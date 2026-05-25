# Orchestrator — Intent Routing System
## GODMYTHOS v10 System Component

> The orchestrator reads every input and routes to the correct mode without
> manual switching. The operator can override any routing decision with
> explicit mode invocation.

Platform-agnostic across Claude Code, Codex, OpenCode, Kilo Code, and
Antigravity. The router consults `graphify-out/GRAPH_REPORT.md` if present
before any recon-style routing decision.

---

## Routing Algorithm

```
INPUT arrives
  │
  ├─ Knowledge-graph signals?
  │   ├─ "graphify" / "/graphify" / "knowledge graph" / "build a graph" → KNOWLEDGE_GRAPH
  │   └─ "what does this codebase do" + unfamiliar repo                 → KNOWLEDGE_GRAPH (then route)
  │
  ├─ Contains URL?
  │   ├─ + "extract" / "tokens" / "design system"     → DESIGN_EXTRACT
  │   ├─ + "score" / "grade" / "quality"              → DESIGN_SCORE
  │   ├─ + "clone" / "reproduce" / "match"            → CLONE pipeline
  │   ├─ + "compare" / "vs" + second URL              → DESIGN_COMPARE
  │   ├─ + "watch" / "monitor" / "drift"              → DESIGN_WATCH
  │   ├─ + "intel" / "tech stack"                     → INTEL (BuiltWith + graphify clone)
  │   ├─ GitHub URL + "explain" / "study"             → KNOWLEDGE_GRAPH (graphify clone)
  │   └─ + build/redesign intent                      → FULL_REDESIGN (extract first)
  │
  ├─ Error / failure state?
  │   ├─ "production down" / "incident"               → INCIDENT
  │   ├─ Stack trace / error / "diagnose" / "debug"   → DIAGNOSE (feedback-loop first)
  │   └─ Runtime failure / fetch failed               → INCIDENT or DIAGNOSE (severity)
  │
  ├─ Review / audit?
  │   ├─ "review" / PR link                           → CODE_REVIEW
  │   ├─ "security" / "audit" / "CVE"                 → SECURITY_AUDIT
  │   └─ "dependencies" / "audit deps"                → DEPENDENCY_TRUTH
  │
  ├─ Planning / decomposition / interview?
  │   ├─ "grill me" / "stress test" / "interview me"  → GRILL_DOCS
  │   ├─ "turn this into a PRD" / "write a PRD"       → TO_PRD
  │   ├─ "break into issues" / "vertical slices"      → TO_ISSUES
  │   ├─ "triage" / "needs-triage" / "is this a bug"  → TRIAGE
  │   ├─ "find architectural friction" / "deep modules" → DEEP_MODULE_HUNT
  │   ├─ "brainstorm" / "let's think" / "options"     → IDEA_REFINE → BRAINSTORM
  │   ├─ "plan" / "spec" / "architect"                → ARCHITECTURE or PLAN
  │   ├─ "greenfield" / "new project" / "scaffold"    → GREENFIELD
  │   └─ "deprecated" / "migrate" / "upgrade"         → DEPRECATION
  │
  ├─ Optimization?
  │   ├─ "slow" / "optimize" / "performance"          → PERFORMANCE
  │   └─ profiler output present                      → PERFORMANCE
  │
  ├─ Knowledge / meta-control?
  │   ├─ "compound" / "what did we learn"             → COMPOUND_MODE
  │   ├─ "knowledge" / "learnings"                    → COMPOUND_MODE (load)
  │   ├─ "zoom out" / "I don't know this area"        → ZOOM_OUT
  │   └─ "caveman" / "be brief" / "tighten"           → CAVEMAN_MODE
  │
  └─ Default: Implementation request
      ├─ Single file / quick fix                      → QUICK_SURGICAL (SMALL scope)
      ├─ Multi-file feature / component               → EXECUTION (MEDIUM scope)
      └─ New service / migration / architecture       → Full Compound Loop (LARGE scope)
```

---

## Pre-routing checks

Before applying routing logic, the orchestrator runs two cheap checks:

**1. Graph awareness check.** If the working directory contains
`graphify-out/GRAPH_REPORT.md`, read it. The orientation it provides
sometimes changes the routing decision (e.g., "fix this bug" might route
to `DIAGNOSE` directly when the graph already shows the relevant subsystem
is well-isolated, or to `KNOWLEDGE_GRAPH` first when the graph is stale).

