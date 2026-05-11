# Sitewide Interlinking Plan — LeanForge Keyword Trend Index

**Scope:** LARGE | **Confidence:** HIGH (85%+) | **Plan Date:** 2025-05-10

---

## 0. RECON SUMMARY

### Current State

**Stack:** Next.js 16 App Router, TypeScript, Tailwind, InsForge auth, Recharts

**14 existing routes:**

| Path | Type | Auth | In Sitemap | In Header | In Footer |
|------|------|------|-----------|-----------|-----------|
| `/` | Static | Public | Yes (1.0) | Logo link | - |
| `/keywords` | Static | Public | Yes (0.9) | Yes | Product |
| `/keywords/[slug]` | Dynamic | Public | Yes (0.7) | - | - |
| `/categories` | Static | Public | Yes (0.8) | Yes | Product |
| `/categories/[slug]` | Dynamic | Public | Yes (0.6) | - | - |
| `/api-docs` | Static | Public | Yes (0.7) | Yes | Product |
| `/about` | Static | Public | Yes (0.5) | - | Company |
| `/contact` | Static | Public | Yes (0.5) | - | Company |
| `/sign-in` | Static | Public | Yes (0.4) | Conditional | - |
| `/auth/callback` | Static | Auth | No | - | - |
| `/privacy` | Static | Public | Yes (0.5) | - | Legal |
| `/terms` | Static | Public | Yes (0.5) | - | Legal |
| `/cookies` | Static | Public | Yes (0.5) | - | Legal |
| `/disclaimer` | Static | Public | Yes (0.5) | - | Legal |

**Existing components:**
- `Header.tsx` — 3 nav links + sign-in/out + "Start Free Trial" external CTA. No mobile nav (desktop only).
- `Footer.tsx` — 4-column: Brand, Product (3 links), Company (2 links + email + phone), Legal (4 links).
- `JsonLd.tsx` — Structured data with `breadcrumbLd()` helper. Breadcrumb JSON-LD exists on 5 pages but no visual breadcrumb component.
- `RegentCTA.tsx` — External cross-sell CTA block.
- No 404 page (`not-found.tsx`).
- No error boundary (`error.tsx`).

**Missing per interlinking prompt requirements:**
- Pricing page (mentioned in prompt: "Public marketing pages" / "Pricing/conversion pages" / footer "Pricing" / header "Pricing" / contextual links)
- Features page (mentioned: "Features" in header, footer, contextual)
- FAQ page (mentioned: footer "FAQ", contextual)
- Help Center / Documentation page (separate from api-docs? Prompt mentions "Help/docs/support pages")
- No mobile nav
- No visual breadcrumbs

**Architecture decisions (resolved):**

1. **Create placeholder pages for pricing, features, FAQ, help-center.** The interlinking prompt explicitly requires links to these, and says "If a route is missing but clearly needed, create a lightweight placeholder page that follows the existing design system." These are NOT optional — they are part of the deliverable.

2. **No dashboard/app sidebar.** This is a public SaaS with InsForge auth for future features. There is no authenticated dashboard pages. The `/auth/callback` redirects to `/keywords`. Dashboard interlinking (priority 10 in the prompt) is out of scope but the architecture will support it via the route config.

3. **Visual breadcrumbs** on: keyword detail, category detail, api-docs, about, contact, privacy, terms, cookies, disclaimer, sign-in. NOT on: home, keywords listing, categories listing.

4. **Route constants centralized** in `src/lib/routes.ts` — single source of truth, consumed by header, footer, breadcrumbs, sitemap, contextual components.

---

## 1. ARCHITECTURE: Route Config (`src/lib/routes.ts`)

