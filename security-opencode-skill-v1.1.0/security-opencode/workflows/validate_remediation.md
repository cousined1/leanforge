# Workflow: Validate Remediation (VALIDATE mode)

> **Rule of the Second Pass**: every security fix is itself a code change,
> and code changes introduce vulnerabilities. The fix for vulnerability A
> must be proven not to introduce vulnerability B before merge.

Added in v1.1.0. Closes the "human-in-the-loop assumption" gap — the
v1.0.0 skill trusted the agent to write a correct fix and stop. v1.1.0
runs the fix back through the audit pipeline scoped to the changed
surface, with a strict no-regression gate.

## When to use

- After any auto-suggested fix from TRIAGE / REVIEW / AUDIT / HARDEN /
  AGENT-AUDIT
- After a human-authored security fix that closes a finding from a prior
  audit (audit ID provided)
- Pre-merge on any PR labeled `security` or touching code that previously
  had a HIGH+ finding
- After incident-response remediation, before lifting containment

## Time budget

5-10 minutes. This is a focused scan, not a full audit.

## Prerequisites

A baseline audit must exist. The validator compares pre-fix state to
post-fix state, so it needs:
- A `.security-audit/<baseline_TS>/findings.jsonl` (the pre-fix audit)
- The current working tree contains the proposed fix

If no baseline exists, the validator runs in **strict mode**: any new
HIGH+ finding on the changed files blocks merge.

## Steps

### Step 1 — Identify the changed surface (30s)

```bash
# What changed between baseline and now?
BASELINE_TS="<from prior audit>"
BASELINE_DIR=".security-audit/$BASELINE_TS"

# Files changed since baseline
git diff --name-only $(cat "$BASELINE_DIR/commit.txt") HEAD > "$OUT/changed-files.txt"
wc -l "$OUT/changed-files.txt"
```

Keep this list small — the validator scans only changed files plus
their direct call-graph neighbors (depth 1).

### Step 2 — Run focused scanners on changed files (3-5 min)

```bash
bash scripts/validate_remediation.sh \
  --baseline "$BASELINE_DIR" \
  --changed "$OUT/changed-files.txt" \
  --output "$OUT/validation"
```

The script (see `scripts/validate_remediation.sh`) re-runs the relevant
SAST tools, but scoped to the changed files. It's much faster than a
full repo scan.

### Step 3 — Diff the findings (1 min)

The script compares pre-fix and post-fix findings and produces a
verdict:

```json
{
  "verdict": "PASS | FAIL | REVIEW",
  "baseline_id": "<TS>",
  "post_id": "<TS>",
  "findings_closed": [...],    // present pre, absent post → good
  "findings_introduced": [...], // absent pre, present post → bad
  "findings_persistent": [...], // present both → unchanged
  "regression_severity": "critical|high|medium|low|none"
}
```

**Verdict rules:**
- **PASS** — at least one finding closed; zero new findings ≥ HIGH;
  zero increase in HIGH+ persistent findings.
- **FAIL** — at least one new finding ≥ HIGH introduced, OR a previously-
  closed finding has reappeared.
- **REVIEW** — new findings only at MEDIUM/LOW severity, OR the fix
  closes nothing measurable (might still be a valid hardening change,
  but needs human eyes).

### Step 4 — Adversarial re-prompt (90s)

For agent-authored fixes specifically: after the diff passes Step 3,
re-run the relevant audit prompt against the changed code with the
**original finding** as adversarial context:

> "The following code change is intended to fix CWE-89 at file:line.
> Verify the fix is correct and complete. Look for: (a) bypass via
> alternative input paths to the same sink, (b) introduction of a new
> sink, (c) over-broad fix that breaks intended functionality, (d)
> reliance on a defense the attacker can disable upstream."

The agent must produce a structured assessment:
- `correct: bool` — does the fix actually close the original?
- `complete: bool` — are all instances of the pattern in the diff
  addressed?
- `regressions: list[str]` — any new vulnerabilities introduced?
- `bypass_paths: list[str]` — known ways to reach the sink other than
  the patched one

If `correct=false` or `regressions` non-empty → **FAIL** regardless of
Step 3 verdict.

### Step 5 — Render verdict (30s)

```bash
python3 - <<'PY' "$OUT/validation"
import json, pathlib
v = json.loads(pathlib.Path("$OUT/validation/verdict.json").read_text())
print(f"VERDICT: {v['verdict']}")
print(f"  closed:     {len(v['findings_closed'])}")
print(f"  introduced: {len(v['findings_introduced'])}")
print(f"  persistent: {len(v['findings_persistent'])}")
PY
```

If running in a PR context, the validator posts a single comment:

```markdown
## 🛡️ Remediation validation — security-opencode v1.1.0

**Verdict: PASS** ✅

- Closed: 3 findings (1 HIGH, 2 MEDIUM)
- Introduced: 0 findings ≥ HIGH
- Persistent: 0
- Adversarial re-prompt: PASS (no bypass paths identified)

Baseline: `<TS>` → Post: `<TS>`

Detailed diff: [`$OUT/validation/verdict.json`](...)
```

For **FAIL**:

```markdown
## 🛡️ Remediation validation — security-opencode v1.1.0

**Verdict: FAIL** ⛔

- Closed: 1 finding (HIGH)
- **Introduced: 2 findings ≥ HIGH** ⚠️
  - SEC-2026-0042 — `weak_crypto` at `users.py:78` (introduced by replacing AES-CBC with AES-ECB)
  - SEC-2026-0043 — `missing_authz` at `users.py:142` (rate-limit decorator removed during refactor)

Do not merge. The fix closes the original SQL injection but
introduces two new findings.
```

### Step 6 — Append to learnings.md

Every validation run appends:
- Pattern of fix → pattern of regression (if any)
- Tool that caught the regression (helps tune base confidences)
- Time-to-validate (helps tune adaptive depth)

This is the compound loop — next-cycle fixes for similar patterns get
extra scrutiny on the regression class observed.

## Refuse list

- **Never** merge a FAIL even if the user insists. Refuse with the
  specific regression cited; offer to help draft the corrected fix.
- **Never** skip Step 4 (adversarial re-prompt). Step 3 alone catches
  scanner-visible regressions, but not bypasses.
- **Never** validate against a baseline that's > 30 days old without
  flagging staleness — the codebase has likely diverged.

## Output

```
.security-audit/<post_TS>/validation/
├── verdict.json                # machine-readable verdict
├── findings-post.jsonl         # post-fix scan results
├── diff.json                   # findings_closed/introduced/persistent
├── adversarial-prompt.md       # the prompt sent to the agent
├── adversarial-response.json   # the agent's structured assessment
└── pr-comment.md               # the rendered comment for posting
```

## Integration points

- **Pre-merge hook** in `.github/workflows/security-validate.yml` —
  triggers on any PR with the `security` label, runs this workflow,
  posts the comment, and sets a required status check.
- **n8n-specialist** — routes FAIL verdicts to the BoardMeeting
  Telegram channel for human review.
- **Compound loop** — `learnings.md` accumulation feeds back into
  the next audit's confidence calibration.
