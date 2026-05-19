# Workflow: Triage PR (TRIAGE mode)

## When to use
- A PR diff or single file is in front of you
- The user said "review this PR", "is this safe to merge", "audit this
  change"

## Time budget
< 2 minutes. This is a fast pass, not a full review.

## Steps

### Step 1 — Read the diff (30s)
- What files changed? Source, tests, config, IaC, workflows?
- Net additions? Watch out for hundreds-of-lines diffs that hide a
  one-line security regression
- New dependencies? Note them for §3

### Step 2 — Per-hunk heuristic (60s)
Apply the 5-question pass from `checklists/secure_code_review.md`:
1. Trust boundary crossed? → validation present?
2. Authorization needed here? → present?
3. Failure mode? → fail-closed?
4. Side effects? → logged, idempotent, rate-limited?
5. Secrets? → from vault, not source?

### Step 3 — Dependency delta (15s)
If `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, etc.
changed:
- New package? Check it exists on the official registry, has reasonable
  download count, last release < 1 year, source repo visible
- Bumped package? Note: was it for a CVE fix? Was the bump correct
  (not a downgrade)?
- Pinned to hash where ecosystem supports it?

### Step 4 — Workflow changes (15s)
If `.github/workflows/*.yml` changed: trigger HARDEN mode instead. PR
review pauses here, hand off to `workflows/harden_actions.md`.

### Step 5 — Comment (30s)
Inline comments for each finding with confidence ≥ 80. Lead with
severity, give the fix:

> **HIGH (CWE-89, OWASP A05:2025):** SQL constructed by string interp on
> line 42. Switch to parameterized:
> ```python
> cur.execute("SELECT * FROM users WHERE id=%s", (uid,))
> ```

No "looks good!" comments — silence on a hunk means it passed the
heuristic.

### Step 6 — Summary block
At the end, post a single summary comment:

```markdown
## Security triage — security-opencode skill

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 0 |
| Low | 0 |

Mode: TRIAGE (fast pass)
Findings ≥ HIGH must be addressed before merge.
Findings < HIGH are advisory.

Full review available via REVIEW mode — re-invoke with `@claude /sec review`.
```

## Refuse list
- Don't auto-approve or auto-merge.
- Don't post "LGTM" without a real check.
- Don't flag style/lint issues here — out of scope. Hand off to the
  code-quality skill if available.

## v1.1.0 follow-up

If the PR is a fix for a previously-flagged finding (e.g. labeled
`security` or referencing a prior audit ID), pause TRIAGE and switch
to VALIDATE mode (`workflows/validate_remediation.md`) instead. TRIAGE
checks the diff in isolation; VALIDATE checks the diff against the
baseline audit and gates on regression.
