#!/usr/bin/env bash
# validate_remediation.sh
# ---------------------------------------------------------------------------
# Intent Validation Layer (v1.1.0)
#
# After a security fix is proposed (auto-suggested or human-authored),
# re-scan only the changed surface and diff against the baseline audit.
# Verdict: PASS / FAIL / REVIEW.
#
# Usage:
#   bash scripts/validate_remediation.sh \
#     --baseline .security-audit/<baseline_TS>/ \
#     --output   .security-audit/<post_TS>/validation/
#     [--changed FILE]              # explicit list of changed files
#     [--diff-range REF1..REF2]     # otherwise: derive from git
#     [--strict]                    # exit non-zero on FAIL
#     [--allow-low-severity-new]    # allow new LOW findings without REVIEW
# ---------------------------------------------------------------------------

set -euo pipefail
IFS=$'\n\t'

BASELINE=""
OUTPUT=""
CHANGED_FILE=""
DIFF_RANGE=""
STRICT=false
ALLOW_LOW_NEW=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --baseline) BASELINE="$2"; shift 2 ;;
    --output) OUTPUT="$2"; shift 2 ;;
    --changed) CHANGED_FILE="$2"; shift 2 ;;
    --diff-range) DIFF_RANGE="$2"; shift 2 ;;
    --strict) STRICT=true; shift ;;
    --allow-low-severity-new) ALLOW_LOW_NEW=true; shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

[[ -n "$BASELINE" ]] || { echo "--baseline required"; exit 2; }
[[ -n "$OUTPUT" ]] || { echo "--output required"; exit 2; }
[[ -d "$BASELINE" ]] || { echo "baseline not found: $BASELINE"; exit 2; }
[[ -f "$BASELINE/findings.jsonl" ]] || {
  echo "baseline missing findings.jsonl — run triangulate.py on baseline first"
  exit 2
}

