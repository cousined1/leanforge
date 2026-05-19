# Workflow: Review Repo (REVIEW mode)

## When to use
- A whole repo audit, not just a PR
- User says "audit this service", "is this app secure", "review my repo"
- Time budget 15-30 minutes

## Steps

### Step 0 — Plan the depth (30s)  *(v1.1.0)*

```bash
cd <repo>
TS=$(date -u +%Y%m%dT%H%M%SZ)
OUT=".security-audit/$TS-review"
mkdir -p "$OUT"

bash scripts/scope_planner.sh --mode REVIEW --output "$OUT/scan_plan.json"
```

The resulting `scan_plan.json` tells you which tools to run, time budget,
and sampling strategy. **Obey the plan.** Don't run tools the planner
excluded for this stack/size combination.

### Step 1 — Recon (1 min)
```bash

# Stack detection
ls -la
cat README* 2>/dev/null | head -50
git log --oneline -20

# Identify languages
find . -type f \( -name "*.py" -o -name "*.js" -o -name "*.ts" \
  -o -name "*.go" -o -name "*.rb" -o -name "*.php" -o -name "*.java" \
  -o -name "*.rs" \) | head -50

# Build manifests
ls package.json requirements.txt go.mod Cargo.toml composer.json \
   Gemfile pom.xml build.gradle 2>/dev/null
```

If unsure, look up `references/tool_matrix.md` to map stack → tools.

### Step 2 — Toolchain check (1 min)
```bash
bash scripts/install_toolchain.sh --check
```
Install anything missing.

### Step 3 — Run the scanners (5-10 min)
```bash
bash scripts/baseline_scan.sh "$OUT"
```
This runs (per `baseline_scan.sh`): gitleaks → semgrep → bandit/eslint/
gosec (lang-specific) → trivy fs → safety/npm-audit (lang-specific) →
optionally syft for SBOM.

### Step 4 — Manual review (10-15 min)
Walk `checklists/secure_code_review.md` against the codebase. Focus on:
- Routes / endpoints (auth, authz, input validation)
- Database queries (parameterized?)
- Crypto usage (`references/cryptography.md`)
- Auth & session handling
- Secrets management
- Error handling
- Logging

For each finding, write a row to `findings.jsonl` per the SKILL.md §7
contract.

### Step 5 — IaC / containers (3-5 min)
If `Dockerfile`, `docker-compose.yml`, `k8s/`, `terraform/` present →
run the checks in `references/iac_container_security.md`.

### Step 6 — Workflows (2 min)
If `.github/workflows/` present → quick `zizmor` pass per
`workflows/harden_actions.md` Step 2.

### Step 7 — Dependency / SBOM (2 min)
```bash
bash scripts/generate_sbom.sh "$OUT/sbom.cdx.json"
grype sbom:"$OUT/sbom.cdx.json" -o json > "$OUT/grype.json"
osv-scanner --sbom="$OUT/sbom.cdx.json" --format=json > "$OUT/osv.json"
```

### Step 8 — Triangulate raw findings  *(v1.1.0, MANDATORY)*

```bash
# Optional semantic anomaly pass first (advisory findings appendix)
python3 scripts/anomaly_scan.py . --output "$OUT/semantic.json"

# Mandatory: collapse overlapping tool findings into unified findings.jsonl
python3 scripts/triangulate.py "$OUT/" \
    --confidence-floor 80 \
    --include-semantic
```

This produces `$OUT/findings.jsonl` (unified) and `$OUT/triangulation.json`
(audit trail). The 80-confidence floor applies to the synthesized
confidence, not the raw per-tool confidence — see
`references/triangulation.md §5`.

### Step 9 — Render report (1 min)
```bash
cp templates/report.md.tmpl "$OUT/report.md"
# Substitute findings counts, project name, date.
```

### Step 10 — Compound retro (1 min)
Append to `$OUT/learnings.md`:
- Which tools surfaced findings the others missed?
- Any false positives that recurred?
- Anything that wasn't checked because tooling was missing?

### Step 11 — Optional: route alerts
If user has Telegram/Slack/n8n configured, offer to route CRITICAL/HIGH
findings via `n8n-specialist`.

## Output structure (matches SKILL.md §6)
```
.security-audit/<timestamp>/
├── findings.jsonl
├── report.md
├── sbom.cdx.json
├── learnings.md
└── audit_log.jsonl
```

Plus tool-specific outputs in the same directory:
- `semgrep.json`, `bandit.json`, `gosec.json`, etc.
- `trivy.json`, `zizmor.json`
- `grype.json`, `osv.json`
- `gitleaks.json`
