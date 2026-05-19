# OWASP Top 10:2025 — Mapping & Checklist

Verified against `https://owasp.org/Top10/2025/` (eighth edition, released
late 2025). Key changes from 2021:

- **A03:2025** is a new category: **Software Supply Chain Failures** —
  expands and absorbs the 2021 A06 "Vulnerable and Outdated Components".
- **A10:2025** is a new category: **Mishandling of Exceptional Conditions**.
- **SSRF** (was A10:2021) is now consolidated into **A01:2025 — Broken
  Access Control**.
- **A02:2025 Security Misconfiguration** moved up from #5 in 2021.
- **A09:2025** was renamed from "Logging and Monitoring Failures" to
  **Security Logging and Alerting Failures** (emphasizing alerting).

For each finding, set the `rule` field in `findings.jsonl` to
`OWASP A##:2025`. Use this file as the master mapping during a REVIEW or
AUDIT run.

---

## A01:2025 — Broken Access Control

**Description:** access restrictions not enforced. Includes IDOR, missing
authz on backend endpoints, JWT/cookie tampering, CORS misconfig, force
browsing — **and SSRF** (server-side request forgery is now within this
category in 2025 because both stem from the application acting outside its
intended permission boundary).

### Checks
- [ ] Every API route has explicit authorization (`@require_role`, RBAC
      decorator, middleware). No route relies on "URL is hard to guess".
