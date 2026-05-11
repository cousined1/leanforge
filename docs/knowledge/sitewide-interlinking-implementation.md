---
type: learning
tags: [interlinking, navigation, seo, breadcrumbs, sitemap, accessibility]
confidence: high
created: 2025-05-10
source: sitewide-interlinking-implementation
supersedes: interlinking-architecture-decisions.md
---

# Sitewide Interlinking Implementation — Compound

## What Changed

18 routes (14 existing + 4 new) now have a complete internal linking architecture.

## New Files (9)

| File | Purpose |
|------|---------|
| `src/lib/routes.ts` | Centralized route config — single source of truth |
| `src/components/Breadcrumbs.tsx` | Visual breadcrumb component (semantic HTML, aria-labels) |
| `src/components/MobileNav.tsx` | Mobile hamburger navigation |
| `src/app/not-found.tsx` | Custom 404 page with navigation links |
| `src/app/error.tsx` | Error boundary with retry + help links |
| `src/app/pricing/page.tsx` | Pricing page (4 tiers from CONTEXT.md) |
| `src/app/features/page.tsx` | Features page (6 feature cards) |
| `src/app/faq/page.tsx` + `FaqContent.tsx` | FAQ page (3 categories, accordion) |
| `src/app/help-center/page.tsx` | Help Center (4 category cards) |

## Modified Files (15)

| File | Change |
|------|--------|
| `src/lib/site.ts` | Imports route groups from `routes.ts` (single source of truth) |
| `src/components/Header.tsx` | 5 nav links + active route styling + mobile nav integration |
| `src/components/Footer.tsx` | 4-column restructure: Product/Company/Resources (with legal) |
| `src/app/about/page.tsx` | Breadcrumbs + breadcrumbLd JSON-LD + Features CTA |
| `src/app/contact/page.tsx` | Breadcrumbs + breadcrumbLd JSON-LD + FAQ link |
| `src/app/sign-in/page.tsx` | Breadcrumbs + breadcrumbLd JSON-LD |
| `src/app/privacy/page.tsx` | Breadcrumbs + breadcrumbLd + Home link |
| `src/app/terms/page.tsx` | Breadcrumbs + breadcrumbLd + Home link |
| `src/app/cookies/page.tsx` | Breadcrumbs + breadcrumbLd + Home link |
| `src/app/disclaimer/page.tsx` | Breadcrumbs + breadcrumbLd + Home link |
| `src/app/keywords/page.tsx` | Visual Breadcrumbs component |
| `src/app/keywords/[slug]/KeywordDetailContent.tsx` | Breadcrumbs + contextual links to category/keywords |
| `src/app/categories/page.tsx` | Visual Breadcrumbs + API docs link |
| `src/app/categories/[slug]/CategoryContent.tsx` | Breadcrumbs + contextual links |
| `src/app/api-docs/ApiDocsContent.tsx` | Breadcrumbs + pricing/help center links |
| `src/app/HomeContent.tsx` | Pricing CTA + FAQ/Features links |

## Routes That Still Need Real Content Later

- `/pricing` — Tier cards are from CONTEXT.md but actual Stripe/payment integration is not connected
- `/features` — Feature descriptions are real but could be expanded with screenshots
- `/faq` — FAQ content is real but could be expanded with more Q&A
- `/help-center` — Help categories link to existing pages but could have dedicated articles

## Verification

- `npm run type-check` — passes
- `npm run build` — passes, all 20 routes generated
- No orphaned pages — all 18 routes reachable from home in ≤3 clicks
- Sitemap includes all 9 public routes + 6 legal routes + dynamic keywords/categories

## Key Learnings

1. **Route config as single source of truth** (Hard Rule #6) — Header, Footer, Breadcrumbs, Sitemap all consume from `src/lib/routes.ts`. Adding a route later means adding it in one place.
2. **TypeScript `as const` vs explicit interface** — `as const` on the routes object made optional properties (`shortLabel`, `description`) not accessible via union types. Switching to `Record<string, RouteDef>` with explicit `RouteDef` interface solved it cleanly.
3. **Server + Client component split** — FAQ page needed `'use client'` for accordion state, so the page.tsx (server component with metadata) renders `<FaqContent />` (client component). This pattern should be used for all interactive pages.
4. **Placeholder pages need real content** (Hard Rule #4) — Every placeholder page has real copy, real links, real metadata. No `// TODO` stubs.