**2. CONTEXT.md awareness check.** If `CONTEXT.md` exists, the orchestrator
seeds the conversation with its vocabulary so the rest of the routing
respects domain language (Hard Rule #15).

Both checks are silent — no narration to the user. They affect routing
quality, not output.

---

## Override Protocol

The operator can bypass the orchestrator at any time:

- **Explicit mode name:** "Run SECURITY_AUDIT on this" → route to SECURITY_AUDIT
- **ULTRATHINK prefix:** "ULTRATHINK: should we migrate to..." → deep reasoning before routing
- **Scope override:** "This is SMALL, just fix it" → skip compound loop ceremony
- **Pipeline override:** "Skip extract, I already have the tokens" → enter CLONE at foundation step
- **Caveman override:** "caveman" anywhere in the message → route output through CAVEMAN_MODE

When override is detected, log it:
`[OVERRIDE] Operator requested {mode}, bypassing orchestrator route to {original_route}.`

---

## Compound Pipeline Routing

For MEDIUM and LARGE scope tasks, the orchestrator enforces the v10 loop:

```
1. Route to correct mode
2. KNOWLEDGE_GRAPH check (Hard Rule #14): build/refresh if needed
3. Run CONFIDENCE_GATE (mandatory for MEDIUM/LARGE)
4. If confidence HIGH → proceed to mode entry
5. If confidence MEDIUM → resolve unknowns → re-gate
6. If confidence LOW → GRILL_DOCS → re-gate (cannot enter execution on LOW)
7. On mode completion → enforce COMPOUND step
8. On COMPOUND completion → surface next recommended action
```

---

## Multi-Mode Pipelines

Some tasks require sequential mode invocation. The orchestrator manages these:

**CLONE pipeline (v10, graphify-augmented):**
```
INTEL (BuiltWith) → graphify clone <url> → DESIGN_EXTRACT →
[VISUAL_CAPTURE] → RECON → GREENFIELD (scaffold) →
EXECUTION (build, vertical slices) → DESIGN_SCORE → REVIEW → COMPOUND
```

**FULL_REDESIGN pipeline:**
```
KNOWLEDGE_GRAPH (target site if accessible) → RECON → DESIGN_EXTRACT →
BRAINSTORM → PLAN → EXECUTION → DESIGN_SCORE → REVIEW → COMPOUND
```

**INTEL pipeline (v10):**
```
BuiltWith lookup → DESIGN_SCORE → graphify clone (if public repo) →
synthesize Intel Brief (cite god nodes + tokens) → COMPOUND
```

**GREENFIELD pipeline:**
```
BRAINSTORM → CONFIDENCE_GATE → PLAN → DOCUMENT_REVIEW →
scaffold (CONTEXT.md + AGENTS.md/CLAUDE.md + docs/agents/) →
EXECUTION (vertical slices) → REVIEW → COMPOUND
```

**DIAGNOSE pipeline (v10, supersedes DEBUG):**
```
Phase 1 BUILD_FEEDBACK_LOOP → Phase 2 REPRODUCE → Phase 3 HYPOTHESIZE →
Phase 4 INSTRUMENT → Phase 5 FIX_AND_TEST → Phase 6 CLEANUP_AND_POSTMORTEM →
COMPOUND
```

**TO_PRD → TO_ISSUES → TRIAGE pipeline:**
```
TO_PRD (synthesize) → publish (needs-triage) → TRIAGE (categorize + state) →
TO_ISSUES (vertical slices) → publish each (needs-triage) → TRIAGE each →
ready-for-agent / ready-for-human
```

---

## Routing Confidence

The orchestrator should route with high confidence (>90%) on most inputs.
When routing confidence is low (ambiguous input):

1. State the two most likely routes
2. Ask the operator which intent applies
3. Log the ambiguity for future pattern matching

Do NOT default to the most complex pipeline when a simpler route fits.
Minimal ceremony for minimal tasks.

---

## Mode Aliases (back-compat from v9)

Legacy invocations still work; the orchestrator transparently maps them:

| Legacy (v9) | v10 target |
|-------------|------------|
| `DEBUG` | `DIAGNOSE` |
| `RECON` | `KNOWLEDGE_GRAPH` if corpus >20 files, else `RECON` |
| `BRAINSTORM` on LOW conf | `GRILL_DOCS` first, then `BRAINSTORM` |

The legacy names are not deprecated — they're just routed through the new
machinery.
