# security-opencode

> **A platform-agnostic application-security skill for AI coding agents.**
> Turns Claude Code, OpenCode, Codex, Kilo, or Antigravity into a competent
> appsec reviewer, supply-chain auditor, CI/CD hardener, AI-agent auditor,
> and — new in v1.1.0 — a self-correcting, self-auditing system.

**Version:** 1.1.0
**Lineage:** GODMYTHOS v10 doctrine · Security_skill.md v2.0 · Cartography
**Compatible with:** Claude Code, OpenCode, Codex, Kilo Code, Google Antigravity
**Companion skills:** claude-context, graphify, openspace-secure, n8n-specialist

---

## What's new in v1.1.0

Four new doctrine layers, in response to the v1.0.0 black-hat review:

1. **Triangulation Layer** — multi-tool finding correlation. The same SQL
   injection from bandit + semgrep + gosec lands as **one** unified
   finding with `corroborated_by: [bandit, semgrep, gosec]` and a
   synthesized confidence score, not three duplicate rows.
   → `scripts/triangulate.py` + `references/triangulation.md`

2. **Intent Validation Layer** — every remediation re-scanned before
   merge. PASS/FAIL/REVIEW verdict on whether the fix closes the original
   finding without introducing new ones. **FAIL = no override.** Includes
   adversarial re-prompt step where the agent must structurally justify
   the fix against bypass paths.
   → `scripts/validate_remediation.sh` + `workflows/validate_remediation.md`

3. **Adaptive Depth Control** — the scope planner. Profiles repo size,
   detected stack, and operating mode → emits a `scan_plan.json` with the
   exact tools to run, time budget, and sampling strategy. AUDIT mode on
   a 1M-LOC monorepo no longer tries to run everything.
   → `scripts/scope_planner.sh`

4. **Semantic Anomaly Detector** — emergent-bug detection via statistical
   sibling-divergence within the codebase. Finds "odd sibling" patterns
   no CVE catalog knows about: a route handler missing auth where its
   peers have it, a sensitive parameter unvalidated where its repo-wide
   peers are validated, sequential int IDs in an otherwise-UUID codebase.
   → `scripts/anomaly_scan.py` + `references/semantic_anomaly.md`

See `CHANGELOG.md` for the full delta.

---

## What this is

A modular skill (entry point `SKILL.md`, deferred-read references +
workflows + checklists + scripts) covering:

- **7 operating modes:** TRIAGE / REVIEW / AUDIT / HARDEN / AGENT-AUDIT /
  INCIDENT / **VALIDATE** *(v1.1.0)*
- **OWASP Top 10:2025** mapping (verified against the late-2025 final release)
- **NIST CSF 2.0** mapping with the new GOVERN function
- **5-phase AI agent audit framework** (human-in-loop → prompt injection
  → defense in depth → trust hardening → observability)
- **CI/CD hardening** (Zizmor, Poutine, Actionlint, pinact, harden-runner)
- **IaC + containers + SBOM** (Trivy, Checkov, TFSec, Syft, Grype, OSV)
- **DAST** (ZAP, Nuclei, Schemathesis) with hard rules around authorized
  targets
- **Triangulation / Intent Validation / Adaptive Depth / Semantic
  Anomaly** *(v1.1.0)*
- **Compound-engineering hooks:** every audit writes `learnings.md` for
  future runs to read first
- **Structured findings.jsonl** contract for downstream routing
- **Cross-skill handoffs** to n8n-specialist, graphify, claude-context,
  Security_skill.md v2.0

## Files (v1.1.0)

