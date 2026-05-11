# SEO Trust Architecture - Technical Plan

## GODMYTHOS Routing

- Mode: LARGE `PLAN` for a coordinated multi-file SEO, structured data, trust, legal, and consent layer.
- Source prompt: `seo-enhancement-prompt.txt`.
- Skill source: `godmythos-v10.2/SKILL.md`.
- Recon exception: `graphify .` was required by Hard Rule #14, but the CLI is not installed in this shell. Targeted recon was used against the Next.js frontend, project summary, footer, layout, route files, and existing domain context.
- Confidence: HIGH for frontend execution once the canonical site URL is known; MEDIUM for exact legal/vendor wording because production analytics, payments, auth, hosting, and tracking vendors must be verified from environment/deploy configuration before final copy is treated as business-approved.

## Current State

- Frontend app: `leanforge-frontend`, Next.js 14 App Router, React 18, Tailwind CSS.
- Existing public routes: `/`, `/keywords`, `/keywords/[slug]`, `/categories`, `/categories/[slug]`, `/api-docs`.
- Existing root metadata is generic in `leanforge-frontend/src/app/layout.tsx`.
- Existing footer has placeholder `#` links for Contact, Privacy, and Terms.
- No visible `sitemap.ts`, `robots.ts`, canonical metadata helper, JSON-LD helper, cookie consent component, About page, Privacy page, Terms page, Cookie Policy page, or Disclaimer page.
- Project identity currently uses LeanForge as product/site name and cross-sells SEO AI Regent.
- Required business identity from prompt: Developer312, subsidiary of NIGHT LITE USA LLC, `hello@developer312.com`, `(510) 401-1225`, `tel:+15104011225`.
- Existing domain glossary is in `keyword-trend-api/CONTEXT.md`; there is no root `CONTEXT.md`.

## Architecture Decision

Implement the SEO/trust layer in `leanforge-frontend` using App Router-native metadata APIs, small centralized constants, and reusable structured-data helpers.

Primary choice:
- Create a central SEO/business configuration module under `leanforge-frontend/src/lib/`.
- Convert indexable page modules to server components where metadata or static legal copy is needed.
- Isolate client-only data fetching into child components when dynamic pages need `generateMetadata`.
- Add route-native `sitemap.ts` and `robots.ts`.
- Add JSON-LD via a small server-rendered component that outputs `application/ld+json`.
- Add a client cookie-consent banner that stores consent and provides first-layer accept/reject controls.

Rejected alternatives:
- Keep every page as a client component and inject SEO from client state. Rejected because crawlers and social previews need server-rendered metadata.
- Add a third-party consent/SEO package. Rejected unless a later vendor review requires it; the current requirements can be met without new dependency risk.
- Generate legal pages as hidden or noindex documents. Rejected because the prompt requires real, easy-to-find, indexable trust pages.

ADR gate:
- No ADR needed yet. The decision is reversible, follows Next.js conventions, and is unsurprising for App Router SEO work.

## Execution Prerequisites

1. Confirm canonical production URL. If unavailable, use a single environment-backed fallback such as `NEXT_PUBLIC_SITE_URL`.
2. Verify whether the frontend uses analytics, marketing pixels, auth, payments, email, support chat, or other processors. If unknown after code/env inspection, legal copy must say "we may use" only where appropriate or include explicit review placeholders.
3. Decide whether root `CONTEXT.md` should be created or whether `keyword-trend-api/CONTEXT.md` remains the domain source. GODMYTHOS prefers root `CONTEXT.md` for this monorepo-like workspace.
4. Confirm whether Developer312 is the publisher/legal operator while LeanForge remains the product brand. Default assumption: LeanForge is the product/site; Developer312 is the business/operator.

## Vertical Slices

### Slice 1 - SEO Configuration Spine

Type: AFK  
Blocked by: Canonical URL assumption or `NEXT_PUBLIC_SITE_URL` fallback.

What to build:
- Add `src/lib/site.ts` or equivalent with product identity, business identity, canonical URL helper, public route list, contact links, social image defaults, and legal route labels.
- Add `src/lib/seo.ts` with metadata-builder helpers for titles, descriptions, canonical alternates, Open Graph, and Twitter cards.
- Add `src/components/JsonLd.tsx` or equivalent to render safe JSON-LD.

Acceptance criteria:
- All business identity values exist in one source of truth.
- Metadata helpers support page-specific title, description, pathname, image, noindex flag if ever needed, and canonical URL.
- No raw duplicate Developer312 contact blocks are introduced outside legal/content components.
- `npm run type-check` passes from `leanforge-frontend`.

Validation:
- `npm run type-check`
- `npm run lint`

