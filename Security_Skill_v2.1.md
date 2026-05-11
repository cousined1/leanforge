# Ultimate Security Skill v2.1: Defense-Grade SaaS Architect
## CMMC 2.0 · NIST CSF 2.0 · NIST SP 800-171/800-53/800-207 · OWASP Top 10:2025 · OWASP ASVS 5.0 · CISA Secure by Design · EO 14028 SBOM · deepsec AI Scanner

---

## 1. Skill Directive & Activation

When utilizing GODMYTHOS v10.2 (or any descendant skill) inside Kilo Code, OpenClaw, Claude Code, or any AI-assisted development tool to generate or architect SaaS platforms, you **must** concurrently activate this Ultimate Security Skill. This skill mandates that all SaaS architecture, code, and infrastructure adhere to:

| Framework | Authority | Version/Date |
|---|---|---|
| CMMC 2.0 Level 2 | DoD / OUSD(A&S) | Final Rule Dec 2024 |
| NIST SP 800-171 Rev 2 | NIST | Feb 2020 (Rev 3 pending) |
| NIST SP 800-53 Rev 5 | NIST | Sep 2020, updated Dec 2024 |
| NIST Cybersecurity Framework | NIST | CSF 2.0, Feb 2024 |
| NIST SP 800-207 | NIST | Zero Trust Architecture, Aug 2020 |
| NIST SP 1800-35 | NIST NCCoE | Implementing ZTA, Jun 2025 |
| OWASP Top 10 | OWASP Foundation | 2025 Edition |
| OWASP ASVS | OWASP Foundation | v5.0.0, May 2025 |
| CISA Secure by Design | CISA / DHS | Pledge + Guidance, 2024 |
| EO 14028 / SBOM | NTIA / CISA | 2025 Minimum Elements |
| deepsec AI Scanner | Vercel Labs | v3 (Phase 9), Apache-2.0 |
| security-scanner | OpenClaw skill | v3 (9-phase pipeline) |

**Activation trigger**: Append the following constraint to all GODMYTHOS v10.2 outputs when building SaaS:

> "Evaluate this code/architecture against the Ultimate Security Skill v2.1. Does it enforce Zero Trust, Least Privilege, FIPS-validated encryption, OWASP Top 10:2025 mitigations, supply chain integrity, SBOM generation, NIST CSF 2.0 Govern-function alignment, and the 9-phase security-scanner pipeline with deepsec AI deep review? If not, rewrite to enforce compliance."

---

## 2. Core Security Engineering Principles

Before writing any SaaS code, apply systems security engineering principles (NIST SP 800-160) to develop trustworthy, secure, and resilient systems.

### 2.1 Design Foundation
- Incorporate security requirements directly into the System Development Life Cycle (SDLC).
- Perform threat modeling (STRIDE, PASTA, or LINDDUN) during design phase — per CISA Secure by Design and OWASP ASVS Chapter 1 (Architecture).
- Adopt Secure by Design principles: Take Ownership of Customer Security Outcomes, Embrace Radical Transparency, Lead From the Top.

### 2.2 Least Functionality (CM.L2-3.4.6)
- Configure the SaaS to provide only essential capabilities.
- Remove or disable unused physical/logical ports, protocols, and unnecessary services.
- Harden container images: minimal base (distroless/Alpine), no shell in production, read-only filesystem.

### 2.3 Application Execution (CM.L2-3.4.8)
- Enforce a "deny-all, permit-by-exception" (allowlisting) execution policy to prevent unauthorized software.
- Container: enforce `readOnlyRootFilesystem: true`, `allowPrivilegeEscalation: false`, non-root UID.

