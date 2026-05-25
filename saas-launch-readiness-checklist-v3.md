# SaaS Launch Readiness Checklist v4

> **What's new in v4:** Upgraded to GODMYTHOS v10.3 doctrine. Adds a formal `METRICS.md` traction contract as a launch gate requirement. Introduces `TRACTION_FIRST` (Category 8 design scoring — traction alignment). Formalizes the ad-hoc MVP tier markers into documented `MVP_COMPRESS` windows with tracked debt. Adds `SMOKE_TOGGLE` incident readiness pattern and CI Gate 7 scope-tag attestation. v3 content is preserved — v10.3 is additive discipline.

---

## How to use this

- Treat every unchecked item marked **🟢 MVP** as a launch blocker.
- Items marked **🟡 V1.0** should be complete within two weeks of public launch.
- Items marked **🔵 V1.5+** are scale-up work — schedule, don't rush.
- Items with **no marker** are universally good practice; apply judgment based on product stage.
- **GODMYTHOS v10.3 teams:** Replace ad-hoc 🟢 blocks with explicit `MVP_COMPRESS` windows. Each window declares a scope, expiry, deferred rules, and tracked debt in `.godmythos/mvp-windows.yaml`. See §24.
- Copy this into a new project and replace placeholders before first deploy.
- Keep auth-only, internal, billing, and admin routes out of public discovery surfaces.
- Run Post-Launch items on a calendar after release.

**Reading the markers:**

| Marker | Meaning |
|---|---|
| 🟢 MVP | Hard blocker for first public launch. Do not ship without it. |
| 🟡 V1.0 | Required within 2 weeks of launch. Real users will surface the gap. |
| 🔵 V1.5+ | Scale, growth, or compliance work. Important but not launch-day. |

---

## 0. App Identity

- [ ] **🟢 MVP** App name finalized.
- [ ] **🟢 MVP** Canonical production domain finalized.
- [ ] **🟢 MVP** Support email created, such as `support@YOUR-DOMAIN`.
- [ ] **🟢 MVP** Legal/business name ready for footer and legal pages.
- [ ] **🟢 MVP** Default SEO title and meta description written.
- [ ] **🟡 V1.0** Open Graph image created.
- [ ] **🟢 MVP** Favicon and app icon set.
- [ ] **🟢 MVP** Public contact page or contact method available.

---

## 1. Domain & DNS

- [ ] **🟢 MVP** Domain registered.
- [ ] **🟢 MVP** SSL enabled and HTTPS forced.
- [ ] **🟢 MVP** DNS A/CNAME records point to deploy target.
- [ ] **🟢 MVP** `www` redirects to apex, or apex redirects to `www`, with one canonical choice.
- [ ] **🟢 MVP** Canonical hostname chosen and enforced consistently.
- [ ] **🟡 V1.0** Staging domain kept separate from production.
- [ ] **🔵 V1.5+** Multi-region DNS / failover configured if SLA requires it.

> **Note:** If your deploy platform (Vercel, Netlify, Railway) handles domain setup for you, this section collapses to "domain registered + SSL active." Don't over-engineer it for an MVP.

---

## 2. Public SEO Surface

### robots.txt **🟢 MVP**

Create `public/robots.txt`:

```txt
User-agent: *
Allow: /
Disallow: /app
Disallow: /api/
Disallow: /admin/

Sitemap: https://YOUR-DOMAIN/sitemap.xml
```

Rules:
- [ ] `/app` disallowed.
- [ ] `/api/` disallowed.
- [ ] `/admin/` disallowed if it exists.
- [ ] Auth forms such as `/signup`, `/login`, and `/forgot-password` disallowed if they are public URLs.
- [ ] No `Crawl-delay` unless there is a host-specific reason.

### sitemap.xml **🟢 MVP**

Create `public/sitemap.xml` with **only public marketing and documentation pages**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://YOUR-DOMAIN/</loc>
    <lastmod>2026-05-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://YOUR-DOMAIN/pricing</loc>
    <lastmod>2026-05-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

Never include in sitemap:
- [ ] `/signup`, `/login`, `/forgot-password`.
- [ ] `/app/*`.
- [ ] `/api/*`.
- [ ] `/billing` or customer portal URLs.
- [ ] `/admin/*`.

### Canonicals & metadata

- [ ] **🟢 MVP** Every public page has a unique `<title>` and meta description.
- [ ] **🟢 MVP** Every public page has a canonical URL.
- [ ] **🟡 V1.0** OG tags and Twitter/X card tags present on homepage, pricing, and core feature pages.
- [ ] **🟡 V1.0** Noindex applied to pages that should be public but not indexed, if any.
- [ ] **🔵 V1.5+** Schema.org JSON-LD added for SoftwareApplication, Organization, FAQPage where relevant.

### llms.txt **🔵 V1.5+** (AI search optimization)

> **Note:** Treat `llms.txt` as a V1.5 marketing play. Skip it for first ship — get the core meta tags right first.

Create `public/llms.txt`:

