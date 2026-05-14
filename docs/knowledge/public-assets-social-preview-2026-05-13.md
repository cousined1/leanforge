---
type: knowledge
tags: [frontend, branding, seo, social-preview, launch-readiness]
confidence: high
created: 2026-05-13
source: MVP-Audit.txt
---

# Public Asset Remediation (Favicon + OG Image)

This pass closed the public-asset gap by adding required browser and social
preview files to the frontend public directory.

Added files:
- leanforge-frontend/public/favicon.svg
- leanforge-frontend/public/favicon.ico
- leanforge-frontend/public/og-image.png (1200x630)
- leanforge-frontend/public/apple-touch-icon.png

Result:
- Metadata image references now resolve to an existing OG image file.
- Browser tab and bookmark icon assets exist for modern browsers and iOS.
- Frontend production build succeeds with the new assets.

Implementation note:
- Generated PNG/ICO assets were produced with a deterministic local script,
  avoiding placeholder links or missing-file references in production.
