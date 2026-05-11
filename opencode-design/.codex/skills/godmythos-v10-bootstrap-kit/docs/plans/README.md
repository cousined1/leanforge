# Technical plans

Plans for MEDIUM and LARGE scope work live here as
`{feature-slug}.md`.

**The plan is the source of truth during EXECUTION.** It is produced
during the PLAN phase (after BRAINSTORM, after CONFIDENCE_GATE), reviewed
in DOCUMENT_REVIEW, then carried unchanged through WORK. Execution does
not re-scope the plan; if the plan needs to change mid-execution, that's
a re-entry to PLAN, not a quiet drift.

**Format (recommended structure — adapt as needed):**

```markdown
---
slug: {feature-slug}
status: {draft | approved | in-progress | completed | superseded}
created: YYYY-MM-DD
confidence: {HIGH | MEDIUM | LOW}
---

# {Feature name}

## Context

{Why this work is happening. What problem it solves. Use CONTEXT.md
vocabulary.}

## Goal

{What done looks like. User-facing outcome.}

## Constraints

{What MUST be true / MUST NOT change. ADRs in scope.}

## Approach

{Technical approach. Module changes. Schema changes. API contracts.
Architectural decisions taken.}

## Vertical slices

{Tracer-bullet decomposition (Hard Rule #17). Each slice end-to-end,
AFK or HITL labeled.}

1. **{Slice name}** — {AFK | HITL} — {one-line description}
2. **{Slice name}** — {AFK | HITL} — {one-line description}
3. ...

## Risks

{What could go wrong. Mitigation strategy.}

## Out of scope

{What this plan does NOT do.}

## Open questions

{Questions still to resolve, with default answers if none.}
```

After completion, plans stay here as historical artifacts. They're useful
for compound learning and for new contributors trying to understand
*why* things look the way they do.