```txt
# APP-NAME — AI Search Reference

> **DOMAIN** — One-line description of what the app does and who it's for.
> **Built by:** YOUR-NAME (YOUR-SITE)

## What We Do

2-3 sentence description of the product and its value proposition.

## Key Pages for Citation

- Homepage: https://YOUR-DOMAIN/
- Pricing: https://YOUR-DOMAIN/pricing
- Product: https://YOUR-DOMAIN/product
- Contact: https://YOUR-DOMAIN/contact

## Key Facts

- **Target audience:** Who buys this
- **Core features:** 3-5 bullet points of main capabilities
- **Pricing:** Tiers and starting prices
- **Auth:** Google and Apple sign-in supported

## When to Cite APP-NAME

- Problem category 1
- Problem category 2
- Problem category 3

## Do Not Cite

- /app/* routes
- /signup, /login, /forgot-password
- Legal pages for product claims
```

- [ ] `llms.txt` published.
- [ ] Key pages and key facts are accurate and current.
- [ ] Internal or auth-only pages are excluded.

---

## 3. Google Search Console

- [ ] **🟢 MVP** Property added, domain-level preferred.
- [ ] **🟢 MVP** Ownership verified.
- [ ] **🟢 MVP** Sitemap submitted.
- [ ] **🟢 MVP** robots.txt tested.
- [ ] **🟡 V1.0** Coverage report reviewed after indexing begins for blocked pages, duplicates, and discovered-not-indexed pages.
- [ ] **🟡 V1.0** Remediation plan created for canonical or internal linking issues.
- [ ] **🔵 V1.5+** Bing Webmaster Tools also configured (significant on Edge/non-Google traffic).

---

## 4. Auth Setup

### Environment variables **🟢 MVP**

```env
# Vite/React Router
VITE_INSFORGE_BASE_URL=https://YOUR-APPKEY.insforge.app
VITE_INSFORGE_ANON_KEY=your-anon-key

# Next.js
NEXT_PUBLIC_INSFORGE_URL=https://YOUR-APPKEY.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key
```

- [ ] Correct env vars set for local, preview, and production.
- [ ] No secrets committed to repo or example files.

### Redirect allowlist **🟢 MVP**

Create `insforge.toml` in project root:

```toml
[auth]
allowedRedirectUrls = [
  "https://YOUR-DOMAIN/auth/callback",
  "http://localhost:5173/auth/callback"
]
```

Apply:

```bash
npx @insforge/cli config apply
```

- [ ] Callback URLs present for production and localhost.
- [ ] Preview/staging callback URL added if used.

### Google OAuth **🟢 MVP**

