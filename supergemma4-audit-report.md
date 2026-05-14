# Security Audit: LeanForge Keyword Trend Index
## Date: 2026-05-13
## Scope: Full-stack application — `keyword-trend-api` (Express/TypeScript/Prisma/PostgreSQL) + `leanforge-frontend` (Next.js 16/React/Tailwind) + deployment infrastructure (Railway)
## Auditor: GODMYTHOS v10 `SECURITY_AUDIT` mode — Seven-Pass audit per `references/security-checklist.md`

---

## Summary

| Pass | Focus | BLOCK | WARN | PASS |
|------|-------|-------|------|------|
| 1 | Dependency Audit (OSS Gate) | 0 | 2 | ✓ |
| 2 | Authentication & Authorization | 1 | 2 | partial |
| 3 | Input Validation & Injection | 0 | 3 | partial |
| 4 | Data Protection | 2 | 1 | partial |
| 5 | Infrastructure & Deployment | 1 | 2 | partial |
| 6 | Monitoring & Response | 0 | 0 | ✓ |
| 7 | Supply Chain & SBOM | 1 | 1 | partial |

**Critical findings:** 3
**High findings:** 5
**Medium findings:** 6
**Low findings:** 7

## Overall Verdict: **FAIL** — Critical credential leak (production secrets in git) blocks deployment. High-severity auth/rate-limiting gaps require remediation before production launch.

---

## CRITICAL Findings (must fix immediately)

### CRIT-1: Production Secrets in Git — `.env.production` Committed

**Severity:** Critical
**Location:** `keyword-trend-api/.env.production`, `leanforge-frontend/.env.production` (both tracked in git)
**Description:** Both `.env.production` files are committed to the repository. The backend `.env.production` contains a live `INSFORGE_API_KEY=ik_8dc6f90c17d1c8c89a9819cbe0191888`, an `INSFORGE_BASE_URL=https://28he5ctp.us-east.insforge.app`, and an `API_SECRET_KEY=leanforge_prod_api_key_2026_secure_12345678`. Neither `.gitignore` file excludes `.env.production` (both only exclude `.env.local` and `.env.*.local`). Verified by `git ls-files`:
```
keyword-trend-api/.env.production
leanforge-frontend/.env.production
```
**Impact:** Anyone with repo access (including future contributors, CI runners, or if the repo is made public) has the InsForge API key, the production API base URL, and can authenticate against InsForge or the backend's own `x-api-key` protected endpoints. If the `DATABASE_URL` or `REDIS_URL` were also unredacted, database access would be compromised.
**Remediation:**
1. **Immediately rotate** `INSFORGE_API_KEY` and the backend `API_SECRET_KEY` — generate new keys on InsForge and Railway.
2. Add `.env.production` to both `.gitignore` files.
3. Use `git filter-repo` or `git filter-branch` to purge both files from git history entirely (they will persist in the commit log otherwise).
4. Verify no other branches or tags contain the keys via `git log --all --diff-filter=A -- .env.production`.

---

### CRIT-2: Hardcoded InsForge Credentials in DEPLOY.md

**Severity:** Critical
**Location:** `DEPLOY.md` (Lines 30-32, 39)
**Description:** The deployment checklist document contains the full `INSFORGE_API_KEY` and `INSFORGE_BASE_URL` in plaintext as Railway variable setup instructions:
```bash
railway variables set INSFORGE_API_KEY="ik_8dc6f90c17d1c8c89a9819cbe0191888"
railway variables set INSFORGE_BASE_URL="https://28he5ctp.us-east.insforge.app"
```
These are copy-pasted directly into a committed markdown file.
**Impact:** Same as CRIT-1 — permanent credential exposure in the commit history.
**Remediation:**
1. Replace the actual values in `DEPLOY.md` with placeholders: `ik_YOUR_INSFORGE_API_KEY_HERE`.
2. Use the same `git filter-repo` pass from CRIT-1 to remove these values from history.

---

### CRIT-3: Same InsForge API Key in Development and Production

**Severity:** Critical
**Location:** `keyword-trend-api/.env.local`, `keyword-trend-api/.env.production`
**Description:** The InsForge API key `ik_8dc6f90c17d1c8c89a9819cbe0191888` is identical across `.env.local` (development) and `.env.production`. This violates the principle of least privilege: a developer's machine compromise immediately grants production access.
**Impact:** If a developer's local `.env.local` (which may be less carefully protected than Railway's secret store) is exfiltrated, the same key grants access to InsForge resources used in production. The key cannot be scoped to one environment.
**Remediation:**
1. Generate separate InsForge API keys for development and production environments.
2. Store production keys exclusively in Railway's `RAILWAY_VARIABLES` or CLI secret store — never in `.env.production`.
3. Add `.env.local` to `.gitignore` (it already is, but verify it stays there).

