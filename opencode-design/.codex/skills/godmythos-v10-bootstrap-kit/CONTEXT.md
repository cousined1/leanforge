# {Project Name}

{One or two sentence description of what this project is and why it exists.
Written for someone who's never seen this repo before.}

> This file is the canonical domain glossary. It is **Hard Rule #15** that
> every artifact (tests, issues, PRDs, ADRs, code identifiers where natural)
> uses this vocabulary. Update this file inline when terms are sharpened —
> don't batch.

---

## Language

**{Term}**:
{One sentence defining what this IS. Not what it does — what it is.}
_Avoid_: {alternative names that should NOT be used for this concept}

**{Term}**:
{Definition.}
_Avoid_: {aliases to avoid}

**{Term}**:
{Definition.}
_Avoid_: {aliases to avoid}

---

## Relationships

{State the meaningful relationships between domain terms. One bullet per
relationship. Use the canonical names above.}

- A **{Term}** has many **{Other Terms}**
- An **{Term}** belongs to exactly one **{Other Term}**
- A **{Term}** is created when {trigger event}
- A **{Term}** transitions through states: {state} → {state} → {state}

---

## Flagged ambiguities

{Track terminology that was previously fuzzy and how it was resolved.
Helps future contributors (and agents) avoid re-introducing the
ambiguity.}

- "{ambiguous-word}" was used to mean both **{Term1}** and **{Term2}** —
  resolved: these are distinct concepts. {Term1} refers to {scope};
  {Term2} refers to {scope}.

---

## Notes

{Optional. Anything else about the domain that doesn't fit above. Keep
brief — link to longer docs (PRDs, ADRs) when needed rather than
duplicating them here.}

---

*Rules:*
- *One sentence per term, max. Define what it IS, not what it does.*
- *Be opinionated about aliases — pick the canonical term, list what to avoid.*
- *Only include terms meaningful to domain experts. Skip generic programming concepts and module/class names unless they have domain meaning.*
- *Group into multiple `## Language` blocks (e.g., `## Order lifecycle`, `## People`) for >10 terms.*
- *Don't couple to implementation. CONTEXT.md is the* what, *not the* how.
