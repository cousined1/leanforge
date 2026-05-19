# Triangulation Doctrine

> **Rule of Three Witnesses**: a finding's authority increases sub-linearly
> with each independent tool that corroborates it. One witness = lead.
> Two = signal. Three = case.

Added in v1.1.0. Closes the "tool synergy" gap identified in the v1.0.0
black-hat review: SAST tools fight each other's context, and the v1.0.0
skill reported overlapping findings as separate findings, diluting signal.

This module sits **after** the raw scan step in `workflows/review_repo.md`
and `workflows/full_audit.md`, and **before** report rendering. It
consumes the raw tool outputs in `.security-audit/<TS>/` and writes a
unified `findings.jsonl`.

---

## 1. Why this matters

A single SQL injection on `users.py:142` can light up:

- **bandit** B608 (Possible SQL injection)
- **semgrep** `python.lang.security.audit.sql-injection`
- **gosec** G201 (if it's a Go file)
- **CodeQL** `py/sql-injection`
- **manual review** comment

Without triangulation, that's five rows in `findings.jsonl` pointing at
the same bug. The report becomes a dilution attack: real critical
findings drown in tool-overlap noise.

With triangulation, that's **one** finding with `corroboration_score=5`
and `confidence=100` — and the next time bandit alone flags something
in a similar-looking line, it gets `corroboration_score=1` and a
proportionally lower confidence floor.

---

## 2. Algorithm

For each raw finding produced by a scanner:

1. **Normalize** to a canonical shape:
   ```
   { file_canonical, line, rule_class, severity, tool, snippet, raw }
   ```
   - `file_canonical` — resolve symlinks, normalize separators, strip
     repo root
   - `line` — int, or None for file-scope findings
   - `rule_class` — mapped from the tool's rule ID to a unified vocabulary
     (see §3)
   - `severity` — one of `critical/high/medium/low/info`

2. **Bucket** by `(file_canonical, line // BUCKET_SIZE)` where
   `BUCKET_SIZE = 5`. This collapses near-line findings.

3. **Group within bucket** by `rule_class`. Findings within the same
   bucket+class are corroborating witnesses.

4. **Synthesize** a unified finding per group:
   - `severity` = max across witnesses
   - `confidence` = `base + 8 * (n-1)` clamped to `[0, 100]`
     - `base` per tool (see §4): high-precision tools = 75, broad tools = 55
   - `corroborated_by` = sorted list of tool names
   - `corroboration_score` = `n / total_applicable_tools` (where
     `total_applicable_tools` is the count of tools that ran on this file
     type, NOT total tools that ran)
   - `snippet` = the longest snippet across witnesses
   - `rule` = the canonical rule class plus the strongest mapping (e.g.
     `CWE-89 | OWASP A05:2025 | bandit:B608 | semgrep:sql-injection`)

5. **Singleton handling** (only one witness):
   - Keep the finding, but flag `corroborated_by: [tool]`,
     `corroboration_score < 1/applicable_tools`
   - The 80-confidence floor in `SKILL.md §3 Hard Rule 5` filters out
     low-confidence singletons. After triangulation, the floor is
     applied to the SYNTHESIZED confidence, not the per-tool confidence.

6. **Conflict resolution** when tools disagree:
   - Severity disagreement → take the highest, but record disagreement
     in `severity_disputed: true`. Surface in the report for human review.
   - Same line, different rule classes (one tool sees SQLi, another sees
     XSS) → emit BOTH findings; they may be both true.

---

## 3. Rule class vocabulary

Tool rule IDs map to a unified vocabulary. The mapping lives in
`scripts/triangulate.py`'s `RULE_CLASS_MAP`. The vocabulary:

| Rule class | Examples |
|---|---|
| `sql_injection` | bandit B608, semgrep sql-injection-*, gosec G201/G202, CWE-89 |
| `command_injection` | bandit B602–B605, semgrep dangerous-system-call, gosec G204, CWE-78 |
| `path_traversal` | bandit B109, semgrep tainted-path-traversal, CWE-22 |
| `xss` | semgrep dangerously-set-inner-html, ESLint react/no-danger, CWE-79 |
| `hardcoded_secret` | bandit B105/B106, gitleaks, trufflehog, CWE-798 |
| `weak_crypto` | bandit B303–B305, semgrep md5/sha1-used, CWE-327 |
| `insecure_deserialization` | bandit B301/B403/B506, semgrep avoid-pickle, CWE-502 |
| `weak_random` | bandit B311, semgrep math-random, CWE-330 |
| `ssrf` | semgrep ssrf-*, CWE-918, OWASP A01:2025 |
| `xxe` | bandit B313–B320, semgrep xxe-*, CWE-611 |
| `open_redirect` | semgrep open-redirect, CWE-601 |
| `missing_auth` | manual, semgrep custom rules, CWE-862 |
| `missing_authz` | manual, semgrep custom rules, CWE-863 |
| `csrf` | semgrep csrf-*, CWE-352 |
| `clickjacking` | manual headers check, CWE-1021 |
| `cve_dependency` | trivy, grype, osv-scanner (mapped to CVE ID) |
| `container_misconfig` | trivy misconfig, hadolint, CIS-Docker |
| `iac_misconfig` | tfsec, checkov, KICS |
| `gha_template_injection` | zizmor template-injection, CWE-94 |
| `gha_unpinned_action` | zizmor unpinned-action, CWE-1357 |

When extending the mapping, add to `RULE_CLASS_MAP` and document the
class here.

---

## 4. Per-tool base confidence

Reflects the tool's precision in our experience. Bandit and semgrep are
broad; CodeQL and gitleaks are precise. Adjust as you collect false-
positive data in `learnings.md` and feed back into the mapping.

| Tool | Base confidence | Notes |
|---|---|---|
| codeql | 80 | Deep dataflow; rare FPs |
| gitleaks | 80 | High-entropy + signature combo |
| trufflehog (verified) | 90 | Only emits verified findings in default config |
| trivy (CVE) | 85 | Tied to NVD/GHSA; usually right about CVE presence |
| grype | 85 | Same source data |
| osv-scanner | 85 | OSV.dev; broader ecosystem |
| semgrep (curated) | 70 | Good signal on curated rulesets; FPs on custom |
| bandit | 60 | Broad rules; many FPs in test code, fixtures |
| gosec | 65 | Good Go-specific signal |
| njsscan | 60 | Similar profile to bandit for Node |
| brakeman | 75 | Rails-aware, low FP |
| zizmor | 85 | Specific to GHA; high precision |
| actionlint | 80 | Syntax-focused, very low FP |
| hadolint | 70 | Style + safety mix |
| checkov | 70 | IaC policy; some FPs on intentional configs |
| tfsec | 70 | Similar to checkov |
| manual | 70 | Variable; depends on reviewer |

---

## 5. Confidence interpretation after triangulation

| Synthesized confidence | Meaning |
|---|---|
| 95–100 | 3+ tools agree, or one high-precision tool with corroborating dataflow |
| 80–94 | 2 tools agree, OR one high-precision tool alone |
| 60–79 | Single broad tool; needs human verification |
| < 60 | Logged only, not surfaced |

The skill's 80-confidence floor (Hard Rule 5) applies to **synthesized**
confidence, not raw per-tool confidence. This is the critical change in
v1.1.0.

---

## 6. Output schema additions (v1.1.0)

`findings.jsonl` rows now include three new fields:

```json
{
  "id": "SEC-2026-0001",
  "severity": "high",
  "confidence": 92,
  "rule": "CWE-89 | OWASP A05:2025",
  "corroborated_by": ["bandit", "semgrep"],
  "corroboration_score": 0.40,
  "severity_disputed": false,
  "...": "..."
}
```

- `corroborated_by` — array of tool names that found this issue
- `corroboration_score` — `len(corroborated_by) / applicable_tools`,
  range [0, 1]
- `severity_disputed` — true when tools disagreed on severity

---

## 7. Running it

```bash
# After baseline_scan.sh has populated .security-audit/<TS>/
python3 scripts/triangulate.py .security-audit/<TS>/

# Output:
#   .security-audit/<TS>/findings.jsonl       (unified)
#   .security-audit/<TS>/triangulation.json   (raw groupings, audit trail)
```

The unified `findings.jsonl` is what gets fed to `templates/report.md.tmpl`,
to `n8n-specialist` for routing, and to `claude-context` for retrieval.

---

## 8. Failure modes & guards

- **Tool that scanned 0 files** (e.g. gosec on a Python-only repo)
  must not count against `applicable_tools` in the score denominator.
  `triangulate.py` reads each tool's run metadata and counts only tools
  that actually scanned ≥1 file.
- **Aggressive bucketing** (BUCKET_SIZE too large) can fuse unrelated
  findings. Default 5; reduce to 1 for high-density files like
  `models.py` with many ORM calls.
- **Custom semgrep rules** are not in `RULE_CLASS_MAP` by default —
  they get `rule_class = f"semgrep:{rule_id}"` and corroborate only with
  themselves. Add them to the map when they're stable.

---

## 9. Feedback into learnings.md

After every audit, the triangulation script appends to `learnings.md`:

- Rules that corroborated across N+ tools — promote to "tier-1 signal"
- Rules that fired in only one tool, repeatedly, with manual review
  marking them FP — candidates for the suppression list
- Tool pairs that disagreed on severity > 3 times — review the
  per-tool base confidence in §4

This is the compound-engineering loop from `SKILL.md §6` applied
specifically to the triangulation layer.
