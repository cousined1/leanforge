#!/usr/bin/env bash
# generate_sbom.sh
# ---------------------------------------------------------------------------
# Generate a CycloneDX SBOM for the current repo, optionally cross-reference
# it against Grype + OSV-Scanner, and optionally sign with cosign.
#
# Usage:
#   bash scripts/generate_sbom.sh [output_path]
#       default output_path = sbom.cdx.json
#
#   --image IMAGE     SBOM for a container image instead of dir
#   --sign            sign the SBOM with cosign (keyless / Sigstore)
#   --scan            run grype + osv-scanner on the generated SBOM
# ---------------------------------------------------------------------------

set -euo pipefail

OUT="sbom.cdx.json"
IMAGE=""
SIGN=false
SCAN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image) IMAGE="$2"; shift 2 ;;
    --sign) SIGN=true; shift ;;
    --scan) SCAN=true; shift ;;
    *) OUT="$1"; shift ;;
  esac
done

log() { echo "[sbom] $*"; }

if ! command -v syft &>/dev/null; then
  log "syft not installed. Install via:"
  log "  curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sudo sh -s -- -b /usr/local/bin"
  exit 1
fi

# Generate
if [[ -n "$IMAGE" ]]; then
  log "→ generating SBOM for image: $IMAGE"
  syft "$IMAGE" -o cyclonedx-json="$OUT" -q
else
  log "→ generating SBOM for directory: $(pwd)"
  syft dir:. -o cyclonedx-json="$OUT" -q
fi

# Inventory
COMPONENT_COUNT=$(python3 -c "
import json
with open('$OUT') as f:
    sbom = json.load(f)
print(len(sbom.get('components', [])))
")
log "✓ SBOM written: $OUT ($COMPONENT_COUNT components)"

# Optional: also generate SPDX format
SPDX_OUT="${OUT%.cdx.json}.spdx.json"
if [[ -n "$IMAGE" ]]; then
  syft "$IMAGE" -o spdx-json="$SPDX_OUT" -q
else
  syft dir:. -o spdx-json="$SPDX_OUT" -q
fi
log "✓ SPDX SBOM written: $SPDX_OUT"

# Scan
if $SCAN; then
  if command -v grype &>/dev/null; then
    GRYPE_OUT="${OUT%.cdx.json}.grype.json"
    log "→ grype scan"
    grype "sbom:$OUT" --output json > "$GRYPE_OUT" || true
    HIGH_CRIT=$(python3 -c "
import json
with open('$GRYPE_OUT') as f: data = json.load(f)
matches = data.get('matches', [])
hc = [m for m in matches if m.get('vulnerability', {}).get('severity', '').lower() in ('high','critical')]
print(len(hc))
")
    log "  HIGH/CRITICAL CVEs: $HIGH_CRIT"
  fi

  if command -v osv-scanner &>/dev/null; then
    OSV_OUT="${OUT%.cdx.json}.osv.json"
    log "→ osv-scanner"
    osv-scanner --sbom="$OUT" --format=json > "$OSV_OUT" || true
  fi
fi

# Sign
if $SIGN; then
  if command -v cosign &>/dev/null; then
    log "→ signing SBOM with cosign (keyless / Sigstore OIDC)"
    cosign sign-blob --yes --output-signature "${OUT}.sig" --output-certificate "${OUT}.pem" "$OUT"
    log "✓ signature: ${OUT}.sig"
    log "✓ cert:      ${OUT}.pem"
    log "  verify with: cosign verify-blob --certificate ${OUT}.pem --signature ${OUT}.sig $OUT"
  else
    log "  cosign not installed — skipping signature. Install: 'go install github.com/sigstore/cosign/v2/cmd/cosign@latest'"
  fi
fi

log "done"
