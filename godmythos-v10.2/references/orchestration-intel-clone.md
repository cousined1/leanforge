# Orchestration, Intel, Clone & Visual Asset Modes
## GODMYTHOS v9 Reference

> Multi-agent coordination, competitive intelligence, site cloning, and programmatic visual generation.

---

## §ORCHESTRATION — Multi-Agent Coordination

**Invoke when:** Work can be parallelized across multiple tracks with shared spec contracts.

**Protocol:**
1. Define work tracks — each track is an independent unit with clear inputs/outputs
2. Define spec contracts — the interface between tracks (data formats, API contracts, shared types)
3. Assign tracks to subagents (or sequential execution if subagents unavailable)
4. Define sync points — where tracks must merge and validate against each other
5. Execute tracks in parallel where possible
6. At each sync point: **collect per-track execution state before merging** (see below)
7. Validate that track outputs satisfy spec contracts — only on COMPLETED tracks
8. Assemble final output from track outputs
9. Run REVIEW on assembled result

**Track definition format:**
```markdown
## Track: {name}
- Input: {what this track receives}
- Output: {what this track produces}
- Contract: {interface spec that other tracks depend on}
- Dependencies: {other tracks that must complete first, or "none"}
- Estimated scope: SMALL / MEDIUM / LARGE
```

**Per-track execution state (Hard Rule #13 — required at every sync point):**

Each track must report one of these states before the orchestrator proceeds to merge:

| State | Meaning | Orchestrator Action |
|-------|---------|---------------------|
| `IDLE` | Not yet started | Do not merge — start or unblock the track |
| `PLANNING` | Generating plan, not executing | Wait or parallelize other tracks |
| `EXECUTING` | Active work in progress | Do not merge partial output |
| `BLOCKED` | Halted — reason must be stated | Triage: unblock, replan, or descope |
| `COMPLETED` | Finished — output satisfies contract | Ready for merge |
| `ROLLED_BACK` | Failed and restored to checkpoint | Must replan before re-executing |

**Sync point format:**
```
[SYNC POINT] {label}
  Track: auth-service       → COMPLETED  (output: JWT middleware + tests passing)
  Track: user-api           → COMPLETED  (output: /users CRUD, schema migrated)
  Track: frontend-shell     → BLOCKED    (reason: auth-service contract not finalized)
  Track: db-migrations      → EXECUTING  (do not merge)

  Merge decision: PARTIAL — auth + user-api ready, frontend blocked on auth contract.
  Action: finalize auth contract → unblock frontend → re-sync before final assembly.
```

**Merge rule:** Never assemble from a track in `EXECUTING`, `BLOCKED`, or `ROLLED_BACK`
state. A merge attempt while any dependent track is not `COMPLETED` is a Hard Rule #13
violation. Either wait, descope, or explicitly document the partial assembly as
`outcome: SUCCESS_WITH_WARNINGS` with the incomplete track noted.

**Anti-pattern:** Parallelizing coupled work. If two tracks share mutable state or have
implicit ordering, they are coupled and must be serialized.

---

## §INTEL — Competitive Intelligence

**Invoke when:** Researching a target product, competitor, or market segment.

**Dual-track analysis:**

| Track | Tool | Output |
|-------|------|--------|
| Tech stack | BuiltWith / `bw` CLI | Stack, scale signals, funnel signals, ad signals |
| Design system | `designlang score` | Design grade, token discipline, accessibility posture |

**BuiltWith integration:**
```bash
# CLI lookup
bw lookup competitor.com

# API (replace with your BuiltWith key)
curl "https://api.builtwith.com/v21/api.json?KEY={key}&LOOKUP=competitor.com"
```

**Scale signal interpretation:**
- Enterprise tools (Optimizely, Segment, Salesforce) → HIGH scale
- Mid-market (Mixpanel, HubSpot, Intercom) → MEDIUM scale
- Free-tier only (Google Analytics, Mailchimp free) → LOW scale

**Funnel signal interpretation:**
- Payment + email + retargeting = active conversion funnel
- No payment processing = pre-revenue or marketplace model
- Heavy ad pixel stack (FB, Google, TikTok, LinkedIn) = paid acquisition focus

**Intel Brief format:**
```markdown
## Target: {domain}
### Scale: {HIGH/MEDIUM/LOW} ({evidence})
### Funnel: {description} ({tools detected})
### Ad Spend: {ACTIVE/MINIMAL/NONE} ({pixels detected})
### Stack: {key technologies}
### Design Grade: {letter} ({per-category breakdown})
### Design Notes: {strengths, weaknesses, opportunities}
### Gaps: {missing capabilities vs market standard}
### Similar Sites: {from BuiltWith lists query}
```

---

## §CLONE — Site Reproduction Pipeline

**Invoke when:** Reproducing an existing site's UI, behavior, or design system.

**Full pipeline:**
```
1. INTEL        — BuiltWith tech stack profiling
2. EXTRACT      — designlang <url> --full (mandatory — tokens, not guesses)
3. VISUAL       — skillui --url <url> --mode ultra (optional — animations, interactions)
4. RECON        — screenshots + component inventory + page map
5. FOUNDATION   — scaffold project + install extracted design tokens
6. SPECS        — component specs referencing token file + animation specs
7. BUILD        — parallel component build from specs
8. ASSEMBLY     — integrate components + routing + data layer
9. VERIFY       — designlang score clone vs original
```

**Verification step:**
```bash
# Score the clone
designlang score https://your-clone.dev

# Compare clone vs original
designlang brands original.com your-clone.dev
```

If category scores diverge by more than one letter grade vs the original, the clone fails visual QA.

**When to add VISUAL step (step 3):**
- Site has significant animation, scroll effects, or hover/focus states
- Interaction patterns need precise matching
- Visual documentation needed for review or handoff

---

## §VISUAL_ASSET — Programmatic Image Generation

**Invoke when:** The deliverable is a generated or composited image, not a UI component.

**Use cases:**
- Book covers and marketing assets (ComfyUI + Flux pipelines)
- Social media graphics (composited from templates + real photography)
- Product mockups (real photography composited, not AI-generated)

**Protocol:**
1. Define the asset spec: dimensions, format, target platform, brand constraints
2. Select generation method:
   - **ComfyUI pipeline** for AI-assisted generation (Flux, SDXL)
   - **Programmatic compositing** for template-based assets (Sharp, Canvas API, ImageMagick)
   - **Photography compositing** for product/marketing (real photos + overlays)
3. Multi-pass refinement — never single-shot complex visuals
4. Validate: correct dimensions, correct color profile, text is readable (verify with extraction if possible)
5. Export in required formats (web: WebP/PNG, print: TIFF/PDF, social: platform-specific)

**Anti-patterns:**
- AI-generating product images instead of compositing real photography
- Single-shot prompting for complex compositions
- Trusting AI generators for text rendering — always overlay text programmatically
- No dimension/format validation before delivery

---

## Combining Modes

Modes compose naturally. Common combinations:

| Task | Mode Sequence |
|------|---------------|
| Clone a competitor | INTEL → CLONE pipeline |
| Redesign your own app | RECON → DESIGN_EXTRACT → BRAINSTORM → BUILD |
| Competitive analysis report | INTEL × N targets → DESIGN_COMPARE → Report |
| Marketing asset campaign | VISUAL_ASSET with ORCHESTRATION (parallel assets) |
| New feature on existing product | RECON → BRAINSTORM → PLAN → EXECUTION |
