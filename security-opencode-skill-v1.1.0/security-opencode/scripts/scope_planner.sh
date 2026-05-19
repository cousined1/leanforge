#!/usr/bin/env bash
# scope_planner.sh
# ---------------------------------------------------------------------------
# Adaptive Depth Control (v1.1.0)
#
# Profile the repo and emit a scan plan tailored to (mode × repo size ×
# detected stack). The plan governs which scanners run, time budgets,
# and sampling strategy.
#
# Closes the "scope creep & fatigue" gap from the v1.0.0 review:
# AUDIT mode on a 500K-LOC monorepo should not try to run everything at
# full depth.
#
# Usage:
#   bash scripts/scope_planner.sh --mode AUDIT [--output scan_plan.json]
#
# Modes: TRIAGE | REVIEW | AUDIT | HARDEN | AGENT-AUDIT | INCIDENT | VALIDATE
# ---------------------------------------------------------------------------

set -euo pipefail

MODE=""
OUTPUT="scan_plan.json"
REPO_ROOT="."

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode) MODE="$2"; shift 2 ;;
    --output) OUTPUT="$2"; shift 2 ;;
    --root) REPO_ROOT="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

[[ -n "$MODE" ]] || { echo "--mode required"; exit 2; }
cd "$REPO_ROOT"

# --- profile ----------------------------------------------------------------

count_files() { find . -type f -name "$1" -not -path '*/node_modules/*' \
  -not -path '*/.git/*' -not -path '*/vendor/*' -not -path '*/dist/*' \
  -not -path '*/build/*' -not -path '*/.venv/*' 2>/dev/null | wc -l; }

