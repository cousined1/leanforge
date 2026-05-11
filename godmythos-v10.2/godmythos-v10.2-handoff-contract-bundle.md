# GODMYTHOS v10.2 — Handoff Contract Bundle

Three deliverables that make the Cartography → UI handoff fail closed:

1. **`opencode-design` patch** — front-matter `requires:`/`produces:` blocks + body pre-flight gate.
2. **`frontend-design-gate` skill** — user-level wrapper for the read-only public `frontend-design` skill. Gate runs first, public skill runs second.
3. **GODMYTHOS v10.2 coordination clause** — small addendum to the Cartography Doctrine Extension explaining how the gate chains.

Apply order: 1 → 2 → 3. Test with one project (StormAtlas is the lowest-risk candidate) before fleet-wide rollout.

---

## 1. `opencode-design` Patch

Target file: `/mnt/skills/user/opencode-design/SKILL.md` (or wherever your `opencode-design` SKILL.md lives).

### 1a. Front-Matter Replacement

Replace the existing front matter with:

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
governed_by: godmythos-v10.2 / Cartography Doctrine
---
```

### 1b. Body Insertion — Pre-Flight Gate

Insert this section as the **very first `##` section** in the SKILL.md body, before any existing content:

```markdown
## Pre-Flight Gate (HR-Cartography-04 / 05 / 07)

**This skill fails closed.** Before generating, editing, or reviewing any component, perform the following checks in order. If any check fails, halt and emit the failure protocol below — do not proceed with the task, do not improvise tokens, do not auto-bootstrap.

### Required artifacts

1. `DESIGN.md` exists at repo root.
2. `.cartography/theme.css` exists and is non-empty.
3. `npx @google/design.md lint --format json DESIGN.md` exits 0 with no `error` severity findings and no `contrast-ratio` warnings (this doctrine promotes contrast warnings to errors).

### Failure Protocol

If any required artifact is missing or stale, respond to the user with exactly:

> **Cartography pre-flight failed.** `opencode-design` requires `.cartography/theme.css` and a passing `DESIGN.md` lint before component work can proceed. Run the GODMYTHOS Cartography pre-flight (`graphify` + `@google/design.md` export) or invoke the Bootstrap Procedure if `DESIGN.md` does not yet exist. I will not proceed until the artifacts are present.

Then stop. Do not offer alternatives, do not suggest temporary tokens, do not write a "rough first pass." The contract is: tokens flow down, requests flow up.

### Token Consumption Rule (HR-Cartography-07)

When the gate passes:
- Reference tokens via Tailwind v4 `@theme` CSS variables (`var(--color-primary)`, `text-(--color-on-tertiary)`, etc.) sourced from `.cartography/theme.css`.
- For non-Tailwind stacks, consume `tokens.json` via your token-loader of choice (Style Dictionary, etc.).
- **No hex literals.** No `#1A1C1E` anywhere in component code. If a value is needed and not in `DESIGN.md`, halt and request a token addition through Cartography (which will run the `diff` gate).
```

---

## 2. `frontend-design-gate` Skill

Target file: `/mnt/skills/user/frontend-design-gate/SKILL.md` — new file, user-level, takes precedence over the public `frontend-design` skill via more specific triggering.

```markdown
---
name: frontend-design-gate
description: Pre-flight gate that runs before any frontend implementation work. Triggers on every request involving production frontend code — React, Vue, Svelte, Next.js, Astro, vanilla HTML/CSS, landing pages, dashboards, web apps, mobile web, or any styling/beautifying of a web UI. Verifies the GODMYTHOS Cartography handoff contract (DESIGN.md present, theme.css exported, lint passing) before delegating to the public frontend-design skill. Always runs first when frontend work is requested in a repo governed by godmythos-v10.2.
requires:
  - path: .cartography/theme.css
    format: tailwind-v4-theme
    source: "npx @google/design.md export --format css-tailwind DESIGN.md"
    on_missing: refuse
  - path: DESIGN.md
    format: design-md-alpha
    on_missing: refuse
delegates_to: frontend-design
governed_by: godmythos-v10.2 / Cartography Doctrine
---

# frontend-design-gate

This skill is a **gate**, not an implementation skill. It runs before `frontend-design` and exists because the public `frontend-design` skill is read-only and cannot itself enforce the Cartography handoff contract.

## Order of Operations

1. **Detect repo governance.** Check for `godmythos.md` (or `.godmythos/`) in the repo. If absent, this skill is a no-op — yield directly to `frontend-design`.
2. **Run the gate** (steps below).
3. **On pass** — emit a one-line preamble to the user (`Cartography contract verified. Delegating to frontend-design.`) and yield to the public `frontend-design` skill, passing `.cartography/theme.css` as a required input in the handoff.
4. **On fail** — halt with the Failure Protocol. Do NOT yield to `frontend-design`.

## The Gate

Verify, in order:

