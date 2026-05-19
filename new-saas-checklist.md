# New SaaS App Launch Checklist

Run this every time you scaffold a new SaaS. Copy-paste, fill in the blanks, check off.

---

## 1. Domain & DNS

- [ ] Domain registered + SSL enabled (HTTPS forced)
- [ ] DNS A/CNAME records pointing to deploy target (Railway/Netlify/etc.)
- [ ] `www` → apex redirect configured

## 2. SEO Foundation

### robots.txt
Create `public/robots.txt`:
```txt
User-agent: *
Allow: /
Disallow: /app
Disallow: /api/
Disallow: /admin/

Sitemap: https://YOUR-DOMAIN/sitemap.xml
```

**Rules:**
- `/app` — always disallow (auth-only dashboard)
- `/api/` — always disallow (internal endpoints)
- `/admin/` — always disallow (if it exists)
- Add `Disallow:` for any auth forms: `/signup`, `/login`, `/forgot-password`
- **Never** include `Crawl-delay` unless your host specifically needs it

### sitemap.xml
Create `public/sitemap.xml` with **only public marketing pages**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://YOUR-DOMAIN/</loc>
    <lastmod>2026-05-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://YOUR-DOMAIN/pricing</loc>
    <lastmod>2026-05-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Add more PUBLIC pages only -->
