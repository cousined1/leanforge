# Security Audit Plan — LeanForge Keyword Trend Index

**Framework:** Security_Skill_v2.1 (CMMC 2.0 · NIST CSF 2.0 · OWASP Top 10:2025 · OWASP ASVS 5.0)
**Scope:** FRONTEND (Next.js) + API (Express/Prisma) + Infrastructure
**Date:** 2025-05-10 | **Confidence:** HIGH

---

## EXECUTIVE SUMMARY

2 CRITICAL, 5 HIGH, 6 MEDIUM, 4 LOW findings across both codebases.
Most urgent: zero authentication on API, leaked real API key in `.env.example`.

---

## FINDINGS MATRIX — OWASP Top 10:2025

| # | OWASP Category | Finding | Severity | Location |
|---|----------------|---------|----------|----------|
| A01 | Broken Access Control | **Zero auth on ALL API endpoints** — mutating endpoints (POST/PUT/DELETE) are public | CRITICAL | `api/src/routes/apiRoutes.ts:13-15,29` |
| A01 | Broken Access Control | **Mass assignment** — `req.body` passed directly to Prisma `update()` | HIGH | `api/src/controllers/keywordController.ts:152-157` |
| A01 | Broken Access Control | No rate limit differentiation between read/write endpoints | MEDIUM | `api/src/middleware/rateLimiter.ts` |
| A02 | Security Misconfiguration | 10MB JSON body limit — memory exhaustion DoS vector | MEDIUM | `api/src/index.ts:37` |
| A02 | Security Misconfiguration | `REDIS KEYS` command used in production — blocks Redis | MEDIUM | `api/src/services/cacheService.ts:33` |
| A03 | Supply Chain Failures | **Real API key in `.env.example`** — committed to repo | CRITICAL | `api/.env.example:2` |
| A03 | Supply Chain Failures | Dead code: `INSFORGE_API_KEY`, `INSFORGE_BASE_URL`, `REDIS_TOKEN` unused | LOW | `api/src/config/env.ts:10-11`, `.env.example:10` |
| A03 | Supply Chain Failures | `@tanstack/react-query` installed but unused — increases attack surface | LOW | `frontend/package.json:18` |
| A04 | Cryptographic Failures | CSP allows `'unsafe-inline'` in `script-src` — weakens XSS protection | MEDIUM | `frontend/next.config.js:12` |
| A05 | Injection | `JSON.stringify` in `dangerouslySetInnerHTML` does not escape `</script>` | LOW | `frontend/src/components/JsonLd.tsx:11` |
| A07 | Auth Failures | OAuth error messages from URL params rendered in DOM | MEDIUM | `frontend/src/components/AuthCallbackClient.tsx:30` |
| A09 | Logging Failures | Error handler leaks `err.message` in dev via `process.env` not validated `config` | LOW | `api/src/middleware/errorHandler.ts:30` |
| A10 | Exceptional Conditions | No request timeout on external API calls (Serper, Google Trends) | HIGH | `api/src/services/serperService.ts:30`, `googleTrendsService.ts:25` |
| A10 | Exceptional Conditions | Unbounded query results — `days` param in `getTimeline` has no max | HIGH | `api/src/controllers/trendController.ts:114` |
| A10 | Exceptional Conditions | Fail-open rate limiter — Redis outage disables all rate limiting | MEDIUM | `api/src/middleware/rateLimiter.ts:33-36` |
| API1 | Broken Object Level Auth | All keyword/category mutations accessible without ownership checks | HIGH | `api/src/routes/apiRoutes.ts` |
| API4 | Unrestricted Resource Consumption | No per-endpoint rate limits; same limit for reads and writes | MEDIUM | `api/src/middleware/rateLimiter.ts` |

---

## PASS 1 — OWASP TOP 10:2025 MITIGATIONS

### 1.1 CRITICAL: Add API Authentication (A01)

**File:** `api/src/middleware/auth.ts` (NEW)
**File:** `api/src/routes/apiRoutes.ts` (MODIFY)

