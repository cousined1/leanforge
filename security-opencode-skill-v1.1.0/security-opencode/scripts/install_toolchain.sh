#!/usr/bin/env bash
# install_toolchain.sh
# ---------------------------------------------------------------------------
# Install / verify the security toolchain for security-opencode skill.
# Idempotent — safe to re-run. Detects existing installs and skips them.
#
# Usage:
#   bash scripts/install_toolchain.sh           # install everything
#   bash scripts/install_toolchain.sh --check   # report status, don't install
#   bash scripts/install_toolchain.sh --core    # install just SAST + secrets + SBOM
# ---------------------------------------------------------------------------

set -euo pipefail

MODE="install"
SCOPE="full"

for arg in "$@"; do
  case "$arg" in
    --check) MODE="check" ;;
    --core) SCOPE="core" ;;
  esac
done

# Detect OS
OS="unknown"
case "$(uname -s)" in
  Linux*)  OS="linux" ;;
  Darwin*) OS="macos" ;;
esac

# Detect package managers available
HAS_BREW=$(command -v brew &>/dev/null && echo 1 || echo 0)
HAS_APT=$(command -v apt-get &>/dev/null && echo 1 || echo 0)
HAS_PIPX=$(command -v pipx &>/dev/null && echo 1 || echo 0)
HAS_PIP=$(command -v pip3 &>/dev/null && echo 1 || echo 0)
HAS_NPM=$(command -v npm &>/dev/null && echo 1 || echo 0)
HAS_GO=$(command -v go &>/dev/null && echo 1 || echo 0)
HAS_CARGO=$(command -v cargo &>/dev/null && echo 1 || echo 0)

log() { echo "[install] $*"; }

check_or_install() {
  local name="$1"; shift
  local check_cmd="$1"; shift
  local install_cmd="$1"; shift
  if eval "$check_cmd" &>/dev/null; then
    log "✓ $name installed"
  else
    if [[ "$MODE" == "check" ]]; then
      log "✗ $name MISSING"
    else
      log "→ installing $name"
      eval "$install_cmd" || log "  ⚠ failed to install $name (continuing)"
    fi
  fi
}

log "OS: $OS"
log "scope: $SCOPE  mode: $MODE"

# ---- core: SAST, secrets, SBOM, IaC --------------------------------------

# Semgrep
check_or_install "semgrep" "command -v semgrep" "pipx install semgrep || pip3 install --user semgrep"

# Bandit (Python SAST)
check_or_install "bandit" "command -v bandit" "pipx install 'bandit[toml]' || pip3 install --user 'bandit[toml]'"