1. `DESIGN.md` exists at repo root.
2. `.cartography/theme.css` exists, is non-empty, and is newer than `DESIGN.md` (else stale — re-export required).
3. `.cartography/graph.json` exists (graphify pre-flight ran).
4. `npx @google/design.md lint --format json DESIGN.md` exits 0. `contrast-ratio` warnings count as errors under godmythos-v10.2.
5. If the working tree has uncommitted changes to `DESIGN.md`, run `git show HEAD:DESIGN.md | npx @google/design.md diff - DESIGN.md` and verify `regression: false`.

## Failure Protocol

Emit:

> **Cartography pre-flight failed at `frontend-design-gate`.** [Specific failure: which file, which check.]
>
> Required action:
> - If `DESIGN.md` is missing → run the godmythos-v10.2 Bootstrap Procedure.
> - If `.cartography/theme.css` is missing or stale → re-run `npx @google/design.md export --format css-tailwind DESIGN.md > .cartography/theme.css`.
> - If `lint` failed → fix the surfaced errors before frontend work proceeds.
> - If `diff` shows regression → justify the regression in the PR description or revert the offending DESIGN.md change.
>
> I will not delegate to `frontend-design` until these are resolved.

Then stop. The point of the gate is to prevent silent token drift across the five-platform agent fleet (Claude Code, Codex, OpenCode, Kilo Code, Antigravity). Failing closed is a feature.

## Pass Behavior

When all five checks pass, emit exactly one preamble line to the user:

> Cartography contract verified — DESIGN.md ✓, theme.css ✓ (fresh), lint ✓, diff ✓. Delegating to frontend-design.

Then yield. The public `frontend-design` skill takes over and produces production code consuming the verified theme.

## Non-Goals

- This skill does NOT generate UI code. It only verifies and delegates.
- This skill does NOT auto-bootstrap `DESIGN.md`. That is HR-Cartography-04's Bootstrap Procedure, which requires explicit user approval.
- This skill does NOT modify `DESIGN.md` or `.cartography/*`. Read-only verification only.
```

---

## 3. GODMYTHOS v10.2 Coordination Clause

Add to `godmythos.md` and `godmythos-v2.md`, immediately after the **Hand-Off Contract** table in the Cartography Doctrine Extension:

```markdown
### Gate Skill Chain

The handoff contract is enforced by two skill-level gates that fail closed:

| Trigger | Gate | Delegates to |
| --- | --- | --- |
| Component / HTML work | `opencode-design` (self-gating in body) | — (terminal) |
| Production frontend code | `frontend-design-gate` (user-level wrapper) | `frontend-design` (public, read-only) |

Both gates verify the same artifact set (`DESIGN.md`, `.cartography/theme.css`, lint pass, diff clean). The redundancy is intentional: any agent on any of the five platforms — Claude Code, Codex, OpenCode, Kilo Code, Antigravity — that invokes either skill hits the gate first, regardless of whether it routed through the GODMYTHOS Cartography pre-flight.

This is belt-and-suspenders. The doctrine is the belt; the skill front-matter `requires:` blocks and body gates are the suspenders. A skill invoked outside doctrine context still fails closed.

**Conflict resolution.** If a user explicitly says "skip the gate" or "just write the code without DESIGN.md," the gate still refuses. Override requires editing `.godmythos/overrides.yaml` with a documented reason and an expiry date — never inline. This protects against social-engineering style drift across long agent sessions.
```

---

## Rollout Sequence

1. **Apply patch 1** to `opencode-design` first. Test on a non-critical component task (e.g., a small UI tweak in StormAtlas).
2. **Drop patch 2** as a new file. Verify it triggers ahead of public `frontend-design` by running a deliberately broken request (no `DESIGN.md` in repo) — should fail closed with the Failure Protocol.
3. **Apply patch 3** to godmythos.md. Sanity-check that the doctrine reads coherently end-to-end.
4. **Bootstrap `DESIGN.md` for StormAtlas** (highest-stakes UI in the fleet) — this becomes the canonical reference for what a passing repo looks like.
5. **Roll out across the fleet** in priority order: StormAtlas → KDP cover-gen pipeline → MEXC/Polymarket trade UIs → internal SaaS dashboards → ComfyUI poster pipelines.

## Known Failure Modes to Watch

- **`frontend-design-gate` not triggering ahead of public `frontend-design`.** Skill resolution depends on description specificity and trigger keywords. If the public skill keeps winning, narrow the public skill's effective trigger by adding a redirecting note to your top-level CLAUDE.md / AGENTS.md ("In godmythos-governed repos, route all frontend requests through `frontend-design-gate` first") so the harness picks the gate.
- **Stale `theme.css`.** The freshness check (file mtime newer than `DESIGN.md`) catches the common case. Doesn't catch `DESIGN.md` edits that were rolled back via undo without saving — but that's a vanishingly small edge case.
- **`@google/design.md` 0.1.0 → 0.2.0 schema drift.** Pin is in place. When you bump, expect to revisit the `requires:` block in case `format:` keys change.
