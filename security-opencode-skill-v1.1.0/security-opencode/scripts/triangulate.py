#!/usr/bin/env python3
"""
triangulate.py — security-opencode v1.1.0 Conflict Resolver

Consumes raw tool outputs in .security-audit/<TS>/ and produces a unified
findings.jsonl with cross-corroboration scoring.

See references/triangulation.md for the doctrine.

Usage:
    python3 scripts/triangulate.py .security-audit/<TS>/
        [--include-semantic]   # merge semantic.json findings
        [--bucket N]           # bucket size in lines (default 5)
        [--confidence-floor N] # only emit findings with synth conf >= N (default 0)
        [--strict]             # fail with exit code 1 if any CRITICAL findings present

Outputs (in the same directory):
    findings.jsonl       — unified findings, one per line
    triangulation.json   — audit trail, raw groupings
"""

from __future__ import annotations

import argparse
import datetime
import hashlib
import json
import pathlib
import re
import sys
from collections import defaultdict
from typing import Any

# ----------------------------------------------------------------------------
# Rule class normalization
# ----------------------------------------------------------------------------

RULE_CLASS_MAP: dict[str, dict[str, str]] = {
    # bandit
    "bandit": {
        r"^B(602|603|604|605|606|607|609)$": "command_injection",
        r"^B608$": "sql_injection",
        r"^B109$": "path_traversal",
        r"^B105|B106|B107$": "hardcoded_secret",
        r"^B30(3|4|5)$": "weak_crypto",
        r"^B301|B302|B403|B506|B701$": "insecure_deserialization",
        r"^B311$": "weak_random",
        r"^B31(3|4|5|6|7|8|9|20)$": "xxe",
        r"^B501$": "tls_verify_disabled",
        r"^B201$": "debug_mode_on",
    },
    # semgrep — rule IDs often look like 'python.lang.security.audit.dangerous-system-call'
    "semgrep": {
        r"sql[-_]?injection": "sql_injection",
        r"command[-_]?injection|dangerous-system-call|dangerous-subprocess": "command_injection",
        r"path[-_]?traversal|tainted-path": "path_traversal",
        r"dangerously[-_]?set[-_]?inner|xss|reflected": "xss",
        r"hardcoded[-_]?(secret|password|key|token)": "hardcoded_secret",
        r"weak[-_]?crypto|md5|sha1|md4|des": "weak_crypto",
        r"pickle|unserialize|avoid[-_]?pickle": "insecure_deserialization",
        r"math[-_]?random|insecure[-_]?random|weak[-_]?random": "weak_random",
        r"ssrf": "ssrf",
        r"xxe": "xxe",
        r"open[-_]?redirect": "open_redirect",
        r"csrf": "csrf",
        r"verify[-_]?false|ssl[-_]?verify|tls[-_]?disabled": "tls_verify_disabled",
    },
    # gosec
    "gosec": {
        r"^G201$|^G202$": "sql_injection",
        r"^G204$": "command_injection",
        r"^G304$": "path_traversal",
        r"^G401|G402|G403|G404|G501|G502|G503|G504|G505$": "weak_crypto",
        r"^G101$": "hardcoded_secret",
        r"^G404$": "weak_random",
        r"^G601$": "implicit_memory_alias",
    },
    # gitleaks / trufflehog — everything maps to hardcoded_secret
    "gitleaks": {r".*": "hardcoded_secret"},
    "trufflehog": {r".*": "hardcoded_secret"},
    # trivy / grype / osv — map to cve_dependency, keep CVE in tag
    "trivy": {
        r"^CVE-": "cve_dependency",
        r"^GHSA-": "cve_dependency",
        r"^DS-": "iac_misconfig",  # trivy misconfig DS codes
        r"^AVD-DS-": "iac_misconfig",
        r"^AVD-K(SV|CV)-": "iac_misconfig",
        r"^AVD-AWS-": "iac_misconfig",
        r".*": "container_misconfig",
    },
    "grype": {r".*": "cve_dependency"},
    "osv-scanner": {r".*": "cve_dependency"},
    # hadolint — DLnnnn codes
    "hadolint": {
        r"^DL3002$": "container_root_user",
        r"^DL3018|DL3008|DL3009|DL3015$": "container_unpinned_pkg",
        r"^DL3025|DL3026$": "container_misconfig",
        r".*": "container_misconfig",
    },
    # tfsec / checkov / kics
    "tfsec": {r".*": "iac_misconfig"},
    "checkov": {r".*": "iac_misconfig"},
    "kics": {r".*": "iac_misconfig"},
    # zizmor (GHA)
    "zizmor": {
        r"template-injection": "gha_template_injection",
        r"unpinned": "gha_unpinned_action",
        r"dangerous-triggers|pull-request-target|workflow-run": "gha_dangerous_trigger",
        r"permissions": "gha_excessive_permissions",
        r".*": "gha_misconfig",
    },
    "actionlint": {r".*": "gha_syntax"},
    # njsscan
    "njsscan": {
        r"sql": "sql_injection",
        r"command": "command_injection",
        r"xss|innerHTML": "xss",
        r"secret|hardcoded": "hardcoded_secret",
        r"crypto|md5|sha1": "weak_crypto",
        r"random": "weak_random",
        r".*": "js_misconfig",
    },
    # brakeman (Ruby)
    "brakeman": {
        r"^SQL ": "sql_injection",
        r"^Command Injection": "command_injection",
        r"^Cross-Site Scripting|^XSS": "xss",
        r"^Cross-Site Request Forgery": "csrf",
        r"^Weak Hash|^Weak Cryptography": "weak_crypto",
        r"^Hardcoded": "hardcoded_secret",
        r"^Mass Assignment": "mass_assignment",
        r"^Path Traversal": "path_traversal",
        r"^Remote Code Execution": "code_injection",
    },
    # manual / semantic anomaly
    "manual": {r".*": "manual"},
    "anomaly_scan.py": {r".*": "semantic_anomaly"},
}

