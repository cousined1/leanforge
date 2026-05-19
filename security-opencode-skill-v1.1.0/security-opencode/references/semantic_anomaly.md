# Semantic Anomaly Detection

> **Rule of the Odd Sibling**: when a function differs from its siblings
> in a security-relevant way, the difference is the finding. Most novel
> bugs are local irregularities, not violations of universal rules.

Added in v1.1.0. Closes the "unknown unknowns" gap — the v1.0.0 skill
checked against known CVE/CWE/OWASP catalogs but had no mechanism to
surface bugs that are NOT in any catalog. The Semantic Anomaly Detector
finds **statistical irregularities** in code structure that correlate
with bugs, especially business-logic flaws that no CVE database knows.

This is intentionally **low-signal but high-novelty**. Findings here
should be tagged `category: semantic_anomaly` and surfaced as
**REVIEW-required**, never auto-actioned.

---

## 1. What we look for

### 1.1 Sibling auth divergence

Most route handlers in a file share an auth pattern. When one diverges,
flag it.

**Detection:** within a route file (FastAPI/Flask/Express/Rails),
collect the auth pattern of every route handler:
- Decorator presence (`@require_auth`, `@login_required`, `before_action :authenticate`)
- Dependency-injected auth (`user = Depends(get_current_user)`)
- Manual check (`if not request.user.is_authenticated`)

If ≥80% of handlers in the file use pattern X but one or two use
pattern Y (or no pattern at all), surface those as:
> **SEMANTIC: auth divergence** — 8 of 10 handlers in `users.py` require
> authentication via `Depends(get_current_user)`; `GET /users/{id}/avatar`
> and `POST /users/{id}/track-event` do not. Confirm both are intentionally
> public; otherwise this is a missing-authz bug.

### 1.2 Type inconsistency across uses

Same identifier name, different types across the codebase. Often a sign
of a refactor that left some sites behind.

**Detection:** for identifiers used in ≥5 files, infer type via:
- Function signature annotations (Python `: int`, TypeScript `: number`)
- ORM column definitions (`user_id = Column(Integer)`)
- Database schema (parse migration files)
- Usage context (`int(user_id)` vs `uuid.UUID(user_id)`)

Flag when the same name has 2+ inferred types and the types are
security-relevant (id, token, key, secret, hash, sig).

### 1.3 Validation divergence

Most parameters of a given name are validated in some way; one isn't.

**Detection:** collect every function that receives a parameter named
`url`, `path`, `filename`, `email`, `token`, `redirect`. Check the
function body for validation patterns:
- `if not <param>.startswith(allowed): raise`
- `validators.url(<param>)`
- `re.match(<pattern>, <param>)`
- Library call known to validate (`requests.get` with an `allowed_domains` filter)

If 80%+ of functions validate but one doesn't, flag.

### 1.4 Error-handling divergence

A function catches `Exception` (broad) in a file where every other
function catches a specific exception type. Or vice versa: a function
doesn't catch at all in a file where every other function does.

**Detection:** Python `ast.ExceptHandler` shape across functions in the
same file; JS `catch(e)` block content; Go error returns.

This is a weak signal individually, but pairs with §1.1 — broad excepts
often mask auth/authz failures that should fail-closed.

### 1.5 Copy-paste with guard drop

Two code blocks have hash-similarity ≥0.85 across 10+ lines, but one
has a security guard the other doesn't.

**Detection:** Levenshtein-near-duplicate detection on function bodies,
then ast-diff to identify which lines are present in only one of the
pair. If the missing lines contain a guard keyword (`if`, `assert`,
`raise`, `require`, `permit`, `authorize`, `verify`), flag.

### 1.6 Naming-pattern violation in IDs

Most IDs in the codebase are UUIDs; one is sequential int. Or vice
versa. Sequential IDs are an enumeration risk.

**Detection:** profile every ORM model's primary key + every API path
parameter named `*_id`. If 80%+ are UUID/string and one is int, flag.
This is the canonical scenario from the v1.0.0 black-hat critique:
> "Why is the user ID field always numeric but the associated record
> ID is UUID?"

### 1.7 Trust-boundary irregularity (graphify integration)

If `graphify` is installed, walk the call graph. Functions that:
- Sit on an HTTP-handler→DB-write path
- Have an unusual node degree (many callers, few callees, or vice versa)
- Receive data that flows from an untrusted source without passing
  through any validator node

