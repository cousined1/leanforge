# GODMYTHOS v10 — Project Bootstrap Kit

Drop-in templates for any project that runs on the GODMYTHOS v10 doctrine.
Works across Claude Code, Codex, OpenCode, Kilo Code, and Google
Antigravity.

---

## What's in this kit

```
AGENTS.md                  # canonical agent entry point — root of repo
CONTEXT.md                 # canonical domain glossary (Hard Rule #15)
docs/
├── adr/
│   └── README.md          # Architectural Decision Records guide
├── agents/
│   ├── issue-tracker.md   # tracker config + templates
│   ├── triage-labels.md   # 5-state, 2-category state machine
│   └── domain.md          # CONTEXT/ADR/knowledge organization
├── knowledge/
│   └── README.md          # compound learnings format
└── plans/
    └── README.md          # technical plan format
.out-of-scope/
└── README.md              # rejection KB format
```

---

## Install

From the kit's root, copy into your project:

```bash
# From this kit's directory
cp -rn AGENTS.md CONTEXT.md docs .out-of-scope /path/to/your/project/
```

The `-n` flag means "don't overwrite" — preserves any existing files. If
you already have an `AGENTS.md` or `CONTEXT.md`, merge the v10 content in
manually rather than overwriting your project-specific notes.

---

## Customize

Open each file and replace `{placeholders}`:

1. **`AGENTS.md`** — fill in project name, stack, deploy target, build/test/
   lint commands, issue tracker choice. Delete sections that don't apply.
2. **`CONTEXT.md`** — replace the template terms with your real domain
   vocabulary. Start with 5–10 terms; grow it inline as work happens.
3. **`docs/agents/issue-tracker.md`** — set the tracker (GitHub / GitLab /
   Linear / .scratch), templates, label conventions.
4. **`docs/agents/domain.md`** — choose single-context vs multi-context;
   delete the option that doesn't apply.
5. **Delete or replace** the `README.md` files in `docs/adr/`,
   `docs/knowledge/`, `docs/plans/`, `.out-of-scope/` — they're
   placeholders that explain the format. Once you have real entries, the
   READMEs become optional.

---

## After install

```bash
# 1. Install the godmythos skill on your platform
#    (see system/PLATFORMS.md in the godmythos skill for full per-platform
#    instructions). Examples:
mkdir -p .claude/skills/godmythos       # Claude Code (project-local)
mkdir -p ~/.codex/skills/godmythos      # Codex (global)
# ...

# 2. Install graphify (optional but recommended)
uv tool install graphifyy
# or: pipx install graphifyy
graphify .                              # build initial graph
graphify hook install                   # auto-refresh on every commit

# 3. Set up git guardrails (Claude Code / Codex / OpenCode only — see
#    references/pocockops-doctrine.md §GIT_GUARDRAILS in the godmythos skill)

# 4. Set up pre-commit hooks (Husky + lint-staged + Prettier + typecheck + test)
npm i -D husky lint-staged prettier
npx husky init
# Configure .husky/pre-commit, .lintstagedrc, .prettierrc per
# references/pocockops-doctrine.md §PRE_COMMIT in the godmythos skill

# 5. Verify
git status
# AGENTS.md, CONTEXT.md, docs/, .out-of-scope/ should all be tracked
```

---

## Verify the agent picks it up

Open a new agent session in this repo. The agent should:

1. Read `AGENTS.md` (or `CLAUDE.md` for Claude Code) at session start
2. Pick up the godmythos skill reference and load `SKILL.md`
3. Read `CONTEXT.md` for domain vocabulary
4. Check for `graphify-out/GRAPH_REPORT.md` (if graphify is installed)

If the agent doesn't reference these on its own, the wiring is wrong.
Common causes:
- Skill not installed at the right platform-specific path
- `AGENTS.md` not at repo root
- Project being opened from a parent directory (open the project root,
  not its parent)

---

## Updating an existing repo

If your project already has some of these files and you're upgrading to
v10:

1. **Preserve** your existing `CONTEXT.md` content. Just verify the
   format matches the template (terms, _Avoid_ aliases, relationships,
   flagged ambiguities sections).
2. **Diff** your existing `AGENTS.md` against this template's. Merge in
   the new sections (graphify, vertical-slice discipline, CI gates 6/7,
   git guardrails) without losing your project-specific notes.
3. **Add** any missing directories: `docs/adr/`, `docs/knowledge/`,
   `docs/plans/`, `.out-of-scope/`.

---

## Doctrine summary

The kit assumes the godmythos skill is installed and readable. The skill
contains the full doctrine (18 Hard Rules, 30+ work modes, orchestrator
routing, CI gate specs, per-platform install matrix). This kit is
project-side scaffolding only — it tells the agent *where to look* in
your repo, not *how to behave*. The skill governs behavior.

Both pieces together = full GODMYTHOS v10 deployment.
