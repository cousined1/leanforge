---
type: knowledge
tags: [production-audit, security-headers, cors, dependency-audit, leanforge]
confidence: high
created: 2026-05-10
source: docs/plans/production-audit-execution.md
---

# Production Audit Hardening

LeanForge is currently in pre-deploy mode: `lean-forge.net` is the intended
production domain, but live DNS/TLS/header checks are not authoritative until
the app is deployed.

Production-readiness checks should separate code-verifiable controls from
runtime-verifiable controls. Code-verifiable controls include build, lint,
type-check, dependency audit, security header config, CORS allowlist config,
robots/sitemap routes, legal/trust pages, and consent-gated analytics wiring.
Runtime-verifiable controls include delivered CDN headers, OAuth callback
registration, TLS/HSTS behavior, Lighthouse scores, GTM network behavior after
consent, and backend environment variable correctness.

For the API, production CORS should be domain-driven instead of hard-coded to a
previous project. `FRONTEND_URL` is the default allowed origin, and
`CORS_ORIGINS` can override it with a comma-separated allowlist. Localhost
origins should remain development-only.

For backend deploys, avoid shipping source maps unless there is a clear
operational reason and private artifact handling is in place. The API build
now disables `sourceMap` and `declarationMap` in `tsconfig.json`.