PER_TOOL_BASE_CONFIDENCE: dict[str, int] = {
    "codeql": 80,
    "gitleaks": 80,
    "trufflehog": 90,
    "trivy": 85,
    "grype": 85,
    "osv-scanner": 85,
    "semgrep": 70,
    "bandit": 60,
    "gosec": 65,
    "njsscan": 60,
    "brakeman": 75,
    "zizmor": 85,
    "actionlint": 80,
    "hadolint": 70,
    "checkov": 70,
    "tfsec": 70,
    "kics": 70,
    "manual": 70,
    "anomaly_scan.py": 60,  # semantic is intentionally lower
}

SEVERITY_RANK = {"info": 0, "low": 1, "medium": 2, "high": 3, "critical": 4}
RANK_SEVERITY = {v: k for k, v in SEVERITY_RANK.items()}


# ----------------------------------------------------------------------------
# Per-tool parsers
# ----------------------------------------------------------------------------


def _norm_path(p: str | None) -> str:
    if not p:
        return ""
    p = p.replace("\\", "/")
    # strip leading ./ and absolute prefix
    p = re.sub(r"^\.\/+", "", p)
    return p


def _norm_severity(raw: Any) -> str:
    if raw is None:
        return "medium"
    s = str(raw).lower().strip()
    if s in SEVERITY_RANK:
        return s
    # common aliases
    aliases = {
        "moderate": "medium",
        "important": "high",
        "warning": "medium",
        "warn": "medium",
        "error": "high",
        "severe": "high",
        "negligible": "info",
        "none": "info",
        "unknown": "medium",
    }
    return aliases.get(s, "medium")


def parse_bandit(j: Any) -> list[dict]:
    results = j.get("results", []) if isinstance(j, dict) else []
    out = []
    for r in results:
        out.append({
            "file": _norm_path(r.get("filename")),
            "line": int(r.get("line_number", 0) or 0),
            "rule_id": r.get("test_id", ""),
            "severity": _norm_severity(r.get("issue_severity", "medium")),
            "tool": "bandit",
            "snippet": r.get("code", "")[:500],
            "message": r.get("issue_text", ""),
            "raw": r,
        })
    return out


