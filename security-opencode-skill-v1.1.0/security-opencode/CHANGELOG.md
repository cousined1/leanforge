# Changelog

All notable changes to security-opencode are documented here.

## [1.1.0] — 2026-05-14

The "Doctrine Hardening" release. Addresses the four gaps identified in
the v1.0.0 black-hat review: tool synergy, intent validation, scope
management, and unknown unknowns.

### Added

- **Triangulation Layer** — multi-tool finding correlation
  - `references/triangulation.md` — doctrine, algorithm, rule-class
    vocabulary, per-tool base confidences
  - `scripts/triangulate.py` — consumes `.security-audit/<TS>/*.json`
    tool outputs, produces unified `findings.jsonl` with
    `corroborated_by`, `corroboration_score`, `severity_disputed`,
    `witnesses` fields
  - Supports: bandit, semgrep, gosec, gitleaks, trufflehog, trivy, grype,
    osv-scanner, zizmor, actionlint, hadolint, checkov, tfsec, njsscan,
    brakeman, semantic anomaly findings
  - Bucket-based grouping (default 5-line window) with conflict resolution
    on severity disagreements
  - Confidence synthesis: `base + 8*(n-1)` clamped to [0, 100]
  - 80-confidence floor now applies to synthesized confidence, not raw
    per-tool

- **Intent Validation Layer** — regression-proof remediation
  - `workflows/validate_remediation.md` — VALIDATE mode runbook
  - `scripts/validate_remediation.sh` — scoped re-scan, baseline diff,
    PASS/FAIL/REVIEW verdict
  - Adversarial re-prompt step: agent must produce structured assessment
    of correct / complete / regressions / bypass paths
  - New operating mode: VALIDATE
  - Hard Rule #12: FAIL verdict blocks merge with no override
  - PR-comment template for posting verdicts

- **Adaptive Depth Control** — mode × size × stack planning
  - `scripts/scope_planner.sh` — profiles repo, emits `scan_plan.json`
  - Repo size classes: small (<50K LOC) / medium (<200K) / large (<1M) /
    xlarge (1M+)
  - Per-mode time budgets: TRIAGE 2min → AUDIT 4h+ (with size multipliers)
  - Sampling strategies: full / diff_only / sampled / sampled_heavy
  - Hard Rule #13: always plan before scanning

- **Semantic Anomaly Detector** — emergent-bug detection via sibling
  divergence
  - `references/semantic_anomaly.md` — doctrine, detector catalog,
    statistical guards, calibration loop
  - `scripts/anomaly_scan.py` — Python AST-based detector for:
    - auth_divergence (route handler missing auth in protected file)
    - validation_divergence (sensitive param unvalidated)
    - error_handling_divergence (broad except in specific-handler file)
    - id_naming_violation (sequential int ID in UUID codebase)
  - Confidence capped at 60 (heuristic class)
  - Findings land in report Appendix C, not main section
  - Hard Rule #14: semantic findings are advisory only

### Changed

- `findings.jsonl` schema gains 6 fields: `corroborated_by`,
  `corroboration_score`, `severity_disputed`, `category`, `witnesses`,
  `rule_class`
- Hard Rule #5 (confidence floor): floor now applies to synthesized
  confidence post-triangulation, not raw per-tool confidence
- `SKILL.md §1` operating-modes table adds VALIDATE row
- `SKILL.md §2` decision tree branches to VALIDATE when a previous audit
  + proposed fix is present
- `SKILL.md §6` audit output directory schema adds `triangulation.json`,
  `scan_plan.json`, `semantic.json`
- Quick-start (§9) now leads with `scope_planner.sh` and ends with
  `triangulate.py` (mandatory) and `validate_remediation.sh` (post-fix)
- `README.md` updated to advertise v1.1.0 capabilities

### Tool support matrix

Triangulation parsers exist for:
- bandit, semgrep, gosec, brakeman, njsscan, hadolint
- gitleaks, trufflehog
- trivy (fs / image / config), grype, osv-scanner
- zizmor, actionlint, checkov, tfsec
- anomaly_scan.py (semantic class)

To extend: add a parser function in `scripts/triangulate.py` and a
rule-class mapping under `RULE_CLASS_MAP[tool]`.

### Migration from v1.0.0

Existing v1.0.0 audits continue to work — the new fields are additive.
For best results on existing `.security-audit/<TS>/` directories:

```bash
# Re-triangulate prior raw outputs into the new schema
python3 scripts/triangulate.py .security-audit/<old_TS>/ \
    --confidence-floor 80
```

This overwrites the old `findings.jsonl` with the unified version while
preserving the raw tool outputs.

## [1.0.0] — 2026-05-14

Initial release. See README for full feature list. Derived from
comprehensive security reference + Security_skill.md v2.0 + GODMYTHOS
v10 doctrine. Adds: structured findings contract, compound-engineering
hooks, 6 operating modes, 6 workflow runbooks, cross-skill handoff
table, Telegram routing.
