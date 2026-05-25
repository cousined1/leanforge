# Enforcement Patterns
## GODMYTHOS v9 Reference

> Anti-rationalization rebuttals, context engineering, phase gate conditions.

---

## §1 — Anti-Rationalization Rebuttals

When you catch yourself forming an excuse to skip a step, find the excuse below
and apply the rebuttal. The excuse is the signal to follow the process.

### Spec/Plan Bypass Excuses

| Excuse | Rebuttal |
|--------|----------|
| "This is too small for a plan" | If it touches >1 file, it's not too small. Write a 3-line plan. |
| "I already know how to do this" | Your confidence is not a substitute for a documented path. Write the plan. |
| "The user wants it fast" | A 2-minute plan saves a 20-minute redo. Speed without direction is waste. |
| "I'll plan as I go" | Plans that emerge during execution are rationalizations, not plans. |

### Test Bypass Excuses

| Excuse | Rebuttal |
|--------|----------|
| "This is too simple to test" | Simple code still breaks. Write a smoke test. 30 seconds. |
| "I'll add tests later" | Later never comes. Tests ship with code. |
| "The type system catches this" | Types catch type errors. They don't catch logic errors. Test the logic. |
| "It's just a config change" | Config changes have caused more outages than code changes. Test it. |

### Review Bypass Excuses

| Excuse | Rebuttal |
|--------|----------|
| "I reviewed it myself, it's fine" | Self-review catches 30% of issues. External review catches 70%. Run it. |
| "The PR is too small to review" | Small PRs are the fastest to review. No excuse to skip. |
| "We need to ship today" | Shipping broken code today creates an incident tomorrow. Review. |

### Security Gate Bypass Excuses

| Excuse | Rebuttal |
|--------|----------|
| "This is a well-known library" | Well-known libraries get compromised (event-stream, ua-parser-js). Gate it. |
| "It has millions of downloads" | Downloads measure popularity, not security. Gate it. |
| "I've used it before" | Your prior use doesn't mean it hasn't been compromised since. Gate it. |

### Compound Step Bypass Excuses

| Excuse | Rebuttal |
|--------|----------|
| "Nothing to document" | If you wrote code, there's a learning. One sentence minimum. |
| "This was trivial" | Trivial decisions still have context that future you will forget. Document. |
| "I'll compound at the end of the sprint" | Learnings decay. Compound within the cycle. |

---

## §2 — Red Flags Per Mode

### EXECUTION mode red flags
- Plan was modified during execution without DOCUMENT_REVIEW
- Steps were reordered "because it made more sense"
- A step was skipped "because it turned out to be unnecessary"
- Scope grew without explicit acknowledgment

### CLONE mode red flags
- No designlang extraction before writing CSS
- Colors hardcoded without referencing token file
- "It looks close enough" without running designlang brands comparison
- No tech stack profiling (BuiltWith) before choosing the clone's stack

### INCIDENT mode red flags
- Code was changed before identifying root cause
- "It was probably this" without hypothesis validation
- No post-incident compound artifact
- Rollback was available but not considered first

### GREENFIELD mode red flags
- Stack chosen for novelty rather than fitness
- No OSS security gate on bootstrap dependencies
- No docs/ directory created at scaffold time
- No CLAUDE.md created for agent-driven projects

---

## §3 — Five-Level Context Hierarchy

Before loading files or starting work, evaluate your context state.

| Level | State | Action |
|-------|-------|--------|
| **L0: Blind** | No project context loaded | Run RECON before touching anything |
| **L1: Oriented** | README, directory structure, entry points known | Proceed with targeted file reads |
| **L2: Mapped** | Data model, dependencies, high-risk areas identified | Ready for planning |
| **L3: Deep** | Implementation details of relevant modules loaded | Ready for execution |
| **L4: Flooding** | Too many files loaded, losing focus | Summarize and drop non-essential context |

**Transitions:**
- Always enter at L0 on a new codebase or after compaction
- Move to L1 with minimal reads (README, package.json, directory listing)
- Move to L2 with targeted reads (schema files, key modules)
- Move to L3 only for the specific files you're changing
- If you hit L4, summarize loaded context into a brief and drop raw file content

**Anti-pattern:** Loading 20 files "to understand the codebase" before starting work.
This is L4 flooding. Read 3-5 targeted files to reach L2, then deepen as needed.

---

## §4 — Phase Gate Conditions

### BRAINSTORM → PLAN gate
- [ ] Requirements document exists at `docs/plans/{slug}-requirements.md`
- [ ] Goal is one sentence
- [ ] Scope boundaries are explicit (in/out)
- [ ] Verification requirements are testable
- [ ] Open questions are enumerated (even if empty)
- [ ] Confidence gate has been run (MEDIUM/LARGE scope)

### PLAN → WORK gate (DOCUMENT_REVIEW)
- [ ] Every step is unambiguous and agent-executable
- [ ] Steps are dependency-ordered
- [ ] Definition of Done is binary and testable
- [ ] Risk register covers obvious failure modes
- [ ] Test strategy covers critical paths
- [ ] No step requires an unresolved human decision
- [ ] Paths are repo-relative
- [ ] Open questions from BRAINSTORM are resolved or explicitly deferred

### WORK → REVIEW gate
- [ ] All plan steps complete
- [ ] All tests pass
- [ ] Compiler/linter clean
- [ ] Code review checklist passed per step
- [ ] Definition of Done criteria met (binary)
- [ ] No new security surface without OSS gate

### REVIEW → COMPOUND gate
- [ ] LLM-as-Judge scoring complete (or explicitly skipped for SMALL scope)
- [ ] Human sign-off received (or working solo)
- [ ] No FAIL verdict outstanding
- [ ] POLISH phase complete (if invoked)

---

## §5 — Deprecation/Migration Workflow

For each deprecated item in the codebase:

```
1. CONFIRM deprecated (not just old)
2. IDENTIFY migration path
3. ASSESS effort (hours / days / weeks)
4. DECIDE:
   - MIGRATE NOW (effort < 4h, clear path)
   - DEFER WITH TICKET (effort > 4h or unclear path)
   - ACCEPT AS DEBT (security-neutral, effort > 1 week, no path)
5. DOCUMENT decision in docs/knowledge/
6. SET review date for deferred items
```

"It still works" with no recorded decision is a Hard Rule #8 violation.

---

## §6 — Idea Refine Phase

Before committing to a plan on ambiguous problems:

1. Enumerate 2-5 competing approaches
2. Score each on: correctness, complexity, reversibility, testability, operational cost
3. Select highest-scoring approach that meets non-negotiable constraints
4. Document rejected approaches with explicit reasoning (ADR format)
5. Do not select based on elegance — score it

---

## §7 — Incremental Implementation Discipline

When a plan has 5+ steps:
- Execute one step at a time
- Validate after each step (compile, test)
- Do not batch validation ("I'll test at the end")
- If a step fails validation, fix it before proceeding
- If a step reveals scope creep, halt and update the plan

**The cost of batched validation:** One broken step in a batch of 5 means debugging
all 5 to find the one. Validate incrementally.