def parse_semgrep(j: Any) -> list[dict]:
    results = j.get("results", []) if isinstance(j, dict) else []
    out = []
    for r in results:
        sev_raw = r.get("extra", {}).get("severity", "medium")
        out.append({
            "file": _norm_path(r.get("path")),
            "line": int(r.get("start", {}).get("line", 0) or 0),
            "rule_id": r.get("check_id", ""),
            "severity": _norm_severity(sev_raw),
            "tool": "semgrep",
            "snippet": r.get("extra", {}).get("lines", "")[:500],
            "message": r.get("extra", {}).get("message", ""),
            "raw": r,
        })
    return out


def parse_gosec(j: Any) -> list[dict]:
    issues = j.get("Issues", []) if isinstance(j, dict) else []
    out = []
    for r in issues:
        out.append({
            "file": _norm_path(r.get("file")),
            "line": int(str(r.get("line", "0")).split("-")[0] or 0),
            "rule_id": r.get("rule_id", ""),
            "severity": _norm_severity(r.get("severity")),
            "tool": "gosec",
            "snippet": r.get("code", "")[:500],
            "message": r.get("details", ""),
            "raw": r,
        })
    return out


def parse_gitleaks(j: Any) -> list[dict]:
    findings = j if isinstance(j, list) else j.get("findings", [])
    out = []
    for r in findings or []:
        out.append({
            "file": _norm_path(r.get("File", r.get("file"))),
            "line": int(r.get("StartLine", r.get("line", 0)) or 0),
            "rule_id": r.get("RuleID", r.get("rule_id", "secret")),
            "severity": "high",  # all secrets default HIGH
            "tool": "gitleaks",
            "snippet": "[REDACTED]",  # never echo the secret
            "message": r.get("Description", "Secret detected"),
            "raw": {k: v for k, v in r.items() if k not in ("Secret", "Match", "secret", "match")},
        })
    return out


def parse_trufflehog(jsonl_text: str) -> list[dict]:
    out = []
    for line in jsonl_text.strip().splitlines():
        if not line.strip():
            continue
        try:
            r = json.loads(line)
        except Exception:
            continue
        src = r.get("SourceMetadata", {}).get("Data", {})
        loc = src.get("Filesystem", {}) or src.get("Git", {})
        out.append({
            "file": _norm_path(loc.get("file", "")),
            "line": int(loc.get("line", 0) or 0),
            "rule_id": r.get("DetectorName", "secret"),
            "severity": "high" if r.get("Verified") else "medium",
            "tool": "trufflehog",
            "snippet": "[REDACTED]",
            "message": f"Secret detected ({r.get('DetectorName', '?')})"
                       + (", verified" if r.get("Verified") else ""),
            "raw": {"verified": r.get("Verified"), "detector": r.get("DetectorName")},
        })
    return out