```
security-opencode/
├── SKILL.md                          # entry point (v1.1.0)
├── README.md                         # this file
├── CHANGELOG.md                      # v1.0.0 → v1.1.0 delta
├── sources.md                        # upstream citations + doctrines
├── references/
│   ├── ai_agent_security.md          # 5-phase LLM/agent framework
│   ├── cicd_hardening.md             # GitHub Actions threat model
│   ├── cryptography.md               # pragmatic crypto guidance
│   ├── dast_pentesting.md            # ZAP / Nuclei / authorized-only
│   ├── iac_container_security.md     # Docker / k8s / Terraform / SBOM
│   ├── sast_tools.md                 # per-tool deep-dive
│   ├── semantic_anomaly.md           # ★ Rule of the Odd Sibling
│   ├── tool_matrix.md                # language → tool decision table
│   ├── training_environments.md      # safe practice targets
│   └── triangulation.md              # ★ Rule of Three Witnesses
├── checklists/
│   ├── api_security.md               # OWASP API Top 10 + GraphQL/REST
│   ├── nist_csf_2.md                 # full subcategory map
│   ├── owasp_top10_2025.md           # verified 2025 mapping
│   └── secure_code_review.md         # manual PR-review heuristic
├── workflows/
│   ├── ai_agent_audit.md             # AGENT-AUDIT mode runbook
│   ├── full_audit.md                 # AUDIT mode (multi-day)
│   ├── harden_actions.md             # HARDEN mode (GHA)
│   ├── incident_response.md          # INCIDENT mode
│   ├── review_repo.md                # REVIEW mode (single repo)
│   ├── triage_pr.md                  # TRIAGE mode (PR / single file)
│   └── validate_remediation.md       # ★ Rule of the Second Pass
├── scripts/
│   ├── anomaly_scan.py               # ★ semantic anomaly detector
│   ├── baseline_scan.sh              # full SAST + secrets + SCA sweep
│   ├── generate_sbom.sh              # syft + grype + osv + cosign
│   ├── install_toolchain.sh          # Linux/macOS (Talisha)
│   ├── install_toolchain.ps1         # Windows (Javante, Scoop)
│   ├── pin_actions.sh                # automated SHA-pinning for GHA
│   ├── scope_planner.sh              # ★ adaptive depth control
│   ├── triangulate.py                # ★ conflict resolver / unifier
│   └── validate_remediation.sh       # ★ intent validation runner
└── templates/
    └── report.md.tmpl                # report scaffold

★ = added in v1.1.0
```

---

## Install — per platform

The skill is one folder. Drop it where each agent looks for skills.

### Claude Code (Javante, Windows)
```powershell
Move-Item -Path .\security-opencode -Destination "$HOME\.claude\skills\security-opencode"
```

### Claude Code (Talisha, Ubuntu)
```bash
mv security-opencode ~/.claude/skills/
```

### OpenCode
```bash
mv security-opencode ~/.openclaw/skills/
opencode reload-skills
```
Config check: `C:\Users\Eddie\.openclaw\openclaw.json` should list the
skills directory.

### Codex (codex-subagents)
Place under the `subagents/skills/` directory. Codex reads YAML
frontmatter from `SKILL.md` for trigger keywords.

### Kilo Code
```bash
mv security-opencode ~/.kilo/skills/
```

### Google Antigravity
```bash
ln -s $(realpath ./security-opencode) ~/.antigravity/agents/sec/skills/
```

### Generic
Drop the folder anywhere the agent searches for skills. Entry point is
`SKILL.md`.

---

## Install — toolchain

Linux / macOS (Talisha):
```bash
bash scripts/install_toolchain.sh         # full
bash scripts/install_toolchain.sh --core  # SAST + secrets + SBOM only
bash scripts/install_toolchain.sh --check # report status only
```

Windows (Javante, requires Scoop):
```powershell
pwsh scripts/install_toolchain.ps1
pwsh scripts/install_toolchain.ps1 -Core
pwsh scripts/install_toolchain.ps1 -Check
```

---

## Quick-start (v1.1.0 flow)

