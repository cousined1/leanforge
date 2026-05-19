# Secure Code Review Checklist

Use this as the manual sweep when a SAST tool's output is in front of you,
or when reviewing a PR by hand. Pair with the OWASP and API checklists
for the policy mapping.

---

## Input handling

- [ ] Every external input (HTTP params, headers, cookies, files, env vars,
      message-queue messages, CLI args, deserialized payloads, retrieved
      LLM context, third-party API responses) is **validated by an
      allow-list** when format is known, or sanitized for the specific
      sink it flows to.
- [ ] No string concatenation into SQL, shell, LDAP, XPath, regex,
      template, or LLM prompt.
- [ ] File uploads: extension allow-list, MIME-type sniff verification,
      max size, stored outside web root, filename randomized, served via
      separate domain (no cookie scope) or `Content-Disposition: attachment`.
- [ ] No "block-list" validation alone — block-lists miss novel encodings.
- [ ] Numeric inputs parsed into typed values (int/decimal), not kept as
      strings.

## Output / encoding

- [ ] HTML output uses the framework's auto-escaping by default. Any
      "raw"/"safe" / `dangerouslySetInnerHTML` call has a comment justifying
      it and references a trusted source.
- [ ] JSON responses use `application/json` and don't reflect untrusted
      bytes into JavaScript contexts.
- [ ] Error messages don't include stack traces, SQL fragments, file paths,
      or internal IPs.
- [ ] Logs redact secrets, full PANs, full SSNs, passwords, tokens.

## Authentication

- [ ] Passwords stored with Argon2id / scrypt / bcrypt(cost ≥ 12).
- [ ] Password reset / email verify tokens: cryptographically random,
      single-use, time-limited ≤15 min, invalidate other sessions on use.
- [ ] Account lockout / exponential backoff on failed login.
- [ ] MFA available; required for admin/privileged.
- [ ] Session IDs from CSPRNG, ≥128 bits, rotated on login and privilege
      change, invalidated server-side on logout.
- [ ] OAuth/OIDC: PKCE for public clients, state required, redirect URI
      exact-match allow-list, no implicit flow.

## Authorization

- [ ] Every route has explicit authorization. No reliance on URL secrecy.
- [ ] Authorization checks the requester's identity vs resource ownership,
      not just "is logged in".
- [ ] Multi-tenant queries filter by tenant on every read (not just writes).
- [ ] Admin/debug endpoints either network-restricted or absent in prod.
- [ ] No client-side-only authz.

## Crypto

- [ ] See `references/cryptography.md` — no MD5/SHA1, no AES-ECB, no
      RSA-PKCS1v1.5, no static IVs, no hand-rolled crypto.
- [ ] TLS 1.2 minimum, valid cert chain, no `verify=False`.
- [ ] Secrets from KMS / vault / secrets manager at runtime, not from
      source or env vars in plaintext containers.

## Session & cookies

- [ ] Cookies: `Secure`, `HttpOnly`, `SameSite=Lax` or `Strict`,
      `__Host-` prefix when possible.
- [ ] Session fixation: rotate session ID on login.
- [ ] CSRF: tokens on state-changing endpoints (or strict same-site
      cookies + custom header check for SPAs).

## Errors & exceptions

- [ ] Auth/authz middleware fails closed (deny on exception).
- [ ] No silent except/catch in security-relevant paths.
- [ ] Resource limits (max body size, max JSON depth, max query
      complexity, timeouts on outbound calls).
- [ ] No unbounded recursion / loops on user-controlled iterators.

## Dependencies & supply chain

- [ ] Dependency manifest + lockfile committed.
- [ ] Lockfile pins to integrity hashes where the ecosystem supports it
      (`integrity:` in `package-lock.json`, `--hash=sha256:` in
      `requirements.txt`, `Cargo.lock`, `go.sum`).
- [ ] No `curl ... | sh` or unsigned binary downloads.
- [ ] Renovate/Dependabot config present and active.
- [ ] No abandoned dependencies (last release > 2 years + no maintainer
      response on issues).

## Configuration & secrets

- [ ] No secrets in source. `.env`, `*.tfvars`, `secrets.yml` gitignored.
- [ ] `.env.example` has placeholder values, no real ones.
- [ ] Debug/dev modes off in prod (`DEBUG=False`, `NODE_ENV=production`).
- [ ] Security headers: CSP, HSTS, X-Content-Type-Options,
      Referrer-Policy, Permissions-Policy.
- [ ] CORS allow-list, never `*` with credentials.

## Logging & monitoring

- [ ] Security events logged (auth, authz, admin actions, payment, data
      export).
- [ ] Logs shipped to SIEM (Wazuh on `10.0.0.179` in Eddie's stack).
- [ ] Alerting on anomalies configured AND tested.
- [ ] No PII / secrets in logs.

## Tests

- [ ] Tests for negative auth cases (anonymous, wrong-tenant, wrong-role)
      exist and pass.
- [ ] Tests for input edge cases (empty, oversized, malformed, Unicode
      tag/ZW/BIDI, null bytes).
- [ ] No tests skipping auth via test-only bypass that leaks to prod.
- [ ] Fuzz tests on parsers / deserializers exposed to untrusted input.

## CI/CD

- [ ] See `workflows/harden_actions.md` for the GHA-specific list.
- [ ] Build artifacts signed.
- [ ] Branch protection: required reviewers, signed commits, no force-push,
      no admin bypass.
- [ ] CODEOWNERS for `.github/workflows/`, IaC, schema migrations.

## AI / agent (if applicable)

- [ ] All 5 phases in `references/ai_agent_security.md` passed.
- [ ] Human-in-loop on state changes.
- [ ] Prompt-injection defenses (delimiters, sanitization, labels).
- [ ] Tool permissions scoped per-task.
- [ ] Observability: every LLM + tool call logged.

---

## Per-line PR review heuristic

For each diff hunk, ask in this order:

1. **Trust boundary** — does this line cross one? (HTTP → app, app → DB,
   app → shell, app → LLM, LLM → tool, etc.) If yes, what's the validation
   / sanitization?
2. **Authorization** — does this line read or modify a resource that
   belongs to someone? Is the requester's authorization checked at this
   line, or upstream in a way that's still valid here?
3. **Failure mode** — what happens on exception? Fail-closed or fail-open?
4. **Side effects** — does this line emit observable state (DB write,
   network call, file write, log)? Is it logged, idempotent, rate-limited
   if appropriate?
5. **Secrets** — does this line touch credentials, tokens, keys? Where do
   they come from, how long do they live in memory, are they redacted
   in logs?

If a hunk passes all five, move on. If any one fails, leave a comment.
