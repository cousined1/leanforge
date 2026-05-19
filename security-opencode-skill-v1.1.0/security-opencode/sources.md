# Sources

The security-opencode skill is synthesized from the comprehensive security
reference doc Eddie supplied, his GODMYTHOS v10 doctrine, his existing
Security_skill.md v2.0, and the upstream public projects below. Where a
section borrows heavily from a single project, it's noted in the relevant
file.

---

## AI agent & LLM security

- **doneyli/ai-agent-security-audit** — origin of the 5-phase framework
  in `references/ai_agent_security.md` (human-in-loop, prompt injection,
  defense in depth, trust hardening, observability)
- **Garak** (NVIDIA / leondz) — LLM vulnerability scanner
- **PyRIT** (Microsoft) — generative AI risk identification toolkit
- **promptfoo** — prompt eval framework
- **VulnHawk** (momenbasel) — AI-powered SAST
- **code-audit** (evilsocket) — Nerve-based codebase auditor
- **rebuff.ai** — prompt-injection detection middleware
- **NeMo Guardrails** (NVIDIA) — programmable rails
- **OWASP LLM Top 10:2025**
- **Lakera Gandalf / DoubleSpeak** — prompt-injection CTFs

## SAST

- **Semgrep** (semgrep.dev / r2c) — semantic, custom rules
- **SonarQube** (SonarSource) — enterprise SAST
- **CodeQL** (GitHub) — dataflow query language
- **PMD / SpotBugs / Find Security Bugs** — JVM ecosystem
- **Bandit** (PyCQA) — Python
- **gosec** (securego) — Go
- **Brakeman** — Rails
- **PHPStan / Psalm / Progpilot** — PHP
- **njsscan** (MobSF) — Node
- **ESLint security plugins** — eslint-plugin-security, eslint-plugin-no-unsanitized
- **clippy** — Rust
- **flawfinder / cppcheck** — C/C++

## Secrets

- **gitleaks** (gitleaks/gitleaks)
- **trufflehog** (trufflesecurity)
- **GitGuardian / ggshield**

## Containers & IaC

- **Trivy** (Aqua Security) — vuln + IaC + secret + SBOM
- **Grype + Syft** (Anchore)
- **Hadolint** (hadolint/hadolint) — Dockerfile linter
- **Checkov** (Bridgecrew) — IaC policy
- **TFSec** (Aqua)
- **KICS** (Checkmarx)
- **kubesec** (controlplaneio)
- **kube-bench** (Aqua) — CIS k8s
- **Polaris** (Fairwinds)
- **cfn-lint / cfn-nag** — CloudFormation
- **Cloudsplaining** — AWS IAM
- **ScoutSuite / Prowler** — multi-cloud audit

## CI/CD

- **Zizmor** (woodruffw) — GHA scanner
- **Poutine** (boostsecurityio) — supply-chain
- **Actionlint** (rhysd) — syntax + safety
- **pinact** (suzuki-shunsuke)
- **Frizbee** (stacklok)
- **harden-runner** (step-security)
- **OpenSSF Scorecard**

## DAST & pentesting

- **OWASP ZAP**
- **Burp Suite Community**
- **Nuclei** (projectdiscovery)
- **wapiti**
- **Schemathesis** — OpenAPI fuzzing
- **sqlmap, commix, Metasploit, Nmap, OpenVAS, Suricata** — lab-only
  offensive

## SCA / SBOM

- **OWASP Dependency-Check**
- **OWASP Dependency-Track**
- **OSV-Scanner** (Google)
- **Renovate** (Mend) / **Dependabot** (GitHub)
- **Sigstore / cosign / rekor**
- **SLSA framework**
- **scancode-toolkit / fossology** — license

## Frameworks & standards

- **OWASP Top 10:2025** — `https://owasp.org/Top10/2025/`
- **OWASP API Security Top 10:2023**
- **OWASP ASVS** — Application Security Verification Standard
- **OWASP SAMM**
- **OWASP Cheat Sheet Series**
- **NIST CSF 2.0** — released Feb 2024
- **NIST SP 800-63B** — digital identity / passwords
- **NIST SP 800-131A** — crypto transitions
- **NIST SP 800-57** — key management
- **NIST SSDF** (SP 800-218) — Secure Software Development Framework
- **CMMC 2.0** — DoD Cybersecurity Maturity Model
- **CIS Benchmarks** — OS, Docker, K8s, cloud
- **MITRE ATT&CK / ATLAS** — threat modeling
- **STRIDE / PASTA / LINDDUN** — threat modeling methodologies
- **IETF RFC 9325** — TLS BCP
- **Latacora — Cryptographic Right Answers**