- Add API key middleware that validates `X-API-Key` header against stored keys
- Use Prisma to look up API key hash (never store plaintext keys)
- Apply auth middleware to mutating routes (POST, PUT, DELETE)
- Keep read-only routes public (consistent with current frontend behavior)
- Add `req.apiKey` context to authenticated requests

### 1.2 CRITICAL: Rotate Leaked API Key (A03)

**File:** `api/.env.example` (MODIFY)

- Remove the real key `ik_sehrni5g1w9ptlg52cx3sx32nlrvsgmz` immediately
- Replace with `YOUR_INSFORGE_API_KEY_HERE`
- **ACTION REQUIRED:** User must rotate this key in the InsForge dashboard if it was ever committed to git history

### 1.3 HIGH: Fix Mass Assignment (A01)

**File:** `api/src/controllers/keywordController.ts` (MODIFY)

- Replace `req.body` passthrough with explicit field allowlist
- Only allow `term`, `category`, `searchVolume`, `difficulty`, `source` on update
- Reject requests containing disallowed fields

### 1.4 HIGH: Add Input Validation to Trend Controllers (A01)

**File:** `api/src/controllers/trendController.ts` (MODIFY)

- Validate `category` against allowed enum values
- Validate `direction` against `'rising'|'falling'|'flat'`
- Validate `geo` is a 2-letter country code
- Cap `days` parameter to max 365
- Validate `keywords` array in compare endpoint

### 1.5 MEDIUM: Fix CSP (A04)

**File:** `frontend/next.config.js` (MODIFY)

- Generate per-request nonces for `script-src` instead of `'unsafe-inline'`
- Alternatively, use `'strict-dynamic'` with a fallback nonce
- Keep `'unsafe-inline'` only for `style-src` (required by Tailwind)

### 1.6 MEDIUM: Sanitize JsonLd Output (A05)

**File:** `frontend/src/components/JsonLd.tsx` (MODIFY)

- Replace `JSON.stringify(data)` with `JSON.stringify(data).replace(/</g, '\\u003c')`
- This prevents `</script>` injection in structured data

### 1.7 LOW: Fix Error Handler (A09)

**File:** `api/src/middleware/errorHandler.ts` (MODIFY)

- Import `config` instead of reading `process.env.NODE_ENV` directly
- Never expose `err.message` even in development — log it, don't return it

---

## PASS 2 — NIST SP 800-171 ACCESS CONTROLS

| Control ID | Requirement | Status | Action |
|-----------|-------------|--------|--------|
| AC.L2-3.1.1 | Authorized Access | **NOT MET** | Add API key auth to mutating endpoints |
| AC.L2-3.1.2 | Transaction Control | **NOT MET** | Per-request authz on mutations |
| AC.L2-3.1.5 | Least Privilege | **PARTIAL** | Add API key tiers (read-only vs read-write) |
| IA.L2-3.5.3 | MFA | N/A | API keys only; MFA handled by InsForge for auth |
| SC.L2-3.13.1 | Boundary Protection | **MET** | Helmet, CORS, CSP configured |
| SC.L2-3.13.11 | FIPS Transit Encryption | **MET** | TLS 1.3 via Railway/InsForge |
| AU.L2-3.3.1 | Audit Logging | **NOT MET** | No request audit trail exists |

### NIST Actions

- **AC.L2-3.1.1/2:** Implement API key auth middleware
- **AU.L2-3.3.1:** Add structured request logging (who, what, when, where, outcome)

---

## PASS 3 — ZERO TRUST ASSESSMENT

| ZTA Tenet | Status | Gap |
|-----------|--------|-----|
| 1. All resources are resources | MET | API endpoints are defined |
| 2. All communication secured | MET | TLS via Railway |
| 3. Per-session access | **NOT MET** | No session/token system |
| 4. Dynamic policy | **NOT MET** | No ABAC/RBAC |
| 5. Monitor integrity | **NOT MET** | No intrusion detection |
| 6. Auth before access | **NOT MET** | No auth on mutations |
| 7. Collect telemetry | **PARTIAL** | GTM analytics only, no security telemetry |

### ZTA Actions

- Implement API key-based auth with tier-based access control
- Add request logging middleware for security telemetry

---

## PASS 4 — SUPPLY CHAIN & SBOM

