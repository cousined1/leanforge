# Workflow Modes
## GODMYTHOS v9 Reference

> All named work modes. Load this file when invoking any mode by name.
> New v9 modes marked ← NEW.

---

## Table of Contents

- [§COMPOUND_MODE](#compound_mode) ← NEW
- [§CONFIDENCE_GATE](#confidence_gate) ← NEW (see also compound-loop.md §GATE)
- [§POLISH_MODE](#polish_mode) ← NEW (see also compound-loop.md §POLISH)
- [§IDEA_REFINE](#idea_refine) (updated: LLM-as-Judge integrated)
- [§EXECUTION](#execution) (updated: mandatory review enforcement)
- [§INCIDENT](#incident)
- [§RECON](#recon)
- [§ARCHITECTURE](#architecture)
- [§PERFORMANCE](#performance)
- [§GREENFIELD](#greenfield)
- [§DEBUG](#debug)
- [§CODE_REVIEW](#code_review)
- [§DEPENDENCY_TRUTH](#dependency_truth)
- [§DEPRECATION](#deprecation)

---

## §COMPOUND_MODE ← NEW

**Invoke when:** Cycle complete and learnings need to be persisted, or when
starting a new cycle and you need to load prior learnings.

**On cycle completion (save):**
1. Review what was built/changed/resolved in this cycle
2. Extract 1-3 learnings (minimum 1 — "nothing to document" rejected)
3. Check `docs/knowledge/` for contradictions — update with `supersedes:` if found
4. Write artifacts per knowledge artifact format (see `compound-loop.md §COMPOUND`)
5. Confirm written paths in output

**On cycle start (load):**
1. Read `docs/knowledge/` index (or list files)
2. Filter for tags relevant to current task
3. Surface applicable entries in BRAINSTORM context
4. Flag STALE entries (>90 days) and LOW confidence entries explicitly

**When `docs/knowledge/` doesn't exist yet:**
Create it. Write the first artifact. Add a `.gitkeep` if empty.
Never skip COMPOUND because the directory doesn't exist.

---

## §IDEA_REFINE (updated v9)

**Invoke when:** Multiple competing approaches exist before committing to PLAN.

**Protocol:**
1. Enumerate approaches (minimum 2, maximum 5 worth evaluating)
2. For each approach: one paragraph on mechanism, tradeoffs, and scope fit
3. **LLM-as-Judge scoring** (v9 addition):
   - Define scoring dimensions before scoring (correctness, complexity, reversibility,
     testability, operational cost)
   - Score each approach per dimension (1-5)
   - Surface per-dimension table, not a single average
4. Select highest-scoring approach that meets the non-negotiable constraints
5. Document rejected approaches with explicit reasoning in `docs/plans/` as
   `{feature-slug}-decisions.md` (Architecture Decision Record format)

**ADR format:**
```markdown
# ADR: {decision title}
## Status: Accepted
## Context: {why this decision was needed}
## Decision: {what was chosen}
## Alternatives Considered:
  - {option}: rejected because {reason}
## Consequences: {what this enables/constrains}
```

Do not select an approach because it feels clean. Score it.

---

## §EXECUTION (updated v9)

**Input:** Approved plan (DOCUMENT_REVIEW passed). Confidence gate passed.

**Execution contract:**
- Build steps in dependency order
- Compile/lint/test after each step — no batched validation
- Mandatory code review per step (not optional post-execution)
- Do not re-scope mid-execution — surface scope changes, halt, update plan

**Subagent dispatch (when available):**
Parallelize independent steps. Each subagent receives:
- The specific plan step
- The full plan document (context)
- The test strategy for its step
- The code review checklist

**Completion criteria:**
- All plan steps complete
- All tests pass
- Compiler/linter clean
- Code review checklist passed for each step
- Definition of Done criteria met (binary)
- Route to §REVIEW

---

## §INCIDENT

**Production is broken. Time-critical. Speed > process.**

**Immediate actions (first 5 minutes):**
1. Identify blast radius: what is broken, how many users affected
2. Check recent deploys: what changed in the last 24 hours
3. Decide: rollback available and clean? Roll back first, investigate after.
4. If no clean rollback: identify the minimal surgical fix

**Investigation protocol:**
- Trace the error to its origin — do not fix symptoms
- State the hypothesis before touching code: *"I believe X causes Y because Z"*
- Validate hypothesis before applying fix
- Test the fix in isolation if possible

**Post-incident (mandatory, even for small incidents):**
- Write a one-paragraph incident summary
- Compound it: `docs/knowledge/incident-{slug}.md` with type: `anti-pattern`
- Add to `references/debugging-playbook.md` if the failure class is new

---

## §RECON

**Invoke when:** Entering an unfamiliar codebase or resuming after a long gap.

**Protocol:**
1. Read `README.md`, `CLAUDE.md`, `docs/` tree (if present)
2. Check `docs/knowledge/` for existing learnings about this codebase
3. Map entry points: `main`, `index`, CLI commands, API routes
4. Map the data model: schema files, migration history, ORM models
5. Map the dependency tree: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`
6. Run OSS security gate on the dependency manifest (spot-check at minimum)
7. Identify high-churn files (git log --stat if available)
8. Produce a RECON brief:

```markdown
# RECON Brief: {codebase name}

## Architecture Summary
{one paragraph: what this is and how it's structured}

## Entry Points
{list of main entry points with brief descriptions}

## Data Model
{key entities and relationships}

## Dependency Health
{any WARN or BLOCK findings from OSS gate}

## High-Risk Areas
{files/modules with high churn, complex logic, or sparse tests}

## Prior Learnings Applied
{entries from docs/knowledge/ that are relevant}
```

**v9 addition:** Load `docs/knowledge/` as part of RECON. Prior learnings
from past cycles on this codebase surface here, not on-demand during execution.

---

## §ARCHITECTURE

**Invoke for:** New service design, system boundaries, data modeling,
API contract design, infrastructure architecture.

**Protocol:**
1. RESEARCH_GROUND first if the architecture space is unfamiliar
2. CONFIDENCE_GATE before producing the architecture document
3. Produce an architecture document at `docs/architecture/{name}.md`

**Architecture document sections:**
- Problem being solved (one sentence)
- Non-functional requirements (latency, throughput, availability, cost)
- Service boundaries and responsibilities
- Data model (entities, relationships, ownership)
- API contracts (interfaces between services)
- Failure modes and mitigations
- Scalability path (what happens at 10x load)
- Security posture (authentication, authorization, data sensitivity)
- Operational concerns (observability, deploy strategy, rollback)

**Decision record:** Every non-obvious architectural choice gets an ADR.
Store in `docs/architecture/decisions/`. See §IDEA_REFINE for ADR format.

---

## §PERFORMANCE

**Invoke for:** Profiling, bottleneck removal, query optimization,
render performance, memory/CPU optimization.

**Protocol:**
1. Measure before optimizing. No profiling = no optimization.
   "I think this is slow" is not a measurement.
2. State the baseline: {metric} = {value} at {conditions}
3. Identify the bottleneck: profiler output, query EXPLAIN, flame graph
4. Propose fix. State expected improvement before implementing.
5. Implement fix. Measure again.
6. State the delta: {metric} went from {before} to {after} ({percent} improvement)
7. Compound: if the bottleneck class is new, document it in `docs/knowledge/`

**Do not optimize without a measurement gate.** The rationalization
"this is obviously faster" is a §JUDGE bypass. Measure it.

---

## §GREENFIELD

**New project from scratch.**

**Phase 1 — Stack selection:**
- Apply GODMYTHOS stack defaults unless there is a concrete technical reason to deviate
- State the reason explicitly if deviating
- Run OSS security gate on all bootstrap dependencies

**Phase 2 — Project scaffold:**
- Initialize repo with proper `.gitignore` for the stack
- Set up CI pipeline (lint + test + build at minimum)
- Set up pre-commit hooks
- Create `docs/` directory with `README.md` and `plans/` and `knowledge/` subdirs
- Create `AGENTS.md` (or `CLAUDE.md` for Claude Code specifically) so all agents read project doctrine

**Phase 3 — Compound Loop entry:**
Greenfield is a LARGE scope task by definition.
Run the full loop: BRAINSTORM → GATE → PLAN → DOCUMENT_REVIEW → WORK → REVIEW → COMPOUND

---

## §DEBUG

**Invoke for:** Tracing failures, root cause analysis, error reproduction.

**Protocol:**
1. Reproduce the error first. If you can't reproduce it, you're guessing.
2. State the hypothesis: *"I believe X causes Y because Z"*
3. Test the hypothesis: what single change would confirm or deny it?
4. Apply the change. Observe. Revise hypothesis if denied.
5. Fix the root cause, not the symptom
6. Add a test that would have caught this failure
7. Compound: if the failure class is new, add to `references/debugging-playbook.md`
   and save a `docs/knowledge/` entry

**Causal chain tracing:**
- Start from the observable symptom
- Trace upstream: what produced this? What produced that?
- Continue until you reach either: (a) a code change that introduced the failure,
  or (b) an external dependency that changed behavior
- Do not fix at a middle point in the chain — fix the origin

---

## §CODE_REVIEW

**Invoke for:** Reviewing existing code for quality, correctness, security, maintainability.

**Review dimensions:**

1. **Correctness** — Does it do what it claims? Are edge cases handled?
2. **Security** — New attack surfaces? Input validation? Auth boundary respected?
3. **Test coverage** — Happy path? Failure path? Edge cases?
4. **Readability** — Would a new engineer understand this in 60 seconds?
5. **Maintainability** — Is complexity justified? Single responsibility? No hidden coupling?
6. **Performance** — Any obvious N+1, unbounded loops, or memory leaks?
7. **Hard Rule compliance** — Any stubs, TODOs in production paths, deprecated APIs?

**Output format:**
```
FINDING: {dimension} | {severity: CRITICAL/HIGH/MEDIUM/LOW/INFO}
Location: {file:line}
Issue: {what the problem is}
Impact: {what breaks or risks arise}
Fix: {specific remediation}
```

**Severity definitions:**
- CRITICAL: ships broken code or security hole
- HIGH: works today, breaks under load or specific conditions
- MEDIUM: works but creates technical debt or test gap
- LOW: style/readability concern
- INFO: observation, no action required

**Verdict:** PASS (no CRITICAL/HIGH) / PASS WITH NOTES / FAIL (any CRITICAL or HIGH)

---

## §DEPENDENCY_TRUTH

**Invoke for:** Auditing declared vs. actual dependencies; finding ghost and phantom deps.

**Protocol:**
1. Read declared dependencies: `package.json`, `pyproject.toml`, `go.mod`, etc.
2. Check for transitive vulnerabilities: `npm audit`, `pip-audit`, `govulncheck`
3. Identify unused declared deps (ghost deps)
4. Identify used but undeclared deps (phantom deps — risk: break on deploy)
5. Run OSS security gate on any dep with a WARN or BLOCK flag
6. Produce a dependency health report

**Report format:**
```markdown
# Dependency Health Report: {project name}

## Summary
Total: {n} | Healthy: {n} | WARN: {n} | BLOCK: {n} | Ghost: {n} | Phantom: {n}

## BLOCK Items (must fix before ship)
{dep}: {reason}

## WARN Items (requires explicit sign-off)
{dep}: {reason}

## Ghost Dependencies (declared but unused)
{dep}: remove from manifest

## Phantom Dependencies (used but undeclared)
{dep}: add to manifest explicitly
```

---

## §DEPRECATION

**Invoke for:** Managing deprecated APIs, libraries, or patterns that are still in use.

**Protocol — for each deprecated item:**
1. Confirm it is actually deprecated (not just old)
2. Identify the migration path (official or community-established)
3. Assess effort: hours / days / weeks
4. Make a decision:

| Decision | Condition | Action |
|----------|-----------|--------|
| **MIGRATE NOW** | Effort < 4h AND migration path is clear | Migrate in this cycle |
| **DEFER WITH TICKET** | Effort > 4h OR migration path is unclear | Create ticket, set deadline, add to `docs/knowledge/` |
| **ACCEPT AS TECHNICAL DEBT** | Security-neutral, effort > 1 week, no migration path | Document formally in `docs/knowledge/` with review date |

"It still works" with no recorded decision is a Hard Rule #8 violation.
Every deprecated item in the codebase must have one of the three above decisions recorded.