…are flagged for human review even if no specific rule fires. This is
the Cartography Doctrine extension from `references/triangulation.md`.

---

## 2. What we DON'T look for

- Known CVE/CWE patterns — that's SAST's job
- Style issues — out of scope
- Test code — high false-positive rate
- Generated code — anything in `**/generated/**`, `**/__generated__/**`,
  `**/*.pb.go`, `**/migrations/*`, `**/node_modules/**`, etc.
- Files < 50 lines — too little data for statistics
- Files in `**/vendor/**`, `**/third_party/**`

---

## 3. Statistical guards

To avoid noise:

- **Minimum corpus size**: §1.1, §1.3, §1.4 require ≥5 siblings before
  divergence-detection kicks in.
- **Minimum dominance**: ≥80% of siblings must share the dominant
  pattern. 60/40 splits aren't anomalies.
- **Maximum findings per category per file**: 3. If §1.4 fires 10 times
  in one file, surface the top 3 and note "+7 more" — human reviewer
  decides if the file needs refactor.
- **Cool-down**: a finding suppressed via `# nosec: semantic-anomaly`
  with a reason comment is never re-flagged on subsequent runs.

---

## 4. Output

Each semantic anomaly is a finding row with:

```json
{
  "category": "semantic_anomaly",
  "subcategory": "auth_divergence | type_inconsistency | validation_divergence |
                  error_handling_divergence | copy_paste_guard_drop |
                  id_naming_violation | trust_boundary_irregularity",
  "severity": "medium",
  "confidence": 60,
  "rule": "SEMANTIC-<subcategory>",
  "corroborated_by": ["semantic_anomaly"],
  "corroboration_score": 0.0,
  "siblings": ["users.py:GET /users", "users.py:POST /users", "..."],
  "divergent": "users.py:GET /users/{id}/avatar",
  "title": "Auth divergence: 1 of 10 handlers lacks auth",
  "explanation": "...",
  "fix": "Confirm intentional; otherwise add @require_auth.",
  "tool": "anomaly_scan.py"
}
```

Confidence is **deliberately capped at 70** — this is a heuristic
class, not a deterministic one. Most semantic findings should sit in
the 50-70 confidence band, which means they fall below the 80 surfacing
floor by default. To surface them, run the report renderer with
`--include-semantic` (see below).

---

## 5. Running it

```bash
python3 scripts/anomaly_scan.py <repo_path> \
  --output .security-audit/<TS>/semantic.json

# Merge into the unified findings (separate channel)
python3 scripts/triangulate.py .security-audit/<TS>/ --include-semantic

# Or render the report with the semantic appendix
# (template handles it via {{INCLUDE_SEMANTIC}} block)
```

By default the report's main findings section excludes semantic anomalies
(too noisy for an exec summary). They land in **Appendix C: Semantic
Anomalies** of the report — a "things worth a closer look" section that
the security reviewer walks during their human pass.

---

## 6. Calibration loop

The detector is statistical, so it needs feedback to stay sharp.

After every audit:
1. Reviewer marks each semantic finding as `confirmed_bug`, `accepted_risk`,
   or `false_positive` in `learnings.md`.
2. The next run reads `learnings.md` and adjusts:
   - `false_positive`: file/subcategory combination is suppressed for
     30 days unless the file changes meaningfully.
   - `confirmed_bug`: increase the base confidence for that subcategory
     by 2 points (clamped to 80).
3. Periodic review of `learnings.md` patterns surfaces tooling gaps
   worth addressing in the skill.

This is the compound-engineering loop from `SKILL.md §6` applied to
semantic detection.

---

## 7. Honest limits

The semantic detector will:
- Miss novel bugs that don't have sibling patterns
- Flag intentional divergences as bugs
- Produce noise on small codebases (< 5 siblings = no signal)
- Underperform on highly metaprogrammatic code (decorators that wrap
  decorators, dynamic dispatch, Ruby's `method_missing`)

It will not replace:
- A human security reviewer
- A proper threat-modeling session
- Targeted dataflow analysis (CodeQL, Joern, custom Semgrep rules)

It WILL surface the "huh, that's odd" findings that experienced
reviewers spot in the first hour of a code review — and it does so on
codebases too large for one human to skim.