def parse_trivy_fs(j: Any) -> list[dict]:
    out = []
    if not isinstance(j, dict):
        return out
    for result in j.get("Results", []):
        target = _norm_path(result.get("Target", ""))
        for vuln in result.get("Vulnerabilities", []) or []:
            out.append({
                "file": target,
                "line": 0,
                "rule_id": vuln.get("VulnerabilityID", "CVE-?"),
                "severity": _norm_severity(vuln.get("Severity", "medium")),
                "tool": "trivy",
                "snippet": f"{vuln.get('PkgName')}=={vuln.get('InstalledVersion')}",
                "message": vuln.get("Title", vuln.get("Description", "")[:300]),
                "raw": {"cve": vuln.get("VulnerabilityID"),
                        "pkg": vuln.get("PkgName"),
                        "installed": vuln.get("InstalledVersion"),
                        "fixed": vuln.get("FixedVersion")},
            })
        for mc in result.get("Misconfigurations", []) or []:
            out.append({
                "file": target,
                "line": int(mc.get("CauseMetadata", {}).get("StartLine", 0) or 0),
                "rule_id": mc.get("ID", ""),
                "severity": _norm_severity(mc.get("Severity", "medium")),
                "tool": "trivy",
                "snippet": mc.get("Resolution", "")[:500],
                "message": mc.get("Title", mc.get("Message", ""))[:300],
                "raw": {"id": mc.get("ID"), "type": mc.get("Type")},
            })
        for s in result.get("Secrets", []) or []:
            out.append({
                "file": target,
                "line": int(s.get("StartLine", 0) or 0),
                "rule_id": s.get("RuleID", "secret"),
                "severity": _norm_severity(s.get("Severity", "high")),
                "tool": "trivy",
                "snippet": "[REDACTED]",
                "message": s.get("Title", "Secret detected"),
                "raw": {"rule": s.get("RuleID")},
            })
    return out


def parse_grype(j: Any) -> list[dict]:
    out = []
    for m in (j or {}).get("matches", []):
        v = m.get("vulnerability", {})
        a = m.get("artifact", {})
        out.append({
            "file": _norm_path(a.get("locations", [{}])[0].get("path", "")),
            "line": 0,
            "rule_id": v.get("id", "CVE-?"),
            "severity": _norm_severity(v.get("severity", "medium")),
            "tool": "grype",
            "snippet": f"{a.get('name')}=={a.get('version')}",
            "message": v.get("description", "")[:300],
            "raw": {"cve": v.get("id"), "pkg": a.get("name"), "version": a.get("version")},
        })
    return out


def parse_osv(j: Any) -> list[dict]:
    out = []
    for r in (j or {}).get("results", []):
        src = _norm_path(r.get("source", {}).get("path", ""))
        for pkg in r.get("packages", []):
            pkg_name = pkg.get("package", {}).get("name", "")
            pkg_ver = pkg.get("package", {}).get("version", "")
            for vuln in pkg.get("vulnerabilities", []) or []:
                # OSV doesn't always carry severity; default medium
                sev = "medium"
                for s in (vuln.get("severity") or []):
                    if "score" in s:
                        # heuristic: CVSS score → severity
                        try:
                            score = float(str(s["score"]).split(":")[-1].split("/")[0])
                            sev = "critical" if score >= 9 else "high" if score >= 7 else "medium" if score >= 4 else "low"
                        except Exception:
                            pass
                out.append({
                    "file": src,
                    "line": 0,
                    "rule_id": vuln.get("id", "OSV-?"),
                    "severity": sev,
                    "tool": "osv-scanner",
                    "snippet": f"{pkg_name}=={pkg_ver}",
                    "message": vuln.get("summary", "")[:300],
                    "raw": {"id": vuln.get("id"), "pkg": pkg_name, "version": pkg_ver},
                })
    return out


def parse_zizmor(j: Any) -> list[dict]:
    findings = j if isinstance(j, list) else j.get("findings", [])
    out = []
    for r in findings or []:
        locs = r.get("locations", [])
        loc = locs[0] if locs else {}
        sym = loc.get("symbolic", {}) if isinstance(loc, dict) else {}
        path = sym.get("key", {}).get("file") if isinstance(sym.get("key"), dict) else loc.get("path", "")
        out.append({
            "file": _norm_path(path),
            "line": int(loc.get("concrete", {}).get("location", {}).get("start_point", {}).get("row", 0) or 0) + 1,
            "rule_id": r.get("ident", "zizmor-?"),
            "severity": _norm_severity(r.get("determinations", {}).get("severity", "medium")),
            "tool": "zizmor",
            "snippet": (r.get("desc", "") or "")[:500],
            "message": r.get("ident", "") + ": " + (r.get("desc", "") or "")[:300],
            "raw": {"ident": r.get("ident"), "audit": r.get("audit")},
        })
    return out


