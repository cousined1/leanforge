---
type: knowledge
tags: [monitoring, sentry, cron, backend-reliability]
confidence: high
created: 2026-05-13
source: MVP-Audit.txt
---

# Monitoring and Alerting Upgrade (Sentry)

This pass added production-ready error telemetry for the keyword API and cron
jobs so failures are visible instead of staying in console logs only.

Implemented:
- Added optional environment-based Sentry configuration via SENTRY_DSN and
  SENTRY_ENVIRONMENT.
- Added startup monitoring initialization with explicit disabled-state logging
  when DSN is missing.
- Added process-level crash capture for uncaughtException and
  unhandledRejection.
- Added Sentry error capture inside trend poller keyword-level failures,
  poller-cycle failures, and daily snapshot-cycle failures.

Operational behavior:
- If SENTRY_DSN is unset, monitoring remains disabled without breaking startup.
- In production with SENTRY_DSN set, cron failures and runtime crashes are
  visible in Sentry with job and phase tags for triage.

Validation:
- keyword-trend-api npm run type-check passed after dependency + code changes.