```bash
# 1. Plan the scope (every run, every mode)
bash scripts/scope_planner.sh --mode REVIEW

# 2. Run the planned baseline sweep
TS=$(date -u +%Y%m%dT%H%M%SZ)
bash scripts/baseline_scan.sh ".security-audit/$TS-review"

# 3. Optional: semantic anomaly pass (sibling-divergence detection)
python3 scripts/anomaly_scan.py . --output ".security-audit/$TS-review/semantic.json"

# 4. Triangulate raw tool outputs into unified findings.jsonl
python3 scripts/triangulate.py ".security-audit/$TS-review/" \
    --confidence-floor 80 \
    --include-semantic

# 5. Render report from template
cp templates/report.md.tmpl ".security-audit/$TS-review/report.md"
# (substitute findings counts, severity, etc.)

# 6. After a fix is proposed, validate before merge
bash scripts/validate_remediation.sh \
    --baseline ".security-audit/$TS-review/" \
    --output   ".security-audit/$(date -u +%Y%m%dT%H%M%SZ)-validation/" \
    --strict
```

Or, naturally:
- "Audit this repo for security issues" → REVIEW mode with full v1.1.0 pipeline
- "Validate this PR fix" → VALIDATE mode
- "Lock down my GitHub Actions" → HARDEN mode
- "Is my LangChain agent safe?" → AGENT-AUDIT mode

The skill picks the right mode from trigger phrases in `SKILL.md §0` and
runs `scope_planner.sh` first to scale depth to repo size.

---

## Output contract (v1.1.0 schema)

```
.security-audit/<timestamp>/
├── scan_plan.json       # what was planned (adaptive depth)
├── findings.jsonl       # unified (post-triangulation)
├── triangulation.json   # audit trail
├── semantic.json        # semantic anomalies (advisory)
├── report.md            # human report
├── sbom.cdx.json        # CycloneDX SBOM (AUDIT mode)
├── learnings.md         # retrospective — next run reads first
└── audit_log.jsonl      # full provenance
```

Each findings.jsonl row (new v1.1.0 fields in bold):

```json
{
  "id": "SEC-2026-0001",
  "severity": "high",
  "confidence": 92,
  "title": "...",
  "rule": "sql_injection | bandit:B608 | semgrep:py/sql-injection",
  "rule_class": "sql_injection",
  "file": "src/api/users.py",
  "line": 142,
  "snippet": "...",
  "corroborated_by": ["bandit", "semgrep"],
  "corroboration_score": 0.40,
  "severity_disputed": false,
  "category": "vulnerability",
  "witnesses": [...],
  "detected_at": "2026-05-14T..."
}
```

Consumable by `n8n-specialist` for routing and `claude-context` for
retrieval.

---

## Three new doctrine rules (v1.1.0)

- **Rule of Three Witnesses** (`references/triangulation.md`): a finding's
  authority increases sub-linearly with each independent tool corroboration.
- **Rule of the Second Pass** (`workflows/validate_remediation.md`): every
  security fix is itself a code change, and code changes introduce
  vulnerabilities. The fix must be proven not to introduce vulnerability
  B before merge.
- **Rule of the Odd Sibling** (`references/semantic_anomaly.md`): when a
  function differs from its siblings in a security-relevant way, the
  difference is the finding.

---

## Notes for Eddie

- **Wazuh** (`10.0.0.179`) is wired in throughout as the SIEM endpoint
  for `DE.CM-01/09` and `A09:2025` controls.
- **BoardMeeting Telegram group** (`-5030461334`) via
  `@JavonteWindows11_bot` is the default alert routing channel.
- **Coolify on Talisha** (TrueNAS SCALE VM) has dedicated notes in
  `references/iac_container_security.md`.
- **StormAtlas** is referenced as a hardened-pattern example in
  `references/cryptography.md` and the OWASP A04 section.
- This skill **defers governance/compliance docs** to your existing
  `Security_skill.md v2.0` — they coexist, not overlap.
- **graphify** integration: triangulate.py + anomaly_scan.py are designed
  to consume a future `cartography.json` from graphify for trust-boundary
  irregularity detection (see `references/semantic_anomaly.md §1.7`).

---

## License & versioning

MIT. v1.1.0 (2026-05-14). Bump OWASP/NIST when upstream frameworks
revise; bump AI agent section when OWASP LLM Top 10 updates; bump
triangulation `RULE_CLASS_MAP` when adding new tools.

For governance / compliance / training material → `Security_skill.md v2.0`.
For deep-dive design discussions → GODMYTHOS v10 doctrine.