TOTAL_FILES=$(find . -type f -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | wc -l)
TOTAL_LOC=$(find . -type f \( -name '*.py' -o -name '*.js' -o -name '*.ts' \
  -o -name '*.go' -o -name '*.rb' -o -name '*.php' -o -name '*.java' \
  -o -name '*.rs' -o -name '*.c' -o -name '*.cpp' -o -name '*.tsx' -o -name '*.jsx' \) \
  -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/vendor/*' \
  -not -path '*/dist/*' -not -path '*/build/*' 2>/dev/null \
  | xargs cat 2>/dev/null | wc -l)

PY_FILES=$(count_files '*.py')
JS_FILES=$(count_files '*.js')
TS_FILES=$(count_files '*.ts')
GO_FILES=$(count_files '*.go')
RB_FILES=$(count_files '*.rb')
PHP_FILES=$(count_files '*.php')
JAVA_FILES=$(count_files '*.java')
RS_FILES=$(count_files '*.rs')
TF_FILES=$(count_files '*.tf')
DOCKERFILES=$(count_files 'Dockerfile')
WORKFLOWS=$( { find .github/workflows -type f \( -name '*.yml' -o -name '*.yaml' \) 2>/dev/null || true; } | wc -l)
K8S_FILES=$( { find . -type f \( -name '*.yaml' -o -name '*.yml' \) \
  -not -path '*/.github/*' -not -path '*/node_modules/*' \
  -exec grep -l 'apiVersion:' {} + 2>/dev/null || true; } | wc -l)

# Agent / LLM detection
HAS_AGENT=False
if grep -rqE '(langchain|langgraph|llamaindex|openai|anthropic|crewai|autogen)' \
   --include='*.py' --include='*.js' --include='*.ts' \
   --exclude-dir='node_modules' --exclude-dir='.git' . 2>/dev/null; then
  HAS_AGENT=True
fi

# Manifests
HAS_PKG_JSON=$([[ -f package.json ]] && echo True || echo False)
HAS_REQS=$([[ -f requirements.txt || -f pyproject.toml ]] && echo True || echo False)
HAS_GO_MOD=$([[ -f go.mod ]] && echo True || echo False)
HAS_CARGO=$([[ -f Cargo.toml ]] && echo True || echo False)
HAS_GEMFILE=$([[ -f Gemfile ]] && echo True || echo False)
HAS_COMPOSER=$([[ -f composer.json ]] && echo True || echo False)
HAS_POM=$([[ -f pom.xml || -f build.gradle || -f build.gradle.kts ]] && echo True || echo False)

# Size class
SIZE="small"
if [[ "$TOTAL_LOC" -gt 50000 ]]; then SIZE="medium"; fi
if [[ "$TOTAL_LOC" -gt 200000 ]]; then SIZE="large"; fi
if [[ "$TOTAL_LOC" -gt 1000000 ]]; then SIZE="xlarge"; fi

# --- build plan -------------------------------------------------------------

python3 - <<PY > "$OUTPUT"
import json, sys

mode = "$MODE"
size = "$SIZE"
loc = $TOTAL_LOC

stack = {
    "python": $PY_FILES,
    "javascript": $JS_FILES,
    "typescript": $TS_FILES,
    "go": $GO_FILES,
    "ruby": $RB_FILES,
    "php": $PHP_FILES,
    "java": $JAVA_FILES,
    "rust": $RS_FILES,
    "terraform": $TF_FILES,
    "docker": $DOCKERFILES,
    "github_actions": $WORKFLOWS,
    "kubernetes": $K8S_FILES,
}
has_agent = $HAS_AGENT
manifests = {
    "package.json": $HAS_PKG_JSON,
    "requirements.txt|pyproject.toml": $HAS_REQS,
    "go.mod": $HAS_GO_MOD,
    "Cargo.toml": $HAS_CARGO,
    "Gemfile": $HAS_GEMFILE,
    "composer.json": $HAS_COMPOSER,
    "pom.xml|build.gradle": $HAS_POM,
}

# Time budgets per mode (seconds)
mode_budgets = {
    "TRIAGE":      120,
    "REVIEW":      1800,
    "AUDIT":       14400,    # 4h cap, can override
    "HARDEN":      600,
    "AGENT-AUDIT": 3600,
    "INCIDENT":    900,
    "VALIDATE":    600,
}
budget = mode_budgets.get(mode, 1800)

# Size multiplier for AUDIT mode
if mode == "AUDIT":
    budget = {"small": 1800, "medium": 7200, "large": 14400, "xlarge": 28800}[size]

# Tool selection matrix
tools = []
sampling = "full"

# Mode-driven decisions
if mode == "TRIAGE":
    # PR-scoped, minimal toolchain
    tools = ["semgrep", "gitleaks"]
    if stack["python"]:    tools.append("bandit")
    if stack["go"]:        tools.append("gosec")
    if stack["javascript"] or stack["typescript"]: tools.append("njsscan")
    sampling = "diff_only"

elif mode == "HARDEN":
    tools = ["zizmor", "actionlint"]
    if stack["docker"]:    tools.append("hadolint")
    sampling = "full"

elif mode == "AGENT-AUDIT":
    tools = ["semgrep", "gitleaks"]
    if stack["python"]:    tools.append("bandit")
    if stack["javascript"] or stack["typescript"]: tools.append("njsscan")
    # garak and promptfoo are added separately by the workflow
    sampling = "full"

elif mode == "VALIDATE":
    tools = ["semgrep", "gitleaks"]
    if stack["python"]:    tools.append("bandit")
    if stack["go"]:        tools.append("gosec")
    if stack["javascript"] or stack["typescript"]: tools.append("njsscan")
    sampling = "diff_only"

elif mode == "INCIDENT":
    # Move fast: secrets first, then SCA, then SAST
    tools = ["gitleaks", "trufflehog"]
    if any(stack[k] for k in ("python","javascript","typescript","go","ruby","php","java","rust")):
        tools.append("semgrep")
    if manifests.get("package.json"): tools.append("npm-audit")
    if manifests.get("requirements.txt|pyproject.toml"): tools.append("pip-audit")
    if manifests.get("go.mod"): tools.append("govulncheck")
    sampling = "full"

elif mode == "REVIEW":
    # Standard repo review
    tools = ["semgrep", "gitleaks"]
    if stack["python"]:    tools += ["bandit", "pip-audit"]
    if stack["go"]:        tools += ["gosec", "govulncheck"]
    if stack["javascript"] or stack["typescript"]: tools += ["njsscan", "npm-audit"]
    if stack["docker"]:    tools.append("hadolint")
    if stack["terraform"]: tools += ["tfsec", "checkov"]
    if stack["github_actions"]: tools.append("zizmor")
    tools += ["trivy", "syft", "grype", "osv-scanner"]
    if has_agent: tools.append("anomaly_scan.py")
    sampling = "full" if size in ("small", "medium") else "sampled"

elif mode == "AUDIT":
    # Everything applicable
    tools = ["semgrep", "gitleaks", "trufflehog"]
    if stack["python"]:    tools += ["bandit", "pip-audit", "safety"]
    if stack["go"]:        tools += ["gosec", "govulncheck"]
    if stack["javascript"] or stack["typescript"]: tools += ["njsscan", "npm-audit"]
    if stack["ruby"]:      tools += ["brakeman", "bundle-audit"]
    if stack["docker"]:    tools.append("hadolint")
    if stack["terraform"]: tools += ["tfsec", "checkov"]
    if stack["kubernetes"]: tools += ["kubesec", "checkov-k8s"]
    if stack["github_actions"]: tools += ["zizmor", "actionlint"]
    tools += ["trivy", "syft", "grype", "osv-scanner", "anomaly_scan.py"]
    # Sampling for very large repos
    sampling = {"small":"full","medium":"full","large":"sampled","xlarge":"sampled_heavy"}[size]

# Anomaly detector requires minimum corpus
if "anomaly_scan.py" in tools and loc < 1000:
    tools.remove("anomaly_scan.py")

# Per-tool time allocation (rough; tools can run in parallel)
per_tool_budget = max(60, budget // max(1, len(tools)))

# Sampling strategies
sampling_strategies = {
    "full":           {"description": "scan every file"},
    "diff_only":      {"description": "only files changed since baseline"},
    "sampled":        {"description": "scan 100% of high-risk dirs (src/, lib/, app/, api/); 30% random sample of low-risk dirs (utils/, helpers/)"},
    "sampled_heavy":  {"description": "scan top 20 highest-churn files per language plus all auth/, payment/, admin/ dirs; 10% random sample elsewhere"},
}

plan = {
    "mode": mode,
    "repo_size": size,
    "total_loc": loc,
    "total_files": $TOTAL_FILES,
    "stack": {k: v for k, v in stack.items() if v > 0},
    "has_agent": has_agent,
    "manifests": {k: v for k, v in manifests.items() if v},
    "tools": tools,
    "tool_count": len(tools),
    "time_budget_seconds": budget,
    "per_tool_budget_seconds": per_tool_budget,
    "sampling": sampling,
    "sampling_strategy": sampling_strategies[sampling],
    "notes": [],
}

# Notes / warnings
if size == "xlarge":
    plan["notes"].append("XLARGE repo: full audit will exceed 8h. Sampling enforced; recommend running per-service rather than monorepo-wide.")
if size in ("large", "xlarge") and mode == "AUDIT":
    plan["notes"].append("Consider splitting AUDIT across multiple sessions (run REVIEW per service first, aggregate).")
if has_agent and mode in ("REVIEW", "AUDIT"):
    plan["notes"].append("Agent code detected; AGENT-AUDIT mode is recommended alongside this run (or as a follow-up).")
if stack["github_actions"] > 0 and "zizmor" not in tools:
    plan["notes"].append("GitHub Actions present but zizmor not in plan — consider running HARDEN mode separately.")
if not any(manifests.values()):
    plan["notes"].append("No dependency manifest detected; SCA tools may report nothing.")
if mode == "TRIAGE" and size != "small":
    plan["notes"].append("TRIAGE on a non-small repo: scope to PR diff. For a full pass run REVIEW.")

print(json.dumps(plan, indent=2))
PY

echo ""
echo "Scan plan written to: $OUTPUT"
echo ""
python3 -c "
import json
p = json.load(open('$OUTPUT'))
print(f'  mode:       {p[\"mode\"]}')
print(f'  size:       {p[\"repo_size\"]}  ({p[\"total_loc\"]:,} LOC, {p[\"total_files\"]:,} files)')
print(f'  tools:      {len(p[\"tools\"])}: {\", \".join(p[\"tools\"])}')
print(f'  budget:     {p[\"time_budget_seconds\"]}s ({p[\"time_budget_seconds\"]//60} min)')
print(f'  sampling:   {p[\"sampling\"]}')
if p['notes']:
    print('  notes:')
    for n in p['notes']:
        print(f'    - {n}')
"
