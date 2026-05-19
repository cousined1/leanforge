#!/usr/bin/env python3
"""
anomaly_scan.py — security-opencode v1.1.0 Semantic Anomaly Detector

Find "odd sibling" bugs by statistical comparison within a codebase:
- Auth divergence in sibling route handlers
- Validation divergence in functions with same-named params
- Type inconsistency for security-relevant identifiers
- Error-handling divergence within a file
- Naming-pattern violations in ID fields

See references/semantic_anomaly.md for the full doctrine.

Usage:
    python3 scripts/anomaly_scan.py <repo_path> [--output semantic.json]
        [--min-siblings N]     # require N siblings before flagging (default 5)
        [--dominance N]        # require N% of siblings agree (default 80)
        [--max-per-file N]     # cap findings per file per category (default 3)

This is intentionally heuristic. Confidence is capped at 70 — findings here
should be reviewed by a human, not auto-actioned.
"""

from __future__ import annotations

import argparse
import ast
import collections
import datetime
import json
import pathlib
import re
from typing import Any

# ----------------------------------------------------------------------------
# File walking
# ----------------------------------------------------------------------------

EXCLUDE_DIRS = {
    "node_modules", ".git", "vendor", "dist", "build", ".venv", "venv",
    "__pycache__", ".tox", ".pytest_cache", "target", ".next", "out",
    "third_party", "generated", "__generated__", "migrations",
    ".security-audit",
}
EXCLUDE_PATTERNS = [
    re.compile(r".*\.pb\.go$"),
    re.compile(r".*\.gen\.(go|ts|js|py)$"),
    re.compile(r".*_pb2\.py$"),
    re.compile(r".*\.min\.(js|css)$"),
]


def walk_files(root: pathlib.Path, exts: set[str]) -> list[pathlib.Path]:
    out = []
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        parts = set(p.relative_to(root).parts)
        if parts & EXCLUDE_DIRS:
            continue
        if any(pat.match(str(p)) for pat in EXCLUDE_PATTERNS):
            continue
        if p.suffix in exts:
            try:
                if p.stat().st_size > 1_000_000:  # skip > 1MB files
                    continue
            except Exception:
                continue
            out.append(p)
    return out


# ----------------------------------------------------------------------------
# Python AST helpers
# ----------------------------------------------------------------------------


def parse_python(path: pathlib.Path) -> ast.AST | None:
    try:
        return ast.parse(path.read_text(encoding="utf-8", errors="replace"),
                         filename=str(path))
    except (SyntaxError, ValueError):
        return None


def function_decorator_names(func: ast.FunctionDef | ast.AsyncFunctionDef) -> list[str]:
    names = []
    for d in func.decorator_list:
        if isinstance(d, ast.Name):
            names.append(d.id)
        elif isinstance(d, ast.Attribute):
            names.append(d.attr)
        elif isinstance(d, ast.Call):
            target = d.func
            if isinstance(target, ast.Name):
                names.append(target.id)
            elif isinstance(target, ast.Attribute):
                names.append(target.attr)
    return names


def function_route_decorator(func: ast.FunctionDef | ast.AsyncFunctionDef) -> str | None:
    """Detect FastAPI/Flask route decorators."""
    for d in func.decorator_list:
        target = d.func if isinstance(d, ast.Call) else d
        name = None
        if isinstance(target, ast.Attribute):
            name = target.attr
        elif isinstance(target, ast.Name):
            name = target.id
        if name and name.lower() in {"get", "post", "put", "patch", "delete",
                                      "route", "head", "options"}:
            return name.lower()
    return None