def parse_actionlint(j: Any) -> list[dict]:
    items = j if isinstance(j, list) else []
    out = []
    for r in items:
        out.append({
            "file": _norm_path(r.get("filepath", "")),
            "line": int(r.get("line", 0) or 0),
            "rule_id": r.get("kind", "actionlint"),
            "severity": "low",  # actionlint is mostly syntax/style
            "tool": "actionlint",
            "snippet": r.get("snippet", "")[:500],
            "message": r.get("message", ""),
            "raw": r,
        })
    return out


def parse_hadolint(j: Any) -> list[dict]:
    items = j if isinstance(j, list) else []
    out = []
    for r in items:
        out.append({
            "file": _norm_path(r.get("file", "Dockerfile")),
            "line": int(r.get("line", 0) or 0),
            "rule_id": r.get("code", "hadolint"),
            "severity": _norm_severity(r.get("level", "medium")),
            "tool": "hadolint",
            "snippet": "",
            "message": r.get("message", ""),
            "raw": r,
        })
    return out


def parse_checkov(j: Any) -> list[dict]:
    out = []
    if not isinstance(j, dict):
        return out
    failed = j.get("results", {}).get("failed_checks", [])
    for r in failed:
        out.append({
            "file": _norm_path(r.get("file_path", "")),
            "line": int(r.get("file_line_range", [0])[0] or 0),
            "rule_id": r.get("check_id", "CKV-?"),
            "severity": _norm_severity(r.get("severity", "medium")),
            "tool": "checkov",
            "snippet": r.get("code_block", "")[:500] if isinstance(r.get("code_block"), str) else "",
            "message": r.get("check_name", ""),
            "raw": {"check_id": r.get("check_id"), "resource": r.get("resource")},
        })
    return out


def parse_tfsec(j: Any) -> list[dict]:
    out = []
    for r in (j or {}).get("results", []) or []:
        out.append({
            "file": _norm_path(r.get("location", {}).get("filename", "")),
            "line": int(r.get("location", {}).get("start_line", 0) or 0),
            "rule_id": r.get("rule_id", "tfsec-?"),
            "severity": _norm_severity(r.get("severity", "medium")),
            "tool": "tfsec",
            "snippet": "",
            "message": r.get("description", ""),
            "raw": r,
        })
    return out


def parse_njsscan(j: Any) -> list[dict]:
    out = []
    if not isinstance(j, dict):
        return out
    for category in ("nodejs", "templates"):
        for rule_id, info in (j.get(category) or {}).items():
            for f in info.get("files", []):
                out.append({
                    "file": _norm_path(f.get("file_path", "")),
                    "line": int(f.get("match_lines", [0])[0] or 0),
                    "rule_id": rule_id,
                    "severity": _norm_severity(info.get("metadata", {}).get("severity", "medium")),
                    "tool": "njsscan",
                    "snippet": f.get("match_string", "")[:500],
                    "message": info.get("metadata", {}).get("description", ""),
                    "raw": {"rule": rule_id},
                })
    return out


def parse_anomaly(j: Any) -> list[dict]:
    """semantic anomalies from scripts/anomaly_scan.py"""
    out = []
    for r in (j or {}).get("findings", []):
        out.append({
            "file": _norm_path(r.get("divergent", "").split(":")[0] if r.get("divergent") else r.get("file", "")),
            "line": int(r.get("line", 0) or 0),
            "rule_id": f"SEMANTIC-{r.get('subcategory', '?')}",
            "severity": _norm_severity(r.get("severity", "medium")),
            "tool": "anomaly_scan.py",
            "snippet": r.get("snippet", "")[:500],
            "message": r.get("title", "") + ". " + r.get("explanation", "")[:300],
            "raw": r,
        })
    return out


