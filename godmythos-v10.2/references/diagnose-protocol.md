# Diagnose Protocol — feedback-loop first

> Mode: `DIAGNOSE`. Supersedes v9's "Bug Diagnosis Loop." Hard Rule #18:
> feedback loop before hypothesis.

A discipline for hard bugs and performance regressions. Skip phases only
when explicitly justified.

When exploring the codebase, use the project's CONTEXT.md vocabulary to get
a clear mental model of the relevant modules, and check ADRs in the area.
If `graphify-out/GRAPH_REPORT.md` exists, read it before grepping (Hard
Rule #14).

---

## Phase 1 — Build a feedback loop

**This is the skill.** Everything else is mechanical. If you have a fast,
deterministic, agent-runnable pass/fail signal for the bug, you will find
the cause — bisection, hypothesis-testing, and instrumentation all just
consume that signal. If you don't, no amount of staring at code will save
you.

Spend disproportionate effort here. **Be aggressive. Be creative. Refuse
to give up.**

### Construction hierarchy — try in this order

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e.
2. **Curl / HTTP script** against a running dev server.
3. **CLI invocation** with a fixture input, diffing stdout against a
   known-good snapshot.
4. **Headless browser script** (Playwright / Puppeteer) — drives the UI,
   asserts on DOM / console / network.
5. **Replay a captured trace.** Save a real network request / payload /
   event log to disk; replay it through the code path in isolation.
6. **Throwaway harness.** Spin up a minimal subset of the system (one
   service, mocked deps) that exercises the bug code path with a single
   function call.
7. **Property / fuzz loop.** If the bug is "sometimes wrong output", run
   1000 random inputs and look for the failure mode.
8. **Bisection harness.** If the bug appeared between two known states
   (commit, dataset, version), automate "boot at state X, check, repeat"
   so you can `git bisect run` it.
9. **Differential loop.** Run the same input through old-version vs
   new-version (or two configs) and diff outputs.
10. **HITL bash script.** Last resort. If a human must click, drive *them*
    with a structured loop so the loop is still structured. Captured
    output feeds back to you.

Build the right feedback loop, and the bug is 90% fixed.

### Iterate on the loop itself

Treat the loop as a product. Once you have *a* loop, ask:

- Can I make it faster? (Cache setup, skip unrelated init, narrow test scope.)
- Can I make the signal sharper? (Assert on the specific symptom, not
  "didn't crash".)
- Can I make it more deterministic? (Pin time, seed RNG, isolate filesystem,
  freeze network.)

A 30-second flaky loop is barely better than no loop. A 2-second
deterministic loop is a debugging superpower.

### Non-deterministic bugs

The goal is not a clean repro but a **higher reproduction rate**. Loop the
trigger 100×, parallelize, add stress, narrow timing windows, inject
sleeps. A 50%-flake bug is debuggable; 1% is not — keep raising the rate
until it's debuggable.

### When you genuinely cannot build a loop

Stop and say so explicitly. List what you tried. Ask the user for: (a)
access to whatever environment reproduces it, (b) a captured artifact (HAR
file, log dump, core dump, screen recording with timestamps), or (c)
permission to add temporary production instrumentation. Do **not** proceed
to hypothesize without a loop.

> **Hard Rule #18 violation:** "Let me try a fix and see if it works"
> without a loop is hypothesis without evidence. Push back.

Do not proceed to Phase 2 until you have a loop you believe in.

---

## Phase 2 — Reproduce

Run the loop. Watch the bug appear.

Confirm:
- [ ] The loop produces the failure mode the **user** described — not a
      different failure that happens to be nearby. Wrong bug = wrong fix.
- [ ] The failure is reproducible across multiple runs (or, for
      non-deterministic bugs, reproducible at a high enough rate to debug
      against).
- [ ] You have captured the exact symptom (error message, wrong output,
      slow timing) so later phases can verify the fix actually addresses it.

Do not proceed until you reproduce the bug.

---

## Phase 3 — Hypothesize

Generate **3–5 ranked hypotheses** before testing any of them.
Single-hypothesis generation anchors on the first plausible idea.

Each hypothesis must be **falsifiable** — state the prediction it makes:

> Format: "If <X> is the cause, then <changing Y> will make the bug
> disappear / <changing Z> will make it worse."

If you cannot state the prediction, the hypothesis is a vibe — discard or
sharpen it.

**Show the ranked list to the user before testing.** They often have domain
knowledge that re-ranks instantly ("we just deployed a change to #3"), or
know hypotheses they've already ruled out. Cheap checkpoint, big time
saver. Don't block on it — proceed with your ranking if the user is AFK.

**Use graph evidence when ranking.** If `graphify-out/graph.json` is
fresh, the god nodes and INFERRED edges around the bug location are
hypothesis fuel. Cite them with confidence tags.

---

## Phase 4 — Instrument

Each probe must map to a specific prediction from Phase 3. **Change one
variable at a time.**

**Tool preference:**

1. **Debugger / REPL inspection** if the env supports it. One breakpoint
   beats ten logs.
2. **Targeted logs** at the boundaries that distinguish hypotheses.
3. Never "log everything and grep".

**Tag every debug log with a unique prefix**, e.g. `[DEBUG-a4f2]`. Cleanup
at the end becomes a single `grep -r "\[DEBUG-a4f2\]"`. Untagged logs
survive into production; tagged logs die.

**Performance branch.** For performance regressions, logs are usually
wrong. Instead: establish a baseline measurement (timing harness,
`performance.now()`, profiler, query plan), then bisect. Measure first,
fix second.

---

## Phase 5 — Fix + regression test

Write the regression test **before the fix** — but only if there is a
**correct seam** for it.

A correct seam is one where the test exercises the **real bug pattern** as
it occurs at the call site. If the only available seam is too shallow
(single-caller test when the bug needs multiple callers, unit test that
can't replicate the chain that triggered the bug), a regression test
there gives false confidence.

**If no correct seam exists, that itself is the finding.** Note it. The
codebase architecture is preventing the bug from being locked down. Flag
this for Phase 6 — hand it to `DEEP_MODULE_HUNT` later.

If a correct seam exists:

1. Turn the minimized repro into a failing test at that seam.
2. Watch it fail.
3. Apply the fix.
4. Watch it pass.
5. Re-run the Phase 1 feedback loop against the original (un-minimized)
   scenario.

---

## Phase 6 — Cleanup + post-mortem

Required before declaring done:

- [ ] Original repro no longer reproduces (re-run the Phase 1 loop)
- [ ] Regression test passes (or absence of seam is documented)
- [ ] All `[DEBUG-...]` instrumentation removed (`grep` the prefix)
- [ ] Throwaway prototypes deleted (or moved to a clearly-marked debug
      location)
- [ ] The hypothesis that turned out correct is stated in the commit / PR
      message — so the next debugger learns
- [ ] CONTEXT.md updated if any domain term was sharpened during diagnosis
- [ ] Compound learning written to `docs/knowledge/` (Hard Rule #11)

**Then ask: what would have prevented this bug?** If the answer involves
architectural change (no good test seam, tangled callers, hidden
coupling), hand off to `DEEP_MODULE_HUNT` with the specifics. Make the
recommendation **after** the fix is in, not before — you have more
information now than when you started.

---

## Compound learning template (Phase 6 → docs/knowledge/)

```markdown
---
type: bug-postmortem
tags: [diagnose, <subsystem>, <symptom>]
confidence: HIGH
created: 2026-01-15
source: <commit-sha or PR link>
---

# {One-line bug description}

## Symptom

What the user saw. Exact error / wrong output / timing.

## Root cause

The hypothesis that turned out correct. Reference Phase 3 ranking position.

## Why diagnosis took as long as it did

The hypotheses that *didn't* pan out. What signal would have re-ranked them
faster.

## Fix

What changed. Reference the commit and the regression test.

## Architectural follow-up (if any)

If the seam was bad, link to the DEEP_MODULE_HUNT issue.

## Reusable signal

The shape of the feedback loop that nailed it — so the next diagnosis can
reuse it.
```

---

## When to short-circuit the protocol

`SMALL` scope, obvious bug, immediate fix:

- Reproduction is trivial (a one-line script or test)
- The fix is obvious from the stack trace
- No architectural concern

In that case: skip directly to Phase 5 (fix + regression test) + Phase 6
(compound). But the moment any of those conditions fails — back to Phase 1.

---

## Anti-patterns to reject

- Generating hypotheses with no feedback loop (Hard Rule #18)
- "Let me just try a fix and see"
- "I think it's probably X" without a falsifiable prediction
- Untagged debug logs left in the codebase
- Declaring "fixed" without re-running the original repro
- Skipping Phase 6 because "it was just a small fix"
- Blaming the code before checking runtime (RUNTIME TRUTH BEFORE CODE BLAME)
- Logging everything and grepping
- Stopping at the first plausible hypothesis (anchoring)
- Ignoring CONTEXT.md vocabulary in the post-mortem