def function_has_auth(func: ast.FunctionDef | ast.AsyncFunctionDef) -> bool:
    """Heuristic: function has auth via decorator, Depends(), or manual check."""
    decos = function_decorator_names(func)
    auth_decos = {"login_required", "auth_required", "authenticated", "require_auth",
                  "require_user", "require_role", "require_admin", "protected"}
    if any(d.lower() in {a.lower() for a in auth_decos} for d in decos):
        return True
    # Depends(get_current_user) or Depends(auth)
    for arg in (func.args.args + func.args.kwonlyargs):
        if arg.annotation:
            ann_src = ast.unparse(arg.annotation) if hasattr(ast, "unparse") else ""
            if "User" in ann_src or "Auth" in ann_src:
                # check default
                pass
        # check default value
    # check defaults for Depends()
    defaults = func.args.defaults + func.args.kw_defaults
    for d in defaults:
        if d is None:
            continue
        if isinstance(d, ast.Call):
            target = d.func
            name = target.attr if isinstance(target, ast.Attribute) else \
                   target.id if isinstance(target, ast.Name) else ""
            if name == "Depends":
                # crude: any Depends() is treated as potentially auth.
                # refine by inspecting the argument
                if d.args:
                    arg_src = ast.dump(d.args[0])
                    if any(kw in arg_src.lower() for kw in
                           ("user", "auth", "current_user", "token", "session")):
                        return True
    # manual: scan body for `if not <expr>: raise` near top
    body = func.body[:5]  # first 5 statements
    body_src = "\n".join(ast.dump(s) for s in body)
    if re.search(r"is_authenticated|current_user|authenticated|require_role|"
                 r"check_auth|verify_token|HTTPException.*401|HTTPException.*403",
                 body_src):
        return True
    return False


def parameter_validation(func: ast.FunctionDef | ast.AsyncFunctionDef,
                          param_name: str) -> bool:
    """Heuristic: does the function validate the given parameter?"""
    src = ast.unparse(func) if hasattr(ast, "unparse") else ""
    if not src:
        return False
    # patterns: validators.url(param), if not param.startswith(...), re.match(..., param)
    patterns = [
        rf"validators?\.\w+\({param_name}",
        rf"re\.(match|search|fullmatch)\([^,]+,\s*{param_name}",
        rf"if\s+(not\s+)?{param_name}[\.\s]+(startswith|endswith|in\s)",
        rf"raise\s+\w*Error.*{param_name}",
        rf"assert\s+{param_name}",
        rf"validate_\w+\({param_name}",
        rf"sanitize_\w+\({param_name}",
        rf"escape\({param_name}",
    ]
    return any(re.search(p, src) for p in patterns)


# ----------------------------------------------------------------------------
# Detector: Python sibling auth divergence
# ----------------------------------------------------------------------------


def detect_auth_divergence_python(files: list[pathlib.Path],
                                    min_siblings: int,
                                    dominance: float,
                                    max_per_file: int) -> list[dict]:
    findings = []
    for fpath in files:
        tree = parse_python(fpath)
        if not tree:
            continue
        # Collect all top-level + class-method route handlers
        route_funcs: list[tuple[str, int, bool]] = []  # (name, lineno, has_auth)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if function_route_decorator(node):
                    route_funcs.append((node.name, node.lineno, function_has_auth(node)))
        if len(route_funcs) < min_siblings:
            continue
        n_auth = sum(1 for _, _, a in route_funcs if a)
        n_total = len(route_funcs)
        dominant_has = n_auth / n_total >= dominance
        dominant_lacks = (n_total - n_auth) / n_total >= dominance
        if dominant_has:
            # find the ones that lack auth
            divergent = [(n, ln) for n, ln, a in route_funcs if not a]
            for n, ln in divergent[:max_per_file]:
                findings.append({
                    "subcategory": "auth_divergence",
                    "severity": "medium",
                    "file": str(fpath),
                    "line": ln,
                    "divergent": f"{fpath}:{ln}:{n}",
                    "siblings": [f"{fpath}:{ln2}:{n2}" for n2, ln2, a in route_funcs if a][:10],
                    "title": f"Auth divergence: route '{n}' lacks auth in a file where {n_auth}/{n_total} routes require it",
                    "explanation": (
                        f"Of {n_total} route handlers in {fpath.name}, {n_auth} use an "
                        f"authentication pattern (decorator, Depends, or manual check). "
                        f"'{n}' on line {ln} does not. Confirm this route is intentionally "
                        f"public; otherwise this is a missing-authorization bug."
                    ),
                    "fix": "Add the same auth pattern used by sibling routes, or document the public-by-design reason in a comment.",
                })
        elif dominant_lacks and n_total >= min_siblings * 2:
            # opposite case: most are public, one isn't — less risky, low severity
            divergent = [(n, ln) for n, ln, a in route_funcs if a]
            for n, ln in divergent[:max_per_file]:
                findings.append({
                    "subcategory": "auth_divergence",
                    "severity": "low",
                    "file": str(fpath),
                    "line": ln,
                    "divergent": f"{fpath}:{ln}:{n}",
                    "siblings": [f"{fpath}:{ln2}:{n2}" for n2, ln2, a in route_funcs if not a][:10],
                    "title": f"Auth divergence (inverse): route '{n}' requires auth in a public file",
                    "explanation": f"Most routes in {fpath.name} are public; '{n}' requires auth. Verify the file is intentionally mixed.",
                    "fix": "If the file should be uniformly public or uniformly protected, align this route.",
                })
    return findings


