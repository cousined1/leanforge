# Upskill SaaS Integration
## GODMYTHOS v10 Reference

> Governs `SAAS_BUILD` and `SAAS_AUDIT` work modes.
> Load this file when: building a SaaS product, auditing an existing SaaS app,
> or any task where a named third-party SaaS service integration is required.
>
> **Architecture:** upskill provides the domain-specific playbook layer.
> GODMYTHOS Hard Rules #1–#18 govern everything the agent executes.
> Hard Rules win all conflicts with upskill output.

---

## One-time setup (OpenCode on Javante / Talisha)

```bash
npm install -g @autoloops/upskill
upskill install
# Answer: telemetry=off, local context=off, submissions=off, scope=verified
```

Verify:

```bash
upskill find "saas build" --limit 3
```

---

## §SAAS_BUILD

**Invoke when:** building a new SaaS product, adding a major SaaS feature (auth,
billing, multi-tenancy, onboarding), or scaffolding a SaaS greenfield from scratch.

**Trigger signals:** "build a saas", "saas app", "subscription product", "stripe
integration", "auth flow", "multi-tenant", "onboarding flow", "pricing page",
"customer portal", any greenfield with clear subscription or user-account shape.

### Entry protocol

**Step 1 — Registry lookup (mandatory, before any build work):**

```bash
# Identify the domain from the task. Examples:
upskill find "saas stripe billing" --limit 3
upskill find "saas auth clerk nextjs" --limit 3
upskill find "saas onboarding flow" --limit 3
upskill find "saas multi-tenant postgres" --limit 3
```

Run the query that most precisely names the SaaS domain at hand.

**Step 2 — Inspect top result:**

```bash
upskill inspect <skill-id-from-step-1>
```

Read the full playbook. Extract:
- Required libraries / versions
- API patterns (auth headers, idempotency keys, webhook signatures, etc.)
- Edge cases the playbook explicitly calls out
- Anything the playbook says NOT to do

**Step 3 — Reconcile with GODMYTHOS doctrine:**

| upskill says | GODMYTHOS says | Resolution |
|---|---|---|
| Use library X | Conflicts with Hard Rule #6 (one source of truth) | Flag conflict, pick the non-duplicating option, document in ADR |
| Skip error handling for brevity | Violates Hard Rule #3 (test before claiming it works) | Follow GODMYTHOS — upskill brevity is never a reason to omit validation |
| Stub the integration for now | Violates Hard Rule #4 (no stubs in production paths) | Implement real integration or feature-flag explicitly |
| Any recommendation | No conflict | Follow it as the domain baseline |

**Step 4 — Execute under GODMYTHOS GREENFIELD or EXECUTION mode:**

Continue with the standard GODMYTHOS flow, using the upskill playbook as the
domain knowledge layer. The upskill skill defines *what* to build in this
domain; GODMYTHOS governs *how* to build it.

- Apply Hard Rules #1–#18 throughout
- CI Gate 2 (type-check) and Gate 3 (test) mandatory before any integration
  is marked complete
- Compound learnings at cycle end: note any upskill guidance that proved
  wrong or outdated in `docs/knowledge/upskill-saas-learnings.md`

### SaaS domain query map

| Building | Query |
|---|---|
| Stripe billing + subscriptions | `upskill find "stripe subscriptions saas"` |
| Stripe webhooks | `upskill find "stripe webhooks implementation"` |
| Clerk / Auth0 / NextAuth auth | `upskill find "saas auth <provider>"` |
| Multi-tenant data isolation | `upskill find "saas multi-tenant postgres row-level-security"` |
| Customer onboarding | `upskill find "saas onboarding flow"` |
| Feature flags | `upskill find "feature flags saas"` |
| Email (Resend / SendGrid) | `upskill find "transactional email saas <provider>"` |
| Usage-based billing | `upskill find "usage based billing stripe metered"` |
| Customer portal | `upskill find "stripe customer portal"` |
| RBAC / permissions | `upskill find "saas rbac permissions"` |

---

## §SAAS_AUDIT

**Invoke when:** auditing an existing SaaS app for production readiness,
security, architecture quality, billing integrity, or pre-launch review.

**Trigger signals:** "audit my saas", "production readiness", "review this app",
"is this production-ready", "security audit", "code review" on a SaaS codebase,
"find what's broken before launch".

