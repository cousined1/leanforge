# Knowledge Graph Doctrine — graphify integration

> Layer 2 of the v10 doctrine stack. Recon, intel, and cross-document
> understanding run on `graphify` graphs, not grep. Hard Rule #14: knowledge
> graph before grep.

`graphify` (PyPI: `graphifyy`) turns any folder of code, docs, papers,
images, or video into a queryable knowledge graph with:

- **Persistent JSON** — `graphify-out/graph.json` survives across sessions
- **Honest audit trail** — every edge tagged `EXTRACTED` / `INFERRED` / `AMBIGUOUS`
- **Community detection** — Leiden clustering on graph topology (no embeddings)
- **God nodes** — highest-degree concepts (what everything connects through)
- **Rationale extraction** — `# WHY:`, `# NOTE:`, `# IMPORTANT:`, `# HACK:`
  comments and docstrings become `rationale_for` nodes
- **~71x token reduction** on mixed corpora vs raw-file reads (verified on
  Karpathy repos + papers + images, 52 files)

---

## §INSTALL — per platform

`graphify` is the same CLI everywhere. The integration glue differs.

```bash
# Recommended (Mac / Linux, both managed installs)
uv tool install graphifyy && graphify install
# or
pipx install graphifyy && graphify install
# or plain pip
pip install graphifyy && graphify install
```

After install, wire the agent platform:

| Platform | Setup command | Always-on mechanism |
|----------|---------------|---------------------|
| Claude Code | `graphify claude install` | `CLAUDE.md` section + PreToolUse hook in `.claude/settings.json` (fires before every Glob/Grep) |
| Codex | `graphify codex install` | `AGENTS.md` + PreToolUse hook in `.codex/hooks.json` |
| OpenCode | `graphify opencode install` | `AGENTS.md` + `tool.execute.before` plugin in `.opencode/plugins/graphify.js` |
| Google Antigravity | `graphify antigravity install` | `.agents/rules/graphify.md` (always-on) + `.agents/workflows/graphify.md` (slash command) |
| Kilo Code | manual (see below) | `AGENTS.md` entry + skill copy to `.kilocode/skills/graphify/` |

**Kilo Code manual install (no first-party graphify integration yet):**

```bash
# 1. Install CLI
uv tool install graphifyy   # or pipx install graphifyy

# 2. Copy skill into Kilo's skill dir (project-local)
mkdir -p .kilocode/skills/graphify
curl -fsSL https://raw.githubusercontent.com/safishamsi/graphify/v5/graphify/skill.md \
  > .kilocode/skills/graphify/SKILL.md

# 3. Add an AGENTS.md entry so Kilo's system prompt picks it up
cat >> AGENTS.md <<'EOF'

## graphify

If `graphify-out/GRAPH_REPORT.md` exists, read it before any architectural
or "what is this" question. Use the graph instead of grepping for structure.
Rebuild after code changes with `graphify <path>` or `graphify hook install`.
EOF
```

**Codex parallel-extraction prerequisite:**
```toml
# ~/.codex/config.toml
[features]
multi_agent = true
```

---

## §POST_COMMIT_HOOK — keep the graph fresh

Platform-agnostic git hook. Install once per project:

```bash
graphify hook install     # post-commit + post-checkout, no background process
graphify hook status      # verify
graphify hook uninstall   # remove
```

After every `git commit` the hook detects changed code files (`git diff
HEAD~1`), re-runs AST extraction on those files, and rebuilds `graph.json`
+ `GRAPH_REPORT.md`. Doc / image changes are skipped — run
`graphify <path> --update` for those (LLM re-extraction).

If a rebuild fails, the hook exits non-zero so git surfaces the error rather
than silently shipping a stale graph.

---

## §USAGE — core commands

```bash
# Build / refresh
graphify .                          # full pipeline on current directory
graphify ./raw                      # specific path
graphify ./raw --mode deep          # aggressive INFERRED edge extraction
graphify ./raw --update             # incremental: only changed files
graphify ./raw --cluster-only       # rerun Leiden on existing graph
graphify ./raw --no-viz             # skip HTML, keep report + JSON
graphify ./raw --watch              # auto-rebuild on code changes

# Add external content to corpus
graphify add https://arxiv.org/abs/1706.03762
graphify add https://x.com/karpathy/status/...
graphify add <video-url>            # yt-dlp + faster-whisper
graphify add <url> --author "Name" --contributor "Name"

# Query (CLI, no agent needed)
graphify query "what connects auth to the database?"
graphify query "show the auth flow" --dfs
graphify query "..." --budget 1500
graphify path "AuthModule" "Database"
graphify explain "SwinTransformer"

# Cross-repo
graphify clone https://github.com/karpathy/nanoGPT
graphify merge-graphs repo1/.../graph.json repo2/.../graph.json --out cross.json

# Export
graphify ./raw --svg                # graph.svg
graphify ./raw --graphml            # Gephi / yEd
graphify ./raw --neo4j              # cypher.txt
graphify ./raw --neo4j-push bolt://localhost:7687
graphify ./raw --wiki               # markdown wiki per community
graphify ./raw --obsidian           # Obsidian vault
graphify ./raw --mcp                # start MCP stdio server
```

