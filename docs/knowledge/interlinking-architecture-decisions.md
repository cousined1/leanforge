---
type: learning
tags: [interlinking, seo, navigation, architecture, planning]
confidence: high
created: 2025-05-10
source: sitewide-interlinking-plan-session
---

# LeanForge Interlinking Architecture Decisions

## Key Decisions

1. **Route config in `src/lib/routes.ts`** — Single source of truth (Hard Rule #6). All nav, footer, breadcrumbs, sitemap consume from this file. No hardcoded paths.

2. **4 new placeholder pages** — Pricing, Features, FAQ, Help Center. The interlinking prompt explicitly requires these as deliverables. Each has real content matching the existing design system, not stubs.

3. **No dashboard/app sidebar** — LeanForge is currently a public-facing SaaS. Auth exists (InsForge) but only for sign-in/sign-out. No authenticated dashboard pages exist. Dashboard interlinking is out of scope.

4. **Visual breadcrumbs on 16 pages** (excluding home). Using semantic `<nav aria-label="Breadcrumb">` with consistent styling. JSON-LD breadcrumb data already exists on 5 pages — extending to all.

5. **Mobile hamburger nav** — Current header has NO mobile navigation. Adding a slide-out or dropdown mobile menu.

6. **Footer restructured to 4 columns** — Product (5 links), Company (3 links), Resources (2 links), Legal (5 links).

7. **All new links use descriptive anchor text** — Never "click here". Always "View pricing plans", "Browse features", etc.

8. **Tracer-bullet slices** — 12 vertical slices. Each independently deployable. Each tagged AFK (agent can complete without human). Order ensures no broken links (404 page created before pages that link to new routes).