mkdir -p "$OUTPUT"
LOG="$OUTPUT/log.txt"
log() { echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LOG"; }

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

log "=== validate_remediation.sh starting ==="
log "baseline: $BASELINE"
log "output:   $OUTPUT"

# --- determine changed files -----------------------------------------------

if [[ -n "$CHANGED_FILE" && -f "$CHANGED_FILE" ]]; then
  cp "$CHANGED_FILE" "$OUTPUT/changed-files.txt"
elif [[ -n "$DIFF_RANGE" ]]; then
  git diff --name-only "$DIFF_RANGE" > "$OUTPUT/changed-files.txt"
elif [[ -f "$BASELINE/commit.txt" ]]; then
  BASE_COMMIT=$(cat "$BASELINE/commit.txt")
  git diff --name-only "$BASE_COMMIT" HEAD > "$OUTPUT/changed-files.txt"
else
  log "no --changed, --diff-range, or baseline commit.txt available"
  log "falling back to: all files modified since HEAD~1"
  git diff --name-only HEAD~1 HEAD > "$OUTPUT/changed-files.txt"
fi

CHANGED_COUNT=$(wc -l < "$OUTPUT/changed-files.txt")
log "changed files: $CHANGED_COUNT"
if [[ "$CHANGED_COUNT" -eq 0 ]]; then
  log "no changed files — nothing to validate"
  echo '{"verdict":"PASS","reason":"no_changes","findings_closed":[],"findings_introduced":[]}' \
    > "$OUTPUT/verdict.json"
  exit 0
fi

# --- run scoped scanners ----------------------------------------------------

log "→ running scoped scanners on changed files"

# semgrep (scoped via --include flags)
if command -v semgrep &>/dev/null; then
  log "  · semgrep"
  INCLUDE_FLAGS=()
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    INCLUDE_FLAGS+=(--include "$f")
  done < "$OUTPUT/changed-files.txt"
  semgrep --config auto --json --metrics off "${INCLUDE_FLAGS[@]}" \
    -o "$OUTPUT/semgrep.json" . 2>>"$LOG" || true
fi

# bandit (only if Python files changed)
if grep -qE '\.py$' "$OUTPUT/changed-files.txt" && command -v bandit &>/dev/null; then
  log "  · bandit"
  PY_FILES=$(grep -E '\.py$' "$OUTPUT/changed-files.txt" | tr '\n' ' ')
  bandit $PY_FILES -f json -o "$OUTPUT/bandit.json" --exit-zero 2>>"$LOG" || true
fi

# gosec (only if Go files changed)
if grep -qE '\.go$' "$OUTPUT/changed-files.txt" && command -v gosec &>/dev/null; then
  log "  · gosec"
  gosec -fmt json -out "$OUTPUT/gosec.json" -quiet ./... 2>>"$LOG" || true
fi

# njsscan (only if JS/TS files changed)
if grep -qE '\.(js|ts|jsx|tsx)$' "$OUTPUT/changed-files.txt" && command -v njsscan &>/dev/null; then
  log "  · njsscan"
  njsscan --json -o "$OUTPUT/njsscan.json" . 2>>"$LOG" || true
fi

# gitleaks (always — secrets in any file matter)
if command -v gitleaks &>/dev/null; then
  log "  · gitleaks (staged + working tree)"
  gitleaks dir . --report-format json --report-path "$OUTPUT/gitleaks.json" --no-banner 2>>"$LOG" || true
fi

# trivy fs (if Dockerfile/k8s/tf changed)
if grep -qE '(Dockerfile|\.ya?ml$|\.tf$)' "$OUTPUT/changed-files.txt" && command -v trivy &>/dev/null; then
  log "  · trivy fs"
  trivy fs --scanners vuln,misconfig,secret --severity HIGH,CRITICAL \
    --format json -o "$OUTPUT/trivy-fs.json" . 2>>"$LOG" || true
fi

# zizmor (if workflows changed)
if grep -qE '\.github/workflows/' "$OUTPUT/changed-files.txt" && command -v zizmor &>/dev/null; then
  log "  · zizmor"
  zizmor --format json .github/workflows/ > "$OUTPUT/zizmor.json" 2>>"$LOG" || true
fi

# --- triangulate the new findings -------------------------------------------

log "→ triangulating post-fix findings"
if command -v python3 &>/dev/null; then
  python3 "$SCRIPT_DIR/triangulate.py" "$OUTPUT" --confidence-floor 60 2>&1 | tee -a "$LOG"
else
  log "  ⚠ python3 not available; cannot triangulate"
fi

POST_FINDINGS="$OUTPUT/findings.jsonl"
if [[ ! -f "$POST_FINDINGS" ]]; then
  log "ERROR: triangulation did not produce findings.jsonl"
  exit 2
fi

# --- diff baseline vs post --------------------------------------------------

log "→ diffing baseline vs post-fix"

python3 - <<PY
import json, pathlib

baseline = pathlib.Path("$BASELINE/findings.jsonl")
post     = pathlib.Path("$POST_FINDINGS")
changed  = set(p.strip() for p in pathlib.Path("$OUTPUT/changed-files.txt").read_text().splitlines() if p.strip())
out_dir  = pathlib.Path("$OUTPUT")
allow_low_new = $( [[ "$ALLOW_LOW_NEW" == "true" ]] && echo True || echo False )

def load(p):
    if not p.exists(): return []
    return [json.loads(line) for line in p.read_text().splitlines() if line.strip()]

base_findings = load(baseline)
post_findings = load(post)

# Restrict baseline to findings that touched changed files
base_in_scope = [f for f in base_findings if any(f.get("file","").endswith(c) or c.endswith(f.get("file","")) for c in changed)]

def signature(f):
    return (f.get("rule_class") or "unknown", f.get("file",""), f.get("line",0) // 5)

base_sigs = {signature(f): f for f in base_in_scope}
post_sigs = {signature(f): f for f in post_findings}

closed     = [f for sig, f in base_sigs.items() if sig not in post_sigs]
introduced = [f for sig, f in post_sigs.items() if sig not in base_sigs]
persistent = [post_sigs[sig] for sig in base_sigs if sig in post_sigs]

SEV_RANK = {"info":0,"low":1,"medium":2,"high":3,"critical":4}
high_or_above = lambda f: SEV_RANK.get(f.get("severity","medium"), 2) >= 3

new_high_or_above = [f for f in introduced if high_or_above(f)]
new_medium = [f for f in introduced if SEV_RANK.get(f.get("severity","medium"), 2) == 2]
new_low_or_info = [f for f in introduced if SEV_RANK.get(f.get("severity","medium"), 2) <= 1]

reasons = []
if new_high_or_above:
    verdict = "FAIL"
    reasons.append(f"introduced {len(new_high_or_above)} HIGH+ finding(s)")
elif new_medium:
    verdict = "REVIEW"
    reasons.append(f"introduced {len(new_medium)} MEDIUM finding(s)")
elif new_low_or_info and not allow_low_new:
    verdict = "REVIEW"
    reasons.append(f"introduced {len(new_low_or_info)} LOW/INFO finding(s)")
elif not closed:
    verdict = "REVIEW"
    reasons.append("closed no findings — confirm this change is necessary")
else:
    verdict = "PASS"
    reasons.append(f"closed {len(closed)} finding(s), introduced 0 above floor")

regression_sev = "none"
if new_high_or_above:
    crit = [f for f in new_high_or_above if f.get("severity") == "critical"]
    regression_sev = "critical" if crit else "high"
elif new_medium:
    regression_sev = "medium"
elif new_low_or_info:
    regression_sev = "low"

verdict_doc = {
    "verdict": verdict,
    "reasons": reasons,
    "baseline_dir": "$BASELINE",
    "post_dir": str(out_dir.parent),
    "changed_files_count": len(changed),
    "findings_closed": closed,
    "findings_introduced": introduced,
    "findings_persistent": persistent,
    "regression_severity": regression_sev,
}

(out_dir / "verdict.json").write_text(json.dumps(verdict_doc, indent=2))
(out_dir / "diff.json").write_text(json.dumps({
    "closed_count": len(closed),
    "introduced_count": len(introduced),
    "persistent_count": len(persistent),
    "regression_severity": regression_sev,
}, indent=2))

# PR comment
comment_lines = [f"## 🛡️ Remediation validation — security-opencode v1.1.0", ""]
emoji = "✅" if verdict == "PASS" else "⚠️" if verdict == "REVIEW" else "⛔"
comment_lines.append(f"**Verdict: {verdict}** {emoji}")
comment_lines.append("")
comment_lines.append(f"- Closed: {len(closed)} findings")
comment_lines.append(f"- Introduced: {len(introduced)} findings")
if new_high_or_above:
    comment_lines.append(f"  - **HIGH+: {len(new_high_or_above)}** ⚠️")
    for f in new_high_or_above[:5]:
        comment_lines.append(f"    - {f.get('id','?')} — {f.get('rule_class','?')} at \`{f.get('file','?')}:{f.get('line',0)}\`")
comment_lines.append(f"- Persistent: {len(persistent)}")
comment_lines.append("")
comment_lines.append(f"Reasons: {', '.join(reasons)}")
comment_lines.append("")
comment_lines.append(f"Regression severity: **{regression_sev.upper()}**")
(out_dir / "pr-comment.md").write_text("\n".join(comment_lines))

print(f"VERDICT: {verdict}")
print(f"  closed:     {len(closed)}")
print(f"  introduced: {len(introduced)}")
print(f"  persistent: {len(persistent)}")
print(f"  regression: {regression_sev}")
PY

VERDICT=$(python3 -c "import json; print(json.load(open('$OUTPUT/verdict.json'))['verdict'])")
log "VERDICT: $VERDICT"

# --- adversarial re-prompt template -----------------------------------------

# Drop the prompt template for the LLM to consume; the agent runs this prompt
# itself after the script finishes.

cat > "$OUTPUT/adversarial-prompt.md" <<'PROMPT_EOF'
# Adversarial re-prompt (Intent Validation Step 4)

The previous code change is intended to fix the security findings closed
in the diff. Now verify the fix end-to-end:

For EACH closed finding in verdict.json:

1. **Correct?** Does the change actually close the original vulnerability,
   or does it merely move it? Examine the AST-level change, not just the
   diff text.

2. **Complete?** Are all instances of the same pattern in the changed
   files addressed? Or did the fix patch one call site and leave siblings
   open?

3. **Regression?** Even findings not flagged by the scanners — did this
   change introduce a new vulnerability the scanners would miss? Consider:
   - New trust boundaries crossed
   - Authorization decisions made
   - Crypto primitives introduced or weakened
   - New external calls (SSRF surface)
   - New file/process operations

4. **Bypass paths?** Are there ways to reach the original sink through a
   path the fix doesn't cover? E.g. fix sanitizes URL-encoded input but
   not base64-encoded input.

Output a JSON document with this shape:

```json
{
  "correct": true|false,
  "complete": true|false,
  "regressions": [
    {"file": "...", "line": 0, "explanation": "..."}
  ],
  "bypass_paths": [
    {"description": "...", "exploit_example": "..."}
  ],
  "final_verdict": "PASS|FAIL|REVIEW",
  "reasoning": "1-2 sentence summary"
}
```

If `correct=false` or `regressions` is non-empty or `final_verdict` is
FAIL, the validation FAILS regardless of the scanner verdict.
PROMPT_EOF

log "wrote adversarial prompt template: $OUTPUT/adversarial-prompt.md"
log ""
log "Next step: the agent should now read adversarial-prompt.md and"
log "produce adversarial-response.json with the structured assessment."
log "After that response is available, the final verdict is the intersection"
log "of the scanner verdict and the adversarial verdict."

if $STRICT && [[ "$VERDICT" == "FAIL" ]]; then
  exit 1
fi
