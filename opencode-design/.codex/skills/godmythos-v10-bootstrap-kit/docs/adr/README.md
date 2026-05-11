# Architectural Decision Records

ADRs live in this directory as `NNNN-slug.md`, numbered sequentially.

**Three-test gate (Hard Rule #16):** create an ADR only when ALL three are
true:

1. **Hard to reverse** — meaningful cost to changing your mind later
2. **Surprising without context** — future reader asks "why on earth did
   they do it this way?"
3. **Real trade-off** — there were genuine alternatives

If any test fails, skip the ADR.

**Numbering:** scan this directory for the highest existing number,
increment, zero-pad to 4 digits.

**Format (minimum):**

```markdown
# {Short title of the decision}

{1–3 sentences: what's the context, what did we decide, and why.}
```

That's it. Most ADRs are a single paragraph. The value is recording
*that* a decision was made and *why* — not filling out sections.

Add optional sections (**Status**, **Considered Options**,
**Consequences**) only when they add genuine value.

See `docs/agents/domain.md` for full details.