- [ ] Object access checks compare requester identity to resource ownership,
      not just "is logged in". (IDOR test: `GET /api/orders/123` as user
      who doesn't own order 123 → must 403, not 200.)
- [ ] No client-side-only authz. The frontend hiding a button is not access
      control.
- [ ] CORS is allow-list, not `*`. `Access-Control-Allow-Origin: *` with
      `Access-Control-Allow-Credentials: true` is impossible (browsers
      reject) but the config error itself is a flag.
- [ ] JWT: `alg` is pinned server-side (reject `none`, reject `HS256` when
      expecting `RS256`). Audience and issuer claims are validated.
- [ ] Vertical privilege escalation: regular users cannot POST to admin
      endpoints by changing a role claim or guessing the URL.
- [ ] Horizontal escalation: tenant isolation enforced on every multi-tenant
      query (`WHERE tenant_id = :ctx.tenant_id` on every read, not just
      writes).
- [ ] Force-browsing: admin / debug / `/api/internal/*` endpoints either
      aren't deployed in prod or are network-restricted, not just
      auth-restricted.
- [ ] Rate-limit auth endpoints to prevent enumeration (login, password
      reset, MFA verify).
- [ ] **SSRF guard:** outbound HTTP from the server validates URLs against
      an allow-list. Block `169.254/16` (cloud metadata), `127.0.0.0/8`,
      `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `::1`, link-local
      `fe80::/10`. Pin to IP post-DNS-resolution to prevent DNS rebinding.

### Common CWEs
CWE-22, CWE-23, CWE-285, CWE-639 (IDOR), CWE-862 (Missing Authorization),
CWE-863 (Incorrect Authorization), CWE-918 (SSRF — moved here from 2021's
A10).

### Quick test commands
```bash
# Force-browse common admin paths
ffuf -w /usr/share/seclists/Discovery/Web-Content/common.txt \
     -u https://target.example.com/FUZZ -mc 200,301,302

# IDOR with two different sessions
curl -H "Authorization: Bearer $TOKEN_A" https://api.example.com/orders/$ID_OF_B
# Expected: 403. Bad: 200.

# SSRF probe — does the app fetch arbitrary URLs?
curl -X POST https://target/api/fetch-url \
  -d '{"url":"http://169.254.169.254/latest/meta-data/iam/security-credentials/"}'
```

---

## A02:2025 — Security Misconfiguration

**Description:** default credentials, verbose errors, unnecessary features
enabled, missing security headers, permissive cloud defaults.

> **Moved up from #5 in 2021 to #2 in 2025** — misconfigurations are the
> single most prevalent class of issue in the contributed dataset.

### Checks
- [ ] No default credentials anywhere in deployed software (admin/admin,
      root/changeme, etc).
- [ ] Debug mode off in prod (`DEBUG = False`, `NODE_ENV=production`).
      Verbose stack traces never reach users.
- [ ] Security headers on every HTML response: `Content-Security-Policy`
      (with nonce or hash, not `unsafe-inline`), `X-Content-Type-Options:
      nosniff`, `X-Frame-Options: DENY` or CSP `frame-ancestors`,
      `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-
      Policy` for unused features.
- [ ] Cookies: `Secure`, `HttpOnly`, `SameSite=Lax` (or `Strict`),
      `__Host-` prefix for session cookies where possible.
- [ ] Unused services disabled (no admin panels, no `/metrics` exposed
      publicly, no Swagger UI in prod unless gated).
- [ ] Cloud bucket / DB defaults reviewed (S3 public access blocked,
      Postgres `pg_hba.conf` not `trust`).
- [ ] Email DNS hardening: SPF, DKIM, DMARC `p=reject`, MTA-STS, TLS-RPT.
- [ ] CSP report-uri configured to a sink Eddie monitors (n8n endpoint or
      Wazuh agent).
- [ ] No verbose framework defaults: Django `DEBUG=False`, Rails
      `config.consider_all_requests_local = false`, Spring Boot
      `server.error.include-stacktrace=never`.

### Common CWEs
CWE-2, CWE-16 (Configuration), CWE-260 (Password in Config File), CWE-520,
CWE-1004 (Sensitive Cookie Without HttpOnly).

---

## A03:2025 — Software Supply Chain Failures *(NEW in 2025)*

**Description:** breakdowns or compromises in the process of building,
distributing, or updating software. Caused by vulnerabilities or malicious
changes in third-party code, tools, or dependencies. **This subsumes the
former A06:2021 "Vulnerable and Outdated Components"** and expands it
across the full SDLC.

### Checks
- [ ] SBOM generated and stored for every release artifact (CycloneDX or
      SPDX). See `references/iac_container_security.md` §7.
- [ ] All dependencies pinned to a version, ideally to a hash/integrity
      (`package-lock.json` `integrity:` field, Go `go.sum`, Python
      `requirements.txt` with `--hash=sha256:...`, Cargo `Cargo.lock`).
- [ ] No installation from arbitrary URLs (`curl ... | sh`). Use signed
      packages from official registries.
- [ ] Dependency confusion: private package names not registered on public
      registries; OR scoped (`@yourorg/*`) and registry-pinned in `.npmrc`.
- [ ] CI/CD pipeline hardened (see `references/cicd_hardening.md`):
      pinned actions, OIDC, ephemeral runners, signed commits, SLSA L2+
      provenance for release artifacts.
- [ ] Container base images pinned to digest; rebuild on a schedule to
      pick up base-image patches.
- [ ] Build reproducibility where feasible (deterministic builds, locked
      toolchains).
- [ ] License compliance check (Syft + `scancode-toolkit` or `fossology`).
- [ ] Renovate or Dependabot configured with `vulnerabilityAlerts: true`
      and `osvVulnerabilityAlerts: true`.
- [ ] All direct dependencies in current supported release lines. No
      critical CVE older than 30 days unaddressed; no high CVE older than
      90 days unaddressed.
- [ ] Container base images < 30 days old (rebuild cadence).
- [ ] `npm audit`, `pip-audit`, `cargo audit`, `govulncheck`, `composer
      audit`, `bundle audit` clean (or all results triaged).
- [ ] Sigstore / cosign signatures verified at deploy time for both
      first-party artifacts and trusted third-party images.

### Common CWEs
CWE-829 (Inclusion of Functionality from Untrusted Control Sphere),
CWE-1104 (Use of Unmaintained Third-Party Components), CWE-1357 (Reliance
on Insufficiently Trustworthy Component), CWE-1395 (Dependency on
Vulnerable Third-Party Component).

### Tools
See `references/iac_container_security.md` §7.

> **Why this category is severe despite low frequency:** OWASP notes that
> supply-chain failures had the **fewest occurrences in testing data but
> the highest average exploit and impact scores from CVEs**. One Log4Shell
> beats ten XSS bugs.

---

## A04:2025 — Cryptographic Failures

**Description:** sensitive data in transit or at rest without proper crypto.
Weak algorithms, missing TLS, hardcoded keys, predictable randomness.

> Dropped from #2 (2021) to #4 (2025) — not because crypto matters less,
> but because misconfiguration and supply-chain failures grew faster.

### Checks
- [ ] TLS 1.2 minimum, TLS 1.3 preferred. No SSLv3, TLS 1.0, TLS 1.1.
- [ ] HSTS header set with `max-age >= 31536000; includeSubDomains; preload`.
- [ ] No `verify=False`, `rejectUnauthorized: false`, `InsecureSkipVerify`
      in HTTP clients.
- [ ] Passwords stored with **Argon2id** (preferred), **scrypt**, or
      **bcrypt(cost ≥ 12)**. Never MD5, SHA-1, SHA-256-without-salt,
      PBKDF2-SHA1.
- [ ] PII (SSN, payment data, health data) encrypted at rest with
      AES-256-GCM or ChaCha20-Poly1305. Keys from KMS, not env vars.
- [ ] No hardcoded keys, IVs, or salts in source. (gitleaks + manual scan
      for high-entropy strings.)
- [ ] RNG for security-sensitive values uses `secrets` (Python),
      `crypto.randomBytes` (Node), `crypto/rand` (Go) — never `Math.random()`,
      `random.random()`, `rand()`.
- [ ] JWT signing keys: HS* secrets are ≥32 bytes, generated from CSPRNG;
      RS*/ES* keys ≥2048 bits / P-256 minimum.
- [ ] HTTPS everywhere — no mixed content, no `http://` API calls from a
      `https://` frontend.
- [ ] Database connections use TLS (`sslmode=verify-full` for Postgres).
- [ ] Secrets at rest: encrypted with a KMS key, not just base64 in a
      ConfigMap.

### Eddie's StormAtlas pattern (already hardened, use as reference)
- Refresh tokens stored as SHA-256 hashes server-side, plaintext only in
  cookie.
- JWT algorithm pinned (`HS256` only; reject `none`, `RS256` confusion).
- Timing-safe comparisons on lockout responses (`hmac.compare_digest`).
- WebSocket auth via signed query param token, validated before upgrade.

### Common CWEs
CWE-261, CWE-296, CWE-310, CWE-326, CWE-327, CWE-330, CWE-331, CWE-757,
CWE-798 (Hardcoded Credentials).

---

## A05:2025 — Injection (incl. XSS and Prompt Injection)

**Description:** SQL, NoSQL, OS command, LDAP, XPath, expression-language,
template, and **prompt** injection. Cross-site scripting remains within
this category.

> Dropped from #3 (2021) to #5 (2025). Still highly dangerous — the drop
> reflects better tooling defaults, not lower impact.

### Checks
- [ ] All SQL via parameterized queries / prepared statements / ORMs.
      No string concatenation with user input.
- [ ] NoSQL: queries built from typed structures, not from user JSON
      passed directly to `.find()`. Watch for MongoDB operator injection
      (`{ $ne: null }`).
- [ ] OS commands: use `subprocess.run(["cmd", arg1, arg2], shell=False)`
      with an array, never `shell=True` with a built string.
- [ ] Template engines (Jinja2, Handlebars, ERB): user input rendered as
      data, not as a template. No `render_template_string(user_input)`.
- [ ] HTML output is escaped by default (the framework does it, or you
      explicitly call an escaper). Mark "raw" output as an exception
      requiring justification.
- [ ] LDAP: filters built with a library that escapes (`ldap3`'s
      `escape_filter_chars`).
- [ ] XML: external entity processing disabled (`defusedxml` in Python,
      `noent: false` in libxml2).
- [ ] **Prompt injection** (see `references/ai_agent_security.md` Phase 2)
      — all LLM-adjacent input sanitized for Unicode tags, ZW, BIDI;
      retrieved content delimited and labeled untrusted.

### Common CWEs
CWE-77 (Command Injection), CWE-78, CWE-79 (XSS), CWE-89 (SQL Injection),
CWE-90, CWE-91, CWE-94, CWE-95 (Eval), CWE-1336 (Template Engine), and the
emerging CWE for LLM prompt injection.

---

## A06:2025 — Insecure Design

**Description:** missing or ineffective control design. Architectural and
threat-modeling flaws rather than implementation mistakes — weak password
reset flows, missing rate limiting at the design level, lack of threat
modeling, missing authorization steps in the design itself.

> Slipped from #4 (2021) to #6 (2025), reflecting gradual industry adoption
> of secure-by-design practices.

### Checks
- [ ] Threat model exists for the system (STRIDE, PASTA, or LINDDUN) and
      is reviewed when major features are added.
- [ ] Trust boundaries documented in the architecture diagram.
- [ ] Abuse cases enumerated alongside use cases. "How would I break
      this?" is answered in design docs.
- [ ] Rate limits designed in, not added as an afterthought.
- [ ] Privilege boundaries minimized — services run with least privilege
      by design, not by exception.
- [ ] Sensitive flows (password reset, payment, deletion) include
      out-of-band verification or rate-limited tokens.
- [ ] Secrets compartmentalized — no single key compromise should give
      access to all environments.
- [ ] Failure modes considered: what happens when the cache is down? when
      the queue is full? when a downstream times out?

### Common CWEs
CWE-209 (overlap with A10), CWE-256, CWE-501 (Trust Boundary Violation),
CWE-522, CWE-525, CWE-602, CWE-840.

---

## A07:2025 — Authentication Failures

**Description:** weak auth, credential stuffing, session fixation, missing
MFA on high-privilege flows. Renamed slightly from "Identification and
Authentication Failures".

### Checks
- [ ] Password policy: min 12 chars, no max < 64, no composition rules
      (NIST 800-63B), checked against breach lists (HIBP Pwned Passwords
      k-anonymity API).
- [ ] Account lockout / progressive delays on failed logins.
- [ ] MFA available for all users; required for admin/privileged accounts.
      WebAuthn preferred over TOTP preferred over SMS.
- [ ] Session IDs from CSPRNG, ≥128 bits entropy, rotated on login and
      privilege change.
- [ ] Logout invalidates server-side session, not just client cookie.
- [ ] No session in URL.
- [ ] Password reset: time-limited (≤15 min), single-use, invalidates
      other sessions, sent to verified email.
- [ ] Brute-force protections on login, MFA-verify, password-reset
      endpoints.
- [ ] OAuth/OIDC: state parameter required, PKCE for public clients,
      redirect_uri exact-match allow-list, no `response_type=token`
      (implicit deprecated), code exchanged server-side.

### Common CWEs
CWE-287, CWE-307, CWE-384 (Session Fixation), CWE-521, CWE-613, CWE-620.

---

## A08:2025 — Software and Data Integrity Failures

**Description:** code, infrastructure, or data trusted without integrity
verification. Includes insecure deserialization, unsigned updates, CI/CD
artifact poisoning (where the artifact integrity itself is the issue —
the broader supply-chain failure is now A03).

### Checks
- [ ] No untrusted deserialization. Python `pickle.loads` on untrusted
      bytes → CRITICAL. Java `ObjectInputStream`, PHP `unserialize`, .NET
      `BinaryFormatter` — same.
- [ ] Auto-update mechanisms verify signatures (Sigstore / cosign /
      Sigstore-rekor for containers, GPG/minisign for binaries).
- [ ] CI/CD artifacts signed; deploy step verifies signature before rollout.
- [ ] Webhooks (Stripe, GitHub, Slack, etc.) verify signature headers
      before processing.
- [ ] Cache poisoning: HTTP cache keys include `Vary` headers; CDN config
      vetted.
- [ ] Frontend assets: subresource integrity (SRI) on `<script>` /
      `<link>` from third-party CDNs.

### Common CWEs
CWE-345, CWE-353, CWE-502 (Deserialization), CWE-565, CWE-784, CWE-829.

---

## A09:2025 — Security Logging and Alerting Failures

**Description:** auditable events not logged, logs not centralized, **no
alerting**, logs containing secrets or PII. The 2025 rename emphasizes
alerting — great logging with no alerting is of minimal value.

### Checks
- [ ] Auth events logged: login success/fail, password change, MFA enroll,
      privilege change, account lockout.
- [ ] High-value action events logged: payment, deletion, admin actions,
      data export, API key creation.
- [ ] Logs centralized to a SIEM (Eddie's Wazuh on `10.0.0.179` +
      OpenSearch).
- [ ] Logs include who/what/when/where/how (subject, action, target,
      timestamp, source IP/agent, request ID).
- [ ] No PII or secrets in logs (passwords, tokens, full PANs, full SSNs).
      Use redaction filters.
- [ ] **Alerting on anomalies** is configured AND tested: failed login
      spikes, lockouts, 4xx/5xx rate, new admin account creation, large
      data export.
- [ ] Alerts route to a human channel that's actually monitored
      (Eddie default: BoardMeeting Telegram group via
      `@JavonteWindows11_bot`).
- [ ] Log retention meets compliance (90+ days for most; 1+ year for
      regulated).
- [ ] Log integrity: append-only, hash-chained, or shipped to immutable
      store (S3 with object lock, WORM).

### Common CWEs
CWE-117 (Improper Log Output Neutralization), CWE-223 (Omission of
Security-Relevant Info), CWE-532 (Sensitive Info in Log), CWE-778
(Insufficient Logging).

---

## A10:2025 — Mishandling of Exceptional Conditions *(NEW in 2025)*

**Description:** error paths that leak sensitive info, fail-open instead of
fail-closed, race conditions, resource exhaustion. The 2025 edition pulls
together 24 CWEs previously scattered across "code quality" issues.

> OWASP survey: **50% of respondents ranked this their #1 emerging
> concern** — exactly the kind of class that scanners miss because the
> bugs surface only under stress.

### Checks
- [ ] Errors fail-closed (deny on exception, not allow). Especially in
      auth/authz middleware.
- [ ] Error responses to users: generic message, no stack trace, no DB
      schema, no internal IPs.
- [ ] Resource limits: max upload size, max JSON depth, max query
      complexity (GraphQL), max request rate per IP/user.
- [ ] No unbounded recursion / loops over user-controlled iterators.
- [ ] Timeouts on every outbound HTTP call (no "infinite hang").
- [ ] No silent except / catch-and-ignore in security-relevant paths.
- [ ] Race conditions audited (TOCTOU): see
      `references/ai_agent_security.md` Phase 4 for the pattern; applies
      equally to non-agent code.
- [ ] NULL dereference / divide-by-zero / array OOB on attacker-influenced
      inputs.
- [ ] Resource exhaustion DoS: zip bombs, billion-laughs XML, regex
      backtracking (ReDoS), infinite redirects.

### Common CWEs
CWE-209 (Info Exposure Through Error), CWE-248 (Uncaught Exception),
CWE-252 (Unchecked Return Value), CWE-362 (Race Condition), CWE-391
(Unchecked Error), CWE-400 (Uncontrolled Resource Consumption), CWE-476
(NULL Pointer Dereference), CWE-636 (Failing Open), CWE-754 (Improper
Check for Unusual Conditions).

> Note: CWE-918 (SSRF) was previously associated with this kind of
> resilience failure but was placed under **A01:2025** in the final OWASP
> mapping. Use A01 for SSRF, A10 for the broader failure-handling class.

---

## Quick-paste audit prompt

> "Audit this repo against OWASP Top 10:2025. For each category A01–A10,
> run the checks in `checklists/owasp_top10_2025.md`. For each finding,
> emit a row to `findings.jsonl` with `rule: 'OWASP A##:2025'` and the
> matching CWE. Confidence floor 80. Surface only above-floor findings in
> the rendered `report.md`. Output the compliance section as a table
> showing pass/fail per category with finding counts."

## Compliance section template (auto-fills into report)

| Category | Status | Findings | Notes |
|---|---|---|---|
| A01 — Broken Access Control (incl. SSRF) | PASS / FAIL | N | |
| A02 — Security Misconfiguration | PASS / FAIL | N | |
| A03 — Software Supply Chain Failures | PASS / FAIL | N | |
| A04 — Cryptographic Failures | PASS / FAIL | N | |
| A05 — Injection | PASS / FAIL | N | |
| A06 — Insecure Design | PASS / FAIL | N | |
| A07 — Authentication Failures | PASS / FAIL | N | |
| A08 — Software & Data Integrity Failures | PASS / FAIL | N | |
| A09 — Security Logging & Alerting Failures | PASS / FAIL | N | |
| A10 — Mishandling of Exceptional Conditions | PASS / FAIL | N | |
