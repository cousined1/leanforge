---
type: pattern
tags: [auth, insforge, oauth, nextjs]
confidence: high
created: 2026-05-10
source: "social-login - trace: [steps 1-6: COMPLETED] outcome: SUCCESS_WITH_LINT_SETUP_GAP"
supersedes: null
---

# InsForge OAuth in LeanForge

LeanForge should use the browser-side `@insforge/sdk` OAuth flow for social login unless SSR-only auth becomes a product requirement. The frontend callback route is the app landing page for `insforge_code`; provider callbacks belong to the InsForge backend. Social buttons should be shown only when `getPublicAuthConfig().oAuthProviders` includes the provider.