# ----------------------------------------------------------------------------
# Detector: Python parameter validation divergence
# ----------------------------------------------------------------------------

SENSITIVE_PARAM_NAMES = {"url", "redirect", "redirect_url", "next", "path",
                          "filename", "file_path", "filepath", "email",
                          "callback", "callback_url", "token", "image_url",
                          "webhook_url", "host", "hostname", "uri", "endpoint"}


def detect_validation_divergence_python(files: list[pathlib.Path],
                                          min_siblings: int,
                                          dominance: float,
                                          max_per_file: int) -> list[dict]:
    findings = []
    # Bucket functions by sensitive-param name across the whole repo
    by_param: dict[str, list[tuple[pathlib.Path, ast.AST, bool]]] = collections.defaultdict(list)
    for fpath in files:
        tree = parse_python(fpath)
        if not tree:
            continue
        for node in ast.walk(tree):
            if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            for arg in node.args.args:
                if arg.arg.lower() in SENSITIVE_PARAM_NAMES:
                    validates = parameter_validation(node, arg.arg)
                    by_param[arg.arg.lower()].append((fpath, node, validates))
    for pname, occurrences in by_param.items():
        if len(occurrences) < min_siblings:
            continue
        n_valid = sum(1 for _, _, v in occurrences if v)
        n_total = len(occurrences)
        if n_valid / n_total < dominance:
            continue
        divergent = [(fp, fn) for fp, fn, v in occurrences if not v]
        per_file_count: dict[pathlib.Path, int] = collections.Counter()
        for fp, fn in divergent:
            if per_file_count[fp] >= max_per_file:
                continue
            per_file_count[fp] += 1
            findings.append({
                "subcategory": "validation_divergence",
                "severity": "medium",
                "file": str(fp),
                "line": fn.lineno,
                "divergent": f"{fp}:{fn.lineno}:{fn.name}",
                "siblings": [f"{a}:{b.lineno}:{b.name}" for a, b, v in occurrences if v][:10],
                "title": f"Validation divergence: '{pname}' parameter unvalidated in '{fn.name}'",
                "explanation": (
                    f"Across {n_total} functions that accept a '{pname}' parameter, "
                    f"{n_valid} validate it before use. '{fn.name}' in {fp.name} does not. "
                    f"This is a potential SSRF / path-traversal / open-redirect surface."
                ),
                "fix": f"Validate '{pname}' before use — add an allow-list check, regex, or library validator that matches the pattern used by sibling functions.",
            })
    return findings


# ----------------------------------------------------------------------------
# Detector: Error-handling divergence (broad except)
# ----------------------------------------------------------------------------