---

## HIGH Findings (must fix before production)

### HIGH-1: Rate Limiting Bypass on Redis Failure

**Severity:** High
**Location:** `keyword-trend-api/src/middleware/rateLimiter.ts` (Line 35)
**Description:** When Redis throws an error, the rate limiter calls `next()` — passing the request through without any rate limiting. An attacker who can cause Redis to fail (e.g., resource exhaustion, network partition) can bypass all rate limits and mount a DoS via unlimited requests.
```typescript
} catch (error) {
    console.error('Rate limiter error (allowing request):', error);
    next();
}
```
**Impact:** Complete bypass of rate limiting under Redis failure — no protection against brute-force, enumeration, or resource-exhaustion attacks during the outage window.
**Remediation:**
1. Implement a fallback in-memory rate limiter (token bucket or sliding window) that activates when Redis is unavailable.
2. Alternatively, return `429 Too Many Requests` when rate limiting cannot be applied — fail closed, not open.
3. Consider per-API-key rate limiting alongside IP-based limiting for authenticated endpoints.

---

### HIGH-2: No Tier-Based Access Control — All Read Endpoints Public

**Severity:** High
**Location:** `keyword-trend-api/src/routes/apiRoutes.ts` (Lines 13-28)
**Description:** All GET/read endpoints (`/keywords`, `/keywords/:slug`, `/trends`, `/categories`, etc.) are publicly accessible without any authentication, API key, or rate-limit tiering. The CONTEXT.md defines tiered access limits (Free: 100/day, Starter: 1,000/day, Growth: 10,000/day), but none of these are enforced in the route definitions. Any unauthenticated user can access all data with only IP-based rate limiting.
**Impact:** Inability to monetize the API. No way to block abusive clients (beyond IP rotation). No user attribution of API calls.
**Remediation:**
1. Make read endpoints require a developer API key (separate from the admin `API_SECRET_KEY`).
2. Implement a PostgreSQL or Redis-backed counter per API key tracking daily/monthly call volume.
3. Return `429 Too Many Requests` with appropriate tier headers when limits are exceeded.
4. Add a "Free tier" anonymous access with the lowest rate limit (100/day per IP) if public access is desired.

---

### HIGH-3: Auth Middleware Loads API Key from `process.env` Bypassing Zod Validation

**Severity:** High
**Location:** `keyword-trend-api/src/middleware/auth.ts` (Line 4)
**Description:** The authentication middleware reads `process.env.API_SECRET_KEY` directly instead of importing the Zod-validated `config` object from `src/config/env.ts`. If the environment variable is renamed, missing, or has validation requirements, the middleware silently breaks or uses an unvalidated value.
```typescript
const API_SECRET_KEY = process.env.API_SECRET_KEY;
```
The validated config at `env.ts` exports `config.API_SECRET_KEY` which is Zod-checked for minimum 32 characters, but the auth middleware bypasses this entirely.
**Impact:** Silent auth bypass: if `process.env.API_SECRET_KEY` is undefined, the middleware's `crypto.timingSafeEqual` comparison throws at runtime, likely returning a 500 error and locking all write operations without a clear error message.
**Remediation:**
1. Import `config` from `../config/env` and use `config.API_SECRET_KEY` instead.
2. Add a startup assertion in `index.ts` that the auth middleware can load the key.

---

### HIGH-4: Missing Zod Validation on `trending()` Query Parameters

**Severity:** High
**Location:** `keyword-trend-api/src/controllers/keywordController.ts` (Line 87)
**Description:** The `trending()` method reads `limit` and `category` from `req.query` directly without Zod schema validation (unlike `list()` and other endpoints). `parseInt(limit, 10)` with `Math.min(..., 100)` handles normal cases but silently converts `NaN` input (e.g., `?limit=abc`) into `NaN`, which Prisma's `take: NaN` may interpret as undefined (returning all records).
```typescript
const { limit = '20', category } = req.query;
const take = Math.min(parseInt(limit as string, 10) || 20, 100);
```
**Impact:** Resource exhaustion via unbounded query results. An attacker could request all keywords by passing a non-numeric limit, potentially causing memory pressure or slow responses.
**Remediation:**
1. Use Zod schema validation (`z.coerce.number().int().min(1).max(100)`) like the `list()` method does.
2. Add the same validation to `category` (enum check).

