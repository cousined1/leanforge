# Google Tag Manager Readiness - Execution Trace

## Routing

- Mode: MEDIUM `WORK` under GODMYTHOS v10.2.
- Source prompt: `Google-tag-manager-prompt.txt`.
- Recon exception: `graphify .` was required by Hard Rule #14, but the CLI is not installed in this shell. Targeted recon was used against the Next.js App Router layout, cookie consent component, policy pages, README, and existing analytics references.
- Confidence: HIGH. The app is a Next.js 14 App Router SPA-like frontend with an existing consent banner and root layout.

## Pageview Ownership

The app owns pageviews. `GoogleTagManager` listens to App Router pathname and search-param changes and pushes a single `page_view` event to `dataLayer` per route transition after consent. GA4/GTM enhanced measurement for browser history changes should be disabled to avoid duplicate virtual pageviews.

## Execution Trace

```yaml
execution_trace:
  - step: 1
    label: "Create analytics module"
    state: COMPLETED
    checkpoint: true
    validation: "src/lib/analytics.ts exports initAnalytics, trackPageView, trackEvent, and ecommerce/signup example helpers"
  - step: 2
    label: "Add consent-gated GTM runtime"
    state: COMPLETED
    checkpoint: true
    validation: "src/components/GoogleTagManager.tsx loads GTM only when NEXT_PUBLIC_GTM_ID exists, environment is enabled, and consent is accepted"
  - step: 3
    label: "Wire root layout"
    state: COMPLETED
    checkpoint: false
    validation: "GTM runtime mounted in app/layout.tsx"
  - step: 4
    label: "Connect cookie consent to analytics gate"
    state: COMPLETED
    checkpoint: false
    validation: "CookieConsent writes shared consent key and dispatches consent-change event"
  - step: 5
    label: "Update env docs and policy copy"
    state: COMPLETED
    checkpoint: false
    validation: "README, .env.example, Privacy Policy, and Cookie Policy updated"
  - step: 6
    label: "Validate"
    state: COMPLETED
    checkpoint: false
    validation: "npm run build passed; npx tsc --noEmit passed; npm run lint blocked by existing interactive ESLint setup; npm audit has existing high advisories in Next/ESLint chains"
outcome: SUCCESS_WITH_EXISTING_TOOLING_GAPS
```

## Validation

- `npm.cmd run build`: passed.
- `npx.cmd tsc --noEmit`: passed.
- `rg "Plausible|TODO|not implemented|href=\"#\"|href='#'" leanforge-frontend/src leanforge-frontend/README.md -n`: no matches.
- `npm.cmd run lint`: blocked by the existing interactive Next.js ESLint setup prompt.
- `npm.cmd audit --audit-level=high`: still reports existing Next/ESLint chain advisories requiring breaking upgrades.

## Operational Follow-Up

Set these frontend environment variables:

- `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX`
- `NEXT_PUBLIC_ANALYTICS_ENABLED=false` in production unless you need to override local/dev behavior; set `true` for local GTM testing.

In GTM/GA4:

- Configure GA4 tags from `dataLayer` events.
- Disable enhanced-measurement browser history pageviews if app-owned `page_view` events are enabled.
- Use Tag Assistant and GA4 DebugView to verify one `page_view` per route transition after consent.
