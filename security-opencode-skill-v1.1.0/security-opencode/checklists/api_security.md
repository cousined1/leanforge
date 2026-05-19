# API Security Checklist

Aligned with OWASP API Security Top 10 (2023 edition is the latest stable
at time of writing; the 2025 edition is in development). When the new
edition lands, update mapping references here.

For HTTP-API specifics. For GraphQL specifics, see notes throughout.
For agent-tool APIs, see `references/ai_agent_security.md`.

---

## API1 — Broken Object Level Authorization (BOLA / IDOR)

- [ ] Every `GET /resources/{id}`, `PUT /resources/{id}`, `DELETE
      /resources/{id}` checks that the authenticated subject owns or has
      permission to access that specific resource.
- [ ] Object IDs are non-guessable where possible (UUIDs, not sequential
      ints) — but this is **defense in depth**, not a replacement for
      authorization.
- [ ] Authorization is enforced at the data layer (`WHERE owner_id = :ctx.user_id`)
      not just the route layer (which can be bypassed by query
      manipulation).
- [ ] Test cases include: requesting another user's resource (expect 403),
      requesting deleted resource (expect 404 not 403 to avoid enumeration).

## API2 — Broken Authentication

See `checklists/secure_code_review.md` § Authentication. API-specific:
- [ ] No basic auth over HTTP (TLS required).
- [ ] API keys are per-application, not per-user; revocable; logged on use.
- [ ] No JWTs in URL query params (leaks to logs/referers).
- [ ] No long-lived bearer tokens — pair short-lived access with rotating
      refresh, or use mTLS for service-to-service.

## API3 — Broken Object Property Level Authorization (BOPLA)

Combines mass-assignment and excessive data exposure.

- [ ] Endpoint responses include only fields the caller is authorized to
      read. No "return the full DB row and let the client filter".
- [ ] Endpoint inputs accept only fields the caller is authorized to write.
      Use explicit field allow-list (Pydantic `model_validate` with
      `extra='forbid'`, Django serializer `fields = (...)` not `'__all__'`,
      Rails strong parameters with explicit `permit`).
- [ ] No client-controlled flags like `is_admin`, `role`, `verified`,
      `tenant_id` in user-facing endpoints.

## API4 — Unrestricted Resource Consumption

- [ ] Rate limits per identity (API key / user / IP), separately per route
      class. Auth endpoints have stricter limits.
- [ ] Pagination: max page size enforced; default sensible (e.g. 25).
- [ ] Request body size limit (e.g. 1 MB for JSON, larger only for explicit
      upload routes).
- [ ] Timeouts on all outbound calls from the API server.
- [ ] GraphQL: query depth limit, query complexity score limit, no
      introspection in prod.
- [ ] No unbounded "expand=all related" parameters.

## API5 — Broken Function Level Authorization (BFLA)

- [ ] Admin functions live on separate route prefixes (`/admin/*`) AND
      are authorization-protected (don't rely on the prefix alone).
- [ ] Lateral routes (one user's action on another's resource) are blocked
      at the route level OR have explicit per-call authorization.
- [ ] HTTP method matters: don't enforce auth on `POST` but skip it on
      `PATCH` or `DELETE`.

## API6 — Unrestricted Access to Sensitive Business Flows

Newer category: bots/scripts abusing legitimate flows at scale.

- [ ] High-value flows (purchases, signups, comment posts, follow/unfollow,
      ticket purchases, claim of free credits) have anti-automation:
      CAPTCHA, proof-of-work, or behavioral fingerprinting.
- [ ] Idempotency keys on payment endpoints (Stripe pattern).
- [ ] Velocity rules: max N actions per minute/hour per identity.
- [ ] Detection of suspicious patterns (low-entropy account names, sequential
      IPs, headless browser signatures) routes to challenge or
      hold-for-review.

## API7 — Server-Side Request Forgery (SSRF)

> See OWASP A01:2025 — SSRF is consolidated under Broken Access Control
> in 2025, but it remains a distinct API risk pattern.

- [ ] Outbound URLs from endpoints (image proxies, webhook validators,
      URL preview, OAuth callbacks) validated against an allow-list.
- [ ] IP-pin after DNS resolve to prevent rebinding.
- [ ] Block cloud metadata IPs (`169.254.169.254`, `fd00:ec2::254`).
- [ ] Block private IP ranges and loopback unless explicitly allowed.
- [ ] No redirect-following on untrusted URLs OR redirect target also
      validated.

## API8 — Security Misconfiguration

See OWASP A02:2025. API-specific:
- [ ] Swagger UI / OpenAPI spec endpoints not exposed in prod (or gated
      behind auth).
- [ ] Detailed errors disabled in prod.
- [ ] Default credentials / sample data removed from prod.
- [ ] CORS scoped to actual frontend origins.

## API9 — Improper Inventory Management

- [ ] All API versions documented and tracked.
- [ ] Deprecated versions disabled when retired, not just undocumented.
- [ ] Non-prod environments (`staging`, `dev`, `qa`) not internet-reachable,
      or have separate auth + data.
- [ ] Third-party API integrations inventoried with version + last-audit
      date.

## API10 — Unsafe Consumption of APIs

The API talks to other APIs that may lie.

- [ ] Validate responses from upstream APIs the same way you validate
      user input.
- [ ] Don't blindly trust webhook payloads — verify signatures (Stripe,
      GitHub, Slack).
- [ ] Don't blindly trust OAuth-claimed scopes — re-check authorization
      server-side.
- [ ] Set timeouts and retries with bounds on every upstream call.

---

## GraphQL-specific

In addition to the above:

- [ ] Introspection disabled in prod (`introspection: false`).
- [ ] Query depth limit set (`graphql-depth-limit`, ~5–10).
- [ ] Query complexity / cost analysis set (`graphql-cost-analysis`).
- [ ] Batching limits (`graphql-no-batching` plugin, or max N operations
      per request).
- [ ] Field-level authorization (each resolver checks its own authz, don't
      rely on the parent).
- [ ] No string-built queries (Apollo's `gql` tagged template, or schema-
      first generation).
- [ ] Persisted queries in prod where feasible — clients send a query
      hash, not the full query text.

---

## REST-specific

- [ ] HTTP methods used semantically (`GET` idempotent, `POST` creates,
      `PUT` upserts, `PATCH` partial, `DELETE` removes).
- [ ] `GET` never has side effects (no "click here to delete" via GET).
- [ ] Idempotent endpoints support `Idempotency-Key` header on retries.
- [ ] HATEOAS / explicit pagination links — don't rely on clients
      guessing URL patterns.

---

## Quick-paste audit prompt

> "Audit the API surface of this repo against the OWASP API Top 10. Use
> `checklists/api_security.md`. List every route, identify auth/authz
> for each, look for BOLA/BOPLA/BFLA gaps, rate-limiting gaps, and SSRF
> sinks. Confidence floor 80. Output to `findings.jsonl`."
