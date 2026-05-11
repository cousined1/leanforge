---
type: pattern
tags: [analytics, gtm, consent, nextjs]
confidence: high
created: 2026-05-10
source: "google-tag-manager-readiness - trace: [steps 1-6: COMPLETED] outcome: SUCCESS_WITH_EXISTING_TOOLING_GAPS"
supersedes: null
---

# Consent-Gated GTM in LeanForge

LeanForge loads Google Tag Manager only after a visitor accepts analytics consent. The reusable analytics module owns `dataLayer` writes, and App Router route changes are tracked by the app as `page_view` events. GA4 enhanced measurement for browser history changes should be disabled when this layer is active, or route changes can double count.