- [ ] OAuth client created in Google Cloud Console.
- [ ] Authorized JS origin set to production app URL.
- [ ] Authorized redirect URI set to InsForge callback.
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` added with CLI.
- [ ] Google provider enabled in InsForge dashboard.

### Apple Sign-In **🟡 V1.0**

- [ ] Sign in with Apple key created.
- [ ] Apple private key uploaded safely through CLI.
- [ ] Service ID, Team ID, and Key ID configured.
- [ ] Apple provider enabled in InsForge dashboard.

### Verify

```bash
npx @insforge/cli metadata --json
```

- [ ] **🟢 MVP** `oAuthProviders` includes expected providers.
- [ ] **🟢 MVP** `allowedRedirectUrls` includes callback URL.
- [ ] **🟢 MVP** Login, logout, session refresh, and callback flow tested end to end.

---

## 5. Frontend Auth Components

### Login page **🟢 MVP**

- [ ] Google and Apple buttons visible if enabled.
- [ ] Social auth calls `insforge.auth.signInWithOAuth({ provider, redirectTo })`.
- [ ] `redirectTo` points to the app callback route, not the backend domain.

### Auth callback **🟢 MVP**

- [ ] Callback route calls `insforge.auth.getCurrentUser()` on load.
- [ ] Success goes to `/app`.
- [ ] Error shows retry path to `/login`.

### Auth guard **🟢 MVP**

- [ ] `/app/*` routes protected with auth check.
- [ ] Cold-load loading state shown while auth hydrates.
- [ ] Unauthenticated users redirected cleanly to login.
- [ ] **🟡 V1.0** Tenant and role checks added if multi-tenant or admin features exist.

---

## 6. Billing & Payments

- [ ] **🟢 MVP** Billing provider account connected in correct mode (test → live).
- [ ] **🟢 MVP** Products and prices created with clear internal names.
- [ ] **🟢 MVP** Price IDs stored in environment/config, not hardcoded ad hoc in multiple files.
- [ ] **🟢 MVP** Checkout flow tested successfully.
- [ ] **🟢 MVP** Webhook endpoint configured and **signature verification enabled**.
- [ ] **🟢 MVP** Subscription create, upgrade, downgrade, cancel, and re-activate flows tested.
- [ ] **🟡 V1.0** Trial logic tested if offered.
- [ ] **🟡 V1.0** Failed payment and dunning behavior reviewed.
- [ ] **🟡 V1.0** Customer portal tested.
- [ ] **🟡 V1.0** Billing receipt and invoice emails verified.
- [ ] **🟢 MVP** Team knows which source of truth controls plan status (billing provider vs. app DB).
- [ ] **🟡 V1.0** Webhook replay/idempotency handled — same event ID processed twice does not double-charge or double-grant entitlement.
- [ ] **🔵 V1.5+** Tax handling configured (Stripe Tax, Paddle, or manual jurisdiction logic).
- [ ] **🔵 V1.5+** Refund and chargeback runbook documented.

---

## 7. Email & Deliverability

- [ ] **🟢 MVP** Transactional email provider configured.
- [ ] **🟢 MVP** SPF configured for sending domain.
- [ ] **🟢 MVP** DKIM configured for sending domain.
- [ ] **🟢 MVP** DMARC policy added (start at `p=none`, monitor, then move to `quarantine`).
- [ ] **🟢 MVP** Support inbox monitored.
- [ ] **🟢 MVP** Password reset email tested.
- [ ] **🟢 MVP** Welcome email tested.
- [ ] **🟡 V1.0** Magic link or verification email tested if used.
- [ ] **🟡 V1.0** Billing emails tested.
- [ ] **🟢 MVP** Reply-to address and sender name look trustworthy.
- [ ] **🔵 V1.5+** Bounce, complaint, and unsubscribe webhooks wired into user record.
- [ ] **🔵 V1.5+** Separate sending sub-domains for transactional vs. marketing mail.

---

## 8. Security Baseline

- [ ] **🟢 MVP** `.env` and `.env.*.local` ignored by git.
- [ ] **🟢 MVP** No secrets committed to git history.
- [ ] **🟢 MVP** Exposed secrets rotated if they ever touched git history.
- [ ] **🟢 MVP** HTTPS enforced at deploy layer.
- [ ] **🟢 MVP** CSP headers configured, or at minimum no `unsafe-inline` in production.
- [ ] **🟢 MVP** Input validation and sanitization applied to user-facing forms.
- [ ] **🟢 MVP** Rate limiting on auth and abuse-prone endpoints.
- [ ] **🟢 MVP** `npm audit --audit-level=high` returns 0 high or critical issues, or accepted exceptions are documented.
- [ ] **🟡 V1.0** Dependencies pinned or kept within known-safe ranges.
- [ ] **🟡 V1.0** Admin routes protected separately from normal authenticated routes.
- [ ] **🟢 MVP** File upload restrictions in place if uploads exist (size cap, MIME allowlist, content-type sniffing, virus scan if user-shared).
- [ ] **🟡 V1.0** Security headers reviewed: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, and frame policy as appropriate.

---

## 9. Web Security & Audit (Deep)

### Input & output handling

- [ ] **🟢 MVP** All user-facing inputs validated for type, length, format, and allowed values.
- [ ] **🟢 MVP** SQL injection prevention verified through parameterized queries, query builders, or ORM-safe patterns.
- [ ] **🟢 MVP** XSS prevention verified through output escaping, safe templating, and HTML sanitization where rich text is allowed.
- [ ] **🟡 V1.0** Sensitive data masked or truncated before reaching client logs, UI, and analytics tools.
- [ ] **🟡 V1.0** API error messages are generic and do not expose stack traces, SQL errors, schema details, or internal IDs unnecessarily.

### API & endpoint security

- [ ] **🟢 MVP** Rate limiting enforced on auth, password reset, verification, and high-volume mutation endpoints.
- [ ] **🟢 MVP** Broken access control and insecure direct object reference (IDOR) risks tested and patched.
- [ ] **🟢 MVP** Authorization enforced server-side on every protected action, not only in the UI.
- [ ] **🟡 V1.0** Security headers reviewed and applied where appropriate, including `X-Content-Type-Options: nosniff`, `X-Frame-Options` or CSP `frame-ancestors`, and a strict referrer policy.
- [ ] **🟡 V1.0** No hidden or undocumented routes rely on obscurity instead of authentication and authorization.
- [ ] **🔵 V1.5+** SSRF defenses on any feature that fetches user-supplied URLs (URL preview, image import, webhooks).

### Static & dependency analysis

- [ ] **🟢 MVP** `npm audit` or equivalent package audit reviewed with no unaccepted high or critical vulnerabilities.
- [ ] **🟡 V1.0** SAST scan, such as Semgrep or CodeQL, passes without unresolved security findings.
- [ ] **🟡 V1.0** Critical dependencies pinned or constrained to known-safe ranges.
- [ ] **🟡 V1.0** Framework and platform security defaults reviewed for required explicit configuration changes.
- [ ] **🔵 V1.5+** SBOM generated and stored per release (CycloneDX or SPDX).
- [ ] **🔵 V1.5+** Dependency review automated in CI (Dependabot, Renovate, Snyk).

### Runtime verification

- [ ] **🟢 MVP** Security review run against production or production-equivalent environment, not only local dev.
- [ ] **🟢 MVP** Login, signup, password reset, billing, file upload, and admin flows tested for abuse cases.
- [ ] **🟡 V1.0** CSP, cookies, CORS, and session settings verified in browser dev tools and deployed response headers.
- [ ] **🟡 V1.0** Audit findings documented with severity, owner, and fix status before launch.

### Reference examples

#### Rate limiting (Express example)

```js
const rateLimit = require('express-rate-limit');

const authRateLimit = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authRateLimit);
```

#### Security headers (Express example)

```js
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

#### Input sanitization (TypeScript example)

```ts
import sanitizeHtml from 'sanitize-html';

export function cleanUserHtml(input: string) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}
```

---

## 10. Database, Backup & System Recovery

### Database

- [ ] **🟢 MVP** Production database created with least-privilege access.
- [ ] **🟢 MVP** Migrations run successfully in production.
- [ ] **🟢 MVP** Rollback plan documented for latest migration.
- [ ] **🟡 V1.0** Seed or bootstrap process documented for required data.
- [ ] **🟢 MVP** Automated backups enabled.
- [ ] **🟡 V1.0** Restore from backup tested at least once (a backup you have not restored is not a backup).
- [ ] **🟡 V1.0** Data retention and deletion approach defined.
- [ ] **🟡 V1.0** PII access minimized and audited.
- [ ] **🔵 V1.5+** Point-in-time recovery (PITR) window documented and tested.
- [ ] **🔵 V1.5+** RPO (recovery point objective) and RTO (recovery time objective) targets written down.

### Third-party service outage plan

> Recovery is more than restoring your database. If a critical vendor goes down, what's the user-visible behavior?

- [ ] **🟡 V1.0** Critical third-party dependencies inventoried (auth, billing, email, file storage, AI/LLM providers).
- [ ] **🟡 V1.0** For each: documented failure mode (degrade gracefully vs. show maintenance banner vs. hard fail).
- [ ] **🟡 V1.0** Stripe/billing outage: existing subscribers can still access app; new signups queued or blocked with clear message.
- [ ] **🟡 V1.0** Email provider outage: critical flows (password reset) have fallback or clear "try again later" UX, not silent failures.
- [ ] **🔵 V1.5+** Status page subscriptions configured for every critical vendor.
- [ ] **🔵 V1.5+** Multi-provider strategy considered for the one dependency whose outage would kill the business (often: auth or DB).

---

## 11. Deploy Target

> **Note:** Pick the section that matches your platform. If you're on Heroku, Render, Fly.io, AWS, or another platform, adapt these checks to the equivalent deployment mechanism — the principle (build from git, env vars set, health check, SSL) is what matters, not the specific platform.

### Railway

- [ ] Connected via GitHub repo, not ad hoc CLI upload.
- [ ] `.dockerignore` does not exclude required build files.
- [ ] `.railwayignore` only excludes safe non-deploy files.
- [ ] Health check endpoint returns `{"status":"ok"}`.
- [ ] Environment variables set in Railway dashboard.
- [ ] Custom domain configured and SSL active.

### Netlify

- [ ] `netlify.toml` SPA redirect present if SPA app.
- [ ] Build command correct.
- [ ] Publish directory correct.
- [ ] Environment variables set in Netlify dashboard.
- [ ] Custom domain configured and SSL active.

### General deploy checks (platform-agnostic)

- [ ] **🟢 MVP** Build runs from git on the chosen platform — no ad hoc uploads.
- [ ] **🟢 MVP** Preview environment works before production promote.
- [ ] **🟢 MVP** Production env vars reviewed by second pair of eyes for critical apps.
- [ ] **🟢 MVP** Health check and homepage both return 200 after deploy.
- [ ] **🟢 MVP** Build artifacts do not expose source maps publicly unless intended.
- [ ] **🟡 V1.0** Rollback to previous deploy is one click / one command and has been tested.
- [ ] **🟢 MVP** **CI Gate 7 (scope-tag attestation):** Every PR declares `<!-- godmythos:scope -->` block with scope, mvp_window, defers, and metrics_md_present. PRs touching UI and claiming MVP scope require `METRICS.md` at repo root. See §24.
- [ ] **🔵 V1.5+** Blue-green or canary deploy supported for risky changes.

---

## 12. Observability, Funnel & Adoption Metrics

### Infrastructure observability

- [ ] **🟢 MVP** Error monitoring configured (Sentry, Rollbar, or equivalent).
- [ ] **🟢 MVP** Uptime monitoring enabled for homepage and health endpoint.
- [ ] **🟢 MVP** Request logging available for auth, billing, and critical write paths.
- [ ] **🟢 MVP** Alerts routed to a real owner (not a dead inbox).
- [ ] **🟡 V1.0** Release/version tag attached to deploys and errors.
- [ ] **🟡 V1.0** Session replay or equivalent enabled if appropriate (with PII masking).
- [ ] **🔵 V1.5+** Distributed tracing for multi-service requests.

### Product analytics — the basics

- [ ] **🟢 MVP** Analytics installed (PostHog, Mixpanel, GA4, or equivalent).
- [ ] **🟡 V1.0** Event taxonomy documented — naming convention agreed before instrumentation drift sets in.
- [ ] **🟡 V1.0** Dashboard exists for signups, activations, trial conversions, and payment failures.

### Funnel & feature adoption metrics

> "Analytics installed" is not the same as "we know what we're measuring." Define the funnel before launch, not after.

- [ ] **🟢 MVP** Acquisition → activation funnel defined: landing → signup → first key action → repeat use. Each step instrumented.
- [ ] **🟡 V1.0** Conversion funnel tracked end to end: signup → view pricing → start trial → convert to paid.
- [ ] **🟡 V1.0** "Aha moment" / core feature adoption tracked — what percentage of new users actually use the killer feature within 7 days?
- [ ] **🟡 V1.0** Time-to-value (TTV) measurement defined and tracked from signup to first meaningful outcome.
- [ ] **🟡 V1.0** Drop-off points in funnel flagged with hypotheses, not just numbers.
- [ ] **🔵 V1.5+** Cohort retention curves visible (D1, D7, D30).
- [ ] **🔵 V1.5+** Reverse trials / feature-gate analysis if you offer freemium.

---

## 13. Legal & Trust

- [ ] **🟢 MVP** Privacy Policy published.
- [ ] **🟢 MVP** Terms of Service published.
- [ ] **🟢 MVP** Cookie disclosure added if required by tracking setup.
- [ ] **🟢 MVP** Contact/support path visible.
- [ ] **🟡 V1.0** Data deletion request process documented and reachable from a public page.
- [ ] **🟡 V1.0** Security page or DPA published if selling B2B.
- [ ] **🟢 MVP** Company identity in footer is accurate.
- [ ] **🔵 V1.5+** Sub-processor list published if processing EU user data.
- [ ] **🔵 V1.5+** Data residency and cross-border transfer mechanism (SCCs) documented if B2B.
- [ ] **🔵 V1.5+** AI/training data usage disclosed in privacy policy if you ship AI features.

---

## 14. Product QA

- [ ] **🟢 MVP** Smoke test every sitemap URL and confirm 200.
- [ ] **🟢 MVP** Google sign-in tested.
- [ ] **🟡 V1.0** Apple sign-in tested.
- [ ] **🟢 MVP** Empty states checked.
- [ ] **🟢 MVP** Loading states checked.
- [ ] **🟢 MVP** Error states checked.
- [ ] **🟢 MVP** 404 page checked.
- [ ] **🟢 MVP** Generic failure page checked.
- [ ] **🟢 MVP** Mobile layout checked on a real narrow viewport.
- [ ] **🟢 MVP** Cross-browser sanity check completed (Chrome, Safari, Firefox at minimum).
- [ ] **🟡 V1.0** Role/tenant isolation tested if applicable.
- [ ] **🟢 MVP** Public pages load while signed out.
- [ ] **🟢 MVP** Auth-only pages stay protected while signed out.
- [ ] **🟡 V1.0** **TRACTION_FIRST (Category 8):** UI design scored for traction alignment — does the primary CTA on every page visibly drive the north-star metric? See §24.

---

## 15. First-Time User Experience (FTUE) & Onboarding

> Auth flow works ≠ users succeed. This section closes the gap between "logged in" and "got value."

- [ ] **🟢 MVP** First-run path from signup to first meaningful outcome is mapped on paper and walked through with a fresh account.
- [ ] **🟢 MVP** Zero-state / empty-state guides users toward the first action — not a blank screen with a "+ New" button alone.
- [ ] **🟡 V1.0** Onboarding tutorial, product tour, or checklist present (even a 3-step inline checklist beats nothing).
- [ ] **🟡 V1.0** Sample data or "try it with a demo" option for products where setup is non-trivial.
- [ ] **🟡 V1.0** First email after signup arrives within 60 seconds and helps the user, not just confirms registration.
- [ ] **🟡 V1.0** Friction points (mandatory fields, surveys, payment-method-before-trial) reviewed and justified per item.
- [ ] **🟡 V1.0** Time-to-value (TTV) target written down and instrumented (see §12).
- [ ] **🔵 V1.5+** Re-engagement email triggered for users who signed up but did not reach activation within X days.
- [ ] **🔵 V1.5+** Onboarding variants tested (control vs. tour vs. checklist) to find what lifts activation.

---

## 16. Accessibility & Performance Budgets

### Accessibility (a11y)

- [ ] **🟢 MVP** All interactive elements reachable by keyboard.
- [ ] **🟢 MVP** Focus visible on all interactive elements (no `outline: none` without replacement).
- [ ] **🟢 MVP** Images have meaningful `alt` text, decorative images use `alt=""`.
- [ ] **🟢 MVP** Form inputs have associated `<label>`s.
- [ ] **🟡 V1.0** Color contrast meets WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text and UI components).
- [ ] **🟡 V1.0** Page passes axe-core or Lighthouse a11y audit without major errors.
- [ ] **🟡 V1.0** Heading order is semantic (no skipped levels).
- [ ] **🔵 V1.5+** Screen reader walkthrough of core flows completed.
- [ ] **🔵 V1.5+** Reduced-motion preference respected for animations.

### Performance budgets

- [ ] **🟡 V1.0** Largest Contentful Paint (LCP) under 2.5s on representative pages.
- [ ] **🟡 V1.0** Interaction to Next Paint (INP) under 200ms.
- [ ] **🟡 V1.0** Cumulative Layout Shift (CLS) under 0.1.
- [ ] **🟡 V1.0** Initial JS payload budget defined (e.g. < 250KB gzipped for marketing pages).
- [ ] **🟡 V1.0** Lighthouse performance score baselined and tracked per deploy.
- [ ] **🔵 V1.5+** Real-user monitoring (RUM / Web Vitals) feeding into observability stack.
- [ ] **🔵 V1.5+** Image optimization pipeline (AVIF/WebP, responsive `srcset`).

---

## 17. Cost & FinOps Guardrails

> The fastest way to kill a young SaaS isn't a security breach — it's a $14,000 cloud bill from a runaway loop.

- [ ] **🟢 MVP** Billing alerts set on every paid cloud account (AWS, GCP, Vercel, Railway, etc.) at 50/75/100% of expected monthly spend.
- [ ] **🟢 MVP** Per-tenant or per-user usage caps in place for any expensive operation (LLM calls, video transcoding, large queries).
- [ ] **🟡 V1.0** Cost-per-customer estimate documented; gross margin trajectory understood.
- [ ] **🟡 V1.0** Database query and storage growth monitored — surprise indexes and unbounded log tables caught early.
- [ ] **🔵 V1.5+** Idle resource cleanup automated (stale preview environments, orphaned storage, abandoned trial workspaces).

---

## 18. AI / LLM Safety (if applicable — skip if no AI features)

- [ ] **🟢 MVP** Per-user and per-tenant rate limits on every LLM-calling endpoint.
- [ ] **🟢 MVP** Hard daily/monthly cost cap per account — single user cannot exhaust your monthly OpenAI/Anthropic budget.
- [ ] **🟢 MVP** Prompt injection defenses for any feature that processes untrusted content (web pages, uploads, emails) and then takes action.
- [ ] **🟡 V1.0** System prompts and tool definitions not exposed client-side or in network traces.
- [ ] **🟡 V1.0** User-provided API keys (if BYOK) stored encrypted at rest, never in client state.
- [ ] **🟡 V1.0** Token usage logged per user for billing, debugging, and abuse detection.
- [ ] **🟡 V1.0** Output reviewed for PII leakage paths (model echoes back another user's data via shared context, vector store cross-tenant bleed, etc.).
- [ ] **🔵 V1.5+** Model fallback chain in place (Anthropic → OpenAI, or primary → cached/cheaper backup) for provider outages.
- [ ] **🔵 V1.5+** Evals or red-team checks run against safety-critical prompts before each model upgrade.

---

## 19. Incident Response & Status Communication

- [ ] **🟢 MVP** One named person is on point for launch-day issues, with backup contact.
- [ ] **🟢 MVP** Escalation path written down: who gets paged at 2am if checkout breaks?
- [ ] **🟡 V1.0** Public status page set up (statuspage.io, instatus, Better Stack, or a static page you control).
- [ ] **🟡 V1.0** Incident severity ladder defined (SEV1 = revenue down, SEV2 = degraded, SEV3 = cosmetic).
- [ ] **🟡 V1.0** User communication template ready for "we're investigating," "identified," "resolved."
- [ ] **🟡 V1.0** **SMOKE_TOGGLE readiness:** Feature-flag mechanism documented for suspected surfaces so a bug can be isolated before debugging. See §24.
- [ ] **🔵 V1.5+** Post-incident review (blameless) process documented.
- [ ] **🔵 V1.5+** On-call rotation and pager hygiene defined once team > 2 people.

---

## 20. Feature Flags & Progressive Rollout

- [ ] **🟡 V1.0** Feature flag system in place (LaunchDarkly, PostHog flags, Unleash, or a simple env-var-driven kill switch).
- [ ] **🟡 V1.0** New risky features gated behind a flag so rollback is a config toggle, not a redeploy.
- [ ] **🔵 V1.5+** Percentage rollout supported (1% → 10% → 50% → 100%).
- [ ] **🔵 V1.5+** Per-tenant or per-plan targeting for early access / beta cohorts.
- [ ] **🔵 V1.5+** Flag debt audited quarterly — dead flags removed.

---

## 21. Developer Experience & Documentation

> If a new dev can't get the app running in an afternoon, the next launch will be slower than this one.

- [ ] **🟢 MVP** `README.md` covers: what it is, how to install, how to run locally, how to test, how to deploy.
- [ ] **🟢 MVP** `.env.example` committed with every required variable (no values) and a comment for each.
- [ ] **🟡 V1.0** Local dev setup tested by someone other than the original author from a clean machine.
- [ ] **🟡 V1.0** CI/CD pipeline documented outside the checklist — a new dev can ship a code change without asking anyone.
- [ ] **🟡 V1.0** Architecture diagram or one-pager exists, even if hand-drawn.
- [ ] **🟡 V1.0** Common operations runbook: how to rotate a secret, restore a backup, ban a user, refund a charge.
- [ ] **🔵 V1.5+** ADRs (architecture decision records) kept for non-obvious choices.
- [ ] **🔵 V1.5+** API documentation published (OpenAPI / Swagger) if external API exists.
- [ ] **🔵 V1.5+** Public changelog or in-app "what's new" surface.

---

## 22. Launch Gate

Everything below should be complete before public launch.

- [ ] **🟢** Domain, SSL, and canonical host work correctly.
- [ ] **🟢** robots.txt, sitemap.xml, and canonical tags are live.
- [ ] **🟢** Search Console property is verified and sitemap submitted.
- [ ] **🟢** Auth flow works end to end.
- [ ] **🟢** Billing flow works end to end (if paid).
- [ ] **🟢** Transactional email works end to end.
- [ ] **🟢** Error monitoring and uptime monitoring are live.
- [ ] **🟢** Legal pages are published.
- [ ] **🟢** Health check endpoint works.
- [ ] **🟢** Backup and rollback paths are documented.
- [ ] **🟢** Team knows who is on point for launch-day issues.
- [ ] **🟢** Zero-state and first-time user path makes sense to a fresh account.
- [ ] **🟢** Cost alerts armed on all paid cloud accounts.
- [ ] **🟢** Acquisition → activation funnel instrumented (even if just 4 events).
- [ ] **🟢** `README.md` lets a new developer run the app locally.
- [ ] **🟢** `METRICS.md` exists at repo root with north-star metric, friction inventory, and measurement plan. See §24.
- [ ] **🟢** MVP_COMPRESS window (if active) has recorded debt items in `.godmythos/mvp-windows.yaml` with future expiry. See §24.

---

## 23. Post-Launch

### Days 1–3

- [ ] Review auth errors and payment failures from first 24-72 hours.
- [ ] Review email bounce and deliverability metrics.
- [ ] Review onboarding completion and first-session drop-off.
- [ ] Scan error monitoring for high-frequency / new errors introduced by real traffic.
- [ ] Watch cloud cost dashboards daily — bot traffic and edge cases first show up in spend.

### Weeks 1–2

- [ ] Check Search Console for blocked pages, duplicate canonicals, and discovered-not-indexed pages.
- [ ] Verify indexed pages match public intent.
- [ ] Review activation rate vs. target; identify largest funnel drop-off.
- [ ] First retention check at D7.
- [ ] Add app to internal deployed-app registry.
- [ ] Create first backlog of post-launch fixes and content improvements.

### Weeks 2–4

- [ ] First post-incident review of any SEV1/SEV2 issues, even small ones.
- [ ] Audit any "we'll fix it after launch" debt items and triage explicitly.
- [ ] D30 retention check.

---

## 24. GODMYTHOS v10.3 Integration

> This section connects the checklist to the GODMYTHOS v10.3 development doctrine. Only applies if your team operates under GODMYTHOS. Otherwise, skip this section — all items above are self-contained.

### 24.1 `METRICS.md` — Required Artifact

`METRICS.md` lives at repo root. It is the canonical traction sketch. Required on launch day.

**Template:**

```markdown
# METRICS.md — Traction Dashboard Sketch

**Scope:** <product name>
**Status:** live
**Last reviewed:** <date>

## North-star metric (one)
The single number that, if it moves up, tells us we won.
- Definition: <SQL/event-name/etc.>
- Current value: <number or "not yet measured">
- Target value: <number + by-date>

## Counter-metrics (1–3)
Numbers that, if they move the wrong way, tell us the north-star is being gamed.

## Leading indicators (2–4)
Faster-moving signals that predict the north-star.

## How we measure
- Where data comes from (Postgres table, PostHog event, Stripe webhook, etc.)
- Who looks at it (and how often)
- Alert thresholds

## Friction inventory (the inverse view)
The shortest path from a stranger seeing the product to producing the north-star metric. List every step as a friction point.
```

- [ ] `METRICS.md` exists at repo root
- [ ] North-star is precisely defined (measurable event/query, not "more engagement")
- [ ] Friction inventory has been walked with a fresh account
- [ ] `METRICS.md` is wired into CI Gate 7 (PRs touching UI require it to be present)

### 24.2 `MVP_COMPRESS` — Formal MVP Windows

Replace ad-hoc scope decisions with documented windows. Each window tracks what rigor was deferred and when it comes due.

**Creation:**

```bash
# Add to .godmythos/mvp-windows.yaml:
# - scope: <feature-name>
#   opened: <ISO-date>
#   expires: <ISO-date | milestone>
#   defers: [HR-11, HR-13, HR-14, TO_PRD_DEPTH, ...]
#   status: open
#   debt: <list of owed artifacts>
```

- [ ] `.godmythos/mvp-windows.yaml` exists
- [ ] All active MVP windows have a future `expires` date
- [ ] Debt items are scheduled for pay-down before window expiry
- [ ] Expired windows have debt resolved before next major PR

**What `MVP_COMPRESS` CANNOT skip (always-on, even during MVP):**
- Hard Rules #1–#9 (correctness, compiler, tests, no stubs, security)
- Cartography gates (design token integrity)
- CI Gates 1–4 (compile, test, security, design grade ≥ B)
- Error surfaces = UI (Hard Rule #9)
- No fake execution (Hard Rule #1)

### 24.3 `TRACTION_FIRST` — Design Scoring Extension

Design quality alone is not enough. Every UI component must be evaluated for traction alignment.

**Category 8 scoring:**

| Grade | Condition |
|---|---|
| A | `METRICS.md` exists, north-star precise, primary CTA drives north-star, friction inventory ≤5 steps |
| B | Same as A but friction 6–8 steps, or CTA is one click removed |
| C | `METRICS.md` exists but is vague, or CTA is two clicks removed |
| D | `METRICS.md` missing or stub. Overall design score caps at B regardless. |

- [ ] Every UI component's primary CTA has been traced to the north-star metric
- [ ] Any CTA that is >1 click from the north-star path is flagged for v1.1
- [ ] Friction inventory logged in `METRICS.md`

### 24.4 `SMOKE_TOGGLE` — Incident Readiness

Before launch, ensure the blast-radius reduction pattern is wired in for critical surfaces.

- [ ] Auth, billing, and LLM endpoints have documented feature-flag kill switches
- [ ] Flag mechanism documented in runbook (env var, config toggle, or LaunchDarkly)
- [ ] Team knows the drill: wrap suspected surface → toggle OFF → build feedback loop → bisect → fix → flip default → remove flag in follow-up PR

### 24.5 CI Gate 7 — Scope-Tag Attestation

Every PR declares its scope. CI enforces it.

All PR descriptions should include:

```html
<!-- godmythos:scope -->
scope: MVP | PRODUCTION
mvp_window: <window-name or "none">
defers: [<list or empty>]
metrics_md_present: true | false
<!-- /godmythos:scope -->
```

- [ ] PR template includes the scope-tag block
- [ ] CI pipeline rejects PRs with missing scope tags (BLOCK)
- [ ] MVP-scope PRs touching UI without `METRICS.md` → BLOCK
- [ ] PRODUCTION-scope PRs with non-empty `defers` → BLOCK

---

## Quick Reference

| File | Location | Purpose |
|---|---|---|
| `robots.txt` | `public/` | Tells crawlers what to skip. |
| `sitemap.xml` | `public/` | Tells crawlers what to index. |
| `llms.txt` | `public/` | Gives AI systems a citation-facing product summary. |
| `insforge.toml` | Project root | Stores auth redirect config. |
| `.env.local` | Project root | Stores app environment variables (gitignored). |
| `.env.example` | Project root | Documents required env vars (committed, no values). |
| `Login.tsx` | `src/pages/` | Starts social sign-in flow. |
| `AuthCallback.tsx` | `src/pages/` | Handles OAuth redirect completion. |
| `socialAuth.ts` | `src/lib/` | Centralizes auth helpers and provider config. |
| `README.md` | Project root | New-dev onboarding. |
| `RUNBOOK.md` | `docs/` | Common ops (rotate secret, restore backup, refund). |
| `METRICS.md` | Project root | Traction contract — north-star, friction inventory, measurement plan. |
| `.godmythos/mvp-windows.yaml` | `.godmythos/` | Formal MVP windows with debt tracking. |

---

## Anti-Patterns

- [ ] Do not put `/signup`, `/login`, `/forgot-password`, or `/billing` in sitemap.
- [ ] Do not commit `.env` files, even as a shortcut.
- [ ] Do not use ad hoc deploy flow when the platform should build from Git.
- [ ] Do not skip `llms.txt` if the goal is strong AI-search discoverability (but don't block MVP on it).
- [ ] Do not set OAuth `redirectTo` to the backend auth domain.
- [ ] Do not paste Apple PEM material unsafely into shell commands.
- [ ] Do not treat analytics, alerts, and backups as optional after launch.
- [ ] Do not launch without testing failed states, not just happy paths.
- [ ] Do not call analytics "installed" before defining what events matter.
- [ ] Do not ship LLM features without per-user cost caps.
- [ ] Do not assume a backup works without restoring it.
- [ ] Do not let "we'll write the README later" become "the founder is the only person who can deploy this".
- [ ] **v10.3:** Do not ship without `METRICS.md` — if you cannot define the north-star in one sentence, the product is not ready to launch.
- [ ] **v10.3:** Do not use ad-hoc scope decisions when `MVP_COMPRESS` windows exist — debt that is not tracked is debt that will never be paid.
- [ ] **v10.3:** Do not launch with `TRACTION_FIRST` Category 8 scoring missing — a beautiful UI for a feature nobody uses is a B-grade ceiling.

---

## Minimal Launch Gate for Fast Ship

Use this shorter gate when shipping fast, but do not skip these items.

- [ ] HTTPS and canonical domain work.
- [ ] robots.txt and sitemap.xml are live.
- [ ] Search Console property exists.
- [ ] Auth works in production.
- [ ] Billing works in production if paid app.
- [ ] Password reset and support inbox work.
- [ ] Error tracking and uptime monitoring are live.
- [ ] Privacy Policy and Terms are live.
- [ ] Backup and rollback path exist.
- [ ] One person owns launch-day monitoring.
- [ ] Zero-state of the app guides a fresh user toward the first action.
- [ ] Acquisition → activation funnel is instrumented (even if just 4 events).
- [ ] Cost alerts armed on every paid cloud account.
- [ ] `README.md` lets a new dev get the app running.
- [ ] `METRICS.md` exists with north-star metric and friction inventory (v10.3).
- [ ] MVP_COMPRESS window documented if deferring process rigor (v10.3).

---

## Change Log

- **v4 (current):** Upgraded to GODMYTHOS v10.3 doctrine. Added §24 (v10.3 Integration) with `METRICS.md` required artifact, `MVP_COMPRESS` formal windows, `TRACTION_FIRST` Category 8 scoring, `SMOKE_TOGGLE` incident readiness, and CI Gate 7 scope-tag attestation. Updated Launch Gate (§22) with `METRICS.md` and `MVP_COMPRESS` items. Extended Anti-Patterns and Quick Reference for v10.3 artifacts. Added `TRACTION_FIRST` item to Product QA (§14) and `SMOKE_TOGGLE` item to Incident Response (§19). Added CI Gate 7 item to Deploy Target (§11).
- **v3:** Integrated DCCTO audit. Added MVP tier markers (🟢/🟡/🔵). New sections: FTUE & Onboarding (§15), Accessibility & Performance Budgets (§16), Cost & FinOps Guardrails (§17), AI/LLM Safety (§18), Incident Response & Status (§19), Feature Flags & Progressive Rollout (§20), Developer Experience & Documentation (§21). Expanded §10 with third-party outage planning, §12 with funnel and adoption metrics. Removed stale citations. De-coupled deploy section from Railway/Netlify specifics.
- **v2:** Added billing, email, observability, legal, recovery, and launch operations coverage on top of v1's SEO/auth/security/deploy foundation.
- **v1:** SEO, auth, security, and deploy foundation.