| Check | Status | Action |
|-------|--------|--------|
| `npm audit` | NOT RUN | Run on both projects |
| Dependency pinning | PARTIAL | `package-lock.json` exists; `^` ranges in package.json |
| Dead dependencies | FOUND | Remove `@tanstack/react-query` from frontend |
| SBOM generation | NOT IMPLEMENTED | Add CycloneDX generation to build |
| `.env.example` secrets | **CRITICAL** | Rotate leaked key |

### Supply Chain Actions

- Run `npm audit` on both projects and report findings
- Remove unused `@tanstack/react-query` dependency
- Remove dead env vars (`INSFORGE_API_KEY`, `INSFORGE_BASE_URL`, `REDIS_TOKEN`)
- Add `.security/` directory structure for future SBOM pipeline

---

## PASS 5 — OWASP ASVS L2 SPOT CHECK

| ASVS Chapter | Check | Status |
|-------------|-------|--------|
| Ch 2: Auth | Credential storage | N/A (OAuth-only) |
| Ch 3: Sessions | Token entropy | N/A (InsForge SDK manages) |
| Ch 4: Access Control | Per-request checks | **FAIL** — mutations unprotected |
| Ch 5: Validation | Input allowlisting | **FAIL** — mass assignment, unbounded queries |
| Ch 6: Crypto | Algorithm strength | PASS — TLS 1.3, no weak algorithms |
| Ch 7: Error Handling | Generic user errors | **PARTIAL** — dev mode leaks |
| Ch 9: API Security | Rate limiting | **PARTIAL** — fail-open, no per-endpoint limits |
| Ch 10: Config | HTTP headers | **PASS** — comprehensive headers configured |

---

## PASS 6 — INFRASTRUCTURE SECURITY

| Check | Status | Notes |
|-------|--------|-------|
| Express helmet | PASS | Applied in `index.ts:29` |
| CORS strict origin | PASS | Configurable via env, defaults to frontend URL |
| Body size limit | **WARN** | 10MB is excessive; reduce to 1MB |
| Trust proxy | PASS | Set to `1` in production |
| `poweredByHeader` | PASS | Disabled in Next.js |
| Redis TLS | PASS | `rediss://` protocol in URL |
| Redis `KEYS` command | **WARN** | Replace with `SCAN` |

---

## PASS 7 — NIST CSF 2.0 PROFILE GAP ANALYSIS

| Function | Current State | Target State | Gap |
|----------|--------------|--------------|-----|
| GOVERN | No security policies | Risk register, security policies | Full gap |
| IDENTIFY | No asset inventory | Complete inventory | Full gap |
| PROTECT | CSP, headers, TLS | + Auth, input validation, rate limits | Partial gap |
| DETECT | No monitoring | IDS, WAF, SIEM | Full gap |
| RESPOND | No IRP | Documented IRP with playbooks | Full gap |
| RECOVER | No DR/BCP | Tested DR with RTO/RPO | Full gap |

**CSF Assessment:** The application is at Tier 1 (Partial) — ad-hoc security measures exist but no formal program.

---

## PASS 8 — SECURITY PIPELINE AUDIT

| Component | Status | Action |
|-----------|--------|--------|
| `.github/workflows/security-scan.yml` | NOT PRESENT | Create CI security pipeline |
| `.security/` directory | NOT PRESENT | Create structure |
| `npm audit` in CI | NOT PRESENT | Add to pipeline |
| Secret scanning | NOT PRESENT | Add gitleaks/trufflehog |
| SAST | NOT PRESENT | Add ESLint security plugin |
| SBOM generation | NOT PRESENT | Add syft/cyclonedx |

---

## PASS 9 — DEEPSEC AI DEEP REVIEW (DEFERRED)

Phase 9 requires self-hosted runner with Ollama. Deferred until:
1. CRITICAL/HIGH findings from Passes 1-8 are remediated
2. Self-hosted runner is provisioned
3. INFO.md is populated with project context

---

## IMPLEMENTATION PLAN — TRACER-BULLET VERTICAL SLICES

### Slice 1: CRITICAL — API Key Rotation + Cleanup (AFK)

