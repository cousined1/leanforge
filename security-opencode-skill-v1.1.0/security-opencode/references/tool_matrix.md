# Tool Matrix — pick by language & target

## Multi-language SAST
| Tool | Languages | Strength | Install |
|---|---|---|---|
| **Semgrep** | 30+ | Fast, semantic, custom rules | `pip install semgrep` |
| **SonarQube** | 30+ | CI-integrated, code smells + sec | docker |
| **CodeQL** | 10+ | Deepest dataflow, GH-native | gh-cli |
| **PMD** | Java/Apex/Kotlin | Mature, broad ruleset | brew/scoop |

## Per-language picks
| Lang | Primary SAST | Deps | Style/lint |
|---|---|---|---|
| **Python** | Bandit + Semgrep | Safety CLI, pip-audit | Ruff, Pyre |
| **JS/TS** | Semgrep + ESLint security | npm audit, Snyk | eslint-plugin-security |
| **Go** | gosec + Semgrep | govulncheck | golangci-lint |
| **Java** | SpotBugs + Find Security Bugs | OWASP Dependency-Check | PMD |
| **Ruby** | Brakeman | bundler-audit | rubocop |
| **PHP** | PHPStan + Psalm + Progpilot | composer audit | Exakat |
| **C/C++** | Cppcheck + flawfinder | OWASP DC | clang-tidy |
| **Rust** | clippy (security lints) | cargo-audit, cargo-deny | clippy |
| **Swift** | semgrep + periphery | — | swiftlint |

## Secrets
- **gitleaks** — fastest, native git history walk
- **trufflehog** — best entropy detection + verifier checks
- **ggshield** (GitGuardian) — broadest signature library, hosted

## Containers / IaC
- **Trivy** — best general-purpose (CVE + IaC + secrets + SBOM)
- **Grype** — fast CVE-only, pairs with **Syft** for SBOM
- **Checkov** — best IaC policy-as-code (Bridgecrew)
- **TFSec** — Terraform-focused, fast
- **KICS** — broadest IaC coverage (TF, K8s, Docker, CFN, Ansible)
- **kube-bench** — CIS Kubernetes benchmark
- **kubesec.io** — K8s manifest scoring

## CI/CD pipeline (GHA-specific)
- **Zizmor** — most comprehensive (untrusted checkouts, templating, triggers)
- **Poutine** — supply-chain focus (conservative heuristics)
- **Actionlint** — syntax + runner compat, lightweight
- **Frizbee / Pinny / Scharf** — auto-pin actions to commit SHAs
- **harden-runner** (StepSecurity) — runtime egress control

## DAST / proxy
- **OWASP ZAP** — full-featured, scriptable
- **Burp Suite Community** — best manual
- **Nuclei** — template-based, fastest for known vulns
- **wapiti** — older but lightweight

## Offensive (lab only)
- **sqlmap** — SQLi exploitation
- **commix** — OS command injection
- **Nmap** — network discovery
- **Metasploit Framework** — exploit dev/run
- **OpenVAS / GVM** — vuln scanning
- **Suricata / Zeek** — IDS/IPS

## SBOM
- **Syft** (Anchore) — most formats (CycloneDX, SPDX, JSON)
- **Trivy SBOM** — integrated with scan workflow
- **cdxgen** — multi-ecosystem CycloneDX generator

## AI/LLM
See `ai_agent_security.md` for full list.

## Decision shortcut
- Python webapp → Semgrep + Bandit + Safety + gitleaks + Trivy (image)
- Node/TS API → Semgrep + ESLint + npm audit + gitleaks + Trivy
- Go service → gosec + govulncheck + Trivy + Zizmor (workflows)
- Terraform repo → Checkov + TFSec + Trivy + gitleaks
- K8s manifests → kubesec + Trivy + Checkov + kube-bench
- LLM agent → Garak + PyRIT + promptfoo + Semgrep + the 5-phase framework