# Mapping of filename → parser
PARSERS: dict[str, callable] = {
    "bandit.json": parse_bandit,
    "semgrep.json": parse_semgrep,
    "gosec.json": parse_gosec,
    "gitleaks.json": parse_gitleaks,
    "gitleaks-history.json": parse_gitleaks,
    "trufflehog.jsonl": None,  # special: JSONL
    "trivy-fs.json": parse_trivy_fs,
    "trivy.json": parse_trivy_fs,
    "grype.json": parse_grype,
    "osv.json": parse_osv,
    "zizmor.json": parse_zizmor,
    "actionlint.json": parse_actionlint,
    "hadolint.json": parse_hadolint,
    "checkov-tf.json": parse_checkov,
    "checkov.json": parse_checkov,
    "tfsec.json": parse_tfsec,
    "njsscan.json": parse_njsscan,
}


# ----------------------------------------------------------------------------
# Classification
# ----------------------------------------------------------------------------


def classify(tool: str, rule_id: str) -> str:
    """Map (tool, rule_id) → canonical rule class."""
    table = RULE_CLASS_MAP.get(tool, {})
    for pattern, klass in table.items():
        if re.search(pattern, rule_id, re.IGNORECASE):
            return klass
    return f"{tool}:{rule_id}"  # unmapped → tool-scoped class


# ----------------------------------------------------------------------------
# File-type → applicable tools (for corroboration score denominator)
# ----------------------------------------------------------------------------

FILE_EXT_TOOLS: dict[str, set[str]] = {
    ".py":  {"bandit", "semgrep", "trivy", "grype", "osv-scanner", "gitleaks", "trufflehog"},
    ".js":  {"njsscan", "semgrep", "trivy", "grype", "osv-scanner", "gitleaks", "trufflehog"},
    ".ts":  {"njsscan", "semgrep", "trivy", "grype", "osv-scanner", "gitleaks", "trufflehog"},
    ".tsx": {"njsscan", "semgrep", "trivy", "grype", "osv-scanner", "gitleaks", "trufflehog"},
    ".jsx": {"njsscan", "semgrep", "trivy", "grype", "osv-scanner", "gitleaks", "trufflehog"},
    ".go":  {"gosec", "semgrep", "trivy", "grype", "osv-scanner", "gitleaks", "trufflehog"},
    ".rb":  {"brakeman", "semgrep", "gitleaks", "trufflehog"},
    ".php": {"semgrep", "gitleaks", "trufflehog"},
    ".java":{"semgrep", "trivy", "gitleaks", "trufflehog"},
    ".rs":  {"semgrep", "gitleaks", "trufflehog"},
    ".tf":  {"tfsec", "checkov", "trivy", "gitleaks"},
    ".yml": {"checkov", "trivy", "zizmor", "actionlint", "gitleaks"},
    ".yaml":{"checkov", "trivy", "zizmor", "actionlint", "gitleaks"},
    "Dockerfile": {"hadolint", "trivy", "gitleaks"},
}


def applicable_tools_for(file_path: str) -> set[str]:
    base = file_path.split("/")[-1] if file_path else ""
    if base == "Dockerfile" or base.startswith("Dockerfile."):
        return FILE_EXT_TOOLS["Dockerfile"]
    for ext, tools in FILE_EXT_TOOLS.items():
        if ext.startswith(".") and file_path.lower().endswith(ext):
            return tools
    # fallback — everyone could be relevant
    return {"semgrep", "gitleaks", "trufflehog"}


# ----------------------------------------------------------------------------
# Triangulation
# ----------------------------------------------------------------------------