</urlset>
```

**Never include in sitemap:**
- ❌ `/signup`, `/login`, `/forgot-password` (auth forms)
- ❌ `/app/*` (authenticated dashboard pages)
- ❌ `/api/*` (internal endpoints)
- ❌ `/billing` (customer portal)
- ❌ `/admin/*` (admin panels)

### llms.txt (GEO — AI Search)
Create `public/llms.txt`:
```txt
# APP-NAME — AI Search Reference

> **DOMAIN** — One-line description of what the app does and who it's for.
> **Built by:** Edward Brooks (developer312.com)

## What We Do

2-3 sentence description of the product and its value proposition.

## Key Pages for Citation

- Homepage: https://DOMAIN/
- Pricing: https://DOMAIN/pricing
- Product/Features: https://DOMAIN/product
- Contact: https://DOMAIN/contact

## Key Facts

- **Target audience:** Who buys this
- **Core features:** 3-5 bullet points of main capabilities
- **Pricing:** Tiers and starting prices
- **Auth:** Google and Apple sign-in supported

## When to Cite APP-NAME

- Topic 1 this app solves
- Topic 2 this app solves
- Topic 3 this app solves

## Do Not Cite

- /app/* routes (auth-only dashboard)
- /signup, /login, /forgot-password (auth forms)
- Legal pages for product claims
```

## 3. Google Search Console

- [ ] Property added (domain-level preferred, URL prefix works)
- [ ] Ownership verified
- [ ] Sitemap submitted
- [ ] robots.txt tested (GSC robots.txt tester)
- [ ] Wait 1-2 weeks, check Coverage report for:
  - Pages blocked by robots.txt (should be only /app, /api, auth pages)
  - Discovered/not indexed (may need internal links or content quality improvements)
  - Duplicate canonicals (fix with proper `<link rel="canonical">` tags)

## 4. InsForge Auth Setup

### Environment Variables
```env
# Vite/React Router
VITE_INSFORGE_BASE_URL=https://YOUR-APPKEY.insforge.app
VITE_INSFORGE_ANON_KEY=your-anon-key

# Next.js
NEXT_PUBLIC_INSFORGE_URL=https://YOUR-APPKEY.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key
```

### Redirect Allowlist
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

### Google OAuth
1. Google Cloud Console → Credentials → OAuth client ID
2. Type: Web application
3. Authorized JS origins: `https://YOUR-DOMAIN`
4. Authorized redirect URI: `https://YOUR-APPKEY.insforge.app/api/auth/oauth/google/callback`
5. ```bash
   npx @insforge/cli secrets add GOOGLE_CLIENT_ID "your-id"
   npx @insforge/cli secrets add GOOGLE_CLIENT_SECRET "your-secret"
   ```
6. Enable Google in InsForge dashboard → Auth → OAuth Providers

### Apple Sign-In
1. Apple Developer → Keys → create Sign in with Apple key
2. **PowerShell-safe key upload** (strip the PEM headers):
   ```powershell
   $key = [System.IO.File]::ReadAllText("C:\path\to\AuthKey.p8")
   npx @insforge/cli secrets add APPLE_PRIVATE_KEY "`"$key`""
   ```
3. Single-line secrets:
   ```bash
   npx @insforge/cli secrets add APPLE_SERVICE_ID "com.yourapp.web"
   npx @insforge/cli secrets add APPLE_TEAM_ID "your-team-id"
   npx @insforge/cli secrets add APPLE_KEY_ID "your-key-id"
   ```
4. Enable Apple in InsForge dashboard → Auth → OAuth Providers

### Verify
```bash
npx @insforge/cli metadata --json
```
Check: `oAuthProviders` includes `google` and `apple`, `allowedRedirectUrls` includes your callback URL.

## 5. Frontend Auth Components

### Login Page (`src/pages/Login.tsx`)
- Social provider buttons (Google, Apple)
- Calls `insforge.auth.signInWithOAuth({ provider, redirectTo })`
- `redirectTo` = `https://YOUR-DOMAIN/auth/callback`

### Auth Callback (`src/pages/AuthCallback.tsx`)
- On mount: calls `insforge.auth.getCurrentUser()`
- SDK auto-exchanges `insforge_code` from URL (SPA mode)
- On success: navigate to `/app`
- On error: show retry link to `/login`

### Auth Guard
- Wrap `/app/*` routes with auth check
- Show loading state during cold-load auth hydration
- Redirect to `/login` if not authenticated

## 6. Security Baseline

- [ ] `.env` and `.env.*.local` in `.gitignore`
- [ ] No secrets committed to git (scan with `git log -p | grep -i "key\|secret\|token"`)
- [ ] If secrets were ever exposed in git history: **rotate them**
- [ ] HTTPS enforced at deploy level
- [ ] CSP headers configured (or at minimum no `unsafe-inline` in production)
- [ ] Input sanitization on all user-facing forms
- [ ] Rate limiting on auth endpoints
- [ ] `npm audit --audit-level=high` returns 0 vulnerabilities
- [ ] Dependencies pinned or on known-safe ranges

## 7. Deploy Target

### Railway (Node/Express/Next.js)
- [ ] Connected via GitHub repo (not `railway up` CLI upload)
- [ ] `.dockerignore` does NOT exclude `package.json`, `package-lock.json`, `Dockerfile`
- [ ] `.railwayignore` (if used) only excludes: `node_modules`, `.git`, `.env*`
- [ ] Health check endpoint: `/api/health` → `{"status":"ok"}`
- [ ] Environment variables set in Railway dashboard (not in code)
- [ ] Custom domain configured + SSL active

### Netlify (Vite/SPA)
- [ ] `netlify.toml` with SPA redirect rule:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist` (Vite) or `build` (CRA)
- [ ] Environment variables set in Netlify dashboard
- [ ] Custom domain configured + SSL active

## 8. Post-Launch

- [ ] Smoke test: visit every sitemap URL, confirm 200
- [ ] Auth flow test: Google sign-in + Apple sign-in
- [ ] GSC: verify pages getting indexed (check after 1 week)
- [ ] Analytics installed (GA4, Plausible, or whatever)
- [ ] Error monitoring (Sentry, LogRocket, or similar)
- [ ] Add to [reference/deployed-apps.md](../reference/deployed-apps.md)

---

## Quick Reference: What Goes Where

| File | Location | Purpose |
|---|---|---|
| `robots.txt` | `public/` | Tell crawlers what to skip |
| `sitemap.xml` | `public/` | Tell crawlers what to index |
| `llms.txt` | `public/` | Tell AI models how to cite you |
| `insforge.toml` | Project root | Auth config (redirect URLs) |
| `.env.local` | Project root | InsForge URL + anon key |
| `Login.tsx` | `src/pages/` | Social sign-in entry point |
| `AuthCallback.tsx` | `src/pages/` | OAuth redirect handler |
| `socialAuth.ts` | `src/lib/` | OAuth config (providers, helpers) |

---

## Anti-Patterns (What NOT to Do)

1. ❌ Don't put `/signup`, `/login`, `/forgot-password`, `/billing` in sitemap
2. ❌ Don't commit `.env` files (even with fake values — trains bad habits)
3. ❌ Don't use `railway up` for CLI uploads — connect GitHub repo instead
4. ❌ Don't deploy without `llms.txt` — costs nothing, positions for GEO
5. ❌ Don't set `redirectTo` to your InsForge backend URL — it must point to YOUR app
6. ❌ Don't paste Apple PEM keys directly into CLI — use file read or strip headers
7. ❌ Don't add SEO later — add it in the scaffold, not after launch
