---
type: learning
tags: [security, audit, owasp, nist, api-auth, input-validation, csp]
confidence: high
created: 2025-05-10
source: security-audit-implementation
---

# Security Audit Implementation — Compound

## What Changed

### API Backend (keyword-trend-api)

| File | Change | OWASP |
|------|--------|-------|
| `.env.example` | Removed real API key `ik_sehrni5g1w9ptlg52cx3sx32nlrvsgmz`, removed dead `REDIS_TOKEN`, commented out unused InsForge vars | A03 |
| `src/config/env.ts` | Removed dead `INSFORGE_API_KEY`/`INSFORGE_BASE_URL` from schema; added `API_SECRET_KEY` with 32-char minimum | A03 |
| `src/middleware/auth.ts` (NEW) | API key auth middleware using `X-API-Key` header, SHA-256 hash comparison with `timingSafeEqual` | A01 |
| `src/routes/apiRoutes.ts` | Applied `requireApiKey` to POST/PUT/DELETE routes; GET routes remain public | A01 |
| `src/controllers/keywordController.ts` | Fixed mass assignment — `req.body` replaced with Zod `updateKeywordSchema.strict()` allowlist | A01 |
| `src/controllers/trendController.ts` | Added Zod schemas for all query params: `trendsQuerySchema`, `dailyTrendsSchema`, `realtimeTrendsSchema`, `timelineSchema`; capped `days` to 365, validated `direction` enum, validated `geo` length | A01, A10 |
| `src/middleware/errorHandler.ts` | Uses validated `config` instead of `process.env`; never exposes `err.message` in responses | A09 |
| `src/index.ts` | Reduced JSON body limit from 10MB to 1MB; added `requestLogger` middleware | A02 |
| `src/services/cacheService.ts` | Replaced Redis `KEYS` with `SCAN`-based iteration | A02 |
| `src/services/serperService.ts` | Added 10-second timeout to axios calls | A10 |
| `src/services/googleTrendsService.ts` | Added 15-second timeout via `Promise.race` wrapper on all Google Trends API calls | A10 |
| `src/middleware/requestLogger.ts` (NEW) | Structured JSON request logging: method, path, status, duration, IP, user-agent | A09 |

### Frontend (leanforge-frontend)

| File | Change | OWASP |
|------|--------|-------|
| `src/components/JsonLd.tsx` | Escaped `</script>` in JSON-LD output via `.replace(/</g, '\\u003c')` | A05 |
| `src/components/AuthCallbackClient.tsx` | Replaced raw `redirectError` URL param with safe generic message | A07 |
| `src/components/SignInPanel.tsx` | Same — safe error message mapping | A07 |

## Remaining Items (Deferred)

| Item | Reason Deferred |
|------|----------------|
| CSP nonce-based `script-src` | Requires custom Next.js server or middleware; `'unsafe-inline'` needed for GTM + hydration |
| Database-backed API key system | No user model exists; env var approach is sufficient for current scale |
| Structured audit logging to SIEM | No SIEM infrastructure deployed yet |
| deepsec Phase 9 AI review | Requires self-hosted runner with Ollama; defer until critical fixes deployed |
| SBOM generation pipeline | No CI/CD pipeline exists yet; add when GitHub Actions is configured |
| Security.txt (CISA pledge) | Add `/.well-known/security.txt` when disclosure policy is formalized |

## Verification

- `tsc --noEmit` — passes on both projects
- `npm run build` — passes on frontend
- `npm audit` — 0 vulnerabilities on both projects
- Auth middleware returns 401/403 correctly without API key
- Mass assignment blocked: extra fields rejected by `.strict()`
- Timeline capped at 365 days max
- Body limit 1MB (was 10MB)

## Key Learnings

1. **Mass assignment is the silent killer** — `req.body` passed directly to Prisma `update()` allows setting `id`, `trendScore`, `velocity`, `direction`, `isActive` etc. Always use `.strict()` Zod schemas.
2. **Fail-open rate limiting is worse than no rate limiting** — gives false confidence. The SCAN fix prevents the `KEYS` command from blocking Redis.
3. **OAuth error params are attacker-controlled** — the `insforge_error` query param in the redirect URL can contain anything. Never render raw URL params in DOM, even as React text children (defense in depth).
4. **External API timeouts are mandatory** — without them, a slow Google Trends response hangs the Express request indefinitely, enabling slowloris-style DoS.
5. **`NEXT_PUBLIC_*` env vars are by-design public** — the InsForge anon key pattern is intentional (like Supabase anon keys). The real risk is whether the backend enforces RLS.