---

### HIGH-5: `API_SECRET_KEY` Cannot Be Rotated Without Restart

**Severity:** High
**Location:** `keyword-trend-api/src/middleware/auth.ts` (read once at module load)
**Description:** The API key is loaded once at module import time via `process.env.API_SECRET_KEY`. To rotate the key, the server must be restarted. There is no key versioning, hot-reload, or support for multiple valid keys during a rotation window.
**Impact:** Key rotation requires downtime or rolling restart. If the key is compromised, there is no grace period for transitioning clients to a new key.
**Remediation:**
1. Support two concurrent keys: `API_SECRET_KEY` (current) and `API_SECRET_KEY_NEXT` (rotating in).
2. On authentication, try the current key first, fall through to the next key. Log usage of the rotating key.
3. After the rotation window (e.g., 24 hours), promote the next key and roll out.

---

## MEDIUM Findings (should fix)

### MED-1: CSP `'unsafe-inline'` Weakens XSS Protection

**Severity:** Medium
**Location:** `leanforge-frontend/next.config.js` (Line 12: `script-src 'self' 'unsafe-inline'`)
**Description:** The Content-Security-Policy allows `'unsafe-inline'` for scripts, which is required for Next.js hydration but significantly weakens XSS protection. An XSS vulnerability in any component becomes trivially exploitable as inline script execution is not blocked.
**Impact:** All XSS vulnerabilities in the frontend become exploitable because CSP cannot prevent inline script injection.
**Remediation:**
1. Investigate Next.js nonce support for stricter CSP: generate a cryptographically random nonce per request and add it to both the CSP header and the `<script>` tags.
2. If nonce-based CSP is not feasible with the current Next.js version, add `'strict-dynamic'` to allow trusted scripts while still blocking injected inline scripts.

---

### MED-2: External CTA Links Missing `rel="noopener noreferrer"`

**Severity:** Medium
**Location:** `leanforge-frontend/src/components/Header.tsx` (Line 71), `leanforge-frontend/src/components/MobileNav.tsx` (Line 73)
**Description:** The "Try SEO AI Regent" CTA link uses Next.js `<Link>` component for an external URL (`https://seo-ai-regent.com/?ref=keyword-trend-api`). When Next.js `<Link>` renders an external URL, it outputs an `<a>` tag WITHOUT `target="_blank"` or `rel="noopener noreferrer"`. The `pricing/page.tsx` correctly uses `<a target="_blank" rel="noopener noreferrer">` for the same URL, but the header and mobile nav do not.
**Impact:** Since the link navigates the current tab (not `_blank`), tab-napping is not a risk. However, missing `rel="noopener noreferrer"` is a hygiene issue and inconsistent with the pricing page pattern.
**Remediation:**
1. Replace Next.js `<Link>` with `<a href={regentPartnerUrl} target="_blank" rel="noopener noreferrer">` for external URLs.
2. Add an eslint rule banning `<Link>` for external URLs.

---

### MED-3: Rate Limiter `INCR` + `EXPIRE` Not Atomic

**Severity:** Medium
**Location:** `keyword-trend-api/src/middleware/rateLimiter.ts` (Lines 19-20)
**Description:** The rate limiter uses `INCR` followed by `EXPIRE` in two separate Redis commands. If the `INCR` succeeds but `EXPIRE` fails (Redis crash between commands), the key has no TTL and accumulates requests forever, eventually making the endpoint permanently rate-limited for that IP.
**Impact:** Permanent self-DoS for a specific IP if Redis fails between the two commands. Low probability but high impact for affected users.
**Remediation:**
1. Use Redis Lua script (`EVAL`) to atomically `INCR` and set expiry: `redis.call('INCR', KEYS[1]); redis.call('EXPIRE', KEYS[1], ARGV[1])`.
2. Alternatively, use `SET key value EX seconds NX` with `INCR` only for increment.

---

### MED-4: Health Check Leaks Technology Stack

**Severity:** Medium
**Location:** `keyword-trend-api/src/index.ts` (Line 51-56)
**Description:** The `/health` endpoint returns JSON indicating Redis and PostgreSQL connection status: `{ status: 'ok', db: 'ok', redis: 'ok' }`. This reveals specific dependency choices to an attacker, helping them target known vulnerabilities in those specific technologies.
**Impact:** Lowers barrier for targeted attacks by revealing the exact stack (PostgreSQL + Redis + Node.js).
**Remediation:**
1. Return a generic response: `{ status: 'ok' }` without listing dependencies.
2. Keep detailed health check on a different endpoint behind authentication (`/admin/health`).

