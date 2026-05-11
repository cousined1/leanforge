# Domain documentation

> How this repo organizes domain knowledge. Mirrors
> `references/pocockops-doctrine.md` from the godmythos skill.

---

## CONTEXT.md

The canonical glossary lives at the repo root in `CONTEXT.md`.

**Single-context vs multi-context:**

- {This is a single-context repo. The root `CONTEXT.md` covers all domain
  language. Delete this option if multi-context.}
- {This is a multi-context repo. The root `CONTEXT-MAP.md` lists each
  bounded context. Per-context glossaries live alongside the code:
  `src/{context}/CONTEXT.md`. Delete this option if single-context.}

**Update rules:**
- Update `CONTEXT.md` **inline** during conversation when terms are
  sharpened — don't batch.
- Use `CONTEXT.md` vocabulary in every artifact: tests, issue titles,
  PRDs, ADRs, agent briefs, code identifiers where natural.
- Drift into vocabulary that contradicts `CONTEXT.md` is a Hard Rule #15
  violation — flag during code review.

---

## ADRs

Architectural Decision Records live in `docs/adr/NNNN-slug.md`,
sequentially numbered.

**Three-test gate (Hard Rule #16):** create an ADR only when ALL three are
true:

1. **Hard to reverse** — meaningful cost to changing your mind later
2. **Surprising without context** — future reader asks "why on earth did
   they do it this way?"
3. **Real trade-off** — there were genuine alternatives

If any test fails, skip the ADR.

**Format (minimum):**

```markdown
# {Short title}

{1–3 sentences: context, decision, why.}
```

That's it. Most ADRs are a single paragraph. Add **Status**, **Considered
Options**, or **Consequences** sections only when they add genuine value.

**Numbering:** scan `docs/adr/` for the highest existing number, increment,
zero-pad to 4 digits.

---

## When ADRs surface naturally

- Mid-conversation, the user gives a load-bearing reason for rejecting a
  proposal → offer to record it as an ADR
- A `DEEP_MODULE_HUNT` candidate contradicts an existing ADR → only
  surface if friction is real enough to revisit; mark explicitly
- During `GRILL_DOCS`, the user picks one approach over alternatives for
  specific reasons → if all three gates pass, write the ADR right there

---

## Compound learnings

`docs/knowledge/*.md` holds learnings from completed work cycles.

**Format:**

```markdown
---
type: {bug-postmortem | architecture-note | pattern | benchmark | constraint}
tags: [tag1, tag2]
confidence: {HIGH | MEDIUM | LOW}
created: YYYY-MM-DD
source: {commit-sha or PR link}
supersedes: {prior-artifact-slug}  # if updating earlier learning
---

# {One-line summary}

{Body — context, finding, evidence, takeaway.}
```

**Hard Rule #11:** every WORK cycle produces at least one. "Nothing to
document" is not accepted — one sentence minimum.

---

## Out-of-scope

`.out-of-scope/{slug}.md` holds rejection rationales for enhancements
that won't be implemented. Read these during TRIAGE before evaluating
new requests, to avoid re-litigating settled decisions.

**Format:**

```markdown
# {Enhancement title}

## Why we said no

{1–3 paragraphs.}

## What would change our mind

{Conditions under which this is worth revisiting.}

## Related

- Issue: {link to original closed issue}
- Related ADRs: {links}
```

---

## Plans

`docs/plans/{feature-slug}.md` holds technical plans during EXECUTION
phase. The plan is the source of truth — execution does not re-scope it.
Plans become historical artifacts after completion (don't delete; they're
useful for compound learning).
