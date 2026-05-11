# AGENTS.md

This repository follows **GODMYTHOS v10** doctrine. All agents — Claude Code,
Codex, OpenCode, Kilo Code, Google Antigravity — should behave consistently
when working in this repo. Read this file first, every session.

> Replace placeholders in `{curly braces}` with your project's actual values.
> Delete sections that don't apply.

---

## Project

**Name:** {project-name}
**Description:** {one-sentence description of what this project is}
**Primary stack:** {e.g., Next.js 14 / FastAPI / React Native + Expo}
**Deploy target:** {e.g., Vercel / Coolify / Cloudflare / Railway}

---

## Skills

- **godmythos** — full-stack engineering doctrine. Hard Rules #1–#18 are
  non-negotiable. Routing brain in `SKILL.md` ORCHESTRATOR section.
  Reference files load on demand from `references/` and `system/`.
  - Claude Code: `.claude/skills/godmythos/SKILL.md` or `~/.claude/skills/godmythos/SKILL.md`
  - Codex: `~/.codex/skills/godmythos/SKILL.md`
  - OpenCode: `~/.config/opencode/skills/godmythos/SKILL.md`
  - Kilo Code: `.kilocode/skills/godmythos/SKILL.md`
  - Antigravity: `.agents/skills/godmythos/SKILL.md`

Read it at session start. Re-read after any context compaction.

---

## graphify

**If `graphify-out/GRAPH_REPORT.md` exists, read it before any architectural,
recon, or "what is this" question.** Use the graph instead of grepping for
structure. This is Hard Rule #14.

- Build / refresh: `graphify .` or `graphify <path>`
- Auto-refresh on commit: `graphify hook install` (post-commit + post-checkout)
- Query from CLI: `graphify query "<question>"`, `graphify path A B`,
  `graphify explain <node>`
- MCP server (Claude Code / Codex / OpenCode / Antigravity):
  `python3 -m graphify.serve graphify-out/graph.json`

**Confidence tags on edges:**
- `EXTRACTED` — found directly in source, confidence 1.0
- `INFERRED` — semantic inference, confidence 0.0–1.0 attached
- `AMBIGUOUS` — flagged for human review

When citing graph evidence in plans / ADRs / compound learnings, **always
include the tag** so confidence is auditable.

`.graphifyignore` lives at repo root with the same syntax as `.gitignore`.

---

## Domain docs

- **`CONTEXT.md`** — canonical domain language. Use this vocabulary in
  every artifact (tests, issues, PRDs, ADRs, code). Update **inline** when
  terms are sharpened — don't batch. This is Hard Rule #15.
- **`docs/adr/NNNN-slug.md`** — Architectural Decision Records. Three-test
  gate before writing one (hard-to-reverse + surprising + real trade-off).
  This is Hard Rule #16. See `docs/agents/domain.md` for details.
- **`docs/knowledge/*.md`** — compound learnings from completed work
  cycles. Every cycle produces at least one. This is Hard Rule #11.
- **`docs/plans/*.md`** — technical plans, source of truth during EXECUTION.
- **`.out-of-scope/*.md`** — rejection rationales (prevents re-suggestion
  loops during TRIAGE).

Multi-context monorepos add a root `CONTEXT-MAP.md` pointing to per-context
`CONTEXT.md` files (e.g., `src/ordering/CONTEXT.md`).

---

## Issue tracker

{Choose one — delete the others.}

- **GitHub Issues** for `{org/repo}`. Use the GitHub CLI (`gh`) or REST API.
  See `docs/agents/issue-tracker.md` for label conventions and templates.
- **GitLab Issues** for `{group/repo}`. See `docs/agents/issue-tracker.md`.
- **Linear** workspace `{workspace}`. See `docs/agents/issue-tracker.md`.
- **`.scratch/issues/`** — markdown-based local issues. See
  `docs/agents/issue-tracker.md` for the file format.

---

## Triage labels

Every triaged issue carries **exactly one category role** and **one state
role**. See `docs/agents/triage-labels.md` for the full state machine.

**Categories:** `bug` · `enhancement`

**States:** `needs-triage` · `needs-info` · `ready-for-agent` ·
`ready-for-human` · `wontfix`

**Default-on-create:** `needs-triage`.

---

## Build / test / lint