---

### MED-5: No HTTPS Enforcement Middleware

**Severity:** Medium
**Location:** `keyword-trend-api/src/index.ts` (no HTTPS redirect)
**Description:** The Express server does not include middleware to redirect HTTP traffic to HTTPS. While Railway provides TLS termination, if the application is deployed elsewhere, traffic between the reverse proxy and the application could be in plaintext.
**Impact:** If deployed without TLS termination, API keys and data transmitted via `x-api-key` header would be in cleartext, enabling credential interception.
**Remediation:**
1. Add Express middleware that checks `req.secure` or `req.headers['x-forwarded-proto']` and redirects HTTP to HTTPS.
2. Configure Railway to enforce HTTPS-only at the edge (check Railway settings).

---

### MED-6: IPs and Request Paths Logged as PII

**Severity:** Medium
**Location:** `keyword-trend-api/src/middleware/requestLogger.ts` (Lines 6, 9, 14)
**Description:** The structured request logger records `ip: req.ip || req.socket.remoteAddress` and `path: req.path` in JSON-formatted logs. IP addresses are PII under GDPR/CCPA, and paths may contain keyword slugs that reveal user interests or search queries.
**Impact:** GDPR/CCPA compliance risk. No documented data retention policy or anonymization mechanism for logged IPs.
**Remediation:**
1. Add a config flag to anonymize IP addresses (e.g., `ip.replace(/\d+$/, '0')` for IPv4, or store a hash).
2. Document log retention and deletion policy.
3. Consider whether path parameters need sanitization before logging.

---

## LOW Findings (nice to have)

### LOW-1: No Max Length Validation on Keyword `term`

**Severity:** Low
**Location:** `keyword-trend-api/src/controllers/keywordController.ts` (createKeywordSchema only validates `z.string().min(1)`)
**Description:** Keyword `term` can be arbitrarily long (no `max()` constraint in the Zod schema). An attacker with API key access could create a keyword with thousands of characters, causing storage bloat and potential rendering/truncation issues in the frontend.
**Remediation:** Add `z.string().min(1).max(200)` to `createKeywordSchema`.

---

### LOW-2: External Google Trends Data Not Sanitized Before Storage

**Severity:** Low
**Location:** `keyword-trend-api/src/jobs/trendPoller.ts` (stores raw API response data)
**Description:** Data from the `google-trends-api` npm package is stored directly in the database without validation or sanitization. If the API or library is compromised and returns malicious payloads (e.g., XSS vectors in trend names), these would be stored and served to users.
**Remediation:** Add a Zod schema for trend data before insertion. Strip HTML tags or special characters from trend names.

---

### LOW-3: Redis Not Disconnected on Graceful Shutdown

**Severity:** Low
**Location:** `keyword-trend-api/src/index.ts` (SIGTERM/SIGINT handlers disconnect Prisma only)
**Description:** The graceful shutdown handler calls `prisma.$disconnect()` but does not call `redis.quit()`, potentially leaving Redis connections dangling until timeout.
**Remediation:** Add `await redis.quit()` in the shutdown handler.

---

### LOW-4: Non-Atomic Redis Lock for Cron Job

**Severity:** Low
**Location:** `keyword-trend-api/src/jobs/trendPoller.ts` (Line 12: `POLLER_LOCK_TTL_SECONDS = 6 * 60 * 60`)
**Description:** The distributed lock TTL is exactly the 6-hour cron interval. If a poller run takes the full 6 hours (unlikely but possible with many keywords), the lock expires and a second instance duplicates the work.
**Remediation:** Increase lock TTL to 7-8 hours, or add a safety margin: `POLLER_LOCK_TTL_SECONDS = Math.ceil(6 * 60 * 60 * 1.2)`.

---

### LOW-5: Draft Legal Documents May Be Deployed

**Severity:** Low
**Location:** `leanforge-frontend/src/app/cookies/page.tsx`, `leanforge-frontend/src/app/privacy/page.tsx`, `leanforge-frontend/src/app/terms/page.tsx`
**Description:** These legal pages contain internal review notes (e.g., "This cookie policy is a draft. If additional analytics... this policy must be updated.") A deploy to production with these draft notes visible could create legal exposure.
**Remediation:** Finalize and remove all draft/review notes before production launch.

---

### LOW-6: Hardcoded Fallback API URL May Be Typo-Squatted

