# GODMYTHOS v10.3 — Cartography + MVP Velocity Bundle

> Refinement of v10.2. Carries the Cartography Handoff Contract forward
> unchanged and adds an explicit **MVP Velocity Pack** for SaaS MVP work.
> Designed to fail closed where rigor is permanent cost (token drift,
> correctness) and dial down where rigor is temporary cost (process
> ceremony, documentation depth).

**Apply order:** 1 → 2 → 3 → 4 → 5 → 6. The Cartography layer (v10.2)
must be in place first; the MVP layer is additive and gated by it.

---

## What changed since v10.2

| Layer | v10.2 | v10.3 |
| --- | --- | --- |
| Cartography handoff contract | `opencode-design` patch + `frontend-design-gate` + coordination clause | **Unchanged.** Carries forward verbatim. |
| MVP scope handling | Implicit — full rigor applied to everything | **New** — `MVP_COMPRESS` mode, time-bounded, with explicit exemption list |
| Business outcome alignment | `DESIGN_SCORE` is technical-quality only | **New** — `TRACTION_FIRST` extension; `METRICS.md` artifact mandatory on MVP scope |
| Bug isolation | `DIAGNOSE` Phase 1 is "build feedback loop" | **Extended** — Phase 0 (`SMOKE_TOGGLE`) wraps in feature flag before feedback-loop work |
| Knowledge graph usage | Codebase recon only (`graphify`) | **Extended** — `PROBLEM_SPACE_MAP` mode adds pain/market/hypothesis edge types |
| CI gates | 1–6 | **7 added** — scope-tag attestation per PR |
| Hard Rules | 1–18 | **19 (`MVP_COMPRESS`) and 20 (`TRACTION_FIRST`) added** |