## Training environments

- **OWASP Juice Shop**
- **DVWA / bWAPP / WebGoat / Mutillidae II**
- **vAPI / crAPI / DVGA**
- **CloudGoat / TerraGoat / CdkGoat / SadCloud**
- **Kubernetes Goat / Bust-a-Kube**
- **HackTheBox / TryHackMe / picoCTF / OverTheWire / VulnHub**

## Eddie's stack / GODMYTHOS lineage

- **GODMYTHOS v10** — Eddie's adaptive engineering doctrine (Compound
  Engineering, Knowledge Graph via graphify, PocockOps layers; nine work
  modes)
- **Security_skill.md v2.0** — Eddie's existing security skill integrating
  NIST CSF 2.0, OWASP, CMMC 2.0, Zero Trust, SBOM
- **Cartography Doctrine** — graphify (AST + LLM knowledge graph)
  integration pattern
- **AGENTS.md / CONTEXT.md** bootstrap kit
- **OpenClaw skill ecosystem** — MEXC, Polymarket, Kalshi, TradingView,
  Stripe CLI, Netlify, Railway, mmx-cli, linear-agents, codex-subagents,
  superpowers-dev-workflow, caveman, MemPalace, agency-agents,
  openspace-secure (telemetry patching + skill auditing)
- **claude-context** — semantic code search MCP skill
- **n8n-specialist** — workflow routing (Eddie's existing skill, used
  for findings routing here)
- **Wazuh** at `10.0.0.179` — Eddie's SIEM (OpenSearch backend)
- **BoardMeeting** Telegram group (`-5030461334`) via
  `@JavonteWindows11_bot` — Eddie's notification channel

## Related open-source skills / agents

- **AutoBE** — full-stack agent
- **GSD** ("Get Shit Done") agent patterns
- **frontend-design / opencode-design / huashu-design** — design system
  lineage
- **Claude Code review plugin** — origin of the 80-confidence-threshold
  pattern adopted here

---

## v1.1.0 doctrines (synthesized for this skill)

The three doctrine rules added in v1.1.0 don't have direct upstream
analogues; they're synthesized from the black-hat critique of v1.0.0 and
from established patterns in adjacent disciplines:

- **Rule of Three Witnesses** (`references/triangulation.md`) — adapts
  the "ensemble" and "majority vote" patterns from ML model serving and
  the multi-source corroboration pattern from threat intel. Inspired by
  how MITRE D3FEND fuses signals across sensor types.
- **Rule of the Second Pass** (`workflows/validate_remediation.md`) —
  adapts test-driven security from web app testing (Burp Macro replay,
  ZAP active scan after fix) and the "no regression" gate from any
  mature CI pipeline. Inspired by the way Google's OSS-Fuzz validates
  fixes before closing bugs.
- **Rule of the Odd Sibling** (`references/semantic_anomaly.md`) —
  adapts the "outlier detection" pattern from anomaly-based IDS
  (Suricata flow stats, Wazuh anomaly rules) to source-code structure.
  Inspired by code-clone detection research (e.g., SourcererCC) and
  by the way experienced reviewers say "this one looks different from
  the others" in code review.

## Tool parsers added in v1.1.0

`scripts/triangulate.py` ships parsers for these tool output formats.
When extending, add a parser and a `RULE_CLASS_MAP` entry:

- bandit (JSON), semgrep (JSON), gosec (JSON), gitleaks (JSON),
  trufflehog (JSONL), trivy fs (JSON), grype (JSON), osv-scanner (JSON),
  zizmor (JSON), actionlint (JSON), hadolint (JSON), checkov (JSON),
  tfsec (JSON), njsscan (JSON), brakeman (manual integration),
  anomaly_scan.py (JSON)

## Versioning & updates

The most volatile section of this skill is the OWASP/NIST mapping. When
OWASP releases a Top 10 update, re-verify `checklists/owasp_top10_2025.md`
against `owasp.org/Top10/<year>/`. The current file was verified against
the 2025 final release.

CVE counts and CVSS values quoted in any tool output are time-of-scan
snapshots. Always re-scan before remediation decisions for fast-moving
ecosystems.
