# Knowledge base

Compound learnings from completed work cycles live here as
`{slug}.md` files.

**Hard Rule #11:** every WORK cycle produces at least one artifact in
this directory. "Nothing to document" is not accepted — one sentence
minimum.

**Format:**

```markdown
---
type: {bug-postmortem | architecture-note | pattern | benchmark | constraint}
tags: [tag1, tag2]
confidence: {HIGH | MEDIUM | LOW}
created: YYYY-MM-DD
source: {commit-sha or PR link}
supersedes: {prior-artifact-slug}  # only if updating earlier learning
---

# {One-line summary}

{Body — context, finding, evidence, takeaway. As long as needed, no longer.}
```

**When `graphify` is installed:** these files are ingested into the
knowledge graph on every rebuild. Past learnings become nodes the agent
can query before the next planning cycle. This is the compound layer's
compounding interest.

See `docs/agents/domain.md` for full details and type guidelines.