# gitleaks (secrets)
check_or_install "gitleaks" "command -v gitleaks" "
  if [[ \"$HAS_BREW\" == 1 ]]; then brew install gitleaks
  else
    LATEST=\$(curl -s https://api.github.com/repos/gitleaks/gitleaks/releases/latest | grep tag_name | cut -d'\"' -f4 | sed 's/^v//')
    curl -sL https://github.com/gitleaks/gitleaks/releases/download/v\$LATEST/gitleaks_\${LATEST}_linux_x64.tar.gz | tar xz -C /tmp gitleaks
    sudo mv /tmp/gitleaks /usr/local/bin/
  fi"

# trufflehog (secrets, deeper)
check_or_install "trufflehog" "command -v trufflehog" "
  if [[ \"$HAS_BREW\" == 1 ]]; then brew install trufflesecurity/trufflehog/trufflehog
  else curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sudo sh -s -- -b /usr/local/bin
  fi"

# Trivy (containers, IaC, SCA, SBOM)
check_or_install "trivy" "command -v trivy" "
  if [[ \"$HAS_BREW\" == 1 ]]; then brew install aquasecurity/trivy/trivy
  else curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sudo sh -s -- -b /usr/local/bin
  fi"

# Syft (SBOM)
check_or_install "syft" "command -v syft" "
  curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sudo sh -s -- -b /usr/local/bin"

# Grype (CVE scan from SBOM)
check_or_install "grype" "command -v grype" "
  curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sudo sh -s -- -b /usr/local/bin"

# OSV-Scanner
check_or_install "osv-scanner" "command -v osv-scanner" "
  if [[ \"$HAS_GO\" == 1 ]]; then go install github.com/google/osv-scanner/cmd/osv-scanner@latest
  elif [[ \"$HAS_BREW\" == 1 ]]; then brew install osv-scanner
  fi"

# Checkov (IaC policy-as-code)
check_or_install "checkov" "command -v checkov" "pipx install checkov || pip3 install --user checkov"

if [[ "$SCOPE" != "core" ]]; then

  # ---- additional SAST -------------------------------------------------------

  # njsscan (Node SAST)
  check_or_install "njsscan" "command -v njsscan" "pipx install njsscan || pip3 install --user njsscan"

  # gosec
  check_or_install "gosec" "command -v gosec" "
    if [[ \"$HAS_GO\" == 1 ]]; then go install github.com/securego/gosec/v2/cmd/gosec@latest
    elif [[ \"$HAS_BREW\" == 1 ]]; then brew install gosec
    fi"

  # govulncheck
  check_or_install "govulncheck" "command -v govulncheck" "
    if [[ \"$HAS_GO\" == 1 ]]; then go install golang.org/x/vuln/cmd/govulncheck@latest; fi"

  # pip-audit
  check_or_install "pip-audit" "command -v pip-audit" "pipx install pip-audit || pip3 install --user pip-audit"

  # safety (Python)
  check_or_install "safety" "command -v safety" "pipx install safety || pip3 install --user safety"

  # ---- IaC / containers ------------------------------------------------------

  # tfsec
  check_or_install "tfsec" "command -v tfsec" "
    if [[ \"$HAS_BREW\" == 1 ]]; then brew install tfsec
    else curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash
    fi"

  # hadolint (Dockerfile)
  check_or_install "hadolint" "command -v hadolint" "
    if [[ \"$HAS_BREW\" == 1 ]]; then brew install hadolint
    else
      sudo wget -qO /usr/local/bin/hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64
      sudo chmod +x /usr/local/bin/hadolint
    fi"

  # kubesec
  check_or_install "kubesec" "command -v kubesec" "
    if [[ \"$HAS_BREW\" == 1 ]]; then brew install kubesec
    else
      curl -sSL https://github.com/controlplaneio/kubesec/releases/latest/download/kubesec_linux_amd64.tar.gz | sudo tar -xz -C /usr/local/bin
    fi"

  # ---- GHA hardening ---------------------------------------------------------

  # zizmor
  check_or_install "zizmor" "command -v zizmor" "pipx install zizmor || pip3 install --user zizmor"

  # actionlint
  check_or_install "actionlint" "command -v actionlint" "
    if [[ \"$HAS_BREW\" == 1 ]]; then brew install actionlint
    else
      bash <(curl -s https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash) latest /usr/local/bin
    fi"

  # pinact
  check_or_install "pinact" "command -v pinact" "
    if [[ \"$HAS_GO\" == 1 ]]; then go install github.com/suzuki-shunsuke/pinact/cmd/pinact@latest; fi"

  # frizbee
  check_or_install "frizbee" "command -v frizbee" "
    if [[ \"$HAS_GO\" == 1 ]]; then go install github.com/stacklok/frizbee@latest; fi"

  # poutine
  check_or_install "poutine" "command -v poutine" "
    if [[ \"$HAS_BREW\" == 1 ]]; then brew install boostsecurityio/tap/poutine; fi"

  # ---- DAST ---------------------------------------------------------------

  # nuclei
  check_or_install "nuclei" "command -v nuclei" "
    if [[ \"$HAS_GO\" == 1 ]]; then go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
    elif [[ \"$HAS_BREW\" == 1 ]]; then brew install nuclei
    fi"

  # ---- AI / LLM ------------------------------------------------------------

  # Garak
  check_or_install "garak" "command -v garak" "pipx install garak || pip3 install --user garak"

  # promptfoo
  check_or_install "promptfoo" "command -v promptfoo" "
    if [[ \"$HAS_NPM\" == 1 ]]; then npm install -g promptfoo; fi"

fi

log "done"
log ""
log "Verify versions:"
for t in semgrep bandit gitleaks trufflehog trivy syft grype checkov zizmor actionlint pinact; do
  if command -v "$t" &>/dev/null; then
    log "  $t: $($t --version 2>&1 | head -1 || echo '?')"
  fi
done