### Entry protocol

**Step 1 — Registry lookup (mandatory, before any audit work):**

```bash
upskill find "saas production readiness audit" --limit 3
upskill find "saas security checklist" --limit 3
upskill find "stripe integration audit" --limit 3   # if billing is in scope
upskill find "saas auth security audit" --limit 3   # if auth is in scope
```

Run all queries relevant to the app's domain. Inspect each result.

**Step 2 — Compose the audit scope from upskill + GODMYTHOS layers:**

The audit runs on two parallel tracks:

| Track | Source | Governs |
|---|---|---|
| **Domain checklist** | upskill playbooks (fetched above) | Stripe edge cases, auth patterns, provider-specific gotchas |
| **Engineering doctrine** | GODMYTHOS `references/security-checklist.md` + CI Gates | Hard Rules, OWASP/CMMC/NIST, no-stubs, source-of-truth |

Both tracks must pass. A clean upskill checklist does not clear a GODMYTHOS
security gate violation. A passing GODMYTHOS CI gate does not excuse a
Stripe webhook signature being skipped.

**Step 3 — Four-pass audit (extends GODMYTHOS CODE_REVIEW protocol):**

**Pass 1 — Domain integrity (upskill layer):**
Walk each upskill-sourced checklist item. For each:
- ✅ Implemented correctly
- ⚠️ Implemented but deviated from playbook (document why)
- ❌ Missing or wrong (file as issue with label `ready-for-agent`)

**Pass 2 — Security gate (GODMYTHOS layer):**
Load `references/security-checklist.md`. Run the full checklist.
Flag any OWASP Top 10 exposure. Flag any auth surface without rate limiting.
Flag any secret not in env vars.

**Pass 3 — Hard Rule compliance:**
Walk Hard Rules #1–#18. File a violation for each rule broken.
No rationalization — violations are findings, not discussions.

**Pass 4 — Production readiness:**
```
□ All CI Gates 1–6 passing on main?
□ No TODOs/stubs in production paths (Hard Rule #4)?
□ Error boundaries present at all external API call sites?
□ Webhook signatures verified (if any webhooks)?
□ Idempotency keys on all payment calls?
□ Rate limits on all auth endpoints?
□ Secrets in env vars, not hardcoded?
□ CONTEXT.md exists and reflects actual domain model?
□ At least one ADR for each major architectural decision?
□ Observability: logs, error tracking, alerting configured?
```

**Step 4 — Audit report (GODMYTHOS REPORTING DOCTRINE):**

Output format:

```markdown
# SaaS Audit Report — <project name>
Date: <ISO date>
Auditor: GODMYTHOS v10 + upskill registry

## Summary
<3-sentence executive summary: overall health, critical count, recommendation>

## Critical findings (block launch)
<numbered list — each with file:line, rule/checklist violated, fix required>

## Warnings (fix before scale)
<numbered list>

## Passes
<what is working correctly — be specific>

## upskill sources used
<list the skill IDs inspected — for reproducibility>

## Compound learnings
<anything to record in docs/knowledge/upskill-saas-learnings.md>
```

---

## Conflict resolution

When upskill output conflicts with GODMYTHOS doctrine, apply this order:

1. **Hard Rules #1–#18** — absolute, no override
2. **GODMYTHOS CI Gates** — absolute, no override
3. **upskill verified skills** — follow unless conflicts with 1 or 2
4. **upskill community skills** — use as reference only; verify before following
5. **upskill-absent domains** — fall back to GODMYTHOS GREENFIELD defaults

If an upskill playbook is outdated (e.g., references a deprecated API version),
note it in `docs/knowledge/upskill-saas-learnings.md` with the corrected pattern.
This feeds future COMPOUND cycles.

---

## Compound learnings file

Path: `docs/knowledge/upskill-saas-learnings.md`

Append after every SAAS_BUILD or SAAS_AUDIT cycle:

```markdown
---
date: <ISO>
mode: SAAS_BUILD | SAAS_AUDIT
skill_used: <upskill skill ID>
finding: <one sentence>
action: followed | deviated | corrected
correction: <if deviated — what was right>
---
```

This file is the long-term institutional memory of where upskill guidance
helped, where it was wrong, and what the correct pattern turned out to be.
