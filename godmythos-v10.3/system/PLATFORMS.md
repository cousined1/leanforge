# Platforms — Multi-Agent Deployment Matrix
## GODMYTHOS v10 System Component

> Where each artifact lives across Claude Code, Codex, OpenCode, Kilo Code,
> and Google Antigravity. The doctrine is identical; the install paths and
> always-on mechanisms differ.

---

## Always-on mechanism per platform

The "always-on mechanism" is how the agent platform automatically loads
project-level rules every session, with no slash command needed.

| Platform | Rules file | Hook layer | Skill location |
|----------|-----------|------------|----------------|
| Claude Code | `CLAUDE.md` | PreToolUse hook in `.claude/settings.json` | `.claude/skills/` (project) or `~/.claude/skills/` (global) |
| Codex | `AGENTS.md` | PreToolUse hook in `.codex/hooks.json` | `~/.codex/skills/` |
| OpenCode | `AGENTS.md` | `tool.execute.before` plugin in `.opencode/plugins/` | `~/.config/opencode/skills/` |
| Kilo Code | `AGENTS.md` | None (rule discipline only) | `.kilocode/skills/` (project) — manual copy |
| Google Antigravity | `.agents/rules/*.md` (always-on) + `.agents/workflows/*.md` (slash commands) | None | `.agents/skills/` |

**Common ground:** all five platforms read either `AGENTS.md` or
`CLAUDE.md` at the project root. Write doctrine to `AGENTS.md` by default;
Claude Code will also pick that up. Use `CLAUDE.md` only when you need
behavior specific to Claude Code.

> **Never create both `AGENTS.md` and `CLAUDE.md` with overlapping content.**
> Pick one as canonical and reference it from the other if both files must
> exist.

---

## §INSTALL — godmythos skill per platform

### Claude Code

```bash
# Project-local
mkdir -p .claude/skills/godmythos
cp -r path/to/godmythos/* .claude/skills/godmythos/

# Or global
mkdir -p ~/.claude/skills/godmythos
cp -r path/to/godmythos/* ~/.claude/skills/godmythos/
```

Then in `CLAUDE.md`:

```markdown
## Skills

- **godmythos** (`~/.claude/skills/godmythos/SKILL.md`) — full-stack
  engineering doctrine. Triggers on architecture, planning, debugging,
  feature implementation, design, knowledge-graph work.
```

### Codex

```bash
# Codex skill dir
mkdir -p ~/.codex/skills/godmythos
cp -r path/to/godmythos/* ~/.codex/skills/godmythos/
```

In `AGENTS.md`:

```markdown
## Skills

- **godmythos** — full-stack engineering doctrine. Read
  `~/.codex/skills/godmythos/SKILL.md` for the routing brain and Hard
  Rules. Loaded automatically on planning, build, debug, design tasks.
```

Required for parallel subagent extraction (graphify, design-extract):

```toml
# ~/.codex/config.toml
[features]
multi_agent = true
```

### OpenCode

```bash
mkdir -p ~/.config/opencode/skills/godmythos
cp -r path/to/godmythos/* ~/.config/opencode/skills/godmythos/
```

In `AGENTS.md`: same block as Codex, with the OpenCode skill path.

### Kilo Code

Kilo's skill mechanism is project-local and rule-driven (no first-party
skill registry):

```bash
mkdir -p .kilocode/skills/godmythos
cp -r path/to/godmythos/* .kilocode/skills/godmythos/
```

In `AGENTS.md`:

```markdown
## Skills

- **godmythos** (`.kilocode/skills/godmythos/SKILL.md`) — read this skill
  before any architecture, planning, debug, or design task. The Hard Rules
  override default behavior. Reference files load on demand.
```

Kilo Code has no PreToolUse hook layer. Discipline is on the agent —
re-read the skill at the start of every session and after any compaction.

### Google Antigravity

```bash
mkdir -p .agents/skills/godmythos
cp -r path/to/godmythos/* .agents/skills/godmythos/
```

In `.agents/rules/godmythos.md` (always-on rules):

```markdown
# godmythos rules

Read `.agents/skills/godmythos/SKILL.md` at session start. The Hard Rules
(#1–#18) are non-negotiable. The orchestrator routing table determines
which mode to enter. Reference files load on demand from
`.agents/skills/godmythos/references/`.
```

In `.agents/workflows/godmythos.md` (slash command registration):

```markdown
# /godmythos

Invoke godmythos doctrine explicitly. Re-reads SKILL.md and resets the
orchestrator state.
```

---

## §GRAPHIFY_INSTALL — per platform

`graphify` (PyPI: `graphifyy`) is the canonical knowledge-graph tool
across all platforms.

```bash
# Recommended (managed install on PATH)
uv tool install graphifyy
# or
pipx install graphifyy
```

Then per-platform integration:

| Platform | Command |
|----------|---------|
| Claude Code | `graphify claude install` |
| Codex | `graphify codex install` |
| OpenCode | `graphify opencode install` |
| Antigravity | `graphify antigravity install` |
| Kilo Code | manual (see below) |

**Kilo Code manual graphify install:**

