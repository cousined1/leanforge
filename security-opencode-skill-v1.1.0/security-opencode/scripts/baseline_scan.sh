#!/usr/bin/env bash
# baseline_scan.sh
# ---------------------------------------------------------------------------
# Run the full baseline SAST + secrets + SCA + IaC sweep on the current repo.
# Detects available tools and skips missing ones. Writes outputs under
# .security-audit/<timestamp>/.
#
# Usage:
#   bash scripts/baseline_scan.sh [output_dir]
# ---------------------------------------------------------------------------

set -euo pipefail

TS=$(date -u +%Y%m%dT%H%M%SZ)
OUT="${1:-.security-audit/$TS-baseline}"
mkdir -p "$OUT"
LOG="$OUT/log.txt"

log() { echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LOG"; }

log "=== baseline_scan.sh starting ==="
log "output: $OUT"

# --- detect stack -----------------------------------------------------------

declare -A LANGS
[[ -f package.json ]] && LANGS[node]=1
[[ -f requirements.txt || -f pyproject.toml || -f setup.py || -f Pipfile ]] && LANGS[python]=1
[[ -f go.mod ]] && LANGS[go]=1
[[ -f Cargo.toml ]] && LANGS[rust]=1
[[ -f composer.json ]] && LANGS[php]=1
[[ -f Gemfile ]] && LANGS[ruby]=1
[[ -f pom.xml || -f build.gradle || -f build.gradle.kts ]] && LANGS[java]=1
[[ -f Dockerfile || -f docker-compose.yml || -f docker-compose.yaml ]] && LANGS[docker]=1
[[ -d .github/workflows ]] && LANGS[gha]=1
find . -maxdepth 3 -name "*.tf" 2>/dev/null | head -1 | grep -q . && LANGS[terraform]=1
find . -maxdepth 3 -path "*/k8s/*.yaml" 2>/dev/null | head -1 | grep -q . && LANGS[k8s]=1

log "detected stack: ${!LANGS[*]}"

# --- 1. secrets sweep -------------------------------------------------------

if command -v gitleaks &>/dev/null; then
  log "→ gitleaks"
  gitleaks dir . --report-format json --report-path "$OUT/gitleaks.json" --no-banner 2>>"$LOG" || true
  if command -v gitleaks &>/dev/null && [[ -d .git ]]; then
    gitleaks git . --report-format json --report-path "$OUT/gitleaks-history.json" --no-banner 2>>"$LOG" || true
  fi
fi

if command -v trufflehog &>/dev/null; then
  log "→ trufflehog (filesystem, verified only)"
  trufflehog filesystem . --only-verified --json > "$OUT/trufflehog.jsonl" 2>>"$LOG" || true
fi

# --- 2. multi-lang SAST -----------------------------------------------------

if command -v semgrep &>/dev/null; then
  log "→ semgrep (auto config)"
  semgrep --config auto --json -o "$OUT/semgrep.json" --metrics off . 2>>"$LOG" || true
fi

# --- 3. lang-specific SAST --------------------------------------------------

if [[ -n "${LANGS[python]+x}" ]] && command -v bandit &>/dev/null; then
  log "→ bandit"
  bandit -r . -f json -o "$OUT/bandit.json" --exit-zero 2>>"$LOG" || true
fi

if [[ -n "${LANGS[python]+x}" ]] && command -v pip-audit &>/dev/null; then
  log "→ pip-audit"
  pip-audit --format json --output "$OUT/pip-audit.json" 2>>"$LOG" || true
fi

if [[ -n "${LANGS[node]+x}" ]] && command -v npm &>/dev/null; then
  log "→ npm audit"
  npm audit --json > "$OUT/npm-audit.json" 2>>"$LOG" || true
fi

if [[ -n "${LANGS[node]+x}" ]] && command -v njsscan &>/dev/null; then
  log "→ njsscan"
  njsscan --json -o "$OUT/njsscan.json" . 2>>"$LOG" || true
fi

if [[ -n "${LANGS[go]+x}" ]] && command -v gosec &>/dev/null; then
  log "→ gosec"
  gosec -fmt json -out "$OUT/gosec.json" -quiet ./... 2>>"$LOG" || true
fi

if [[ -n "${LANGS[go]+x}" ]] && command -v govulncheck &>/dev/null; then
  log "→ govulncheck"
  govulncheck -json ./... > "$OUT/govulncheck.json" 2>>"$LOG" || true
fi

if [[ -n "${LANGS[rust]+x}" ]] && command -v cargo &>/dev/null; then
  log "→ cargo audit"
  cargo audit --json > "$OUT/cargo-audit.json" 2>>"$LOG" || true
fi

# --- 4. IaC / containers ---------------------------------------------------

if [[ -n "${LANGS[docker]+x}" ]] && command -v trivy &>/dev/null; then
  log "→ trivy fs (vuln+misconfig+secret)"
  trivy fs --scanners vuln,misconfig,secret --severity HIGH,CRITICAL --format json -o "$OUT/trivy-fs.json" . 2>>"$LOG" || true
fi

if [[ -n "${LANGS[docker]+x}" ]] && command -v hadolint &>/dev/null; then
  log "→ hadolint"
  if [[ -f Dockerfile ]]; then
    hadolint Dockerfile --format json > "$OUT/hadolint.json" 2>>"$LOG" || true
  fi
fi

if [[ -n "${LANGS[terraform]+x}" ]] && command -v tfsec &>/dev/null; then
  log "→ tfsec"
  tfsec . --format json --out "$OUT/tfsec.json" 2>>"$LOG" || true
fi

if [[ -n "${LANGS[terraform]+x}" ]] && command -v checkov &>/dev/null; then
  log "→ checkov (terraform)"
  checkov -d . --framework terraform -o json --output-file-path "$OUT/" 2>>"$LOG" || true
  [[ -f "$OUT/results_json.json" ]] && mv "$OUT/results_json.json" "$OUT/checkov-tf.json"
fi

if [[ -n "${LANGS[k8s]+x}" ]] && command -v checkov &>/dev/null; then
  log "→ checkov (kubernetes)"
  checkov -d . --framework kubernetes -o json --output-file-path "$OUT/k8s/" 2>>"$LOG" || true
fi

# --- 5. GHA hardening ------------------------------------------------------

if [[ -n "${LANGS[gha]+x}" ]] && command -v zizmor &>/dev/null; then
  log "→ zizmor"
  zizmor --format json .github/workflows/ > "$OUT/zizmor.json" 2>>"$LOG" || true
fi

if [[ -n "${LANGS[gha]+x}" ]] && command -v actionlint &>/dev/null; then
  log "→ actionlint"
  actionlint -format '{{json .}}' > "$OUT/actionlint.json" 2>>"$LOG" || true
fi

# --- 6. SBOM ---------------------------------------------------------------

if command -v syft &>/dev/null; then
  log "→ syft (CycloneDX SBOM)"
  syft dir:. -o cyclonedx-json="$OUT/sbom.cdx.json" -q 2>>"$LOG" || true
fi

if [[ -f "$OUT/sbom.cdx.json" ]] && command -v grype &>/dev/null; then
  log "→ grype (CVE scan from SBOM)"
  grype "sbom:$OUT/sbom.cdx.json" --output json > "$OUT/grype.json" 2>>"$LOG" || true
fi

if [[ -f "$OUT/sbom.cdx.json" ]] && command -v osv-scanner &>/dev/null; then
  log "→ osv-scanner"
  osv-scanner --sbom="$OUT/sbom.cdx.json" --format=json > "$OUT/osv.json" 2>>"$LOG" || true
fi

# --- summary --------------------------------------------------------------

log "=== summary ==="
for f in "$OUT"/*.json "$OUT"/*.jsonl; do
  [[ -f "$f" ]] || continue
  size=$(wc -c < "$f")
  lines=$(wc -l < "$f")
  log "  $(basename "$f"): ${size}B, ${lines} lines"
done

log "=== done ==="
log "Next: open $OUT/ and synthesize findings into $OUT/findings.jsonl + $OUT/report.md"
log "Render with: cp templates/report.md.tmpl $OUT/report.md && edit"