**Files:** `api/.env.example`, `api/src/config/env.ts`

- Remove real API key from `.env.example`
- Remove dead env vars (`INSFORGE_API_KEY`, `INSFORGE_BASE_URL`, `REDIS_TOKEN`)
- Add `API_KEY_SALT` env var for key hashing
- **Verify:** `.env.example` contains no real secrets

### Slice 2: CRITICAL — API Authentication Middleware (AFK)

**Files:** `api/src/middleware/auth.ts` (NEW), `api/src/routes/apiRoutes.ts`

- Create API key validation middleware
- Validate `X-API-Key` header against hashed keys (bcrypt/argon2)
- Apply to POST/PUT/DELETE routes only (reads remain public)
- Return 401 with `WWW-Authenticate` header on failure
- **Verify:** `curl -X POST /api/v1/keywords` returns 401 without key

### Slice 3: HIGH — Fix Mass Assignment + Input Validation (AFK)

**Files:** `api/src/controllers/keywordController.ts`, `api/src/controllers/trendController.ts`

- Replace `req.body` passthrough with allowlist validation
- Add Zod schemas for all trend query params
- Cap `days` to 365, validate `geo` format, validate enum values
- **Verify:** `PUT /keywords/test` with extra fields rejects disallowed fields

### Slice 4: MEDIUM — Fix Request Body Size + Error Handler (AFK)

**Files:** `api/src/index.ts`, `api/src/middleware/errorHandler.ts`

- Reduce JSON body limit from 10MB to 1MB
- Import `config` instead of `process.env` in error handler
- Never expose `err.message` in responses
- **Verify:** Large body request returns 413

### Slice 5: MEDIUM — Fix Redis KECS Command (AFK)

**File:** `api/src/services/cacheService.ts`

- Replace `keys(pattern)` with `SCAN`-based iteration
- **Verify:** Cache invalidation still works

### Slice 6: MEDIUM — Fix CSP + JsonLd Sanitization (AFK)

**Files:** `frontend/next.config.js`, `frontend/src/components/JsonLd.tsx`

- Add `JSON.stringify(data).replace(/</g, '\\u003c')` to JsonLd
- Add `'strict-dynamic'` to CSP `script-src` with nonce fallback
- **Verify:** `npm run build` passes, CSP header updated

### Slice 7: MEDIUM — Add Request Timeouts (AFK)

**Files:** `api/src/services/serperService.ts`, `api/src/services/googleTrendsService.ts`

- Add 10-second timeout to all external HTTP calls
- Add retry with exponential backoff for 5xx errors
- **Verify:** External API calls timeout gracefully

### Slice 8: LOW — Dependency Cleanup (AFK)

**Files:** `frontend/package.json`

- Remove `@tanstack/react-query` (unused)
- Run `npm audit` on both projects
- **Verify:** `npm audit` shows no critical/high vulnerabilities

### Slice 9: MEDIUM — Structured Request Logging (AFK)

**File:** `api/src/middleware/requestLogger.ts` (NEW)

- Log: method, path, status, duration, IP, user-agent
- Structured JSON format for SIEM ingestion
- Redact sensitive fields (API keys in headers)
- **Verify:** Request logs appear in structured format

### Slice 10: MEDIUM — OAuth Error Sanitization (AFK)

**Files:** `frontend/src/components/AuthCallbackClient.tsx`, `frontend/src/components/SignInPanel.tsx`

- Map OAuth error codes to safe human-readable messages
- Never render raw `redirectError` from URL params
- **Verify:** `/auth/callback?insforge_error=<script>alert(1)</script>` renders safely

---

## VERIFICATION COMMANDS

```bash
# Frontend
cd leanforge-frontend
npm run type-check
npm run build
npm audit

# API
cd keyword-trend-api
npm run type-check
npm run build
npm audit
```

---

## CONSTRAINTS

- **No external dependencies** unless strictly necessary (prefer built-in Express/Zod)
- **Preserve existing public API behavior** — GET endpoints remain unauthenticated
- **Backward compatible** — existing frontend API calls must continue working without API keys
- **Incremental deployment** — each slice is independently deployable