---

## §OUTPUT_LAYOUT

```
graphify-out/
├── GRAPH_REPORT.md   plain-language summary — read this first
├── graph.html        interactive viz (vis.js)
├── graph.json        persistent graph (NetworkX node-link format)
└── cache/            SHA256 cache — re-runs only process changed files
```

**Always-on agent reads `GRAPH_REPORT.md`.** The hook surfaces it before
every Glob / Grep / Bash call (on platforms with hook support). Read it for
a one-page orientation: god nodes, communities, surprising connections,
suggested questions.

For specific lookups, traverse `graph.json` via:
- `graphify query` — BFS / DFS traversal with token budget
- `graphify path` — shortest path between two nodes
- `graphify explain` — node + 1-hop neighborhood
- MCP server (`python -m graphify.serve graphify-out/graph.json`) — exposes
  `query_graph`, `get_node`, `get_neighbors`, `shortest_path` as tools

---

## §CONFIDENCE_TAGS — interpreting edges

Every relationship in the graph carries one of:

| Tag | Meaning | Confidence |
|-----|---------|-----------|
| `EXTRACTED` | Found directly in source (AST call, import, citation, exact text match) | 1.0 |
| `INFERRED` | Reasonable inference with confidence score 0.0–1.0 attached | variable |
| `AMBIGUOUS` | Flagged for human review | n/a |

**Maps directly onto Hard Rule #12 confidence levels:**
- `EXTRACTED` evidence supports HIGH confidence claims
- `INFERRED` with score >0.85 supports HIGH; 0.6–0.85 = MEDIUM; <0.6 = LOW
- `AMBIGUOUS` always forces a GRILL_DOCS pass before execution

When citing graph evidence in plans, ADRs, or compound learnings, **always
include the tag** so the next agent (or future you) can re-evaluate
confidence without re-reading the source.

```markdown
> Per `graph.json`: `AuthModule` --INFERRED(0.82)--> `JWTValidator`
> (semantic similarity from rationale comments). Worth verifying with a
> grep before relying on it for the migration plan.
```

---

## §IGNORE — exclude paths

Create `.graphifyignore` at repo root (same syntax as `.gitignore`):

```
# .graphifyignore
node_modules/
dist/
vendor/
*.generated.py
docs/translations/
graphify-out/

# never extract your own agent instructions as knowledge
AGENTS.md
CLAUDE.md
GEMINI.md
.codex/
.opencode/
.claude/
```

A single root-level `.graphifyignore` works even when graphify is run on a
subfolder.

---

## §TEAM_WORKFLOW — committing the graph

`graphify-out/` is designed to be committed to git so every teammate starts
with a fresh map.

**Recommended `.gitignore` additions:**
```
graphify-out/cache/         # optional: commit for shared extraction speed
graphify-out/manifest.json  # mtime-based, invalid after git clone
graphify-out/cost.json      # local token tracking
```

**Shared setup:**
1. One person runs `graphify .` and commits `graphify-out/`
2. Everyone pulls — their agent reads `GRAPH_REPORT.md` immediately
3. Install `graphify hook install` so every commit refreshes the graph
4. For doc / paper / image changes, run `graphify --update` after the edit

---

## §WHEN_TO_BUILD — Hard Rule #14 in practice

**Build a graph (mandatory):**
- Inheriting a codebase you didn't write
- Auditing a third-party repo before integrating
- Multi-context monorepo where `CONTEXT-MAP.md` exists
- Research corpus (papers + code + notes mixed)
- Any repo >20 files where the question is "what does this do" or "how is X
  connected to Y"

**Skip the graph (legitimate):**
- Single-file fix with explicit line/function reference
- The graph already exists and is <1 commit stale
- Trivial scaffolding where you wrote everything in this session
- Pure UI styling pass (use `designlang` instead)