```bash
mkdir -p .kilocode/skills/graphify
curl -fsSL https://raw.githubusercontent.com/safishamsi/graphify/v5/graphify/skill.md \
  > .kilocode/skills/graphify/SKILL.md

cat >> AGENTS.md <<'EOF'

## graphify

If `graphify-out/GRAPH_REPORT.md` exists, read it before any architectural
or "what is this" question. Use the graph instead of grepping for
structure. Rebuild after code changes with `graphify <path>` or
`graphify hook install`.
EOF
```

**Always-on graphify post-commit hook (all platforms):**

```bash
graphify hook install   # post-commit + post-checkout
graphify hook status
graphify hook uninstall
```

This is the platform-agnostic mechanism that keeps `graphify-out/` fresh.

---

## §GIT_GUARDRAILS — per platform

> Blocks `git push`, `reset --hard`, `clean -f`, `clean -fd`, `branch -D`,
> `checkout .`, `restore .` before they execute.

The hook script is identical across platforms (see
`references/pocockops-doctrine.md §GIT_GUARDRAILS`). The wiring differs.

### Claude Code

`.claude/hooks/block-dangerous-git.sh` (executable) +
`.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
        }]
      }
    ]
  }
}
```

### Codex

`.codex/hooks/block-dangerous-git.sh` + `.codex/hooks.json`:

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "command": "$CODEX_PROJECT_DIR/.codex/hooks/block-dangerous-git.sh"
    }
  ]
}
```

### OpenCode

`.opencode/plugins/block-dangerous-git.js`:

```javascript
export default {
  hooks: {
    "tool.execute.before": async ({ tool, input }) => {
      if (tool !== "bash") return;
      const cmd = input.command || "";
      const blocked = [
        /git\s+push/,
        /git\s+reset\s+--hard/,
        /git\s+clean\s+-f/,
        /git\s+branch\s+-D/,
        /git\s+(checkout|restore)\s+\./,
      ];
      for (const re of blocked) {
        if (re.test(cmd)) {
          return { error: `BLOCKED: ${cmd} is not permitted by godmythos guardrails.` };
        }
      }
    }
  }
}
```

Plus registration in `opencode.json`:

```json
{ "plugins": [".opencode/plugins/block-dangerous-git.js"] }
```

### Kilo Code

No hook layer. Add to `AGENTS.md`:

```markdown
## Git guardrails

Do NOT run any of these commands:
- git push (any variant including --force)
- git reset --hard
- git clean -f / -fd
- git branch -D
- git checkout . / git restore .

If a destructive operation is genuinely needed, surface the request to the
human first.
```

This is rule discipline only. Combine with shell-level aliases for
critical projects:

```bash
# ~/.bashrc or project .envrc
alias git-push-disabled='echo "BLOCKED by godmythos guardrails"; false'
```

### Antigravity

No hook layer. Add to `.agents/rules/git-guardrails.md`:

```markdown
# Git guardrails (always-on)

Do NOT run any of: git push, git reset --hard, git clean -f, git clean -fd,
git branch -D, git checkout ., git restore .

Surface destructive requests to the human first.
```

---

## §MCP_SERVER — per platform

The graphify MCP server (`python -m graphify.serve graphify-out/graph.json`)
exposes `query_graph`, `get_node`, `get_neighbors`, `shortest_path` as
tools. Configuration:

### Claude Code

`.mcp.json`:
```json
{
  "mcpServers": {
    "graphify": {
      "type": "stdio",
      "command": "python3",
      "args": ["-m", "graphify.serve", "graphify-out/graph.json"]
    }
  }
}
```

### Codex / OpenCode

Same `.mcp.json` schema; both honor the standard MCP config format.

### Kilo Code

Kilo Code MCP support is partial — check current version. If supported,
same `.mcp.json` schema. If not, fall back to invoking
`graphify query / path / explain` via Bash from within the agent
conversation.

### Antigravity

Antigravity has MCP support; use `.mcp.json` at project root.

---

## §AGENTS_MD_TEMPLATE — common entry point

A canonical `AGENTS.md` that all five platforms can consume:

```markdown
# AGENTS.md

This repo follows GODMYTHOS v10 doctrine. Agents on Claude Code, Codex,
OpenCode, Kilo Code, and Google Antigravity should all behave consistently.

## Skills

- **godmythos** (`.claude/skills/godmythos/SKILL.md` or platform-equivalent)
  — full-stack engineering doctrine. Hard Rules #1–#18 are non-negotiable.
  Routing brain in SKILL.md ORCHESTRATOR section.

## graphify

If `graphify-out/GRAPH_REPORT.md` exists, read it before any architectural
or "what is this" question. Use the graph instead of grepping. Rebuild on
commit via `graphify hook install`.

## Domain docs

- `CONTEXT.md` — canonical domain language. Use this vocabulary in every
  artifact. Update inline when terms are sharpened.
- `docs/adr/` — Architectural Decision Records. Three-test gate before
  writing one.
- `docs/knowledge/` — compound learnings from completed work cycles.
- `docs/plans/` — technical plans, source of truth during EXECUTION.

## Issue tracker

[GitHub Issues / GitLab / .scratch markdown / etc.]. See
`docs/agents/issue-tracker.md`.

## Triage labels

Five canonical states (`needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`) + two categories (`bug`, `enhancement`).
See `docs/agents/triage-labels.md`.

## Git guardrails

Do NOT run: git push, git reset --hard, git clean -f / -fd, git branch -D,
git checkout . / git restore .
```

This single file makes the project legible to every agent the operator
might launch.