def triangulate(
    raw: list[dict],
    bucket_size: int,
    tools_that_ran: set[str],
) -> tuple[list[dict], dict]:
    """
    Returns (unified_findings, audit_trail).
    """
    # add classification
    for f in raw:
        f["rule_class"] = classify(f["tool"], f["rule_id"])

    # bucket: (file, line_bucket, rule_class) → list of witnesses
    buckets: dict[tuple, list[dict]] = defaultdict(list)
    for f in raw:
        line_bucket = (f["line"] // bucket_size) if f["line"] > 0 else 0
        key = (f["file"], line_bucket, f["rule_class"])
        buckets[key].append(f)

    unified = []
    seq = 0
    for (fpath, line_b, klass), witnesses in sorted(buckets.items()):
        seq += 1
        tools = sorted({w["tool"] for w in witnesses})
        n = len(tools)

        # severity = max
        max_sev_rank = max(SEVERITY_RANK[w["severity"]] for w in witnesses)
        severity = RANK_SEVERITY[max_sev_rank]

        # severity dispute?
        severities = {w["severity"] for w in witnesses}
        severity_disputed = len(severities) > 1

        # confidence
        base = max(PER_TOOL_BASE_CONFIDENCE.get(t, 50) for t in tools)
        confidence = min(100, base + 8 * (n - 1))

        # corroboration score
        applicable = applicable_tools_for(fpath) & tools_that_ran
        denom = max(1, len(applicable))
        corroboration_score = round(n / denom, 2)

        # representative snippet — longest
        snippet = max((w.get("snippet", "") for w in witnesses), key=len, default="")

        # line — earliest non-zero
        lines = [w["line"] for w in witnesses if w["line"] > 0]
        line = min(lines) if lines else 0

        # build rule string from witnesses
        rule_parts = sorted({f"{w['tool']}:{w['rule_id']}" for w in witnesses})
        rule_str = f"{klass} | " + " | ".join(rule_parts[:4])
        if len(rule_parts) > 4:
            rule_str += f" | +{len(rule_parts)-4} more"

        # message — pick the most informative
        message = max((w.get("message", "") for w in witnesses), key=len, default=klass)

        unified.append({
            "id": f"SEC-{datetime.datetime.now(datetime.UTC).year}-{seq:04d}",
            "severity": severity,
            "confidence": confidence,
            "title": (message[:100] + "...") if len(message) > 100 else message,
            "rule": rule_str,
            "rule_class": klass,
            "file": fpath,
            "line": line,
            "snippet": snippet[:500],
            "message": message,
            "corroborated_by": tools,
            "corroboration_score": corroboration_score,
            "severity_disputed": severity_disputed,
            "category": "semantic_anomaly" if klass == "semantic_anomaly" else "vulnerability",
            "witnesses": [{"tool": w["tool"], "rule_id": w["rule_id"],
                           "severity": w["severity"], "line": w["line"]}
                          for w in witnesses],
            "detected_at": datetime.datetime.now(datetime.UTC).isoformat() + "Z",
        })

    # Sort: severity desc, then confidence desc
    unified.sort(key=lambda f: (-SEVERITY_RANK[f["severity"]], -f["confidence"]))

    audit_trail = {
        "tools_that_ran": sorted(tools_that_ran),
        "raw_finding_count": len(raw),
        "unified_finding_count": len(unified),
        "buckets": len(buckets),
        "bucket_size": bucket_size,
        "generated_at": datetime.datetime.now(datetime.UTC).isoformat() + "Z",
    }
    return unified, audit_trail


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------


def main():
    ap = argparse.ArgumentParser(description="Triangulate tool outputs into unified findings.jsonl")
    ap.add_argument("audit_dir", help=".security-audit/<TS>/ directory")
    ap.add_argument("--include-semantic", action="store_true",
                    help="merge semantic.json from anomaly_scan.py")
    ap.add_argument("--bucket", type=int, default=5, help="line bucket size (default 5)")
    ap.add_argument("--confidence-floor", type=int, default=0,
                    help="suppress findings below this synthesized confidence")
    ap.add_argument("--strict", action="store_true",
                    help="exit 1 if any CRITICAL findings remain")
    args = ap.parse_args()

    audit = pathlib.Path(args.audit_dir)
    if not audit.exists():
        print(f"ERROR: {audit} does not exist", file=sys.stderr)
        sys.exit(2)

    raw: list[dict] = []
    tools_that_ran: set[str] = set()

    # standard JSON parsers
    for fname, parser in PARSERS.items():
        path = audit / fname
        if not path.exists() or path.stat().st_size == 0:
            continue
        try:
            if fname.endswith(".jsonl"):
                text = path.read_text()
                rows = parse_trufflehog(text) if "trufflehog" in fname else []
            else:
                j = json.loads(path.read_text())
                if parser is None:
                    continue
                rows = parser(j)
            raw.extend(rows)
            if rows:
                tools_that_ran.add(rows[0]["tool"])
        except Exception as e:
            print(f"WARN: could not parse {fname}: {e}", file=sys.stderr)

    # truffleHog special-case (JSONL)
    th_path = audit / "trufflehog.jsonl"
    if th_path.exists() and th_path.stat().st_size > 0:
        try:
            rows = parse_trufflehog(th_path.read_text())
            raw.extend(rows)
            if rows:
                tools_that_ran.add("trufflehog")
        except Exception as e:
            print(f"WARN: could not parse trufflehog.jsonl: {e}", file=sys.stderr)

    # semantic
    if args.include_semantic:
        sem_path = audit / "semantic.json"
        if sem_path.exists():
            try:
                j = json.loads(sem_path.read_text())
                rows = parse_anomaly(j)
                raw.extend(rows)
                if rows:
                    tools_that_ran.add("anomaly_scan.py")
            except Exception as e:
                print(f"WARN: could not parse semantic.json: {e}", file=sys.stderr)

    if not raw:
        print("no raw findings parsed — nothing to triangulate", file=sys.stderr)
        # write empty outputs for downstream tooling
        (audit / "findings.jsonl").write_text("")
        (audit / "triangulation.json").write_text(json.dumps({"empty": True}, indent=2))
        sys.exit(0)

    unified, trail = triangulate(raw, args.bucket, tools_that_ran)

    # apply floor
    floor_filtered = [f for f in unified if f["confidence"] >= args.confidence_floor]

    # write outputs
    out_findings = audit / "findings.jsonl"
    out_findings.write_text("\n".join(json.dumps(f) for f in floor_filtered) + "\n")
    print(f"wrote {len(floor_filtered)} findings to {out_findings} "
          f"(of {len(unified)} unified from {len(raw)} raw)")

    out_audit = audit / "triangulation.json"
    out_audit.write_text(json.dumps({
        **trail,
        "confidence_floor": args.confidence_floor,
        "below_floor_count": len(unified) - len(floor_filtered),
        "by_severity": {sev: sum(1 for f in floor_filtered if f["severity"] == sev)
                        for sev in SEVERITY_RANK},
        "by_corroboration": {
            "n=1": sum(1 for f in floor_filtered if len(f["corroborated_by"]) == 1),
            "n=2": sum(1 for f in floor_filtered if len(f["corroborated_by"]) == 2),
            "n>=3": sum(1 for f in floor_filtered if len(f["corroborated_by"]) >= 3),
        },
        "severity_disputed_count": sum(1 for f in floor_filtered if f["severity_disputed"]),
    }, indent=2))
    print(f"wrote audit trail to {out_audit}")

    # learnings.md hook
    learnings = audit / "learnings.md"
    n_critical = sum(1 for f in floor_filtered if f["severity"] == "critical")
    n_high = sum(1 for f in floor_filtered if f["severity"] == "high")
    n_corroborated = sum(1 for f in floor_filtered if len(f["corroborated_by"]) >= 2)
    with learnings.open("a") as fh:
        fh.write(f"\n## Triangulation pass — {datetime.datetime.now(datetime.UTC).isoformat()}Z\n\n")
        fh.write(f"- Raw findings: {len(raw)}\n")
        fh.write(f"- Unified: {len(unified)} (compression: {len(raw)/max(1,len(unified)):.1f}x)\n")
        fh.write(f"- CRITICAL: {n_critical}, HIGH: {n_high}\n")
        fh.write(f"- Multi-tool corroborated: {n_corroborated}\n")
        fh.write(f"- Tools that ran: {sorted(tools_that_ran)}\n")

    if args.strict and n_critical > 0:
        print(f"STRICT mode: {n_critical} CRITICAL finding(s) present", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
