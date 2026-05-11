# Security Checklist
## GODMYTHOS v9 Reference

> Comprehensive security review incorporating NIST CSF 2.0, OWASP Top 10:2025,
> CMMC 2.0, CISA Secure by Design, and EO 14028 SBOM requirements.

---

## SECURITY_AUDIT_MODE — Seven-Pass Structure

### Pass 1: Dependency Audit (OSS Gate)
For every external dependency in the manifest:

| Check | Tool | Verdict |
|-------|------|---------|
| Known CVEs | `npm audit` / `pip-audit` / `govulncheck` / `cargo audit` | PASS / WARN / BLOCK |
| Last publish date | npm registry / PyPI / crates.io | > 12 months = WARN |
| Maintainer activity | GitHub commits | 0 in 6 months = WARN |
| Download anomalies | npm stats | Sudden spike without release = WARN |
| License compatibility | SPDX check | Copyleft in proprietary = BLOCK |

**Verdicts:**
- **PASS** — No issues. Proceed.
- **WARN** — Requires explicit user confirmation before use. Document the risk.
- **BLOCK** — Non-negotiable rejection. Find an alternative.

### Pass 2: Authentication & Authorization
- [ ] Auth tokens are never stored in localStorage (use httpOnly cookies or secure session)
- [ ] JWT tokens have reasonable expiration (≤ 1 hour for access, ≤ 7 days for refresh)
- [ ] API routes enforce authentication middleware
- [ ] Role-based access control is implemented, not just auth/no-auth
- [ ] Password hashing uses bcrypt/scrypt/argon2 (not MD5/SHA-1/SHA-256)
- [ ] OAuth flows use PKCE for public clients
- [ ] Session invalidation works on logout and password change
- [ ] No hardcoded API keys, tokens, or credentials in source

### Pass 3: Input Validation & Injection
- [ ] All user input is validated server-side (client validation is UX, not security)
- [ ] SQL queries use parameterized queries or ORM (no string concatenation)
- [ ] NoSQL queries are sanitized
- [ ] File uploads validate type, size, and content (not just extension)
- [ ] Path traversal is prevented (no `../` in file operations)
- [ ] XML parsing disables external entities (XXE prevention)
- [ ] GraphQL queries have depth/complexity limits
- [ ] Command injection vectors are sanitized (no `exec()` with user input)

### Pass 4: Data Protection
- [ ] Sensitive data is encrypted at rest (database encryption, encrypted file storage)
- [ ] TLS 1.2+ enforced for all connections (no plaintext HTTP in production)
- [ ] PII is identified and classified
- [ ] Logging does not include sensitive data (passwords, tokens, PII)
- [ ] Error messages do not leak implementation details to end users
- [ ] Database backups are encrypted
- [ ] Secrets management uses a vault (not env files in repo)

### Pass 5: Infrastructure & Deployment
- [ ] Production environment is isolated from staging/dev
- [ ] Docker images use minimal base images (alpine, distroless)
- [ ] Container runs as non-root user
- [ ] Network ports are minimized (only expose what's needed)
- [ ] CORS is configured correctly (not `*` in production)
- [ ] CSP headers are set (Content-Security-Policy)
- [ ] Rate limiting is configured on all public endpoints
- [ ] Health check endpoints do not expose internal state

### Pass 6: Monitoring & Response
- [ ] Security events are logged (failed auth, permission denials, rate limit hits)
- [ ] Alerts are configured for anomalous patterns
- [ ] Incident response runbook exists
- [ ] Wazuh/SIEM integration is active (if homelab deployment)
- [ ] CrowdSec or equivalent is blocking known bad actors

### Pass 7: Supply Chain & SBOM
- [ ] SBOM (Software Bill of Materials) is generated for each release
- [ ] Dependencies are pinned to exact versions (no floating ranges in production)
- [ ] Lock files (package-lock.json, poetry.lock, Cargo.lock) are committed
- [ ] CI validates lock file integrity
- [ ] Third-party skills/plugins are audited before deployment

---

## OSS Gate Quick Reference

For adding a new dependency to any project:

```
1. SEARCH   — CVE databases (NVD, GitHub Security Advisories, Snyk DB)
2. CHECK    — npm/PyPI/crates.io for last publish date and download trends
3. INSPECT  — GitHub for maintainer activity, open security issues, contributor count
4. LICENSE  — Verify SPDX compatibility with project license
5. VERDICT  — PASS / WARN / BLOCK
6. DOCUMENT — If WARN: record risk + user confirmation in PR description
             If BLOCK: record reason + alternative chosen
```

---

## Known Malicious Patterns (Hardcoded BLOCK)

| Pattern | Description | Action |
|---------|-------------|--------|
| Feishu/ByteDance endpoints | Data exfiltration to Feishu/Lark APIs | BLOCK — no exceptions |
| `postinstall` scripts with network calls | Install-time code execution + exfil | BLOCK unless verified |
| Obfuscated source in published package | Hidden malicious code | BLOCK |
| `capability-evolver` pattern | Skill that reads MEMORY.md, .env, credentials | BLOCK |
| Install hooks that modify other packages | Supply chain attack vector | BLOCK |

---

## OWASP Top 10:2025 Quick Checklist

| # | Category | Key Check |
|---|----------|-----------|
| A01 | Broken Access Control | Enforce least privilege, deny by default |
| A02 | Cryptographic Failures | TLS everywhere, strong hashing, no hardcoded keys |
| A03 | Injection | Parameterized queries, input validation, output encoding |
| A04 | Insecure Design | Threat model before building, security requirements in specs |
| A05 | Security Misconfiguration | Remove defaults, disable directory listing, harden headers |
| A06 | Vulnerable Components | OSS gate on all deps, automated scanning |
| A07 | Auth Failures | MFA support, brute-force protection, secure session management |
| A08 | Data Integrity Failures | Verify CI/CD pipeline integrity, signed releases |
| A09 | Logging Failures | Log security events, don't log sensitive data |
| A10 | SSRF | Validate/sanitize all URLs, deny internal network access from user input |

---

## Audit Output Format

```markdown
# Security Audit: {project name}
## Date: {YYYY-MM-DD}
## Scope: {what was audited}

## Summary
- Pass 1 (Dependencies): {PASS/WARN/BLOCK count}
- Pass 2 (Auth): {findings count by severity}
- Pass 3 (Input): {findings count}
- Pass 4 (Data): {findings count}
- Pass 5 (Infra): {findings count}
- Pass 6 (Monitoring): {findings count}
- Pass 7 (Supply Chain): {findings count}

## CRITICAL Findings (must fix before ship)
{finding}: {description} → {remediation}

## HIGH Findings (must fix before production)
{finding}: {description} → {remediation}

## MEDIUM Findings (should fix, track in backlog)
{finding}: {description} → {remediation}

## LOW Findings (nice to have)
{finding}: {description}

## Overall Verdict: PASS / PASS WITH NOTES / FAIL
```