def detect_error_handling_divergence_python(files: list[pathlib.Path],
                                              min_siblings: int,
                                              dominance: float,
                                              max_per_file: int) -> list[dict]:
    findings = []
    for fpath in files:
        tree = parse_python(fpath)
        if not tree:
            continue
        funcs: list[tuple[str, int, str]] = []  # (name, line, "specific|broad|none")
        for node in ast.walk(tree):
            if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            handlers = [n for n in ast.walk(node) if isinstance(n, ast.ExceptHandler)]
            if not handlers:
                funcs.append((node.name, node.lineno, "none"))
                continue
            broad = False
            for h in handlers:
                if h.type is None:  # bare except:
                    broad = True; break
                src = ast.unparse(h.type) if hasattr(ast, "unparse") else ""
                if src in {"Exception", "BaseException"}:
                    broad = True; break
            funcs.append((node.name, node.lineno, "broad" if broad else "specific"))

        funcs_with_handlers = [(n, l, t) for n, l, t in funcs if t != "none"]
        if len(funcs_with_handlers) < min_siblings:
            continue
        n_specific = sum(1 for _, _, t in funcs_with_handlers if t == "specific")
        n_total = len(funcs_with_handlers)
        if n_specific / n_total >= dominance:
            divergent = [(n, l) for n, l, t in funcs_with_handlers if t == "broad"]
            for n, l in divergent[:max_per_file]:
                findings.append({
                    "subcategory": "error_handling_divergence",
                    "severity": "low",
                    "file": str(fpath),
                    "line": l,
                    "divergent": f"{fpath}:{l}:{n}",
                    "siblings": [f"{fpath}:{l2}:{n2}" for n2, l2, t in funcs_with_handlers if t == "specific"][:10],
                    "title": f"Error-handling divergence: '{n}' catches broad Exception in a file of specific handlers",
                    "explanation": (
                        f"{n_specific}/{n_total} functions in {fpath.name} use specific "
                        f"exception types; '{n}' catches Exception or uses bare except. "
                        f"Broad excepts can mask security-relevant failures and lead to "
                        f"fail-open behavior."
                    ),
                    "fix": "Narrow the except to specific types, or document why the broad catch is required.",
                })
    return findings


# ----------------------------------------------------------------------------
# Detector: ID naming-pattern violation
# ----------------------------------------------------------------------------

# Pattern: ORM column definitions
ORM_PK_PATTERN = re.compile(
    r"(?P<name>\w+_id|id)\s*=\s*(?:db\.)?Column\s*\(\s*(?P<type>Integer|String|UUID|BigInteger)",
    re.IGNORECASE,
)


