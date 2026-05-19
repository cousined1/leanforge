# Workflow: Full Audit (AUDIT mode)

## When to use
- Multi-day org or monorepo audit
- Pre-acquisition due diligence
- Annual third-party audit prep (SOC2, CMMC, ISO 27001)
- After a serious incident, comprehensive sweep

## Time budget
Hours-to-days, not minutes. Plan around the user's actual time.

## Pre-flight (do this with the user, before starting)

Confirm:
- Repo / org list (single repo? multi-repo? entire GitHub org?)
- Scope (code only? infra? cloud accounts? all environments?)
- Authorization (written permission to run DAST against running services?)
- Output (markdown report? SARIF for GH? executive summary deck?)
- Deadline
- Compliance framework target (OWASP / NIST CSF / CMMC / custom)

If any of those is unclear, ask before starting.

**v1.1.0:** run the scope planner per repo before starting to surface
the size class — XLARGE repos may need to be split into per-service
sub-audits.

```bash
for repo in $REPOS; do
  (cd "$repo" && bash scripts/scope_planner.sh --mode AUDIT) \
    > "plans/$(basename $repo).json"
done
```

## Steps (multi-day pace)

### Day 0 — Plan
1. Inventory repos and services
2. Map each to a tool plan from `references/tool_matrix.md`
3. Stand up an output directory under `.security-audit/<TS>-full/`
4. Open a notes file; will become the executive summary

### Day 1 — Per-repo REVIEW
For each repo:
- Run `workflows/review_repo.md` end-to-end
- Append findings to a global `findings.jsonl`
- Tag each finding with `repo:<name>` for later filtering

### Day 2 — Cross-cutting + Triangulation  *(v1.1.0)*

Per repo, after `review_repo.md` completes:

```bash
# Optional semantic pass (advisory; lands in Appendix C of report)
python3 scripts/anomaly_scan.py "$repo" --output "$OUT/$repo/semantic.json"

# Mandatory: triangulate to produce unified per-repo findings.jsonl
python3 scripts/triangulate.py "$OUT/$repo/" \
    --confidence-floor 80 \
    --include-semantic
```

Then org-wide:
- Aggregate per-repo `findings.jsonl` into a master `findings.jsonl`
  (preserve `repo:<name>` tag on each row)
- Aggregate SBOMs across all repos → master SBOM
- Cross-reference master SBOM against Grype + OSV-Scanner
- Look for the same vulnerable dependency across multiple services
  (Log4Shell pattern — one CVE, many services affected)
- Org-wide GHA hardening pass: run `workflows/harden_actions.md` for
  every repo with workflows

### Day 3 — Cloud / infra
- Iac scan every Terraform / CloudFormation root module
- Cloud-side config scan (use ScoutSuite for AWS/Azure/GCP, or
  Prowler for AWS, or Cloudsplaining for IAM)
- Kubernetes cluster scan with `trivy k8s` and `kube-bench`
- Network exposure: any 0.0.0.0/0 ingress on admin ports?

### Day 4 — Agent / LLM surface
For each repo with AI agent components:
- Run `workflows/ai_agent_audit.md` end-to-end
- Aggregate Phase 1–5 findings into the master report

### Day 5 — DAST (lab-only / staging)
- If the user authorized DAST: ZAP baseline + Nuclei against staging
- Manual API testing of high-value flows
- Schemathesis if OpenAPI specs are available

### Day 6 — Report
- Compose `report.md` from `templates/report.md.tmpl`
- Executive summary: top 5 risks, recommended priorities, time-to-fix
  estimates
- Detailed findings: severity-grouped, with file paths and CWE/OWASP
  references
- Compliance section: pass/fail per OWASP / NIST CSF / CMMC category
- Appendix: SBOM, tool outputs, methodology

### Day 7 — Compound retro
Write a thorough `learnings.md`:
- What worked
- Tool gaps (where automated coverage was poor)
- False-positive patterns to suppress next year
- Recommendations for the next audit cycle

## Output structure
```
.security-audit/<TS>-full/
├── findings.jsonl                   # aggregated across all repos
├── report.md                        # executive + detailed
├── exec_summary.md                  # top-line for non-technical readers
├── compliance/
│   ├── owasp_top10_2025.md
│   ├── nist_csf_2.md
│   └── cmmc_2.md                    # if applicable
├── sbom/
│   ├── master.cdx.json
│   └── per-repo/*.cdx.json
├── per-repo/
│   └── <repo-name>/
│       ├── findings.jsonl
│       ├── report.md
│       └── tool-outputs/
├── infra/
│   ├── terraform-checkov.json
│   ├── cloud-scout.json
│   └── k8s-trivy.json
├── dast/
│   └── zap-baseline-*.html
├── learnings.md
└── audit_log.jsonl
```

## Quality bar (must be true to call it done)
- [ ] Every CRITICAL finding has a reproduction step or screenshot
- [ ] Every HIGH finding has a CWE and OWASP/NIST mapping
- [ ] No quoted code in the report exceeds 15 lines per source file
      (use file:line references for longer code)
- [ ] Executive summary is < 1 page and avoids jargon
- [ ] All tool versions and scan dates recorded for reproducibility

## Refuse list
- Don't audit a system the user doesn't appear to own or have authorization
  to test
- Don't promise compliance certification — the audit prepares for it, an
  accredited auditor signs it off