### Slice 2 - Global Layout, Footer, and Trust Navigation

Type: AFK  
Blocked by: Slice 1.

What to build:
- Update `layout.tsx` with metadata base, default template title, canonical-capable defaults, Open Graph, Twitter metadata, and baseline Organization/WebSite JSON-LD.
- Replace footer placeholder links with working routes: `/about`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/disclaimer`.
- Include the required footer identity block and trust line.
- Add About and Contact links to internal navigation where appropriate without crowding the header.

Acceptance criteria:
- Site-wide footer includes current year, Developer312, subsidiary note, email mailto link, phone tel link, legal links, and trust line.
- Footer has no `href="#"` placeholders.
- Header/footer navigation remains accessible and responsive.
- Organization and WebSite JSON-LD include canonical site URL, name, email, telephone, contact point, and parent organization reference or legal note.

Validation:
- `rg "href=\"#\"|href=''" leanforge-frontend/src`
- `npm run type-check`
- `npm run lint`

### Slice 3 - Required Trust and Legal Pages

Type: AFK with HITL review for final legal approval  
Blocked by: Slices 1 and 2.

What to build:
- Add `/about`, `/contact`, `/privacy`, `/terms`, `/cookies`, and `/disclaimer`.
- Use server components with page-specific metadata.
- Add AboutPage JSON-LD to `/about` and ContactPage JSON-LD to `/contact`.
- Include business identity consistently on About and Contact.
- Draft legal pages clearly for a SaaS/API keyword intelligence product. Mark copy as business/legal draft when vendor specifics cannot be verified.

Acceptance criteria:
- Each page has exactly one meaningful H1.
- Each page has unique title and meta description.
- Each legal/trust page links to related legal pages where useful.
- Disclaimer exists because the product provides SEO scores, trend forecasts, recommendations, and informational guidance.
- Contact page includes email, phone, expected response framing, and a simple contact route. If no backend form endpoint exists, use mailto CTA instead of a nonfunctional form.

Validation:
- `npm run type-check`
- `npm run lint`
- Manual route review in browser or Next build output.

### Slice 4 - Public Page Metadata and Structured Data

Type: AFK  
Blocked by: Slice 1.

What to build:
- Add unique metadata to `/`, `/keywords`, `/categories`, `/api-docs`, `/keywords/[slug]`, and `/categories/[slug]`.
- For client-heavy pages, split page content into client components so the route file can export `metadata` or `generateMetadata`.
- Add WebPage JSON-LD to major public pages.
- Add BreadcrumbList JSON-LD to nested routes where hierarchy is clear.
- Add SoftwareApplication schema to the homepage or product/API page only where visible content supports it.
- Add FAQPage schema only if a visible FAQ section is added; otherwise skip it.
- Do not add Review or AggregateRating schema.

Acceptance criteria:
- Every indexable route has unique `<title>`, meta description, canonical URL, OG tags, and Twitter tags.
- Dynamic keyword/category pages generate metadata from slug and, where possible, from API data. If runtime API fetch is unreliable at build time, metadata uses slug-derived fallback copy and canonical URL.
- Structured data matches visible page content.
- No fake ratings, testimonials, certifications, or compliance claims.

Validation:
- `npm run type-check`
- `npm run lint`
- Inspect rendered HTML for one H1 and JSON-LD script blocks.

### Slice 5 - Sitemap, Robots, and Crawlability

Type: AFK  
Blocked by: Slice 1 and route inventory.

What to build:
- Add App Router `sitemap.ts` with static public routes and dynamic keyword/category routes if available from the API or a local static list.
- Add App Router `robots.ts` with sensible allow rules and sitemap URL.
- Ensure legal pages are indexable.
- Add internal links from homepage to About and Contact, and from product/signup/payment-like CTAs to Privacy/Terms where relevant.

Acceptance criteria:
- `/sitemap.xml` renders with canonical absolute URLs.
- `/robots.txt` renders and references sitemap.
- Sitemap includes homepage, product/content pages, trust/legal pages, and feasible dynamic pages.
- Internal links use descriptive anchor text.

Validation:
- `npm run build`
- Local route check for `/sitemap.xml` and `/robots.txt`.

### Slice 6 - Cookie Consent Flow

Type: AFK with HITL review if analytics/marketing vendors are later added  
Blocked by: Slice 3 Cookie Policy.

What to build:
- Add a `CookieConsent` client component mounted in `layout.tsx`.
- Store user choice in localStorage or a first-party cookie.
- First layer includes Accept, Reject, and Manage/Preferences.
- Link to Privacy Policy and Cookie Policy.
- Ensure no non-essential analytics/marketing scripts run before consent. If no such scripts exist, document that the consent layer is ready and only essential cookies are currently used.

Acceptance criteria:
- Banner appears until a choice is stored.
- Reject is equally accessible as Accept.
- Consent copy avoids dark patterns.
- Component does not break hydration.
- Policy page describes current categories and how to change consent.

Validation:
- `npm run type-check`
- Browser smoke test: accept, reject, clear storage, reload.

### Slice 7 - Verification, Review, and Compound Artifact

Type: AFK  
Blocked by: Slices 1-6.

What to build:
- Run final build, lint, and type checks.
- Perform code review pass: correctness, readability, performance, security/privacy.
- Produce execution trace for all slices.
- Save a learning artifact to `docs/knowledge/seo-trust-architecture.md`.
- Update root `CONTEXT.md` or add a `CONTEXT-MAP.md` only if governance is approved during execution.

Acceptance criteria:
- `npm run build` passes.
- `npm run type-check` passes.
- `npm run lint` passes or any Next lint setup issue is documented with a concrete fix.
- No placeholder legal links, fake schema, broken internal routes, or duplicate H1s.
- Execution trace records each slice terminal state.

Validation:
- `npm run build`
- `npm run type-check`
- `npm run lint`
- `rg "TODO|not implemented|href=\"#\"|fake|placeholder" leanforge-frontend/src`

## Implementation Order

1. Slice 1: SEO configuration spine.
2. Slice 2: layout/footer/trust navigation.
3. Slice 3: required trust and legal pages.
4. Slice 4: metadata and structured data for existing public pages.
5. Slice 5: sitemap, robots, crawlability, internal links.
6. Slice 6: cookie consent flow.
7. Slice 7: verification, review, and compound artifact.

## File Impact Forecast

Expected new files:
- `leanforge-frontend/src/lib/site.ts`
- `leanforge-frontend/src/lib/seo.ts`
- `leanforge-frontend/src/components/JsonLd.tsx`
- `leanforge-frontend/src/components/CookieConsent.tsx`
- `leanforge-frontend/src/app/about/page.tsx`
- `leanforge-frontend/src/app/contact/page.tsx`
- `leanforge-frontend/src/app/privacy/page.tsx`
- `leanforge-frontend/src/app/terms/page.tsx`
- `leanforge-frontend/src/app/cookies/page.tsx`
- `leanforge-frontend/src/app/disclaimer/page.tsx`
- `leanforge-frontend/src/app/sitemap.ts`
- `leanforge-frontend/src/app/robots.ts`
- Optional client extraction files under existing route directories.

Expected changed files:
- `leanforge-frontend/src/app/layout.tsx`
- `leanforge-frontend/src/app/page.tsx`
- `leanforge-frontend/src/app/keywords/page.tsx`
- `leanforge-frontend/src/app/keywords/[slug]/page.tsx`
- `leanforge-frontend/src/app/categories/page.tsx`
- `leanforge-frontend/src/app/categories/[slug]/page.tsx`
- `leanforge-frontend/src/app/api-docs/page.tsx`
- `leanforge-frontend/src/components/Footer.tsx`
- `leanforge-frontend/src/components/Header.tsx`
- `leanforge-frontend/src/app/globals.css` only if consent component needs small utility styling not expressible through Tailwind.

## Definition of Done

- Required pages exist and are reachable through footer navigation.
- Business identity is consistent across footer, Contact/About, legal pages, and Organization JSON-LD.
- Every public indexable route has unique metadata, canonical URL, Open Graph, and Twitter metadata.
- JSON-LD is accurate and limited to visible/applicable content.
- Cookie consent flow exists and blocks non-essential scripts if any are present.
- `/sitemap.xml` and `/robots.txt` work.
- No fake ratings, fake testimonials, fake certifications, or invented compliance claims.
- Build/type/lint verification is run and results are recorded.
- GODMYTHOS execution trace and compound learning artifact are produced after WORK.

## Open Questions

1. What is the canonical production URL for LeanForge Keyword Trend Index?
2. Should the legal operator be shown as Developer312 everywhere, with LeanForge as product brand, or should the public brand become Developer312?
3. Are analytics, marketing pixels, auth providers, payments, email tools, support chat, or hosting vendors already configured outside this local codebase?
4. Should a root `CONTEXT.md` be created now for GODMYTHOS governance, or should the existing `keyword-trend-api/CONTEXT.md` remain the only context artifact for this workspace?

## Document Review Verdict

PASS WITH NOTES.

The plan is executable and vertically sliced. The only caveats are canonical URL and legal/vendor facts; those are isolated as prerequisites and do not block implementation if environment-backed fallbacks and draft legal language are acceptable.