### 2.4 Memory Safety Mandate (CISA Secure by Design)
- For new components, prefer memory-safe languages (Rust, Go, Java, C#, Python) over C/C++.
- If C/C++ is required, compile with `-fstack-protector-strong`, ASLR, DEP/NX, and CFI.
- Publish a memory safety roadmap per CISA pledge Goal 3.

---

## 3. NIST CSF 2.0 — Six-Function Alignment

All SaaS must map controls to the six CSF 2.0 functions (22 categories, 106 subcategories).

### 3.1 GOVERN (GV) — NEW in CSF 2.0
The Govern function sits at the center of the CSF wheel, informing and directing all other five functions.

| Category | Subcategory Highlights | SaaS Implementation |
|---|---|---|
| GV.OC — Organizational Context | GV.OC-01: Mission understood; GV.OC-02: Stakeholder expectations | Document SaaS mission, tenant SLAs, regulatory obligations |
| GV.RM — Risk Management Strategy | GV.RM-01: Risk appetite established; GV.RM-05: Communication lines | Maintain live risk register; define risk tolerance per tenant tier |
| GV.RR — Roles, Responsibilities | GV.RR-01: Organizational leadership accountable | RACI matrix for security ownership; C-suite sign-off on risk acceptance |
| GV.PO — Policy | GV.PO-01: Cybersecurity policy established | Publish and version security policies in Git; enforce via CI/CD gates |
| GV.OV — Oversight | GV.OV-01: Risk management strategy reviewed | Quarterly security posture reviews; board-level reporting |
| GV.SC — Supply Chain Risk Mgmt | GV.SC-01–10: Third-party risk integrated | Vendor risk assessments; SBOM requirements in contracts; dependency audit |

### 3.2 IDENTIFY (ID)
- Asset Management (ID.AM): Maintain a complete inventory of hardware, software, data flows, and external dependencies.
- Risk Assessment (ID.RA): Conduct continuous vulnerability scanning; maintain CVE triage SLAs.
- Improvement (ID.IM): Track improvement actions from assessments and incidents.

### 3.3 PROTECT (PR)
- Identity Management & Access Control (PR.AA): See Section 4.
- Awareness & Training (PR.AT): Security awareness for all dev/ops personnel.
- Data Security (PR.DS): Encryption at rest and in transit (see Section 5). PR.DS-10: Protect data-in-use (memory encryption, screen lock policies).
- Platform Security (PR.PS): Harden OS, runtime, orchestrator. Patch within SLA.
- Technology Infrastructure Resilience (PR.IR): Redundancy, failover, and capacity planning.

### 3.4 DETECT (DE)
- Continuous Monitoring (DE.CM): IDS/IPS, SIEM correlation, anomaly detection.
- Adverse Event Analysis (DE.AE): Automated alert triage; threat intelligence enrichment.

### 3.5 RESPOND (RS)
- Incident Management (RS.MA): Documented IRP with playbooks.
- Incident Analysis (RS.AN): Root cause analysis for every P1/P2.
- Incident Reporting (RS.CO): Stakeholder notification within regulatory timelines.
- Incident Mitigation (RS.MI): Contain, eradicate, recover.

### 3.6 RECOVER (RC)
- Incident Recovery Plan Execution (RC.RP): Tested DR/BCP with RTO/RPO targets.
- Communication (RC.CO): Post-incident customer and regulatory notification.

---

## 4. Access Control, Identity & Zero Trust Architecture

### 4.1 NIST SP 800-207 Zero Trust Tenets
All SaaS architectures must implement the seven ZT tenets:

1. **All data sources and computing services are resources** — SaaS microservices, APIs, databases, SaaS-hosted files, IoT endpoints.
2. **All communication is secured regardless of network location** — mTLS between all services; no implicit trust from VPC/subnet membership.
3. **Access to individual resources is granted on a per-session basis** — Short-lived tokens (JWT ≤15 min); re-evaluate trust continuously.
4. **Access is determined by dynamic policy** — ABAC/RBAC hybrid; context includes identity, device posture, location, time, behavior analytics.
5. **Enterprise monitors and measures integrity/security posture of all owned/associated assets** — Continuous Diagnostics & Mitigation (CDM).
6. **All resource authentication and authorization are dynamic and strictly enforced before access** — No cached auth decisions for sensitive operations.
7. **Enterprise collects information about assets, network traffic, and access requests to improve security posture** — Feed all telemetry to SIEM.

### 4.2 ZTA Logical Components
- **Policy Engine (PE)**: Makes grant/deny/revoke decisions using identity, CDM data, threat intel, and enterprise policy.
- **Policy Administrator (PA)**: Executes PE decisions by configuring data paths and issuing session tokens.
- **Policy Enforcement Point (PEP)**: Gatekeeper at every resource boundary; enables/terminates connections per PA instruction.

### 4.3 CMMC / NIST 800-171 Access Controls
| Control ID | Requirement | SaaS Implementation |
|---|---|---|
| AC.L2-3.1.5 | Least Privilege | RBAC with principle of least privilege; just-in-time (JIT) elevation |
| AC.L2-3.1.1 | Authorized Access | All API endpoints require authentication; no anonymous access to CUI |
| AC.L2-3.1.2 | Transaction Control | Enforce per-operation authorization checks (not just login-time) |
| SC.L2-3.13.3 | Role Separation | Separate user plane from management plane; admin consoles on isolated network |
| IA.L2-3.5.3 | Multifactor Authentication | MFA mandatory for all accounts — privileged AND non-privileged network access |
| IA.L2-3.5.4 | Replay-Resistant Auth | TLS 1.3+, FIDO2/WebAuthn, or Kerberos; no bearer-only tokens for sensitive ops |

### 4.4 OWASP ASVS 5.0 — Authentication & Session (Chapters 2-3)
- Verify all authentication endpoints are resistant to credential stuffing (rate limiting, CAPTCHA, breached-password checks).
- Session tokens must be generated with at least 128 bits of entropy.
- Session idle timeout ≤15 minutes for sensitive apps; absolute timeout ≤12 hours.
- Verify that re-authentication is required before sensitive transactions (step-up auth).

---

## 5. Boundary Protection, Cryptography & Data Security

### 5.1 Network Segmentation (SC.L2-3.13.1)
- Monitor, control, and protect communications at external boundaries and key internal boundaries (DMZ, database tier, prod vs. dev).
- Implement microsegmentation for east-west traffic between microservices.
- Enforce network policies (Kubernetes NetworkPolicy, service mesh mTLS) at orchestrator level.

### 5.2 Cryptography
| Control ID | Requirement | Implementation |
|---|---|---|
| SC.L2-3.13.11 | FIPS-validated encryption (transit) | TLS 1.3 with FIPS 140-3 validated modules; no TLS <1.2 |
| SC.L2-3.13.16 | FIPS-validated encryption (rest) | AES-256-GCM or ChaCha20-Poly1305; FIPS 140-3 module |
| SC.L2-3.13.10 | Key Management | HSM-backed key storage; automated rotation ≤90 days; key ceremony for root keys |
| — | Certificate Management | Automate via ACME (Let's Encrypt / internal CA); cert expiry monitoring |

### 5.3 OWASP Top 10:2025 — A04: Cryptographic Failures
- Never use MD5, SHA-1, or DES for any security purpose.
- Verify that sensitive data is not transmitted in cleartext, including to internal services.
- Implement HTTP Strict Transport Security (HSTS) with `includeSubDomains` and `preload`.
- Do not log or cache sensitive data (credentials, tokens, PII).

---

## 6. OWASP Top 10:2025 — Full Coverage Matrix

The 2025 edition analyzed 589 CWEs across 175,000+ CVE records. All SaaS must address every category.

| # | Category | Key CWEs | Mandatory Mitigations |
|---|---|---|---|
| A01 | Broken Access Control | IDOR, CORS misconfig, privilege escalation, SSRF (consolidated) | Per-request authz checks; deny-by-default; SSRF allowlists; CORS strict origin |
| A02 | Security Misconfiguration | Default creds, verbose errors, XXE, unnecessary features | Hardened baselines (CIS Benchmarks); no default passwords; disable XML external entities |
| A03 | Software Supply Chain Failures | Malicious packages, compromised maintainers, tampered builds **(NEW)** | SBOM generation; dependency pinning with hash verification; Sigstore/cosign for artifact signing; `npm audit` / `pip-audit` in CI |
| A04 | Cryptographic Failures | Weak algorithms, plaintext transmission, poor key mgmt | FIPS 140-3 modules; TLS 1.3; HSM key storage; no hardcoded secrets |
| A05 | Injection | SQLi, XSS, OS command injection, LDAP injection | Parameterized queries; contextual output encoding; CSP headers; no `eval()` |
| A06 | Insecure Design | Missing threat model, insecure business logic | Threat modeling in design phase; secure design patterns; abuse case testing |
| A07 | Identification & Authentication Failures | Credential stuffing, weak passwords, missing MFA | MFA enforcement; bcrypt/Argon2id hashing; breached-password API checks |
| A08 | Software & Data Integrity Failures | Deserialization, CI/CD pipeline compromise, unsigned updates | Signed artifacts; integrity verification; protected CI/CD pipelines; no unsafe deserialization |
| A09 | Security Logging & Alerting Failures | Missing audit trails, no real-time alerting | Structured logging to SIEM; alert on 100+ failed logins/min; tamper-evident log storage |
| A10 | Mishandling of Exceptional Conditions | Improper error handling, fail-open, logic errors **(NEW)** | Fail-closed defaults; generic error messages to users; detailed internal logging; fuzz testing |

---

## 7. Software Supply Chain Security & SBOM

### 7.1 Executive Order 14028 — SBOM Requirements
Per EO 14028 and CISA's 2025 Minimum Elements update, all SaaS platforms must:

- **Generate machine-readable SBOMs** in CycloneDX or SPDX format for every release.
- **Include minimum data fields**: Producer Name, Component Name, Version, Software Identifiers (PURL/CPE), Dependency Relationships, SBOM Author, Timestamp.
- **Automate SBOM generation** as part of CI/CD pipeline (e.g., `syft`, `trivy`, `cdxgen`).
- **Distribute SBOMs** to customers/operators via API endpoint or release artifacts.
- **Maintain VEX (Vulnerability Exploitability eXchange)** attestations to clarify which CVEs actually affect deployed software.

### 7.2 OWASP Top 10:2025 A03 — Software Supply Chain Failures
- Pin all dependencies to exact versions with cryptographic hash verification (`package-lock.json`, `requirements.txt` with hashes, `go.sum`).
- Use Sigstore/cosign to sign and verify container images and build artifacts.
- Run `npm audit`, `pip-audit`, `govulncheck`, or `cargo-audit` on every CI build; block on critical/high findings.
- Monitor for typosquatting and dependency confusion attacks.
- Require 2FA on package registry accounts (npm, PyPI, crates.io).
- Vet new dependencies before adoption: check maintainer reputation, download velocity, recent commits, license compliance.

### 7.3 Build Pipeline Integrity (SLSA Framework Alignment)
- **SLSA Level 1**: Automated build process; SBOM generated.
- **SLSA Level 2**: Version-controlled build service; authenticated provenance.
- **SLSA Level 3**: Hardened build platform; non-falsifiable provenance.
- Target SLSA Level 3 for production builds.

---

## 8. CISA Secure by Design — Seven Pledge Goals

All SaaS platforms built under this skill must meet CISA's Secure by Design pledge goals:

| Goal | Requirement | Implementation |
|---|---|---|
| 1. MFA | Measurably increase MFA adoption | MFA enabled by default for all accounts; SSO/SAML/OIDC with MFA at IdP |
| 2. Default Passwords | Eliminate default passwords | Require unique strong credentials at setup; no factory defaults ship |
| 3. Reduce Vulnerability Classes | Eliminate entire classes of vulnerabilities | Memory-safe languages; parameterized queries; CSP; SAST/DAST in CI |
| 4. Security Patches | Increase customer patch adoption | Auto-update by default; BOM-based patch tracking; zero-downtime deploys |
| 5. Vulnerability Disclosure Policy | Publish VDP | `/.well-known/security.txt`; responsible disclosure program; no legal threats |
| 6. CVE Transparency | Accurate, timely CVE records | CWE+CPE in every CVE; timely disclosure of critical/high vulns |
| 7. Intrusion Evidence | Enable intrusion detection for customers | Security audit logs available to tenants; log forwarding to customer SIEM |

---

## 9. Audit, Accountability & Continuous Monitoring

### 9.1 Audit Logging (AU.L2-3.3.1 through 3.3.8)
- Capture execution of all privileged functions in audit logs.
- Log: who (identity), what (action), when (timestamp), where (source IP/service), outcome (success/fail).
- Protect audit logs and logging tools from unauthorized access, modification, and deletion.
- Retain logs per regulatory requirements (minimum 1 year online, 3 years archive for CMMC).

### 9.2 Continuous Monitoring & Intrusion Detection (SI.L2-3.14.6/7)
- Implement NIDS/HIDS at network boundaries and on critical hosts.
- Deploy WAF with OWASP Core Rule Set (CRS) for all public-facing endpoints.
- Feed telemetry to SIEM/SOAR with correlation rules for MITRE ATT&CK TTPs.
- Establish baseline behavior profiles; alert on anomalies (UEBA).

### 9.3 Malicious Code Protection (SI.L2-3.14.2/5)
- Real-time malware scanning at all ingestion points (file upload, email, API payload).
- Container image scanning in CI/CD and at runtime (Trivy, Grype, Clair).
- Runtime security monitoring (Falco, Sysdig) for container escape and anomalous syscalls.

---

## 10. OWASP ASVS 5.0 — Verification Requirements Checklist

Use ASVS as a testable security requirements standard. Map to three assurance levels:

| Level | Target | Verification Depth |
|---|---|---|
| L1 | All software | Automated + basic manual testing |
| L2 | Apps handling sensitive data | In-depth manual testing + SAST/DAST |
| L3 | Critical/high-value/military | Full code review + architecture analysis + pentest |

### Key ASVS Chapters for SaaS:

| Chapter | Focus | Critical Checks |
|---|---|---|
| 1. Encoding & Sanitization | Injection prevention | Parameterized queries; contextual encoding; OS command protection |
| 2. Authentication | Identity verification | Credential storage (Argon2id); MFA; anti-automation; step-up auth |
| 3. Session Management | Session lifecycle | Entropy ≥128 bits; idle/absolute timeouts; secure cookie flags |
| 4. Access Control | Authorization | Per-request checks; deny-by-default; attribute/role-based; anti-IDOR |
| 5. Validation & Sanitization | Input handling | Allowlist validation; structured data parsing; file upload restrictions |
| 6. Cryptography | Data protection | Algorithm strength; key management; random number generation |
| 7. Error Handling & Logging | Observability | Generic user errors; detailed server logs; no sensitive data in logs |
| 8. Data Protection | PII/CUI handling | Data classification; retention policies; anonymization; right to deletion |
| 9. API & Web Services | API security | Rate limiting; schema validation; OAuth 2.0 flows; CORS policy |
| 10. Configuration | Deployment hardening | HTTP security headers; TLS config; server info suppression |
| 11. Business Logic | Logic security | Anti-fraud; workflow integrity; rate limiting on sensitive operations |
| 12. Files & Resources | File handling | Upload validation; path traversal prevention; storage isolation |
| 13. Secure Coding | Code quality | No eval/exec; safe deserialization; dependency management |

---

## 11. Infrastructure & Container Security

### 11.1 Kubernetes / Orchestrator Hardening
- Enforce Pod Security Standards (Restricted profile).
- Network Policies: deny-all default; allowlist per-service.
- RBAC: no cluster-admin for workloads; namespace-scoped roles.
- Secrets: External secrets operator (Vault, AWS SM, Azure KV); no secrets in environment variables or ConfigMaps.
- Image Policy: Admission controller (OPA/Gatekeeper or Kyverno) to enforce signed images, no `latest` tag, no root containers.

### 11.2 Container Image Security
- Use distroless or minimal base images.
- Scan all images with Trivy/Grype in CI; block critical/high CVEs.
- Sign images with Sigstore cosign; verify signatures at admission.
- Rebuild images weekly to incorporate OS-level patches.

### 11.3 Infrastructure as Code (IaC) Security
- Scan Terraform/Helm/CloudFormation with `tfsec`, `checkov`, or `kics`.
- Enforce tagging policies for cost/security attribution.
- Use separate state backends per environment with encryption at rest.
- Drift detection: reconcile deployed state against IaC definitions.

---

## 12. API Security (OWASP API Security Top 10 2023)

SaaS platforms are API-first. Address the OWASP API Security Top 10 alongside the web Top 10:

| # | Risk | Mitigation |
|---|---|---|
| API1 | Broken Object Level Authorization | Per-object authz checks; no client-side ID inference |
| API2 | Broken Authentication | OAuth 2.0 + PKCE; token binding; credential rotation |
| API3 | Broken Object Property Level Authorization | Allowlist response fields; block mass assignment |
| API4 | Unrestricted Resource Consumption | Rate limiting; pagination; request size limits |
| API5 | Broken Function Level Authorization | Role-based endpoint access; admin API on separate path |
| API6 | Unrestricted Access to Sensitive Business Flows | Bot detection; business logic rate limits; CAPTCHA for sensitive ops |
| API7 | Server Side Request Forgery | URL allowlisting; no user-controlled URLs in server requests |
| API8 | Security Misconfiguration | CORS strict; disable TRACE/OPTIONS leaks; error sanitization |
| API9 | Improper Inventory Management | API gateway catalog; deprecation lifecycle; no shadow APIs |
| API10 | Unsafe Consumption of APIs | Validate all third-party API responses; timeout and circuit-breaker patterns |

---

## 13. Incident Response & Resilience

### 13.1 Incident Response Plan (NIST SP 800-61 Rev 2)
- Maintain a documented IRP with roles, escalation paths, and communication templates.
- Conduct tabletop exercises quarterly and full simulations annually.
- Integrate with MITRE ATT&CK for TTP-based detection and response playbooks.

### 13.2 Disaster Recovery / Business Continuity
- Define RTO and RPO per service tier.
- Multi-region/multi-AZ deployment for critical services.
- Automated failover with health checks; chaos engineering (Chaos Monkey, Litmus).
- Backup encryption at rest; test restore procedures monthly.

### 13.3 Post-Incident
- Blameless post-mortems for every P1/P2 incident.
- Update threat model and controls based on lessons learned.
- Notify affected tenants and regulators per applicable timelines.

---

## 14. Compliance Documentation Output

When generating the SaaS platform, automatically prompt the creation of these compliance artifacts:

### 14.1 System Security Plan (SSP)
- System environment and boundaries.
- Hardware/software inventory.
- Network architecture diagrams.
- Control implementation statements for all 110 NIST SP 800-171 requirements.

### 14.2 Plan of Action & Milestones (POA&M)
- If any security requirements are unimplemented, detail how and when deficiencies will be mitigated.
- Assign owner, target date, and risk rating for each item.

### 14.3 SPRS Score Readiness
- Target a perfect SPRS score of 110 by fully implementing all 800-171 controls.
- Document scoring methodology and self-assessment results.

### 14.4 SBOM Artifacts
- CycloneDX or SPDX BOM for every deployable artifact.
- VEX documents for all known CVEs.
- Signed provenance attestations (SLSA).

### 14.5 CSF 2.0 Organizational Profile
- Current Profile documenting present state across all six functions.
- Target Profile documenting desired state aligned to CSF Tier 3 (Repeatable) minimum.
- Gap analysis between Current and Target Profiles.

---

## 15. Nine-Phase Security Scanner Pipeline (security-scanner v3)

This skill ships a complete CI/CD security pipeline implemented as a GitHub Actions workflow (`.github/workflows/security-scan.yml`). Every SaaS repo must deploy the full pipeline. Phases 1-7 are traditional tooling; Phase 8 is active exploit verification; Phase 9 is AI-powered deep review via deepsec.

### 15.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        .github/workflows/security-scan.yml                          │
├───────┬────────────────────┬──────────────────┬─────────────────────────────────────┤
│ Mode  │ Phases             │ Trigger           │ Runner                             │
├───────┼────────────────────┼──────────────────┼─────────────────────────────────────┤
│ QUICK │ 1-3                │ Non-fork PRs      │ ubuntu-24.04           (~2-5 min)  │
│ FULL  │ 1-3 + 5-6          │ Push to main/cron │ ubuntu-24.04          (~10-20 min) │
│ DEEP  │ 1-3 + 5-7          │ Schedule/dispatch │ ubuntu-24.04          (~30-60 min) │
│ P8    │ 8 (exploit verify)  │ Manual dispatch   │ ubuntu-24.04           (opt-in)   │
│ P9    │ 9 (AI deep review)  │ Dispatch / label  │ self-hosted (Ollama)   (opt-in)   │
└───────┴────────────────────┴──────────────────┴─────────────────────────────────────┘
```

### 15.2 Phase Map

| Phase | Layer | Tool(s) | What It Catches |
|---|---|---|---|
| 1 | SAST | gosec, govulncheck | Go-specific security bugs, known vulnerable stdlib usage |
| 2 | Dependencies | osv-scanner | Known CVEs in direct and transitive deps (OSV database) |
| 3 | Secrets + Weakness | secret_scan.sh (TruffleHog/gitleaks) | Hardcoded tokens, API keys, passwords, high-entropy strings |
| 5 | Container + SBOM | grype, syft | Container image CVEs; SBOM generation (CycloneDX/SPDX) |
| 6 | DAST | nuclei | Runtime vulnerabilities against live staging endpoint |
| 7 | Fuzz + Race | native Go fuzz (`go test -fuzz`), race detector | Memory corruption, data races, panic-on-input |
| 8 | Exploit Verify | go-exploit | Confirms exploitability of findings against scoped targets |
| **9** | **AI Deep Review** | **deepsec (vercel-labs)** | **Logic flaws, auth bypass, IDOR, multi-step taint flows, architectural smells — what regex and SAST can't see** |

### 15.3 Repo Layout

```
.github/workflows/security-scan.yml
.security/
├── scripts/
│   ├── aggregate.py          # Normalizes all phase outputs into unified findings.json
│   ├── gate.py               # Pass/hold/reject verdict based on severity thresholds
│   └── secret_scan.sh        # Phase 3 secret detection wrapper
├── scope.txt                 # Phase 8 authorized targets (exploit verify)
├── allowed.txt               # Vetted exception fingerprints (optional)
├── raw/                      # Phase outputs land here (gitignored)
├── report/                   # Aggregated report + verdict (gitignored)
└── deepsec/
    ├── bootstrap.sh           # Provider-aware launcher for Phase 9
    ├── deepsec.config.ts      # deepsec project configuration
    ├── INFO.md.template       # Context template (fill per-project)
    ├── INFO.md                # Filled project context (injected into AI)
    └── .workspace/            # deepsec runtime (gitignored)
```

### 15.4 Gate Logic (aggregate.py + gate.py)

All phase outputs are normalized into a single `findings.json`. The gate produces a three-tier verdict:

| Verdict | Criteria | CI Effect |
|---|---|---|
| `DEPLOY` | Zero critical, zero high, all mediums are in `allowed.txt` | ✅ Pipeline passes |
| `HOLD` | ≥1 high finding OR ≥3 mediums not in allowlist | ⚠️ Warning; blocks merge in strict mode |
| `REJECT` | ≥1 critical finding | 🛑 Pipeline fails; merge blocked |

### 15.5 Phase 8 — Exploit Verification (scope.txt)

Phase 8 fires exploit payloads against authorized targets to confirm exploitability. This is the most dangerous phase and requires:

- **Written authorization** from CISO or legal authority (reference via `ticket=` field)
- **Explicit target listing** in `.security/scope.txt` with expiration dates
- **Loopback/RFC1918 are implicitly allowed**; all other targets must be listed
- **Fail-closed**: Targets not in scope are treated as "assumed exploitable"

```
# Example scope.txt entry:
staging.myapp.com  authorized-by=ciso@company.com  expires=2027-01-01  ticket=SEC-1234
```

### 15.6 CI/CD Gate Policy (per-phase enforcement)

| Phase | Block Merge On | Tools |
|---|---|---|
| 1 (SAST) | Critical/high findings | gosec, govulncheck |
| 2 (Deps) | Critical CVE in dependencies | osv-scanner |
| 3 (Secrets) | Any detected secret | TruffleHog, gitleaks |
| 5 (Container) | Critical CVE in image | grype, syft |
| 6 (DAST) | Critical runtime vuln | nuclei |
| 7 (Fuzz) | Panics, data races | go-fuzz, `-race` |
| 8 (Exploit) | Confirmed exploitable vuln | go-exploit |
| 9 (AI Review) | P0/P1 deepsec finding | deepsec |

### 15.7 Mandatory Workflow Hardening Baseline

All security pipelines must satisfy the following baseline controls before production use:

- **Pin runtime and tools**: Pin runner OS (for example, `ubuntu-24.04`) and all scanner versions. Do not use floating versions like `@latest` in CI.
- **No unverified installer scripts**: Never use `curl | sh` for scanner installation. Download release artifacts directly and verify SHA256 checksums before execution.
- **Fork PR safety**: Do not execute high-risk phases (build/container/DAST/exploit tooling) on untrusted fork PR code unless explicitly approved and isolated.
- **Container hardening**: Run test containers with non-root UID, dropped Linux capabilities, `no-new-privileges`, and read-only root filesystem.
- **Report minimization**: PR comments must include verdict and counts only; full reports stay in restricted artifacts/job summary.
- **Artifact minimization**: Default artifact retention to 30 days (or stricter), configurable by policy.

---

## 16. Phase 9 — deepsec AI Deep Review

### 16.1 What is deepsec?

[deepsec](https://github.com/vercel-labs/deepsec) is an agent-powered vulnerability scanner from Vercel Labs that uses coding agents (Claude, Codex, or local Ollama models) to perform deep semantic code review. Unlike regex/AST-based SAST, deepsec understands multi-file taint flows, business logic, auth bypass patterns, and architectural weaknesses.

deepsec is designed to surface hard-to-find issues that have been lurking in codebases. It's configured to use the best models at maximum thinking levels. Commands are idempotent — interrupt a job, restart it, and deepsec picks up where it left off.

### 16.2 Why Phase 9 Exists

Traditional scanners (Phases 1-7) catch known vulnerability patterns but miss:

| Blind Spot | Example | Why SAST Misses It |
|---|---|---|
| Logic flaws | Auth bypass via parameter manipulation | No regex pattern for broken business rules |
| Multi-step taint | User input → cache → template → XSS | Cross-file data flow exceeds SAST scope |
| IDOR | `/api/orders/{id}` with no ownership check | Requires understanding of authz model |
| Race conditions in business logic | Double-spend via concurrent requests | Requires temporal reasoning |
| Architectural smells | Over-broad CORS, weak crypto choices, SSRF via user-controlled URLs | Requires contextual judgment |

Phase 9 fills these gaps by having an AI agent read the code, understand the project context (via INFO.md), and reason about security implications.

### 16.3 deepsec Pipeline Steps

Phase 9 executes via `bootstrap.sh`, which runs these five stages:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   SCAN   │ →  │ PROCESS  │ →  │  TRIAGE  │ →  │  EXPORT  │ →  │   GATE   │
│ (regex)  │    │  (AI)    │    │  (AI)    │    │ (json/md)│    │ (verdict)│
├──────────┤    ├──────────┤    ├──────────┤    ├──────────┤    ├──────────┤
│ Fast     │    │ Deep     │    │ P0/P1/P2 │    │ Findings │    │ DEPLOY/  │
│ matchers │    │ review   │    │ classify │    │ artifact │    │ HOLD/    │
│ no AI    │    │ per-file │    │ cheap    │    │          │    │ REJECT   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

1. **`deepsec scan`** — Fast regex matchers against the codebase (no AI cost). Generates candidate findings.
2. **`deepsec process`** — AI investigates each candidate. Reads surrounding code, cross-references auth/data-flow patterns, confirms or dismisses. This is the expensive step.
3. **`deepsec triage`** — AI classifies confirmed findings as P0 (critical), P1 (high), P2 (medium). Cheap second pass.
4. **`deepsec export`** — Outputs `deepsec.json` (for gate) and markdown finding reports (for humans).
5. **`aggregate.py` + `gate.py`** — Produces unified verdict; posts PR comment.

### 16.4 Provider Architecture

Phase 9 supports three AI backends, selectable at dispatch time:

| Provider | Backend | Cost | Secrets/Vars Required | Best For |
|---|---|---|---|---|
| `ollama` (default) | Local Ollama via OpenAI-compatible API | $0 (electricity) | `vars.OLLAMA_HOST` (optional) | Daily use; no data leaves runner |
| `ai-gateway` | Vercel AI Gateway (Claude + Codex) | ~$0.10-0.30/file | `secrets.AI_GATEWAY_API_KEY` | Cloud accuracy; dual-agent dedup |
| `anthropic-direct` | Anthropic API | ~$0.10-0.30/file | `secrets.ANTHROPIC_AUTH_TOKEN` | Direct Claude access |

**Provider wiring** (from `bootstrap.sh`):

```bash
# Ollama: Routes through OpenAI-compatible endpoint
export OPENAI_BASE_URL="${OLLAMA_HOST}/v1"
export OPENAI_API_KEY="ollama-local"   # Ollama doesn't check the key

# AI Gateway: AI_GATEWAY_API_KEY auto-expands inside deepsec
# Anthropic Direct: ANTHROPIC_AUTH_TOKEN + ANTHROPIC_BASE_URL
```

**Default model**: `kimi-k2.6:cloud` for Ollama (code-reasoning optimized for 24GB VRAM). Override with `DEEPSEC_MODEL` env var or `ai_model` dispatch input.

### 16.5 INFO.md — Project Context Injection

INFO.md is the most important file in the deepsec pipeline. It's injected into every AI batch and makes findings project-aware instead of generic. A template is provided at `.security/deepsec/INFO.md.template`.

**Required sections**:

| Section | Purpose | Example Content |
|---|---|---|
| What this codebase does | System shape, primary users, critical operations | "Multi-tenant SaaS API serving 10k orgs via REST/gRPC" |
| Trust boundaries | Where untrusted input enters/exits | "HTTP handlers, queue consumers, file uploads → DB writes, shell exec" |
| Auth & authz primitives | Named helpers the AI should know | "`internal/auth/middleware.go:RequireUser` gates HTTP routes" |
| Known false-positive sources | Intentional patterns that look dangerous | "admin/* runs behind VPN; public-internet findings are FP" |
| Out-of-scope | What deepsec should skip | "Dependencies (Phase 2), container CVEs (Phase 5), testdata" |

**Critical rule**: Generic INFO.md = generic findings. Spend 10 minutes per project filling it in. Target 50-100 lines.

### 16.6 deepsec.config.ts — Configuration Reference

```typescript
import { defineConfig } from "deepsec/config";

export default defineConfig({
  projects: [{
    id: "target",
    root: "../../..",   // Relative to .workspace
    promptAppend: [
      "Skip findings covered by traditional SAST (gosec, govulncheck, osv-scanner, grype).",
      "Focus on: logic flaws, auth bypass, IDOR, race conditions, multi-step taint flows.",
      "Be conservative with severity. Prefer high precision over recall.",
    ].join("\n"),
    priorityPaths: [
      "internal/api/",      // Highest-leverage paths first
      "internal/auth/",     // so --limit budget is spent wisely
      "internal/handlers/",
      "cmd/",
      "pkg/",
    ],
  }],
  matchers: {
    exclude: [],   // Add slugs to skip noisy categories
  },
  plugins: [],     // Org-specific matchers go here
  dataDir: "./data",
});
```

### 16.7 Phase 9 Trigger Rules

Phase 9 is **deliberately excluded** from nightly cron to avoid burning GPU/API budget. It only fires when:

| Trigger | Mechanism |
|---|---|
| Manual dispatch | `workflow_dispatch` with `run_ai_review: true` |
| PR label | PR receives the `deep-review` label |

It will **not** run on `push`, on unlabeled PRs, or on the schedule. This is enforced by an `if:` guard on the `ai_deep_review` job.

### 16.8 Self-Hosted Runner Setup (Ollama)

Phase 9 requires a self-hosted runner with:

```bash
# Prerequisites
# - Linux or macOS, Node 22+, pnpm
# - Enough VRAM for the model (24GB+ for kimi-k2.6:cloud)

# Install Ollama from an official package source for your OS.
# Avoid pipe-to-shell installers in CI and production environments.
# If you must install from downloaded artifacts, verify checksum/signature first.

# Pull a code-reasoning model
ollama pull kimi-k2.6:cloud

# Enable daemon
systemctl --user enable --now ollama

# GitHub repo settings:
# vars.AI_RUNNER_LABEL = "self-hosted" (or your custom label)
# vars.OLLAMA_HOST = "http://localhost:11434" (default)
```

### 16.9 Tuning Parameters

| Env Var | Default | Purpose |
|---|---|---|
| `DEEPSEC_CONCURRENCY` | 3 | Parallel AI investigations (lower if OOM-ing) |
| `DEEPSEC_BATCH_SIZE` | 3 | Files per batch to the model |
| `DEEPSEC_LIMIT` | (no limit) | Cap total files investigated (set to 50 for calibration) |
| `DEEPSEC_MODEL` | `kimi-k2.6:cloud` | Override model for any provider |
| `DEEPSEC_PROJECT_ID` | `target` | Project ID in deepsec workspace |

### 16.10 Troubleshooting

| Symptom | Fix |
|---|---|
| "Ollama not reachable" | Check `ollama serve` is running; verify `OLLAMA_HOST` matches |
| deepsec refuses files | Model declined exploit-looking code; switch agents or add path to `ignorePaths` |
| Pipeline too slow | Set `DEEPSEC_LIMIT=50`; lower `DEEPSEC_CONCURRENCY` |
| FP rate too high | Improve INFO.md with project-specific context; add FP patterns to `matchers.exclude` |
| Findings don't match expectations | Run both Ollama and cloud provider, diff verdicts; deepsec dedupes across agents |

---

## 17. OpenClaw / Kilo Code Integration Hooks

### 17.1 Skill Activation Triggers
This skill activates on any of these trigger phrases:
- "security audit", "compliance check", "CMMC", "NIST", "OWASP"
- "secure SaaS", "defense-grade", "zero trust", "SBOM"
- "vulnerability assessment", "pentest prep", "hardening"
- "FedRAMP", "SPRS", "CUI protection"
- "deepsec", "deep review", "AI security scan", "Phase 9", "security-scanner"

### 17.2 SECURITY_AUDIT_MODE
When activated with `SECURITY_AUDIT_MODE`, perform a nine-pass audit:

| Pass | Focus | Output |
|---|---|---|
| 1 | OWASP Top 10:2025 | Finding matrix with CWE mapping |
| 2 | NIST 800-171 Controls | Per-control compliance status (Met/Partial/Not Met) |
| 3 | Zero Trust Assessment | ZTA tenet alignment scorecard |
| 4 | Supply Chain & SBOM | Dependency risk report; SBOM completeness check |
| 5 | OWASP ASVS L2 Spot Check | Sampled verification across ASVS chapters |
| 6 | Infrastructure/Container | CIS Benchmark delta; K8s security posture |
| 7 | CSF 2.0 Profile Gap Analysis | Current vs. Target profile across all six functions |
| **8** | **Security Pipeline Audit** | **Verify all 9 phases deployed; check scope.txt, INFO.md, gate thresholds** |
| **9** | **deepsec AI Deep Review** | **Trigger Phase 9 with selected provider; review P0/P1/P2 findings** |

### 17.3 OSS Security Gating (from GODMYTHOS v10.2)
When evaluating external skills, packages, or repos:

| Indicator | Verdict |
|---|---|
| PostHog/telemetry with cloud endpoints | WARN — Patch or document |
| Feishu/ByteDance/Lark hardcoded endpoints | BLOCK — Known exfiltration vector |
| `eval()` / `exec()` on remote-fetched code | BLOCK — Remote code execution |
| Subprocess spawning with user-controlled input | BLOCK — OS command injection |
| No LICENSE file; unclear provenance | WARN — Vet before use |
| Signed releases with SLSA provenance | PASS |

Output a verdict table: `PASS` / `WARN` / `BLOCK` with rationale for each finding.

---

## 18. Reference Links

- NIST CSF 2.0: https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf
- NIST SP 800-207 (ZTA): https://csrc.nist.gov/pubs/sp/800/207/final
- NIST SP 1800-35 (ZTA Implementation): https://pages.nist.gov/zero-trust-architecture/
- NIST SP 800-171 Rev 2: https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final
- OWASP Top 10:2025: https://owasp.org/Top10/2025/
- OWASP ASVS 5.0: https://github.com/OWASP/ASVS
- OWASP API Security Top 10: https://owasp.org/API-Security/
- CISA Secure by Design: https://www.cisa.gov/resources-tools/resources/secure-by-design
- CISA SBOM: https://www.cisa.gov/sbom
- CISA 2025 SBOM Minimum Elements: https://www.cisa.gov/resources-tools/resources/2025-minimum-elements-software-bill-materials-sbom
- SLSA Framework: https://slsa.dev/
- CIS Benchmarks: https://www.cisecurity.org/cis-benchmarks
- **deepsec (Vercel Labs)**: https://github.com/vercel-labs/deepsec
- **deepsec Getting Started**: https://github.com/vercel-labs/deepsec/blob/main/docs/getting-started.md
- **deepsec Configuration**: https://github.com/vercel-labs/deepsec/blob/main/docs/configuration.md
- **deepsec Writing Matchers**: https://github.com/vercel-labs/deepsec/blob/main/docs/writing-matchers.md
- **deepsec Plugins**: https://github.com/vercel-labs/deepsec/blob/main/docs/plugins.md
- gosec: https://github.com/securego/gosec
- govulncheck: https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck
- osv-scanner: https://github.com/google/osv-scanner
- grype: https://github.com/anchore/grype
- syft (SBOM): https://github.com/anchore/syft
- nuclei: https://github.com/projectdiscovery/nuclei
- Ollama: https://ollama.com/

---

*Ultimate Security Skill v2.1 — Last updated: 2026-05-09*
*Includes security-scanner v3 (9-phase pipeline) + deepsec Phase 9 AI deep review.*
*For use with GODMYTHOS v10.2, Kilo Code, OpenClaw, Claude Code, and all AI-assisted development workflows.*