{Replace with your actual commands. Comment out lines that don't apply.}

```bash
# Install deps
npm install
# pnpm install
# yarn install
# pip install -r requirements.txt
# go mod download
# cargo build

# Type check / compile (Hard Rule #2)
npm run typecheck       # or: npx tsc --noEmit
# cargo check
# go build ./...
# mypy --strict .

# Test (Hard Rule #3)
npm test
# pytest
# cargo test
# go test ./...

# Lint / format
npm run lint
npm run format

# Security audit (Hard Rule #7)
npm audit --audit-level=high
# pip-audit
# cargo audit
# govulncheck ./...

# Design quality gate (Hard Rule #10, UI work only)
npx designlang score $DEPLOY_URL
```

---

## Git guardrails

**Do NOT run any of these commands:**

- `git push` (any variant including `--force`)
- `git reset --hard`
- `git clean -f` / `git clean -fd`
- `git branch -D`
- `git checkout .` / `git restore .`

If a destructive operation is genuinely needed, surface the request to the
human first.

On platforms with PreToolUse hook support (Claude Code, Codex, OpenCode),
the hook in `.claude/hooks/`, `.codex/hooks/`, or `.opencode/plugins/`
enforces this automatically. On Kilo Code and Antigravity, this is rule
discipline only.

---

## Pre-commit hooks

This repo uses Husky + lint-staged. Hooks run automatically on `git commit`:

- Prettier (or equivalent) auto-formats staged files
- Type check
- Test suite

If a hook fails, the commit is blocked. Fix the underlying issue — don't
bypass with `--no-verify`.

---

## CI quality gates

This repo enforces seven gates on every PR:

1. **Compiler clean** — `tsc --noEmit` / `cargo check` / equivalent (BLOCK)
2. **Test pass** — all tests pass, no flakes (BLOCK)
3. **Security gate** — no HIGH/CRITICAL CVEs (BLOCK)
4. **Design quality** — `designlang score` ≥ B on UI PRs (BLOCK)
5. **Compound artifact** — at least one `docs/knowledge/*.md` per PR (WARN)
6. **Knowledge graph fresh** — `graphify-out/` ≤ 1 commit stale (WARN)
7. **Vertical-slice discipline** — no test-only or impl-only PRs (BLOCK)

See `system/CI_INTEGRATION.md` in the godmythos skill for full details.

---

## Working with this repo — quick reference

**Starting any non-trivial work:**

1. Read `CONTEXT.md` — use this vocabulary throughout
2. Check for `graphify-out/GRAPH_REPORT.md` — read it before grepping
3. Skim relevant ADRs in `docs/adr/`
4. Look at recent `docs/knowledge/` entries for prior learnings
5. Run the orchestrator routing logic in `SKILL.md`

**Confidence gate (Hard Rule #12):**
- HIGH (>85%) → proceed
- MEDIUM (60–85%) → resolve specific unknowns first
- LOW (<60%) → mandatory `GRILL_DOCS` interview before any code

**Tracer-bullet discipline (Hard Rule #17):**
- One vertical slice at a time, end-to-end
- RED→GREEN one test at a time, never bulk-write tests
- Each issue is independently grabbable and demoable
- Each issue labeled AFK or HITL

**Bug diagnosis (Hard Rule #18):**
- Phase 1 is "build a feedback loop." Do not generate hypotheses, do not
  stare at code, do not propose fixes until you have a fast deterministic
  pass/fail signal.

**Compound (Hard Rule #11):**
- Every WORK cycle produces a `docs/knowledge/*.md` artifact
- "Nothing to document" is not accepted — one sentence minimum

---

## Out-of-scope

See `.out-of-scope/` for enhancements that have been considered and
rejected. Read these during TRIAGE before evaluating new requests, to
avoid re-litigating settled questions.

---

## Repo-specific notes

{Add anything that's true of this repo but not generic doctrine. Examples:}

- {Authentication uses {provider}; the auth module is a god node — touch with care}
- {The {subsystem} has its own CONTEXT.md at {path}}
- {Production deploy requires manual approval; agents must mark deploy PRs HITL}
- {The {feature} flag system is documented in `docs/knowledge/feature-flags.md`}

---

*This file is the single source of truth for how agents operate in this
repo. If it's wrong or out of date, fix it — don't work around it.*