**One source of truth (Hard Rule #6).** All route paths, labels, and metadata live here.

```typescript
// src/lib/routes.ts
export const routes = {
  home: { path: '/', label: 'Home' },
  keywords: { path: '/keywords', label: 'Keywords', description: '...' },
  keywordDetail: { path: '/keywords/[slug]', label: 'Keyword Detail' },
  categories: { path: '/categories', label: 'Categories', description: '...' },
  categoryDetail: { path: '/categories/[slug]', label: 'Category Detail' },
  apiDocs: { path: '/api-docs', label: 'API Documentation', shortLabel: 'API' },
  pricing: { path: '/pricing', label: 'Pricing' },
  features: { path: '/features', label: 'Features' },
  about: { path: '/about', label: 'About' },
  contact: { path: '/contact', label: 'Contact' },
  helpCenter: { path: '/help-center', label: 'Help Center' },
  faq: { path: '/faq', label: 'FAQ' },
  signIn: { path: '/sign-in', label: 'Sign In' },
  privacy: { path: '/privacy', label: 'Privacy Policy' },
  terms: { path: '/terms', label: 'Terms of Service' },
  cookies: { path: '/cookies', label: 'Cookie Policy' },
  disclaimer: { path: '/disclaimer', label: 'Disclaimer' },
} as const;

export type RouteKey = keyof typeof routes;

// Grouped for navigation
export const headerNavRoutes = ['keywords', 'categories', 'features', 'pricing', 'apiDocs'] as const;
export const footerProductRoutes = ['keywords', 'categories', 'apiDocs', 'features', 'pricing'] as const;
export const footerCompanyRoutes = ['about', 'contact', 'helpCenter'] as const;
export const footerResourceRoutes = ['faq', 'apiDocs'] as const;
export const footerLegalRoutes = ['privacy', 'terms', 'cookies', 'disclaimer'] as const;
```

---

## 2. PLACEHOLDER PAGES (4 new routes)

All follow existing design system (CSS vars from globals.css, existing card/btn classes).

### `/pricing` — `src/app/pricing/page.tsx`
- Tier cards (Free, Starter, Growth, Enterprise) from CONTEXT.md monetization tier mapping
- "Get Started" CTAs → `/sign-in` and external Regent link
- Canonical URL, metadata
- Links to: features, FAQ, contact, sign-in

### `/features` — `src/app/features/page.tsx`
- Feature grid: Trend tracking, Category filtering, API access, Velocity metrics, Daily snapshots, etc.
- CTAs → pricing, sign-in, api-docs
- Canonical URL, metadata

### `/faq` — `src/app/faq/page.tsx`
- FAQ accordion or list with collapsible sections
- Data driven from context (What is LeanForge? How often are trends updated? etc.)
- Links to: contact, help-center, api-docs

### `/help-center` — `src/app/help-center/page.tsx`
- Help categories: Getting Started, API Usage, Account, Billing
- Links to: api-docs, contact, faq, sign-in

Each placeholder page includes:
- `buildMetadata()` for SEO
- Breadcrumb JSON-LD
- Visual breadcrumb component
- Contextual internal links

---

## 3. VISUAL BREADCRUMBS — `src/components/Breadcrumbs.tsx`

**New component** consuming `routes` config.

```tsx
// Props: items: Array<{ label: string; href?: string }>
// Renders: <nav aria-label="Breadcrumb"><ol>...<li><Link or span></ol></nav>
// Styling: text-muted-foreground, hover:text-foreground, chevron separators
// Responsive: truncate long paths on mobile
```

**Pages with breadcrumbs:**

| Page | Breadcrumb trail |
|------|-----------------|
| `/keywords` | Home > Keywords |
| `/keywords/[slug]` | Home > Keywords > {term} |
| `/categories` | Home > Categories |
| `/categories/[slug]` | Home > Categories > {name} |
| `/api-docs` | Home > API Documentation |
| `/pricing` | Home > Pricing |
| `/features` | Home > Features |
| `/faq` | Home > FAQ |
| `/help-center` | Home > Help Center |
| `/about` | Home > About |
| `/contact` | Home > Contact |
| `/privacy` | Home > Privacy Policy |
| `/terms` | Home > Terms of Service |
| `/cookies` | Home > Cookie Policy |
| `/disclaimer` | Home > Disclaimer |
| `/sign-in` | Home > Sign In |

**Excluded:** Home page (`/`) — as per prompt.

---

## 4. HEADER NAVIGATION UPGRADE

**Current:** 3 links (Keywords, Categories, API) — desktop only, no mobile nav.

**Target:**

Desktop nav:
| Label | Route |
|-------|-------|
| Features | `/features` |
| Pricing | `/pricing` |
| Keywords | `/keywords` |
| Categories | `/categories` |
| API Docs | `/api-docs` |

Mobile: hamburger menu with same links + Sign In/Sign Out.

**Active route styling:** `aria-current="page"` + conditional `text-foreground font-medium` class.

**Authenticated state:** Keep existing Sign Out button. Add conditional "Dashboard" link → `/keywords` (already the post-auth landing).

---

## 5. FOOTER INTERLINKING UPGRADE

**Current:** 4 columns (Brand, Product [3], Company [2+2], Legal [4])

**Target:** 4 columns

| Column | Links |
|--------|-------|
| **LeanForge** (brand) | Tagline, copyright |
| **Product** | Keywords, Categories, Features, Pricing, API Docs |
| **Company** | About, Contact, Help Center |
| **Resources** | FAQ, Privacy, Terms, Cookies, Disclaimer |

---

## 6. CONTEXTUAL INTERNAL LINKS

Per-page targeted links (not over-linked, intentional flow toward conversion):

**Home (`/`):**
- Already has: Keywords CTA, Categories CTA, API CTA
- Add: "View Pricing" link in hero, "Explore Features" link, "Read FAQ" link

**Keywords listing (`/keywords`):**
- Add: "Not sure where to start? Browse by category" → `/categories`
- Add: "Need API access? View API Documentation" → `/api-docs`

**Keyword detail (`/keywords/[slug]`):**
- Add: "View all {category} keywords" → `/categories/{categorySlug}`
- Add: "Compare with other trending keywords" → `/keywords`
- Add: RegentCTA already present

**Categories listing (`/categories`):**
- Add: "Access keyword data programmatically" → `/api-docs`

**Category detail (`/categories/[slug]`):**
- Add: "View pricing for API access" → `/pricing`
- Add: "Browse all categories" → `/categories`

**API Docs (`/api-docs`):**
- Add: "View pricing" → `/pricing`
- Add: "Need help? Visit Help Center" → `/help-center`

**Pricing:**
- Add: "See all features" → `/features`
- Add: "Questions? Visit FAQ" → `/faq`
- Add: "Contact us" → `/contact`

**Features:**
- Add: "View pricing plans" → `/pricing`
- Add: "Get started free" → `/sign-in`
- Add: "Read the API docs" → `/api-docs`

**FAQ:**
- Add: "Contact support" → `/contact`
- Add: "Read API documentation" → `/api-docs`

**About:**
- Add: "Get in touch" → `/contact`
- Add: "Explore features" → `/features`

**Contact:**
- Add: "About us" → `/about`
- Add: "Read FAQ" → `/faq`
- Already links to `/about`

**Help Center:**
- Add: "API documentation" → `/api-docs`
- Add: "Contact support" → `/contact`

**Legal pages (privacy, terms, cookies, disclaimer):**
- Each already cross-links to other legal pages
- Add: "Back to home" → `/`

---

## 7. 404 PAGE — `src/app/not-found.tsx`

```tsx
// Not Found page with:
// - Clear "Page not found" heading
// - Helpful description
// - Links: Home, Keywords, Pricing, Contact
// - Search suggestion
// - Matches design system
```

---

## 8. ERROR BOUNDARY — `src/app/error.tsx`

```tsx
// Error boundary with:
// - "Something went wrong" heading
// - Retry button
// - Links: Home, Help Center
// - 'use client' required
```

---

## 9. SEO ENHANCEMENTS

- **Canonical URLs:** Already via `buildMetadata()` — verify all pages use it. All new pages will use it.
- **Sitemap:** Update `site.ts` `publicRoutes` to include `/pricing`, `/features`, `/faq`, `/help-center`. Update `legalRoutes` grouping if needed.
- **No orphaned pages:** All 18 routes (14 existing + 4 new) reachable within 2-3 clicks from home.
- **Descriptive anchor text:** All links use descriptive text, never "click here."
- **Metadata on placeholder pages:** Title, description, canonical URL on all 4 new pages.

---

## 10. ACCESSIBILITY

All new links and components:
- `aria-label` on icon-only links
- `aria-current="page"` on active breadcrumb/link
- Keyboard navigable (native `<Link>` + `<a>`)
- Visible focus states (Tailwind `focus-visible:ring`)
- Semantic `<nav aria-label="...">` for breadcrumb nav, header nav, footer columns
- No icon-only links without accessible text

---

## 11. FILE MANIFEST

### New files:
| File | Purpose |
|------|---------|
| `src/lib/routes.ts` | Centralized route config — single source of truth |
| `src/components/Breadcrumbs.tsx` | Visual breadcrumb component |
| `src/components/MobileNav.tsx` | Mobile hamburger navigation |
| `src/app/not-found.tsx` | 404 page |
| `src/app/error.tsx` | Error boundary |
| `src/app/pricing/page.tsx` | Pricing placeholder page |
| `src/app/features/page.tsx` | Features placeholder page |
| `src/app/faq/page.tsx` | FAQ placeholder page |
| `src/app/help-center/page.tsx` | Help Center placeholder page |

### Modified files:
| File | Change |
|------|--------|
| `src/components/Header.tsx` | Add Features, Pricing links; add MobileNav; add active route styling |
| `src/components/Footer.tsx` | Restructure to 4 cols: Product, Company, Resources, Legal; add new links |
| `src/app/layout.tsx` | No change (already wraps Header/Footer) |
| `src/lib/site.ts` | Add new routes to `publicRoutes`; update groups |
| `src/app/HomeContent.tsx` | Add contextual links (Pricing, Features, FAQ) |
| `src/app/keywords/KeywordsContent.tsx` | Add contextual links (Categories, API Docs) |
| `src/app/keywords/[slug]/KeywordDetailContent.tsx` | Add contextual links (Category, Keywords listing) |
| `src/app/categories/CategoriesContent.tsx` | Add contextual link (API Docs) |
| `src/app/categories/[slug]/CategoryContent.tsx` | Add contextual links (Pricing, Categories) |
| `src/app/api-docs/ApiDocsContent.tsx` | Add contextual links (Pricing, Help Center) |
| `src/app/about/page.tsx` | Add Breadcrumbs, contextual links (Contact, Features) |
| `src/app/contact/page.tsx` | Add Breadcrumbs, contextual links (About, FAQ) |
| `src/app/sign-in/page.tsx` | Add Breadcrumbs |
| `src/app/privacy/page.tsx` | Add Breadcrumbs, home link |
| `src/app/terms/page.tsx` | Add Breadcrumbs, home link |
| `src/app/cookies/page.tsx` | Add Breadcrumbs, home link |
| `src/app/disclaimer/page.tsx` | Add Breadcrumbs, home link |
| `src/app/sitemap.ts` | Add new routes to sitemap generation |
| `src/app/page.tsx` | Add Breadcrumbs JSON-LD for new routes if applicable |

---

## 12. EXECUTION ORDER (Tracer-Bullet Vertical Slices)

Each slice is independently deployable and demoable. Labeled AFK (agent) or HITL (human).

### Slice 1: Route Config Foundation (AFK)
**Vertical:** `src/lib/routes.ts` (config) → consumed by nothing yet (preparation)
- Create centralized route config
- Update `src/lib/site.ts` to import from routes.ts where overlapping
- **Verify:** `npm run type-check` passes

### Slice 2: Breadcrumbs Component (AFK)
**Vertical:** `routes.ts` → `Breadcrumbs.tsx` → render on one page (e.g., `/about`)
- Create Breadcrumbs component
- Add to `/about` page with breadcrumb trail
- Add breadcrumb JSON-LD on `/about` if not present
- **Verify:** Visual breadcrumb renders, JSON-LD validates, type-check passes

### Slice 3: 404 + Error Pages (AFK)
**Vertical:** `routes.ts` → `not-found.tsx` + `error.tsx`
- Create custom 404 with internal links
- Create error boundary
- **Verify:** Navigate to `/nonexistent` shows 404 with links

### Slice 4: Header Navigation Upgrade (AFK)
**Vertical:** `routes.ts` → `Header.tsx` → `MobileNav.tsx`
- Add Features, Pricing to nav
- Add mobile hamburger menu
- Add active route styling
- **Verify:** All nav links work on desktop + mobile, active state shows

### Slice 5: Footer Interlinking Upgrade (AFK)
**Vertical:** `routes.ts` → `Footer.tsx`
- Restructure to 4 columns with new links
- Note: Links to `/pricing`, `/features`, etc. will 404 until Slice 6+
- **Verify:** Footer renders, existing links work, new links show (will lead to 404 until placeholder pages exist, but 404 page from Slice 3 catches this gracefully)

### Slice 6: Pricing Placeholder Page (AFK)
**Vertical:** `routes.ts` → `pricing/page.tsx` + metadata + breadcrumb + contextual links
- Create pricing page with tier cards
- SEO metadata, JSON-LD, visual breadcrumb
- Contextual links to Features, FAQ, Contact, Sign-in
- Add to sitemap
- **Verify:** `/pricing` renders, breadcrumb works, links work

### Slice 7: Features Placeholder Page (AFK)
**Vertical:** `routes.ts` → `features/page.tsx` + metadata + breadcrumb + contextual links
- Feature grid with CTAs
- Links to Pricing, Sign-in, API Docs
- Add to sitemap
- **Verify:** `/features` renders end-to-end

### Slice 8: FAQ Placeholder Page (AFK)
**Vertical:** `routes.ts` → `faq/page.tsx` + metadata + breadcrumb + contextual links
- FAQ content with accordion
- Links to Contact, Help Center, API Docs
- Add to sitemap
- **Verify:** `/faq` renders end-to-end

### Slice 9: Help Center Placeholder Page (AFK)
**Vertical:** `routes.ts` → `help-center/page.tsx` + metadata + breadcrumb + contextual links
- Help category cards
- Links to API Docs, Contact, FAQ
- Add to sitemap
- **Verify:** `/help-center` renders end-to-end

### Slice 10: Breadcrumbs on All Pages (AFK)
**Vertical:** `Breadcrumbs.tsx` → add to remaining pages
- Add Breadcrumbs component to all pages listed in Section 3
- Ensure JSON-LD breadcrumb data matches visual breadcrumb
- **Verify:** Every page (except home) shows breadcrumb, crumbs are consistent

### Slice 11: Contextual Internal Links (AFK)
**Vertical:** Per-page contextual link additions
- Update HomeContent.tsx
- Update KeywordsContent.tsx
- Update KeywordDetailContent.tsx
- Update CategoriesContent.tsx
- Update CategoryContent.tsx
- Update ApiDocsContent.tsx
- **Verify:** All contextual links render and navigate correctly

### Slice 12: Sitemap + SEO Final Pass (AFK)
**Vertical:** `site.ts` + `sitemap.ts` update + final verification
- Update `publicRoutes` with new pages and priorities
- Verify sitemap includes all 18 routes
- Verify canonical URLs on all pages
- Verify no broken links (manual spot-check)
- Run `npm run build` and `npm run type-check`
- **Verify:** Build passes, sitemap generates correctly

---

## 13. CONSTRAINTS

- **No external dependencies.** Use only existing packages (Next.js Link, lucide-react icons, Tailwind).
- **Preserve existing design.** Use CSS vars from globals.css, existing `.btn-*` and `.card` classes.
- **Preserve auth logic.** Don't modify AuthProvider, sign-in/out flows, or route guards.
- **Mobile-first.** Every nav/breadcrumb/footer change must work on mobile.
- **SEO-first.** Every page gets `buildMetadata()`, canonical URL, semantic HTML.
- **No stubs in production paths.** Placeholder pages have real content, real links, real metadata. Not `// TODO`.