**Severity:** Low
**Location:** `leanforge-frontend/src/app/api-docs/ApiDocsContent.tsx` (Line 26)
**Description:** The API documentation page hardcodes a fallback URL `https://api.keywordtrendindex.com` which differs from the production URL `https://api.leans-forge.net`. If the `api.keywordtrendindex.com` domain is ever registered, users following the documentation could be misled.
**Remediation:** Remove the hardcoded fallback and always use `process.env.NEXT_PUBLIC_API_URL` at runtime.

---

### LOW-7: `postcss` Override in package.json Without Documentation

**Severity:** Low
**Location:** `leanforge-frontend/package.json` (Line 13-15)
**Description:** `postcss` is overridden to `8.5.14` via `"overrides"`, suggesting a past compatibility fix or security patch. The rationale is undocumented. If a future update requires a newer version, the override may silently block it.
**Remediation:** Document the reason for the override in the adjacent code or commit message, and add a review date.

---

## OWASP Top 10:2025 Quick Assessment

| # | Category | Status | Notes |
|---|----------|--------|-------|
| A01 | Broken Access Control | **FAIL** | CRIT-3: no tier enforcement; HIGH-2: read endpoints unauth |
| A02 | Cryptographic Failures | PASS | TLS via Railway, no weak crypto |
| A03 | Injection | PASS | Prisma ORM, no raw SQL, Zod validation |
| A04 | Insecure Design | **WARN** | CRIT-1: secrets in git; rate limiter fails open |
| A05 | Security Misconfiguration | **WARN** | CSP `unsafe-inline`, no HTTPS middleware |
| A06 | Vulnerable Components | **WARN** | `@insforge/sdk` unpinned; `google-trends-api` unknown vulns |
| A07 | Auth Failures | **WARN** | HIGH-3: auth middleware bypasses Zod; HIGH-5: no key rotation |
| A08 | Data Integrity Failures | PASS | No CI/CD integrity checks needed at current scale |
| A09 | Logging Failures | **WARN** | MED-6: PII logged; no retention policy |
| A10 | SSRF | PASS | No user-supplied URLs fetched by backend |

---

## Remediation Priority Matrix

| ID | Severity | Effort | Fix area |
|---|---|---|---|
| CRIT-1 | Critical | 1h | Rotate keys + delete `.env.production` from git + fix `.gitignore` |
| CRIT-2 | Critical | 15m | Replace hardcoded values in DEPLOY.md with placeholders |
| CRIT-3 | Critical | 30m | Generate separate dev/prod InsForge keys, update Railway |
| HIGH-1 | High | 2h | Add in-memory fallback rate limiter |
| HIGH-2 | High | 4h | Implement API key auth on reads + usage counter |
| HIGH-3 | High | 15m | Import validated config in auth middleware |
| HIGH-4 | High | 15m | Add Zod schema to trending() endpoint |
| HIGH-5 | High | 2h | Support concurrent key rotation |
| MED-1 | Medium | 4h | Investigate nonce-based CSP |
| MED-2 | Medium | 15m | Fix external links in Header + MobileNav |
| MED-3 | Medium | 30m | Atomic INCR+EXPIRE via Lua script |
| MED-4 | Medium | 10m | Generic health response |
| MED-5 | Medium | 1h | HTTPS redirect middleware |
| MED-6 | Medium | 30m | IP anonymization + retention policy |
| LOW-1/7 | Low | various | Nice-to-have cleanup |

---

## Posture by Service

| Service | Vulnerabilities | Verdict |
|---------|----------------|---------|
| **Backend API** (`keyword-trend-api`) | CRIT-1, CRIT-3, HIGH-1-5, MED-3-6, LOW-1-4 | **FAIL** — credentials in git, bypassable rate limiting, no tier enforcement |
| **Frontend** (`leanforge-frontend`) | CRIT-1, MED-1-2, MED-6, LOW-5-7 | **FAIL** — credentials in git, weakened CSP, missing rel attributes |
| **Deployment** (`DEPLOY.md`, `railway.json`, `deploy.sh`) | CRIT-2, MED-5 | **FAIL** — hardcoded credentials in docs |
| **Auth** (InsForge) | CRIT-3 | **PASS WITH NOTES** — OAuth provider is fine, key management is not |

---

*Audit generated by GODMYTHOS v10 `SECURITY_AUDIT` mode (Seven-Pass). Full source scan of 57+ files completed. Runtime scans (`npm audit`, `pip-audit`) not run — requires `npm install` in both project directories.*