The MVP layer is opt-in per cycle, time-bounded per invocation, and
**cannot override** the Cartography gates or correctness Hard Rules
(#1–#9). Full exemption list in §6.

---

## 1. Cartography Handoff Contract (carry-over from v10.2)

> **Unchanged from v10.2.** Reproduced here so this bundle is
> self-contained. If you already have the v10.2 bundle applied, skip
> to §2.

### 1.1 `opencode-design` Patch

Target: `/mnt/skills/user/opencode-design/SKILL.md`.

#### Front-matter

```yaml
---
name: opencode-design
description: <KEEP YOUR EXISTING DESCRIPTION VERBATIM HERE>
requires:
  - path: .cartography/theme.css
    format: tailwind-v4-theme
    source: "npx @google/design.md export --format css-tailwind DESIGN.md"
    on_missing: refuse
    rationale: "Component layer must consume tokens; cannot define them."
  - path: .cartography/tokens.json
    format: dtcg
    source: "npx @google/design.md export --format dtcg DESIGN.md"
    on_missing: refuse
    optional: true
    rationale: "Use when the target stack is non-Tailwind."
  - path: DESIGN.md
    format: design-md-alpha
    on_missing: refuse
    rationale: "Source of truth for design rationale — the prose, not just the tokens."
produces:
  - components consuming token references via @theme CSS variables
  - never raw hex literals, never bg-[#...], never inline color styles
governed_by: godmythos-v10.3 / Cartography Doctrine
---
```

> The only diff vs v10.2 is `governed_by: godmythos-v10.3`. The contract
> itself is identical.

#### Body insertion — Pre-Flight Gate

Insert as the very first `##` section in the SKILL.md body:

```markdown
## Pre-Flight Gate (HR-Cartography-04 / 05 / 07)

This skill fails closed. Before generating, editing, or reviewing any
component, perform the following checks in order. If any check fails,
halt and emit the failure protocol below — do not proceed with the task,
do not improvise tokens, do not auto-bootstrap.

### Required artifacts

1. `DESIGN.md` exists at repo root.
2. `.cartography/theme.css` exists and is non-empty.
3. `npx @google/design.md lint --format json DESIGN.md` exits 0 with no
   `error` severity findings and no `contrast-ratio` warnings (this
   doctrine promotes contrast warnings to errors).

### Failure Protocol

If any required artifact is missing or stale, respond to the user with
exactly:

> **Cartography pre-flight failed.** `opencode-design` requires
> `.cartography/theme.css` and a passing `DESIGN.md` lint before
> component work can proceed. Run the GODMYTHOS Cartography pre-flight
> (`graphify` + `@google/design.md` export) or invoke the Bootstrap
> Procedure if `DESIGN.md` does not yet exist. I will not proceed until
> the artifacts are present.

Then stop. Do not offer alternatives, do not suggest temporary tokens,
do not write a "rough first pass." The contract is: tokens flow down,
requests flow up.

### Token Consumption Rule (HR-Cartography-07)

When the gate passes:
- Reference tokens via Tailwind v4 `@theme` CSS variables
  (`var(--color-primary)`, `text-(--color-on-tertiary)`, etc.) sourced
  from `.cartography/theme.css`.
- For non-Tailwind stacks, consume `tokens.json` via your token-loader
  of choice (Style Dictionary, etc.).
- **No hex literals.** No `#1A1C1E` anywhere in component code. If a
  value is needed and not in `DESIGN.md`, halt and request a token
  addition through Cartography (which will run the `diff` gate).
```

### 1.2 `frontend-design-gate` Skill

Target: `/mnt/skills/user/frontend-design-gate/SKILL.md` — new file.
Reproduced verbatim from v10.2; only `governed_by` bumps to `v10.3`.

```markdown
---
name: frontend-design-gate
description: Pre-flight gate that runs before any frontend implementation work. Triggers on every request involving production frontend code — React, Vue, Svelte, Next.js, Astro, vanilla HTML/CSS, landing pages, dashboards, web apps, mobile web, or any styling/beautifying of a web UI. Verifies the GODMYTHOS Cartography handoff contract (DESIGN.md present, theme.css exported, lint passing) before delegating to the public frontend-design skill. Always runs first when frontend work is requested in a repo governed by godmythos-v10.3.
requires:
  - path: .cartography/theme.css
    format: tailwind-v4-theme
    on_missing: refuse
  - path: DESIGN.md
    format: design-md-alpha
    on_missing: refuse
delegates_to: frontend-design
governed_by: godmythos-v10.3 / Cartography Doctrine
---

# frontend-design-gate

This skill is a gate, not an implementation skill. It runs before
`frontend-design` and exists because the public `frontend-design` skill
is read-only and cannot itself enforce the Cartography handoff contract.

## Order of Operations

1. Detect repo governance. Check for `godmythos.md` (or `.godmythos/`)
   in the repo. If absent, this skill is a no-op — yield directly to
   `frontend-design`.
2. Run the gate (steps below).
3. On pass — emit a one-line preamble
   (`Cartography contract verified. Delegating to frontend-design.`)
   and yield to the public `frontend-design` skill, passing
   `.cartography/theme.css` as a required input.
4. On fail — halt with the Failure Protocol. Do not yield.

## The Gate

1. `DESIGN.md` exists at repo root.
2. `.cartography/theme.css` exists, is non-empty, and is newer than
   `DESIGN.md`.
3. `.cartography/graph.json` exists.
4. `npx @google/design.md lint --format json DESIGN.md` exits 0.
   Contrast-ratio warnings count as errors.
5. If `DESIGN.md` has uncommitted changes:
   `git show HEAD:DESIGN.md | npx @google/design.md diff - DESIGN.md`
   must report `regression: false`.

## Failure Protocol

> **Cartography pre-flight failed at `frontend-design-gate`.**
> [Specific failure: which file, which check.]
>
> Required action:
> - If `DESIGN.md` is missing → run the godmythos-v10.3 Bootstrap.
> - If `.cartography/theme.css` is missing or stale → re-run
>   `npx @google/design.md export --format css-tailwind DESIGN.md
>   > .cartography/theme.css`.
> - If `lint` failed → fix the surfaced errors first.
> - If `diff` shows regression → justify in PR description or revert.
>
> I will not delegate to `frontend-design` until these are resolved.

## Non-Goals

- Does NOT generate UI code.
- Does NOT auto-bootstrap `DESIGN.md`.
- Does NOT modify `DESIGN.md` or `.cartography/*`.
```

### 1.3 Coordination Clause (godmythos.md)

Add the Gate Skill Chain table immediately after the Hand-Off Contract
table in the Cartography Doctrine Extension. Verbatim from v10.2; no
diff.

---

## 2. NEW — `MVP_COMPRESS` Mode (Hard Rule #19)

> **Hard Rule #19 — MVP scope is a posture, not a license.**
> When `MVP_COMPRESS` is invoked, specific process-rigor Hard Rules
> downgrade to **best-effort** for a time-bounded window. The
> invocation must be explicit, must declare an expiry, and must list
> what the user is consciously deferring. The Cartography gates and
> correctness rules (#1–#9) remain at full strength regardless. After
> expiry, full rigor returns automatically. Drift past expiry is a
> Hard Rule violation.

### 2.1 What MVP_COMPRESS does

For the duration of its window, the following Hard Rules downgrade
from BLOCK to BEST_EFFORT. The work still happens where natural; it
just doesn't block.

| Hard Rule | Normal | Under MVP_COMPRESS | Compound debt |
| --- | --- | --- | --- |
| #11 — Compound every cycle | BLOCK if missing | BEST_EFFORT | Owed: 1 compound artifact per shipped feature, due at MVP-end |
| #13 — Execution trace mandatory | BLOCK if missing | BEST_EFFORT | Owed: retrofit traces for any feature that becomes load-bearing post-MVP |
| #14 — Knowledge graph before grep | BLOCK on >20-file corpus | WARN only | Owed: `graphify` run at MVP-end before next major cycle |
| Gate 5 — Compound artifact in PR | WARN after 24h | OFF | Same as #11 above |
| Gate 6 — Knowledge graph fresh | WARN after 24h | OFF | Same as #14 above |
| `TO_PRD` depth | Full PRD template | `TO_ONEPAGER` template | Owed: full PRD if feature survives MVP cull |

### 2.2 What MVP_COMPRESS does NOT do

The following are **never** downgraded, regardless of MVP posture. This
is the hard boundary. Attempting to compress these is a Hard Rule
violation.

- **Hard Rules #1–#9** — Correctness, compiler validation, test before
  claim, no stubs in deploy paths, read before write, single source of
  truth, security gate, no rationalized deprecation, error UX. These
  are correctness, not ceremony. MVP doesn't get to ship broken.
- **Cartography gates** (HR-Cartography-04/05/07, `opencode-design`
  body gate, `frontend-design-gate`) — Token drift across the
  five-platform agent fleet is permanent cost. The whole point of the
  v10.2 contract is that one improvisation in one MVP poisons the next
  six months of UI work. Stays on.
- **Hard Rule #7 (Security gate for dependencies)** — A compromised
  dependency in an MVP is still a compromised dependency. The supply
  chain doesn't care about your launch timeline.
- **Gate 1 (Compiler clean)** and **Gate 2 (Test pass)** — Same reason.
- **Gate 3 (Security audit)** — Same reason.

If the user asks to compress any of the above, refuse and explain
which boundary is being touched.

### 2.3 Invocation

`MVP_COMPRESS` must be invoked with three required parameters:

```
MVP_COMPRESS
  scope: <product-name | feature-name>
  expires: <ISO-8601 date | milestone-name>
  defers: [HR-11, HR-13, HR-14, TO_PRD_DEPTH, ...]
  rationale: "<one-line reason — e.g. 'pre-launch velocity push for StormAtlas paid tier'>"
```

Example:

```
MVP_COMPRESS
  scope: storm-atlas-paid-tier
  expires: 2026-06-30
  defers: [HR-11, HR-13, HR-14, TO_PRD_DEPTH, Gate-5, Gate-6]
  rationale: "Three-week velocity push to ship Stripe-gated paid tier; full PRD + compound audit due 2026-07-07."
```

The invocation is logged to `.godmythos/mvp-windows.yaml`:

```yaml
- scope: storm-atlas-paid-tier
  opened: 2026-06-09
  expires: 2026-06-30
  defers: [HR-11, HR-13, HR-14, TO_PRD_DEPTH, Gate-5, Gate-6]
  rationale: "..."
  status: open
  debt:
    - {rule: HR-11, owed_by: 2026-07-07, owed_artifact: "docs/knowledge/storm-atlas-paid-tier-compound.md"}
    - {rule: HR-13, owed_by: 2026-07-07, owed_artifact: "docs/traces/storm-atlas-paid-tier-trace.md"}
    - {rule: HR-14, owed_by: 2026-07-07, owed_artifact: "graphify-out/GRAPH_REPORT.md (fresh)"}
    - {rule: TO_PRD, owed_by: "feature-survival-decision", owed_artifact: "docs/prds/storm-atlas-paid-tier.md"}
```

### 2.4 Expiry behavior

On expiry:

1. The orchestrator surfaces all entries in `.godmythos/mvp-windows.yaml`
   where `status: open` and `expires < today`.
2. For each entry, every line in `debt:` becomes a blocker on the
   next PR until satisfied (Gate 7 below enforces this).
3. The MVP window is marked `status: expired` automatically.
4. Re-opening requires a fresh `MVP_COMPRESS` invocation with a new
   expiry. No silent extensions.

### 2.5 The `TO_ONEPAGER` mode

When `MVP_COMPRESS` is active and the orchestrator would otherwise
route to `TO_PRD`, it routes to `TO_ONEPAGER` instead. The one-pager
template is intentionally constrained:

```markdown
# <Feature Name> — One-Pager

**Status:** MVP / scope=<window-name> / expires=<date>
**Owner:** <person>
**Author:** <person>

## Problem (≤3 sentences)
What pain are we solving, for whom, right now?

## Solution sketch (≤5 sentences)
What we will build. No architecture deep-dive — that lives in the plan.

## Success metric (1 line)
The single number that tells us whether this worked.
(See METRICS.md for the dashboard sketch.)

## Out-of-scope (≤5 bullets)
What we are explicitly NOT doing this cycle.

## Open questions (≤3 bullets)
Things we will learn from shipping, not from arguing.
```

Total length cap: **400 words.** A one-pager that exceeds this is
no longer a one-pager and should route back to `TO_PRD`.

### 2.6 Operator default

Eddie's stacks (Eco-Auditor, ProvenanceOS, SEO AI Regent, StormAtlas)
are all MVP-stage SaaS. Recommended posture per stack at v10.3 rollout:

| Stack | Recommended posture | Notes |
| --- | --- | --- |
| StormAtlas | MVP_COMPRESS until paid tier ships | Cartography ON (already has UI surface) |
| Eco-Auditor | MVP_COMPRESS until first customer | Cartography ON |
| ProvenanceOS | MVP_COMPRESS until pilot signed | Cartography ON |
| SEO AI Regent | MVP_COMPRESS until 10 paying users | Cartography ON |
| KDP / cover-gen pipelines | Full rigor — already past MVP | — |
| Trading bots (MEXC/Polymarket/Kalshi) | Full rigor — correctness > velocity | Money on the line, not the right place to compress |
| OpenClaw infrastructure | Full rigor — homelab is permanent | — |

---

## 3. NEW — `TRACTION_FIRST` Extension (Hard Rule #20)

> **Hard Rule #20 — DESIGN_SCORE is incomplete without TRACTION_SCORE.**
> Any artifact that scores design quality must also score user-outcome
> alignment. Technical quality with no traction signal is a B-grade
> ceiling, not an A. This rule is always on, MVP posture or not — but
> it does the most work during MVP, when business outcome alignment is
> the only thing that matters.

### 3.1 The `METRICS.md` artifact

`METRICS.md` lives at repo root, alongside `CONTEXT.md` and `DESIGN.md`.
It is the canonical traction sketch. Required when `MVP_COMPRESS` is
active for the current scope; strongly recommended otherwise.

Template:

```markdown
# METRICS.md — Traction Dashboard Sketch

**Scope:** <feature or product>
**Status:** sketch | live | abandoned
**Last reviewed:** <date>

## North-star metric (one)
The single number that, if it moves up, tells us we won.
- Definition (precise, query-able): <SQL/event-name/etc.>
- Current value: <number or "not yet measured">
- Target value: <number + by-date>

## Counter-metrics (1–3)
Numbers that, if they move the wrong way, tell us the north-star is
being gamed.
- <metric 1>
- <metric 2>

## Leading indicators (2–4)
Faster-moving signals that predict the north-star.
- <signal 1>
- <signal 2>

## How we measure (≤5 bullets)
- Where data comes from (Postgres table, PostHog event, Stripe webhook, etc.)
- Who looks at it (and how often)
- What the alert thresholds are

## Friction inventory (the inverse view)
The shortest path from a stranger seeing the product to producing the
north-star metric. List every step. Each step is a friction point.
1. <step>
2. <step>
3. <step>
```

`METRICS.md` is not a BI dashboard. It is a one-page contract that
forces the team to declare what success looks like *before* shipping,
in terms the user (not the engineer) would recognize.

### 3.2 `DESIGN_SCORE` extension

The existing `DESIGN_SCORE` mode returns a grade across 7 technical
categories. `TRACTION_FIRST` adds an 8th category and a composite rule:

| Category | Source |
| --- | --- |
| 1. Typography | `designlang` |
| 2. Color | `designlang` |
| 3. Spacing | `designlang` |
| 4. Hierarchy | `designlang` |
| 5. Density | `designlang` |
| 6. Affordance | `designlang` |
| 7. Consistency | `designlang` |
| **8. Traction alignment** ← v10.3 | `METRICS.md` check + heuristic |

**Traction alignment scoring (D–A):**

- **A** — `METRICS.md` exists, north-star is precisely defined, the
  shipped UI's primary CTA visibly drives the north-star, friction
  inventory has ≤5 steps.
- **B** — Same as A but friction inventory has 6–8 steps, OR primary
  CTA is one click removed from north-star path.
- **C** — `METRICS.md` exists but is vague ("more engagement"), OR
  primary CTA is two clicks removed from north-star path.
- **D** — `METRICS.md` missing or is a stub. UI scores cannot exceed
  B overall regardless of other categories.

**Composite rule:** A `DESIGN_SCORE` grade ≥ A requires Category 8 ≥ B.
You can have flawless typography on a feature nobody uses — that is a
B-grade outcome at best. v10.3 codifies this.

### 3.3 `INTEL` route extension

When `INTEL` is invoked to research a competitor product, the output
must now include a competitor `METRICS.md` reconstruction (best-effort,
from observable signals — pricing page, social proof, public job
postings, etc.). This forces the recon to surface *what the competitor
is optimizing for*, not just *what they built*. Template:

```markdown
## Competitor METRICS.md (reconstructed)

**Confidence:** LOW | MEDIUM | HIGH
**Sources:** [list]

### Inferred north-star
<best guess + signal>

### Inferred counter-metrics
<from pricing structure, plan limits, etc.>

### Friction inventory (observed)
1. <step from visitor to converted user>
2. ...
```

---

## 4. NEW — `SMOKE_TOGGLE` Phase 0 (DIAGNOSE Extension)

> Phase 0 of `DIAGNOSE` is "wrap the surface, then build the loop." A
> failure isolated behind a feature flag is a failure with a known
> blast radius. A failure that might be anywhere in the call graph
> is a failure with unbounded blast radius. Always reduce blast
> radius before hypothesizing.

### 4.1 Updated DIAGNOSE protocol

Previous (v10, from Hard Rule #18):

```
Phase 1: Build a deterministic, agent-runnable pass/fail signal.
Phase 2: Generate hypotheses against the signal.
Phase 3: Bisect / fix / verify.
```

v10.3:

```
Phase 0: SMOKE_TOGGLE — wrap the suspected surface in a feature flag.
         Default state: OFF. The toggled-OFF path becomes the control;
         the toggled-ON path becomes the test surface.

Phase 1: Build the feedback loop against the flag-ON path only.
         (Hard Rule #18 unchanged — fast, deterministic, pass/fail.)

Phase 2: Generate hypotheses against the flagged-ON path.

Phase 3: Bisect / fix / verify. When the flag-ON path passes the loop,
         flip the default to ON and remove the flag in a follow-up PR.
```

### 4.2 When SMOKE_TOGGLE is mandatory

- Bug affects a code path on a production deploy.
- Bug is intermittent (race, timing, load-dependent).
- Repro requires modifying a file with cross-cutting effects (a
  middleware, a base class, a global config).
- You don't know yet whether the bug is in the code or the data.

### 4.3 When SMOKE_TOGGLE is optional

- Bug is in a script or CLI tool with no production blast radius.
- Bug is in test code itself.
- Bug reproduces in 100% of cases on a local-only branch already.

### 4.4 Flag system requirements

The flag does not need to be sophisticated. A `process.env.FLAG_NAME`
check, a config-file boolean, or a `localStorage` toggle is sufficient
for Phase 0. Bringing in LaunchDarkly mid-diagnose is over-engineering.

For Eddie's stacks, the default flag mechanism is:

- **Frontend (Next.js / React):** `process.env.NEXT_PUBLIC_FLAG_<NAME>`
  read once into a context provider, exposed via `useFlag()`.
- **Backend (FastAPI / Node):** env-var read at startup, exposed via a
  `flags` object in the DI container.
- **n8n workflows:** `FLAGS` static-data node referenced via
  `{{ $node["FLAGS"].json["<name>"] }}` in conditional IF nodes.

### 4.5 Compound integration

When the bug is resolved and the flag is removed in the follow-up PR,
the `COMPOUND` step records: (a) the toggled-OFF and toggled-ON
diffs, (b) the feedback loop that proved correctness, (c) the
flag-removal PR link. This becomes a high-signal compound artifact —
the kind that pays back when a similar bug recurs.

---

## 5. NEW — `PROBLEM_SPACE_MAP` Mode (KNOWLEDGE_GRAPH Extension)

> `graphify` is currently a codebase-explainer. v10.3 extends it into
> a problem-space cartographer. Same graph engine, different node and
> edge types, different prompt during `BRAINSTORM` and `INTEL`.

### 5.1 Node and edge types

The base `graphify` graph has nodes = files/modules/symbols, edges =
imports/calls/references. `PROBLEM_SPACE_MAP` adds:

**Node types:**
- `pain` — a user pain point or workaround extracted from `CONTEXT.md`,
  user interviews, support tickets, or `BRAINSTORM` output.
- `tool` — an existing competitor, library, or workaround the user
  currently leans on.
- `solution_hypothesis` — a proposed feature or product from
  `BRAINSTORM` output.
- `metric` — a node imported from `METRICS.md` (north-star,
  counter, leading indicator).

**Edge types:**
- `causes` — pain → pain (one pain produces another)
- `mitigates` — tool → pain (existing solution partially addresses)
- `competes_with` — tool → tool (substitute relationship)
- `proposes` — solution_hypothesis → pain (this idea targets this pain)
- `validates` — solution_hypothesis → metric (this idea, if it works,
  moves this metric)
- `risks` — solution_hypothesis → counter_metric (this idea, if it
  works in the wrong way, moves this counter-metric the wrong way)

### 5.2 Invocation

```
PROBLEM_SPACE_MAP
  source: [CONTEXT.md, docs/brainstorm/*.md, docs/intel/*.md, METRICS.md]
  output: graphify-out/PROBLEM_SPACE.md
```

### 5.3 Output

The orchestrator produces:

- `graphify-out/problem-space.json` — the graph itself.
- `graphify-out/PROBLEM_SPACE.md` — human-readable report.

The report surfaces:

- **God-node pains** — pain points with the highest in-degree from
  `causes` edges. These are the load-bearing problems.
- **Under-served pains** — pain nodes with no incoming `mitigates`
  edges. These are the gap candidates.
- **Crowded pains** — pain nodes with ≥3 incoming `mitigates` edges
  from different tools. These are the saturated markets — avoid
  unless you have a structural advantage.
- **Orphan hypotheses** — `solution_hypothesis` nodes with no
  `proposes` edge to any pain, or no `validates` edge to any
  metric. These are vanity ideas — flag for retirement.
- **Risk hot-spots** — hypotheses with many `risks` edges. These need
  counter-metric monitoring from day one.

### 5.4 When to invoke

- During `BRAINSTORM` for a new product or major feature.
- During `INTEL` when researching a market segment (the competitor's
  `METRICS.md` reconstruction from §3.3 feeds in as `metric` nodes).
- At MVP-end as part of the deferred-rigor pay-down — refresh the
  problem-space map with what you learned from real users.

### 5.5 Anti-pattern guardrail

`PROBLEM_SPACE_MAP` is a thinking tool, not a decision tool. The graph
shows you where the gaps and crowds are; it does not tell you which
gap is worth pursuing. Treating the graph as a roadmap is a category
error — call it out and route back to `BRAINSTORM` / `IDEA_REFINE` for
the actual decision.

---

## 6. Hard Boundaries — What MVP_COMPRESS CANNOT Touch

Restated explicitly because this is where past process-compression
attempts in the industry have failed. The boundary is non-negotiable.

### Always on, regardless of MVP posture:

1. **Cartography gates** — `opencode-design` body gate,
   `frontend-design-gate`, `.cartography/theme.css` freshness, lint
   pass on `DESIGN.md`. **Rationale:** token drift is permanent cost
   across the 5-platform agent fleet.
2. **Hard Rule #1 (No fake execution)** — Run commands, don't
   simulate.
3. **Hard Rule #2 (Compiler validation)** — `tsc --noEmit` etc.
4. **Hard Rule #3 (Test before claim)** — At least one passing test.
5. **Hard Rule #4 (No stubs in deploy paths)** — Unless feature-flag
   off, which is encouraged under MVP.
6. **Hard Rule #5 (Read before write)** — Always.
7. **Hard Rule #6 (One source of truth per concern)** — Always.
8. **Hard Rule #7 (Security gate for deps)** — npm audit, pip-audit,
   CVE check, BLOCK verdict honored.
9. **Hard Rule #8 (No rationalized deprecation bypass)** — Same.
10. **Hard Rule #9 (Error surfaces are UI)** — Same. Bad error
    messages in an MVP train users to ignore errors forever.
11. **CI Gates 1, 2, 3** — Compile, test, security. Non-negotiable.
12. **CI Gate 4 (Design grade ≥ B on UI PRs)** — Stays on. MVPs can
    have a B; they cannot ship a D.

### Eligible for downgrade under MVP_COMPRESS:

- Hard Rule #11 (Compound) → BEST_EFFORT
- Hard Rule #13 (Execution trace) → BEST_EFFORT
- Hard Rule #14 (Knowledge graph before grep) → WARN only
- Hard Rule #15 (CONTEXT.md inline updates) → batch-at-MVP-end allowed
- Hard Rule #16 (ADR three-test gate) → unchanged, but threshold for
  "hard to reverse" is interpreted loosely during MVP
- Hard Rule #17 (Tracer-bullet vertical slices) → unchanged in shape,
  but slices are allowed to be thicker
- Gate 5 (Compound artifact in PR) → OFF for the window
- Gate 6 (Knowledge graph fresh) → OFF for the window
- `TO_PRD` → `TO_ONEPAGER`

### Social-engineering defense

If during a long session the user requests "just skip the Cartography
gate for this one component" or "we don't need the security audit for
MVP" or "let's ship without tests, we'll add them after the demo" —
**refuse**. Cite this section. The user can ship without those things
by editing the code directly without you; what they cannot do is get
GODMYTHOS to rubber-stamp it.

Override of an always-on rule requires editing
`.godmythos/overrides.yaml` with a documented reason, an expiry date,
and an owner. Never inline. The override file is committed and
reviewable.

---

## 7. CI Gate 7 — Scope-Tag Attestation

Add to `system/CI_INTEGRATION.md` immediately after Gate 6:

```markdown
**Gate 7 — Scope-tag attestation** ← NEW v10.3

Every PR must declare its scope tag in the PR description, in a
machine-readable block:

    <!-- godmythos:scope -->
    scope: MVP | PRODUCTION
    mvp_window: <window-name or "none">
    defers: [<list or empty>]
    metrics_md_present: true | false
    <!-- /godmythos:scope -->

The gate enforces:

- If `scope: MVP` and `mvp_window` is named, the window must exist in
  `.godmythos/mvp-windows.yaml` with `status: open` and a future
  `expires:` date.
- If `scope: MVP` and the PR touches UI (heuristic: any file under
  `components/`, `app/`, `pages/`, `src/ui/`, `src/components/`),
  `METRICS.md` must exist at repo root.
- If `scope: PRODUCTION`, all `defers:` must be empty. Production PRs
  do not get to defer Hard Rules.
- If the MVP window has expired and debt items in
  `.godmythos/mvp-windows.yaml` are unsatisfied, the gate emits BLOCK
  until the debt is resolved or the window is re-opened with a new
  expiry.

Pipeline fail conditions (additions):
- Missing scope-tag block → BLOCK
- MVP scope with expired window and unpaid debt → BLOCK
- PRODUCTION scope with non-empty defers → BLOCK
- MVP UI PR with no METRICS.md → BLOCK
```

Updated CI pipeline shape:

```
trigger → graphify-rebuild → lint → compile → test →
security-audit → [design-score + traction-score] → scope-attest →
compound-check → deploy
```

---

## 8. Refined Rollout Sequence

Order of application matters. Each step assumes the previous is done.

1. **Cartography first.** If v10.2 isn't in place, apply §1 (the
   `opencode-design` patch and the `frontend-design-gate` skill) and
   verify it fails closed on a deliberately broken request. **Do not
   skip this even if you're eager to get to the MVP layer.** The
   MVP layer's value depends on the Cartography gates being live.

2. **Drop the `MVP_COMPRESS` mode into `godmythos.md`** (§2). Add
   Hard Rule #19 to the HARD RULES section, add `MVP_COMPRESS` and
   `TO_ONEPAGER` to the WORK MODE ROUTING table, add the operator
   defaults table.

3. **Drop the `TRACTION_FIRST` mode** (§3). Add Hard Rule #20, extend
   the `DESIGN_SCORE` reference to include Category 8, extend the
   `INTEL` reference to include competitor `METRICS.md`
   reconstruction.

4. **Drop the `SMOKE_TOGGLE` extension** (§4). Update Hard Rule #18 to
   reference Phase 0; update `references/diagnose-protocol.md` body to
   include Phase 0 ahead of Phase 1.

5. **Drop the `PROBLEM_SPACE_MAP` mode** (§5). Add to WORK MODE ROUTING
   table; update `references/knowledge-graph.md` with the new node and
   edge types.

6. **Add CI Gate 7** (§7) to `system/CI_INTEGRATION.md`. Implement the
   scope-tag parser in the n8n / GitHub Actions workflow.

7. **Bootstrap `METRICS.md` for StormAtlas** as the canonical example.
   This is highest-stakes UI in Eddie's fleet — it benefits most from
   the traction lens and is the lowest-risk place to make the first
   bootstrap mistake.

8. **Open MVP windows** per the operator defaults table (§2.6) — one
   `.godmythos/mvp-windows.yaml` entry per active SaaS MVP.

9. **Roll out across the fleet** in priority order:
   StormAtlas → Eco-Auditor → ProvenanceOS → SEO AI Regent →
   internal SaaS dashboards. KDP, trading bots, and infrastructure
   stay on full rigor — they don't need the MVP layer.

10. **Schedule MVP-end pay-down reviews** in calendar — one per open
    window, dated to `expires - 7 days`. The week before the window
    closes is when debt becomes urgent.

---

## 9. Refined Failure Modes

In addition to the v10.2 failure modes (frontend-design-gate trigger
order, stale theme.css, `@google/design.md` version drift), watch for:

### MVP velocity failures

- **`MVP_COMPRESS` invoked without expiry.** Refuse to enter the mode.
  An MVP window without an expiry is a license, not a posture. Make
  the user pick a date.

- **`MVP_COMPRESS` invoked for production-stage product.** Operator
  defaults table (§2.6) flags KDP / trading / infrastructure as
  full-rigor. If the user tries to compress one of these, ask once,
  warn, then defer to user. If approved, log in
  `.godmythos/mvp-windows.yaml` with a `scope_override: true` flag so
  the choice is visible on review.

- **Compressing past the boundary.** User asks to skip a security
  audit "just for the MVP," skip the Cartography gate "just for one
  component," ship without tests "we'll add them after launch." All
  refused per §6. Cite the section.

- **Stale `METRICS.md`.** `last_reviewed` field > 30 days old triggers
  a WARN on Gate 4 (design-score / traction-score combined). Either
  refresh or mark the feature `status: abandoned`.

### Traction lens failures

- **`METRICS.md` north-star is unmeasurable.** "More engagement,"
  "better UX," "happier users" — all D-grade. Force a number, a
  query, an event name. If the user cannot define how the metric is
  measured, the metric is not real.

- **`METRICS.md` north-star contradicts the friction inventory.**
  E.g., north-star is "free signups" but the friction inventory has
  credit-card collection in step 2. Flag immediately — this is the
  most common MVP self-sabotage.

### SMOKE_TOGGLE failures

- **Flag never removed.** Phase 0 wraps the surface in a flag; the
  fix flips the default; a follow-up PR should remove the flag.
  When that follow-up PR doesn't ship, the flag becomes permanent
  technical debt. Run a quarterly audit:
  `git grep -rn "FLAG_" | wc -l` should trend down, not up.

- **Flag becomes a feature.** Sometimes the toggled-OFF path turns
  out to be useful (a "classic mode" toggle). This is fine but should
  be made explicit — move the flag out of `flags/diagnose/` into
  `flags/features/` and add a `METRICS.md` entry for the flag's usage.

### Problem-space failures

- **Graph treated as roadmap.** Restated from §5.5. Watch for users
  who run `PROBLEM_SPACE_MAP`, see a god-node pain with no mitigates
  edges, and immediately start building. Force a `BRAINSTORM` /
  `IDEA_REFINE` cycle between the graph and the build.

- **Pain nodes that are actually feature requests.** "Users want
  dark mode" is not a pain — it's a hypothesis. The pain it proposes
  to fix ("eye strain at night," "OS-level inconsistency," whatever)
  is the pain. Re-classify before graph build.

---

## 10. Drop-in Snippets

For the GODMYTHOS bootstrap kit and Eddie's existing skills.

### 10.1 Append to `godmythos.md` HARD RULES section

```markdown
**#19 — MVP_COMPRESS is a posture, not a license** ← NEW v10.3
When `MVP_COMPRESS` is invoked for a named scope with a declared
expiry, Hard Rules #11, #13, #14 and Gates 5, 6 downgrade to
BEST_EFFORT for the window. The Cartography gates, correctness rules
(#1–#9), and security gates remain at full strength. Debt items are
logged in `.godmythos/mvp-windows.yaml` and become blockers on
expiry. Full protocol: this bundle §2. Drift past expiry is a Hard
Rule violation.

**#20 — DESIGN_SCORE is incomplete without TRACTION_SCORE** ← NEW v10.3
Any design-quality artifact must also include a traction-alignment
score (Category 8). `METRICS.md` is the canonical traction sketch and
is required at repo root for any product under `MVP_COMPRESS`. A
`DESIGN_SCORE` grade ≥ A requires Category 8 ≥ B. Full protocol: this
bundle §3.
```

### 10.2 Append to WORK MODE ROUTING table

```markdown
| `MVP_COMPRESS` | Entering MVP velocity window; time-bounded rigor dial-down | this bundle §2 |
| `TO_ONEPAGER` | Auto-selected over TO_PRD when MVP_COMPRESS active | this bundle §2.5 |
| `TRACTION_FIRST` | Generating or scoring METRICS.md; extending DESIGN_SCORE | this bundle §3 |
| `SMOKE_TOGGLE` | Phase 0 of DIAGNOSE; wrap surface in feature flag | this bundle §4 |
| `PROBLEM_SPACE_MAP` | Map pain/tool/hypothesis/metric edges before BRAINSTORM | this bundle §5 |
```

### 10.3 Append to CI gates section

(CI Gate 7 block from §7 above.)

### 10.4 New file — `.godmythos/mvp-windows.yaml`

(Schema and example from §2.3 above. Initial content is an empty
list `[]`.)

### 10.5 New file — `.godmythos/overrides.yaml`

```yaml
# .godmythos/overrides.yaml
#
# Hard Rule and Cartography gate overrides. Each entry requires:
#   - rule: the rule or gate being overridden
#   - reason: one-line justification
#   - expires: ISO-8601 date — no perpetual overrides
#   - owner: who approved
#
# Always-on rules (Cartography gates, HR #1–#9, security gates, CI Gates
# 1/2/3/4) require this file to be modified for any override. MVP_COMPRESS
# alone does NOT override these — see bundle §6 for the boundary.

overrides: []
```

### 10.6 New file — `METRICS.md` template

(Template from §3.1 above. Drop into repo root, fill in north-star.)

---

## 11. Changelog

**v10.3 (this bundle) — Cartography + MVP Velocity Pack**

Additions:
- Hard Rule #19 — `MVP_COMPRESS` is a posture, not a license
- Hard Rule #20 — `DESIGN_SCORE` requires Category 8 (TRACTION_SCORE)
- Work modes: `MVP_COMPRESS`, `TO_ONEPAGER`, `TRACTION_FIRST`,
  `SMOKE_TOGGLE`, `PROBLEM_SPACE_MAP`
- CI Gate 7 — scope-tag attestation
- Phase 0 added to DIAGNOSE (`SMOKE_TOGGLE` ahead of feedback-loop work)
- KNOWLEDGE_GRAPH extension — pain/tool/solution_hypothesis/metric
  node types and `causes`/`mitigates`/`competes_with`/`proposes`/
  `validates`/`risks` edge types
- New files: `.godmythos/mvp-windows.yaml`, `.godmythos/overrides.yaml`,
  `METRICS.md` template
- Operator defaults table for Eddie's fleet (StormAtlas, Eco-Auditor,
  ProvenanceOS, SEO AI Regent, KDP, trading bots, infrastructure)

Carries forward unchanged from v10.2:
- `opencode-design` Pre-Flight Gate (HR-Cartography-04/05/07)
- `frontend-design-gate` skill
- Cartography Doctrine Extension coordination clause
- Gate Skill Chain table

Carries forward unchanged from v10:
- All v10 Hard Rules (#1–#18)
- Knowledge Graph Doctrine
- PocockOps Doctrine
- All v10 work modes and CI Gates 1–6
- Compound Engineering base

**Compatibility:** Drop-in over v10.2. No breaking changes. The MVP
layer is opt-in per cycle; repos that never invoke `MVP_COMPRESS`
behave identically to v10.2.

---

## Apply checklist

```
[ ] v10.2 Cartography bundle applied (opencode-design + frontend-design-gate)
[ ] Hard Rule #19 added to godmythos.md HARD RULES
[ ] Hard Rule #20 added to godmythos.md HARD RULES
[ ] 5 new modes added to WORK MODE ROUTING table
[ ] CI Gate 7 added to system/CI_INTEGRATION.md
[ ] DIAGNOSE protocol updated with Phase 0 reference
[ ] KNOWLEDGE_GRAPH reference updated with new node/edge types
[ ] DESIGN_SCORE reference updated with Category 8
[ ] INTEL reference updated with competitor METRICS.md reconstruction
[ ] .godmythos/mvp-windows.yaml created (empty list)
[ ] .godmythos/overrides.yaml created (empty list)
[ ] METRICS.md template documented in references/
[ ] StormAtlas bootstrap: METRICS.md filled in
[ ] StormAtlas bootstrap: MVP window opened in mvp-windows.yaml
[ ] Operator defaults table reviewed; non-MVP stacks confirmed full-rigor
[ ] Calendar reminders scheduled: window-expires - 7 days for each open window
```

---

*GODMYTHOS v10.3 — Cartography + MVP Velocity Bundle. The doctrine is*
*the belt; the gates are the suspenders; the MVP layer is the running*
*shoes. Together they let you move fast without falling on your face.*
