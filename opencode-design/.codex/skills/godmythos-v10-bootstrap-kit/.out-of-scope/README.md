# Out of scope

This directory holds rejection rationales for enhancements that have been
considered and decided against.

**Purpose:** prevent the same idea from being re-suggested every quarter.
When an enhancement is closed as `wontfix`, write the rationale here. When
a similar request comes in later, surface the existing rationale during
TRIAGE.

**File naming:** `{slug}.md` where slug is short and descriptive
(`multi-tenancy.md`, `plugin-architecture.md`, `realtime-sync.md`).

**Format:**

```markdown
# {Enhancement title}

## Why we said no

{1–3 paragraphs explaining the reasoning. Reference any ADRs or
constraints that drove the decision.}

## What would change our mind

{Conditions under which this is worth revisiting. E.g., "if we acquire a
team large enough to maintain a plugin API," "if regulatory changes
require multi-tenant isolation."}

## Related

- Original issue: {link}
- Related ADRs: ADR-NNNN, ADR-NNNN
- Date decided: YYYY-MM-DD
```

**During TRIAGE:** read the files in this directory before evaluating any
new enhancement. If the new request resembles an existing rejection,
surface the prior rationale to the maintainer rather than re-litigating.

---

*This README itself is not an out-of-scope record — delete it once you
have real entries, or keep it as documentation. The directory's purpose
is recorded in `docs/agents/domain.md`.*
