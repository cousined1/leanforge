# install_toolchain.ps1
# ---------------------------------------------------------------------------
# Install / verify the security toolchain on Windows (Javante) via Scoop.
# Idempotent — safe to re-run.
#
# Usage (in PowerShell):
#   pwsh scripts/install_toolchain.ps1            # install everything
#   pwsh scripts/install_toolchain.ps1 -Check     # report status only
#   pwsh scripts/install_toolchain.ps1 -Core      # core SAST + secrets + SBOM
# ---------------------------------------------------------------------------

param(
  [switch]$Check,
  [switch]$Core
)

function Log($msg) { Write-Host "[install] $msg" }

# Verify Scoop is installed
if (-not (Get-Command scoop -ErrorAction SilentlyContinue)) {
  if ($Check) { Log "✗ scoop is NOT installed"; exit 1 }
  Log "→ installing Scoop"
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
}

# Ensure required buckets
$buckets = scoop bucket list 2>$null | Out-String
if ($buckets -notmatch "main") { scoop bucket add main }
if ($buckets -notmatch "extras") { scoop bucket add extras }

# Detect Python (needed for pipx)
$pythonOk = $false
if (Get-Command python -ErrorAction SilentlyContinue) {
  $pythonOk = $true
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
  $pythonOk = $true
}

# Ensure pipx
if (-not (Get-Command pipx -ErrorAction SilentlyContinue) -and $pythonOk -and -not $Check) {
  Log "→ installing pipx"
  python -m pip install --user pipx
  python -m pipx ensurepath
}

function Check-Or-Install {
  param([string]$Name, [string]$CheckCmd, [scriptblock]$Install)
  if (Get-Command $CheckCmd -ErrorAction SilentlyContinue) {
    Log "✓ $Name installed"
  } else {
    if ($Check) {
      Log "✗ $Name MISSING"
    } else {
      Log "→ installing $Name"
      try { & $Install } catch { Log "  ⚠ failed to install $Name (continuing): $_" }
    }
  }
}

# ---- core -----------------------------------------------------------------

Check-Or-Install "semgrep" "semgrep" { pipx install semgrep }
Check-Or-Install "bandit" "bandit" { pipx install 'bandit[toml]' }
Check-Or-Install "gitleaks" "gitleaks" { scoop install gitleaks }
Check-Or-Install "trufflehog" "trufflehog" { scoop install trufflehog }
Check-Or-Install "trivy" "trivy" { scoop install trivy }
Check-Or-Install "syft" "syft" { scoop install syft }
Check-Or-Install "grype" "grype" { scoop install grype }
Check-Or-Install "osv-scanner" "osv-scanner" { scoop install osv-scanner }
Check-Or-Install "checkov" "checkov" { pipx install checkov }

if (-not $Core) {

  # ---- SAST -------------------------------------------------------------------

  Check-Or-Install "njsscan" "njsscan" { pipx install njsscan }
  Check-Or-Install "gosec" "gosec" { scoop install gosec }
  Check-Or-Install "pip-audit" "pip-audit" { pipx install pip-audit }
  Check-Or-Install "safety" "safety" { pipx install safety }

  # ---- IaC / containers ----------------------------------------------------

  Check-Or-Install "tfsec" "tfsec" { scoop install tfsec }
  Check-Or-Install "hadolint" "hadolint" { scoop install hadolint }
  Check-Or-Install "kubesec" "kubesec" { scoop install kubesec }

  # ---- GHA hardening -------------------------------------------------------

  Check-Or-Install "zizmor" "zizmor" { pipx install zizmor }
  Check-Or-Install "actionlint" "actionlint" { scoop install actionlint }
  # pinact / frizbee require Go; recommend to install Go via Scoop first
  if (-not (Get-Command pinact -ErrorAction SilentlyContinue)) {
    if (Get-Command go -ErrorAction SilentlyContinue) {
      if (-not $Check) {
        Log "→ installing pinact (via go install)"
        go install github.com/suzuki-shunsuke/pinact/cmd/pinact@latest
        Log "→ installing frizbee (via go install)"
        go install github.com/stacklok/frizbee@latest
      }
    } else {
      Log "  ⚠ pinact/frizbee need Go: 'scoop install go' first"
    }
  }

  # ---- DAST -------------------------------------------------------------------

  Check-Or-Install "nuclei" "nuclei" { scoop install nuclei }

  # ---- AI / LLM -----------------------------------------------------------

  Check-Or-Install "garak" "garak" { pipx install garak }
  Check-Or-Install "promptfoo" "promptfoo" {
    if (Get-Command npm -ErrorAction SilentlyContinue) { npm install -g promptfoo }
    else { Log "  ⚠ promptfoo needs Node/npm. Install Node first." }
  }
}

Log "done"
Log ""
Log "Note for Javante (Eddie's Win11 desktop):"
Log "  - Scoop installs land in C:\Users\Eddie\scoop\shims (already on PATH)"
Log "  - pipx installs land in C:\Users\Eddie\.local\bin (ensure on PATH)"
Log "  - go install lands in C:\Users\Eddie\go\bin (ensure on PATH)"
Log ""
Log "If MSI Center is running, watch for UDP socket exhaustion that affects"
Log "Trivy DB downloads — disable MSI Center temporarily during long pulls."
