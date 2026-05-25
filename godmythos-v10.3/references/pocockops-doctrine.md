# PocockOps Doctrine

> Layer 3 of the v10 doctrine stack. Synthesized and adapted from Matt
> Pocock's engineering skill set (`mattpocock/skills`) for the founder-
> operator multi-agent context.
>
> Where Compound Engineering says "compound every cycle" and the Knowledge
> Graph says "build the map first," PocockOps says "share the language,
> record the tradeoffs, slice vertically, and feedback-loop your bugs."

This file covers, in order:
- §SETUP — bootstrapping a repo for the doctrine
- §CONTEXT_MD — the canonical domain glossary (Hard Rule #15)
- §ADR — Architectural Decision Records (Hard Rule #16)
- §GRILL — the grilling interview loop
- §TRACER_BULLETS — vertical-slice TDD and issue decomposition (Hard Rule #17)
- §PRD — synthesizing context into a PRD
- §SLICES — breaking a plan into AFK/HITL issues
- §TRIAGE — the bug/enhancement state machine
- §DEEP_MODULES — finding architectural friction
- §ZOOM_OUT — meta-control for unfamiliar areas
- §CAVEMAN — token-pressure mode
- §AGENT_BRIEF — durable handoffs (also see `references/agent-brief.md`)
- §OUT_OF_SCOPE — preventing re-suggestion loops
- §RATIONALE_COMMENTS — extractable inline knowledge
- §GIT_GUARDRAILS — blocking dangerous git operations
- §PRE_COMMIT — Husky / lint-staged / format / typecheck / test

---

## §SETUP — bootstrapping a repo

When you first encounter a repo (or set up a new one), establish these
artifacts:

```
/
├── AGENTS.md             # platform-agnostic agent doctrine entry point
├── CLAUDE.md             # Claude Code-specific (if used)
├── CONTEXT.md            # canonical domain glossary
├── docs/
│   ├── adr/              # Architectural Decision Records (lazy)
│   ├── agents/           # per-repo agent config
│   │   ├── issue-tracker.md
│   │   ├── triage-labels.md
│   │   └── domain.md
│   ├── knowledge/        # compound learnings (Hard Rule #11)
│   └── plans/            # technical plans
├── .out-of-scope/        # rejection knowledge base (lazy)
└── graphify-out/         # knowledge graph (lazy, via graphify hook install)
```

**Multi-context monorepos** add a root `CONTEXT-MAP.md` pointing to per-
context CONTEXT.md files (e.g., `src/ordering/CONTEXT.md`,
`src/billing/CONTEXT.md`).

**Create lazily.** Don't scaffold the whole tree upfront. Each artifact is
created the first time it's needed: `CONTEXT.md` when the first domain term
is sharpened; `docs/adr/` when the first ADR is justified;
`.out-of-scope/` when the first wontfix is filed.

**The `## Agent skills` block** in `AGENTS.md` (or `CLAUDE.md`) tells the
agent where the per-repo config lives:

```markdown
## Agent skills

### Issue tracker
GitHub Issues for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels
Canonical role names map directly to GitHub labels. See `docs/agents/triage-labels.md`.

### Domain docs
Single-context. `CONTEXT.md` at root, ADRs in `docs/adr/`. See `docs/agents/domain.md`.
```

---

## §CONTEXT_MD — the canonical domain glossary

> Hard Rule #15: CONTEXT.md is canonical. Update inline. Use its vocabulary
> in every artifact.

**Format:**

```markdown
# {Project Name}

{One or two sentence description of what this project is and why it exists.}

## Language

**Order**:
A customer's request to purchase one or more items.
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account

## Relationships

- An **Order** produces one or more **Invoices**
- An **Invoice** belongs to exactly one **Customer**

## Flagged ambiguities

- "account" was used to mean both **Customer** and **User** — resolved:
  these are distinct concepts.
```

**Rules:**

- One sentence per term, max. Define what it IS, not what it does.
- Be opinionated about aliases — pick the canonical term, list what to avoid.
- Only include terms meaningful to domain experts. Skip generic programming
  concepts and module/class names unless they have domain meaning.
- Group into multiple `## Language` blocks when natural (`## Order
  lifecycle`, `## People`, etc.) for >10 terms.
- **Don't couple to implementation.** `CONTEXT.md` is the *what*, not the
  *how*. If a term only makes sense to a developer, it doesn't belong.

**When to update:**
- A new domain term is introduced in conversation → add it now, not later
- An existing term is sharpened ("you mean X, not Y") → update its definition
- Two terms collapse into one → record the resolution under "Flagged ambiguities"
- Code refactor renames a domain concept → CONTEXT.md changes too

**Drift detection:** during `CODE_REVIEW`, flag any new identifier or
comment that introduces vocabulary contradicting `CONTEXT.md`. This is a
Hard Rule #15 violation.

---

## §ADR — Architectural Decision Records

> Hard Rule #16: three-test gate. Most decisions don't qualify.

ADRs live in `docs/adr/NNNN-slug.md`, sequentially numbered. Create the
`docs/adr/` directory lazily.

**Three-test gate (ALL three must be true):**

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader looks at the code and
   asks "why on earth did they do it this way?"
3. **Real trade-off** — there were genuine alternatives and you picked one
   for specific reasons

If any test fails, skip the ADR.

**Template (minimum):**

```markdown
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

That's it. Most ADRs are a single paragraph. The value is recording *that*
a decision was made and *why* — not filling out sections.

**Optional sections** (only when they add genuine value):

- **Status frontmatter** (`proposed | accepted | deprecated | superseded by ADR-NNNN`)
  — useful when decisions are revisited
- **Considered Options** — only when the rejected alternatives are worth remembering
- **Consequences** — only when non-obvious downstream effects need to be called out

**Numbering:** scan `docs/adr/` for the highest existing number, increment
by one, zero-pad to 4 digits.

**When ADRs surface during work:**

- Mid-conversation, the user gives a load-bearing reason for rejecting a
  proposal → offer an ADR: *"Want me to record this as an ADR so future
  architecture reviews don't re-suggest it?"*
- A `DEEP_MODULE_HUNT` candidate contradicts an existing ADR → only surface
  the candidate if the friction is real enough to revisit the ADR. Mark it:
  *"contradicts ADR-0007 — but worth reopening because…"*
- During `GRILL_DOCS`, the user picks one approach over alternatives for
  specific reasons → if all three gates pass, write the ADR right there.

---

## §GRILL — the grilling interview loop

> Mode: `GRILL_DOCS`. Trigger: "grill me", "stress test my plan",
> "interview me", LOW confidence on a MEDIUM/LARGE task.

**The pattern:**

> Interview me relentlessly about every aspect of this plan until we reach
> a shared understanding. Walk down each branch of the design tree,
> resolving dependencies between decisions one-by-one. For each question,
> provide your recommended answer.
>
> **Ask the questions one at a time, waiting for feedback on each question
> before continuing.**
>
> **If a question can be answered by exploring the codebase, explore the
> codebase instead.**

This is the v10 implementation of v9's `CONFIDENCE_GATE`. When confidence
is LOW, the gate is the grilling loop.

**During the session:**

- **Challenge against the glossary.** When the user uses a term that
  conflicts with `CONTEXT.md`: *"Your glossary defines 'cancellation' as X,
  but you seem to mean Y — which is it?"*
- **Sharpen fuzzy language.** *"You're saying 'account' — do you mean the
  Customer or the User? Those are different things."*
- **Stress-test with concrete scenarios.** Invent edge cases that probe the
  boundaries between concepts.
- **Cross-reference with code.** If the user states how something works,
  check whether the code agrees. *"Your code cancels entire Orders, but
  you just said partial cancellation is possible — which is right?"*

**Update CONTEXT.md inline** when terms resolve. Don't batch.

**Offer ADRs sparingly** — only when the three-test gate passes.

**Exit condition:** the user says "good," "ship it," or runs out of
substantive answers. At that point you have either: (a) a plan with all
decisions resolved, ready for `PLAN` phase, or (b) a list of unresolved
questions that need a human or external input — surface those explicitly.

---

## §TRACER_BULLETS — vertical-slice discipline

> Hard Rule #17: tracer-bullet vertical slices. Horizontal slicing is a
> Hard Rule violation.

Applies to two activities:

1. **TDD inside a single slice** — RED→GREEN one test at a time
2. **Issue decomposition across a plan** — each issue is a vertical slice

### TDD: one test at a time

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

**Why:** tests written in bulk test *imagined* behavior. You end up testing
the shape (signatures, data structures) instead of user-facing behavior.
You commit to test structure before understanding the implementation. The
tests become insensitive — pass when behavior breaks, fail when behavior
is fine.

**Correct flow per cycle:**

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive an internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```

**Tests test behavior through public interfaces.** A good test reads like a
specification: "user can checkout with valid cart" tells you what
capability exists. Bad tests mock internal collaborators, test private
methods, or assert through external means (querying the DB instead of
using the interface).

**Never refactor while RED.** Get to GREEN first.

### Issue decomposition: every issue is a vertical slice

Each issue cuts through ALL integration layers end-to-end (schema → API →
UI → tests), NOT a horizontal slice of one layer.

**Slice rules:**
- Each slice delivers a narrow but COMPLETE path through every layer
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
- Each slice is labeled **AFK** (agent can complete autonomously) or
  **HITL** (human required for design / access / judgment)
- Prefer AFK over HITL where possible

**AFK signals:** clear acceptance criteria, no external access needed, no
design judgment, no irreversible action without rollback.
**HITL signals:** ambiguous AC requiring human disambiguation, requires
production access, requires aesthetic / strategic call, requires real-user
testing.

---

## §PRD — synthesizing context into a PRD

> Mode: `TO_PRD`. Trigger: "turn this into a PRD", "write a PRD".

**Do NOT interview.** Synthesize what's already in the conversation +
codebase context.

**Process:**

1. Explore the repo (or read `graphify-out/GRAPH_REPORT.md`) to understand
   current state. Use CONTEXT.md vocabulary throughout.
2. Sketch the major modules to build or modify. Actively look for
   opportunities to extract **deep modules** (small interface, deep
   implementation) that can be tested in isolation.
3. Confirm modules with the user. Confirm which modules they want tests for.
4. Write the PRD using the template below. Publish it to the issue tracker
   with the `needs-triage` label so it enters the normal triage flow.

**Template:**

```markdown
## Problem Statement

The problem the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A long, numbered list. Each story:

1. As an <actor>, I want a <feature>, so that <benefit>

## Implementation Decisions

- Modules to build / modify
- Interfaces being modified
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets — they go stale.

## Testing Decisions

- What makes a good test (only test external behavior, not implementation)
- Which modules will be tested
- Prior art for the tests in the codebase

## Out of Scope

What is explicitly NOT in this PRD.

## Further Notes

Anything else.
```

---

## §SLICES — breaking a plan into AFK/HITL issues

> Mode: `TO_ISSUES`. Trigger: "break into issues", "vertical slices",
> "tracer bullets".

**Process:**

1. Gather context from the conversation (or fetch a referenced PRD/issue).
2. Explore the codebase if not already done. Use CONTEXT.md vocabulary.
3. **Draft vertical slices** per `§TRACER_BULLETS`. Each slice independently
   grabbable, demoable, narrow but complete.
4. **Quiz the user** with a numbered list. For each slice show:
   - **Title** — short descriptive name
   - **Type** — HITL / AFK
   - **Blocked by** — which other slices must complete first
   - **User stories covered** — from the source PRD
5. Iterate until the user approves granularity, dependencies, AFK/HITL labels.
6. **Publish in dependency order** (blockers first) so you can reference
   real issue identifiers in the "Blocked by" field.

**Issue template:**

```markdown
## Parent

A reference to the parent issue (if applicable).

## What to build

Concise description of this vertical slice. End-to-end behavior, not
layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- A reference to the blocking issue, OR "None — can start immediately"
```

Apply the `needs-triage` label so each issue enters the normal triage flow.

Do NOT close or modify the parent issue.

---

## §TRIAGE — the bug/enhancement state machine

> Mode: `TRIAGE`. Trigger: "triage this", "needs-triage", "is this a bug".

**Two category roles:**
- `bug` — something is broken
- `enhancement` — new feature or improvement

**Five state roles:**
- `needs-triage` — maintainer needs to evaluate
- `needs-info` — waiting on reporter
- `ready-for-agent` — fully specified, AFK-ready
- `ready-for-human` — needs human implementation
- `wontfix` — will not be actioned

Every triaged issue carries exactly one category role and one state role.
If state roles conflict, flag and ask before doing anything else.

**State transitions:**
```
unlabeled → needs-triage → {needs-info, ready-for-agent, ready-for-human, wontfix}
needs-info → needs-triage (when reporter replies)
maintainer can override at any time
```

**Disclaimer (every triage comment must start with):**

```
> *This was generated by AI during triage.*
```

**Triaging a specific issue:**

1. **Gather context.** Read full issue (body, comments, labels, reporter,
   dates). Parse prior triage notes to avoid re-asking. Explore codebase
   using CONTEXT.md vocabulary, respect ADRs. Read `.out-of-scope/*.md` —
   surface any prior rejection that resembles this issue.

2. **Recommend.** Tell the maintainer your category + state recommendation
   with reasoning, plus a brief codebase summary relevant to the issue.

3. **Reproduce (bugs only).** Before grilling, attempt reproduction. Report:
   successful repro with code path, failed repro, or insufficient detail
   (strong `needs-info` signal).

4. **Grill (if needed).** If the issue needs fleshing out, run `GRILL_DOCS`.

5. **Apply the outcome:**
   - `ready-for-agent` → post an **agent brief** comment (see
     `references/agent-brief.md`)
   - `ready-for-human` → same structure as agent brief, but note why it
     can't be delegated
   - `needs-info` → post triage notes (template below)
   - `wontfix` (bug) → polite explanation, then close
   - `wontfix` (enhancement) → write to `.out-of-scope/`, link from a
     comment, then close
   - `needs-triage` → apply the role; optional partial-progress comment

**Needs-info template:**

```markdown
## Triage Notes

**What we've established so far:**

- point 1
- point 2

**What we still need from you (@reporter):**

- question 1
- question 2
```

Capture everything resolved during grilling under "established so far" so
the work isn't lost. Questions must be specific and actionable.

---

## §DEEP_MODULES — finding architectural friction

> Mode: `DEEP_MODULE_HUNT`. Trigger: "find architectural friction",
> "deepening opportunities", "deep modules".

Surface refactors that turn shallow modules into deep ones. Aim:
testability and AI-navigability.

**Glossary (use exactly):**

- **Module** — anything with an interface and implementation (function,
  class, package, slice).
- **Interface** — everything a caller must know: types, invariants, error
  modes, ordering, config. Not just the type signature.
- **Implementation** — the code inside.
- **Depth** — leverage at the interface. **Deep** = high leverage.
  **Shallow** = interface nearly as complex as the implementation.
- **Seam** — where an interface lives; a place behavior can be altered
  without editing in place. (Use this, not "boundary.")
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth.
- **Locality** — what maintainers get from depth: change, bugs, knowledge
  concentrated in one place.

**Key principles:**

- **Deletion test** — imagine deleting the module. If complexity vanishes,
  it was a pass-through. If complexity reappears across N callers, it was
  earning its keep. A "yes, concentrates" is the signal you want.
- **The interface is the test surface.**
- **One adapter = hypothetical seam. Two adapters = real seam.**

**Process:**

1. **Explore.** Read CONTEXT.md and any ADRs in the area. Walk the
   codebase. Note where you experience friction:
   - Where does understanding one concept require bouncing between many
     small modules?
   - Where are modules **shallow** — interface nearly as complex as the
     implementation?
   - Where have pure functions been extracted just for testability, but
     real bugs hide in how they're called (no **locality**)?
   - Where do tightly-coupled modules leak across their seams?
   - Which parts are untested or hard to test through current interfaces?

   Apply the **deletion test** to anything you suspect is shallow.

2. **Present candidates** as a numbered list. For each:
   - **Files** — which modules involved
   - **Problem** — why current architecture causes friction
   - **Solution** — plain English description
   - **Benefits** — locality + leverage + how tests improve

   Use CONTEXT.md vocabulary for domain. Use the deep-modules vocabulary
   above for architecture. **Don't say** "the FooBarHandler" or "the Order
   service" — say "the Order intake module."

   **ADR conflicts:** if a candidate contradicts an existing ADR, only
   surface it when friction is real enough to warrant revisiting. Mark
   clearly: *"contradicts ADR-0007 — but worth reopening because…"*

   **Do NOT propose interfaces yet.** Ask: "Which would you like to explore?"

3. **Grilling loop** on the chosen candidate. Walk the design tree:
   constraints, dependencies, the shape of the deepened module, what sits
   behind the seam, what tests survive.

   Side effects happen inline:
   - Naming a deepened module after a concept not in CONTEXT.md? Add the
     term to CONTEXT.md.
   - Sharpening fuzzy language? Update CONTEXT.md right there.
   - User rejects with a load-bearing reason? Offer an ADR (three-test gate).

---

## §ZOOM_OUT — meta-control for unfamiliar areas

> Mode: `ZOOM_OUT`. Trigger: "zoom out", "I don't know this area",
> "broader context".

**One-shot prompt:**

> I don't know this area of code well. Go up a layer of abstraction. Give
> me a map of all the relevant modules and callers, using the project's
> domain glossary vocabulary.

If `graphify-out/GRAPH_REPORT.md` exists, this becomes essentially free:
read the relevant community + god nodes, summarize, and proceed.

If no graph exists and the area is >20 files, build one first (Hard Rule
#14) before answering.

---

## §CAVEMAN — token-pressure mode

> Mode: `CAVEMAN_MODE`. Trigger: "caveman", "be brief", "less tokens",
> "tighten".

Persistent terse mode. Drops articles, fillers, pleasantries, hedging.
Keeps technical substance exact. ~75% token reduction.

**Active every response once triggered.** No revert after many turns. No
filler drift. Off only on "stop caveman" or "normal mode".

**Rules:**

- Drop: articles (a/an/the), filler (just/really/basically/actually/simply),
  pleasantries (sure/certainly/of course/happy to), hedging
- Fragments OK. Short synonyms (big not extensive, fix not "implement a
  solution for"). Abbreviate (DB/auth/config/req/res/fn/impl). Strip
  conjunctions. Use arrows (X -> Y). One word when one word enough.
- Technical terms stay exact. Code blocks unchanged. Errors quoted exact.
- Pattern: `[thing] [action] [reason]. [next step].`

**Examples:**

> "Why React component re-render?"
> Inline obj prop -> new ref -> re-render. `useMemo`.

> "Explain database connection pooling."
> Pool = reuse DB conn. Skip handshake -> fast under load.

**Auto-clarity exception.** Drop caveman temporarily for: security warnings,
irreversible action confirmations, multi-step sequences where fragment
order risks misread, user asks to clarify or repeats question. Resume
caveman after the clear part is done.

```
**Warning:** Will permanently delete all rows in `users` table. Cannot undo.

DROP TABLE users;

Caveman resume. Verify backup exist first.
```

---

## §AGENT_BRIEF — durable handoffs

When transitioning an issue to `ready-for-agent`, post a comment with the
agent brief. Format detailed in `references/agent-brief.md`. The brief is
the contract — the AFK agent will work from it without further human
context.

---

## §OUT_OF_SCOPE — preventing re-suggestion loops

`.out-of-scope/` at repo root holds rejection rationales:

```
.out-of-scope/
├── multi-tenancy.md
├── plugin-architecture.md
└── ...
```

Each file: 1-3 paragraphs explaining why this enhancement was rejected and
under what conditions reopening would make sense.

**When to write one:** during `TRIAGE`, an enhancement is `wontfix`-ed and
the rejection reason is non-trivial — write to `.out-of-scope/`, link from
the closing comment.

**When to read them:** during `TRIAGE`, before evaluating a new enhancement.
Surface any prior rejection that resembles the current issue.

This keeps the knowledge base from churning on the same rejected ideas.

---

## §RATIONALE_COMMENTS — extractable inline knowledge

`graphify` extracts rationale comments as `rationale_for` nodes. Use these
markers consistently:

```python
# WHY: We pin to PostgreSQL 14 because pgvector requires it for the
# auth-recovery flow.

# IMPORTANT: This must run BEFORE the migration. Order matters.

# HACK: Working around a known issue in lib X v2.3 — remove when 2.4 lands.

# NOTE: This duplicates the logic in foo.py because the call sites have
# different timing constraints. Don't deduplicate without re-checking.
```

```typescript
// WHY: ...
// IMPORTANT: ...
// HACK: ...
// NOTE: ...
```

These survive into the knowledge graph and into compound learnings. They
answer the most expensive question in any codebase: *why was this done
this way?*

---

## §GIT_GUARDRAILS — blocking dangerous git operations

Per platform:

**Claude Code** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

**Codex** (`.codex/hooks.json`): equivalent PreToolUse hook on Bash matcher.

**OpenCode** (`.opencode/plugins/`): `tool.execute.before` plugin with same
detection logic.

**Kilo Code / Antigravity:** no PreToolUse layer. Rely on rule discipline
in `AGENTS.md` / `.agents/rules/` plus shell-level aliasing where critical.

**The hook script** (bash, portable across platforms with hook support):

```bash
#!/usr/bin/env bash
# .claude/hooks/block-dangerous-git.sh (or platform equivalent)
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command // ""')

block=0
case "$cmd" in
  *"git push"*)              block=1; reason="git push is restricted";;
  *"git reset --hard"*)      block=1; reason="git reset --hard is destructive";;
  *"git clean -f"*)          block=1; reason="git clean -f deletes untracked files";;
  *"git clean -fd"*)         block=1; reason="git clean -fd deletes untracked files and dirs";;
  *"git branch -D"*)         block=1; reason="git branch -D deletes branches";;
  *"git checkout ."*)        block=1; reason="git checkout . discards working changes";;
  *"git restore ."*)         block=1; reason="git restore . discards working changes";;
esac

if [ "$block" = "1" ]; then
  echo "BLOCKED: $reason. Agent does not have authority for this command." >&2
  exit 2
fi
exit 0
```

Test with:
```bash
echo '{"tool_input":{"command":"git push origin main"}}' | ./block-dangerous-git.sh
# Should exit 2 with the BLOCKED message.
```

---

## §PRE_COMMIT — Husky / lint-staged / format / typecheck / test

```bash
# 1. Detect package manager
# package-lock.json → npm ; pnpm-lock.yaml → pnpm ;
# yarn.lock → yarn ; bun.lockb → bun ; default → npm

# 2. Install
npm i -D husky lint-staged prettier
npx husky init   # creates .husky/, adds prepare: "husky" to package.json
```

`.husky/pre-commit`:
```
npx lint-staged
npm run typecheck
npm run test
```

If `typecheck` or `test` script is missing, omit the line and tell the user.

`.lintstagedrc`:
```json
{ "*": "prettier --ignore-unknown --write" }
```

`.prettierrc` (only if missing):
```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 80,
  "singleQuote": false,
  "trailingComma": "es5",
  "semi": true,
  "arrowParens": "always"
}
```

Verify:
- [ ] `.husky/pre-commit` exists and is executable
- [ ] `.lintstagedrc` exists
- [ ] `prepare: "husky"` in package.json
- [ ] Prettier config exists
- [ ] `npx lint-staged` runs cleanly

Commit message: `Add pre-commit hooks (husky + lint-staged + prettier)` —
this run-through is itself the smoke test.

---

## Doctrine Summary

Setup creates the four canonical artifacts: `AGENTS.md` / `CLAUDE.md`,
`CONTEXT.md`, `docs/adr/`, `docs/agents/`.

CONTEXT.md is canonical (#15). ADRs use the three-test gate (#16). Tests
and issues are tracer-bullet vertical slices (#17). Bugs are diagnosed
feedback-loop-first (#18) — see `references/diagnose-protocol.md`.

PRDs synthesize, never interview. Slices are AFK or HITL. Triage is bug or
enhancement, in one of five states. Rejections live in `.out-of-scope/`.

The grilling loop is the gate when confidence is LOW. Deep-module hunts
turn shallow modules into deep ones. Zoom-out is one prompt away. Caveman
mode handles token pressure.

Rationale comments survive into the knowledge graph and into the compound
layer. The agent brief is the durable handoff to AFK work.

Git guardrails prevent destructive operations on platforms with hook
support. Pre-commit hooks enforce format / typecheck / test on every
commit.

Compounded with Layer 1 (Compound Engineering) and Layer 2 (Knowledge
Graph), this is what v10 means by *founder-operator multi-agent doctrine*.