def detect_id_naming_violation(files: list[pathlib.Path]) -> list[dict]:
    findings = []
    occurrences: list[tuple[pathlib.Path, int, str, str]] = []  # path, line, name, type
    for fpath in files:
        if fpath.suffix not in {".py", ".rb", ".ts", ".js"}:
            continue
        try:
            text = fpath.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        for i, line in enumerate(text.splitlines(), 1):
            m = ORM_PK_PATTERN.search(line)
            if m:
                t = m.group("type").lower()
                if t in {"integer", "biginteger"}:
                    norm = "int"
                elif t in {"uuid"}:
                    norm = "uuid"
                else:
                    norm = "string"
                occurrences.append((fpath, i, m.group("name").lower(), norm))
    if len(occurrences) < 5:
        return findings
    by_name: dict[str, collections.Counter] = collections.defaultdict(collections.Counter)
    for _, _, n, t in occurrences:
        by_name[n][t] += 1
    # Repo-wide ID type vote (if 80%+ of all IDs are one type, flag the others)
    all_types: collections.Counter = collections.Counter()
    for n, c in by_name.items():
        all_types.update(c)
    total = sum(all_types.values())
    if total < 5:
        return findings
    dominant, dom_count = all_types.most_common(1)[0]
    if dom_count / total < 0.7:
        return findings
    # Now flag IDs that don't match the dominant type
    for fp, ln, n, t in occurrences:
        if t != dominant:
            findings.append({
                "subcategory": "id_naming_violation",
                "severity": "low" if dominant != "int" else "medium",
                "file": str(fp),
                "line": ln,
                "divergent": f"{fp}:{ln}:{n}",
                "siblings": [],  # too many
                "title": f"ID type divergence: '{n}' is {t} while {dom_count}/{total} IDs in this codebase are {dominant}",
                "explanation": (
                    f"Repo-wide, {dom_count} of {total} primary-key fields are {dominant}. "
                    f"'{n}' in {fp.name}:{ln} is {t}. Sequential int IDs in an otherwise UUID-based "
                    f"system are an enumeration risk (BOLA / IDOR enabler)."
                ),
                "fix": f"Standardize to {dominant} or document why this ID type is intentionally different.",
            })
    return findings[:20]  # cap output


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(description="Semantic anomaly detector (security-opencode v1.1.0)")
    ap.add_argument("repo_path", help="repo root to scan")
    ap.add_argument("--output", default="semantic.json", help="output JSON path")
    ap.add_argument("--min-siblings", type=int, default=5)
    ap.add_argument("--dominance", type=float, default=0.80)
    ap.add_argument("--max-per-file", type=int, default=3)
    args = ap.parse_args()

    repo = pathlib.Path(args.repo_path).resolve()
    if not repo.exists():
        print(f"ERROR: {repo} does not exist")
        return 2

    print(f"[anomaly] scanning {repo}")
    py_files = walk_files(repo, {".py"})
    js_files = walk_files(repo, {".js", ".ts", ".tsx", ".jsx"})
    rb_files = walk_files(repo, {".rb"})
    all_files = py_files + js_files + rb_files
    print(f"[anomaly]   python: {len(py_files)}, js/ts: {len(js_files)}, ruby: {len(rb_files)}")

    findings: list[dict] = []

    if py_files:
        print("[anomaly] running auth divergence (python)")
        findings += detect_auth_divergence_python(py_files, args.min_siblings, args.dominance, args.max_per_file)

        print("[anomaly] running validation divergence (python)")
        findings += detect_validation_divergence_python(py_files, args.min_siblings, args.dominance, args.max_per_file)

        print("[anomaly] running error-handling divergence (python)")
        findings += detect_error_handling_divergence_python(py_files, args.min_siblings, args.dominance, args.max_per_file)

    print("[anomaly] running id-naming-violation (multi-lang)")
    findings += detect_id_naming_violation(all_files)

    # Confidence cap at 70
    for f in findings:
        f["confidence"] = 60
        f["category"] = "semantic_anomaly"
        f["tool"] = "anomaly_scan.py"

    # Sort: severity rank, then file
    rank = {"critical": 4, "high": 3, "medium": 2, "low": 1, "info": 0}
    findings.sort(key=lambda x: (-rank.get(x.get("severity", "medium"), 2), x.get("file", "")))

    output = {
        "version": "1.1.0",
        "scanner": "anomaly_scan.py",
        "repo": str(repo),
        "generated_at": datetime.datetime.now(datetime.UTC).isoformat() + "Z",
        "parameters": {
            "min_siblings": args.min_siblings,
            "dominance": args.dominance,
            "max_per_file": args.max_per_file,
        },
        "stats": {
            "python_files_scanned": len(py_files),
            "js_files_scanned": len(js_files),
            "ruby_files_scanned": len(rb_files),
            "findings": len(findings),
        },
        "findings": findings,
    }

    pathlib.Path(args.output).write_text(json.dumps(output, indent=2))
    print(f"[anomaly] wrote {len(findings)} findings to {args.output}")

    # By subcategory
    by_sub = collections.Counter(f["subcategory"] for f in findings)
    for sub, n in by_sub.most_common():
        print(f"  - {sub}: {n}")


if __name__ == "__main__":
    main()