**Always wrong:**
- Grepping a 200-file repo to "understand the architecture"
- Reading 30 files in sequence to find a connection
- Stating an architectural claim from memory when graph evidence is one
  command away

---

## §INTEL_INTEGRATION — graphify in CLONE / INTEL pipelines

`INTEL` mode (researching a target) and `CLONE` mode (reproducing a product)
both extend with graphify:

```
INTEL pipeline:
  BuiltWith API call          → tech stack profile
  designlang score <url>      → design quality grade
  graphify clone <github_url> → architecture graph (if repo is public)
  --> compound: intel report cites god nodes from cloned graph

CLONE pipeline:
  Step 1: INTEL (above)       → know what you're cloning
  Step 2: graphify clone      → understand their architecture
  Step 3: designlang extract  → exact tokens
  Step 4: skillui ultra       → visual fingerprint
  Step 5: PLAN with evidence  → BRAINSTORM cites god nodes + tokens
  Step 6: EXECUTION           → vertical slices, each citing graph evidence
```

See `references/orchestration-intel-clone.md` for the full pipeline.

---

## §WIKI — agent-crawlable knowledge base

```bash
graphify ./raw --wiki
```

Generates Wikipedia-style markdown:

```
graphify-out/wiki/
├── index.md                 entry point — community list, god nodes
├── communities/
│   ├── auth-and-sessions.md
│   ├── data-layer.md
│   └── ...
└── nodes/
    ├── AuthModule.md         per-god-node article
    └── ...
```

Point any agent at `index.md` and it can navigate the knowledge base by
reading files instead of parsing JSON. Useful when the agent platform lacks
an MCP layer (Kilo Code, partial OpenCode setups).

---

## §MCP_SERVER — live agent access

For Claude Code / Codex / OpenCode (any platform with MCP support):

```bash
# .mcp.json or platform equivalent
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

Exposed tools: `query_graph`, `get_node`, `get_neighbors`, `shortest_path`.
Use this when the conversation involves repeated targeted queries — beats
re-reading `GRAPH_REPORT.md` over and over.

**WSL / Linux note:** Ubuntu ships `python3` not `python`. Use a venv path:

```bash
python3 -m venv .venv && .venv/bin/pip install "graphifyy[mcp]"
```

```json
{
  "mcpServers": {
    "graphify": {
      "type": "stdio",
      "command": ".venv/bin/python3",
      "args": ["-m", "graphify.serve", "graphify-out/graph.json"]
    }
  }
}
```

---

## §VIDEO_AND_AUDIO — multimodal corpus

```bash
pip install 'graphifyy[video]'
graphify ./my-corpus               # picks up .mp4 .mov .mp3 .wav etc.
graphify add <youtube-url>         # yt-dlp downloads audio, transcribes
graphify ./my-corpus --whisper-model medium  # better accuracy
```

Audio never leaves the machine. faster-whisper transcribes locally, using a
domain-aware prompt derived from the corpus's god nodes. Transcripts cache
in `graphify-out/transcripts/`.

---

## §HONESTY_RULES — non-negotiable

These are graphify's own rules, mirrored here as v10 doctrine:

- **Never invent an edge.** If unsure, tag `AMBIGUOUS`.
- **Never skip the corpus-size warning** (>200 files or >2M words).
- **Always show token cost** in the report.
- **Never hide cohesion scores** behind symbols — show the raw number.
- **Never run HTML viz on >5,000 nodes** without warning the user.
- **Never claim graph evidence you didn't verify.** EXTRACTED is the floor;
  INFERRED is a hypothesis until checked; AMBIGUOUS is always a finding,
  not a conclusion.

---

## §COMPOUND_INTEGRATION — graph + knowledge layer

Compound learnings (`docs/knowledge/*.md`) and the knowledge graph reinforce
each other:

- **Graph informs compound:** when writing a `docs/knowledge/` artifact,
  cite god nodes and confidence-tagged edges as evidence.
- **Compound informs graph:** Markdown in `docs/knowledge/` is itself
  ingested by graphify — your past learnings become nodes in the next graph
  rebuild.
- **Cross-repo learning:** `graphify merge-graphs` combines multiple
  `graph.json` outputs. Each node is tagged with its source repo. Use this
  to find patterns that recur across your projects.

The full v10 loop:
```
WORK → COMPOUND → docs/knowledge/*.md → graphify --update →
graph.json + GRAPH_REPORT.md updated → next BRAINSTORM reads them
→ better PLAN → better WORK → ...
```

This is the compounding interest the doctrine is named for.
