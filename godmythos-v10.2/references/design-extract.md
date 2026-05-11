# Design Extract — Design Language Intelligence

Companion reference for GODMYTHOS v8. Primary tool: [Manavarya09/design-extract](https://github.com/Manavarya09/design-extract) (`designlang` CLI + Claude Code plugin). Secondary tool: [amaancoderx/npxskillui](https://github.com/amaancoderx/npxskillui) (`skillui` CLI — ultra visual capture, local codebase scanning, animation/interaction extraction).

Read this file when entering DESIGN_EXTRACT_MODE, DESIGN_SCORE_MODE, DESIGN_WATCH_MODE, DESIGN_COMPARE_MODE, or when starting any CLONE_MODE, FULL_REDESIGN, or UI work where the source of truth is a live site rather than a local spec.

---

## Core principle

Design tokens are evidence, not estimates. A color you guessed is a bug. A shadow you approximated is a lie. This module enforces a zero-approximation policy for all extractable design values by running them through `designlang` (primary — tokens, scoring, watch, compare) and optionally `skillui` (secondary — visual capture, animation specs, local codebase scanning) before any styling code is written.

---

## Tool selection matrix

| Scenario | Primary tool | Secondary tool | Rationale |
|---|---|---|---|
| Live URL → design tokens | `designlang` | — | W3C tokens, multi-format output, score/watch/compare |
| Live URL → visual evidence (scroll screenshots, animation specs, interaction diffs) | `designlang --screenshots` | `skillui --mode ultra` | skillui ultra captures 7-frame scroll journey, DOM component fingerprints, `@keyframes`, hover/focus diffs |
| Local codebase → design token audit | — | `skillui --dir <path>` | Scans CSS/SCSS/TSX/JSX, Tailwind config, CSS variables from source |
| Git repo → design token scan | — | `skillui --repo <url>` | Shallow clones and runs dir mode |
| Design quality scoring (A–F) | `designlang score` | — | skillui has no scoring mode |
| Design drift monitoring | `designlang watch` | — | skillui has no watch mode |
| Multi-site comparison | `designlang brands` | — | skillui has no compare mode |
| Competitive intel (tech stack + design) | `designlang score` + BuiltWith | `skillui --mode ultra` (visual evidence) | Ultra screenshots document competitor UI state |
| Clone verification | `designlang brands original.com clone.dev` | — | Letter-grade comparison |

**Rule: `designlang` is the token authority. `skillui` is the visual evidence and local scanning complement. When both produce tokens for the same URL, `designlang` wins on color/typography/spacing values. `skillui` wins on animation specs, interaction states, and visual documentation.**

---

## Installation

### designlang (primary)

```bash
# No install — run directly
npx designlang https://example.com

# Or install globally for pipelines
npm install -g designlang

# As an agent skill (Claude Code, Cursor, Codex, 40+ agents)
npx skills add Manavarya09/design-extract
```

Once installed as a Claude Code skill, invoke via:
```
/extract-design <url>
```

### skillui (secondary)

```bash
# Install globally
npm install -g skillui

# For ultra mode (full visual extraction with Playwright):
npm install playwright
npx playwright install chromium
```

> **Security note (audited 2026-04-19):** skillui source is clean — no exfiltration, no install hooks, no malicious dependencies. Two caveats: (1) without Playwright installed, default mode sends the target URL to `api.microlink.io` for screenshotting — install Playwright to keep everything local; (2) auto-installs extracted SKILL.md to `~/.claude/skills/` without confirmation — may overwrite existing skills with the same name. See §Security Audit Provenance at end of file.

---

## CLI reference

```
designlang <url> [options]

Options:
  -o, --out <dir>          Output directory (default: ./design-extract-output)
  -n, --name <n>           Output file prefix (default: derived from URL)
  -w, --width <px>         Viewport width (default: 1280)
      --height <px>        Viewport height (default: 800)
      --wait <ms>          Wait after load for SPAs (default: 0)
      --dark               Also extract dark mode styles
      --depth <n>          Internal pages to crawl for full system (default: 0)
      --screenshots        Capture component screenshots
      --responsive         Capture at 4 breakpoints
      --interactions       Capture hover/focus/active interaction states
      --full               Enable all captures
      --framework <type>   Only generate specific theme: react | shadcn

Modes:
  designlang score <url>              Score design quality (A–F) across 7 categories
  designlang watch <url>              Monitor site for design drift; alert on change
  designlang brands <url1> <url2>...  Multi-site comparison matrix
  designlang clone <url>              Generate a running Next.js app with the extracted design
```

---

## Output formats

| Format | File | Use |
|---|---|---|
| AI-optimized markdown | `{name}.md` | Primary: feed to agent as design context |
| W3C Design Tokens JSON | `tokens.json` | Design tooling interop, Figma import |
| Tailwind config | `tailwind.config.js` | Drop into any Tailwind project |
| CSS custom properties | `variables.css` | Drop into any web project |
| React theme | `theme.ts` | Drop into React component libraries |
| shadcn/ui theme | `shadcn.json` | Drop into shadcn projects |
| Figma variables JSON | `figma-variables.json` | Import into Figma |
| Visual HTML preview | `preview.html` | Visual sanity check |

---

## Extraction coverage — 14 sections

The markdown output (`{name}.md`) covers:

1. **Color Palette** — primary, secondary, neutral, semantic, surface, brand colors with hex values and usage context
2. **Typography** — font families, weights, sizes, line heights, letter spacing; body / heading / mono stacks
3. **Spacing** — spacing scale (px and rem), base unit, usage patterns
4. **Border Radii** — all detected radii values, semantic names where inferred
5. **Box Shadows** — elevation levels, directional shadows, blur/spread values
6. **CSS Custom Properties** — all `:root` and scope-specific variables with their values
7. **Breakpoints** — media query values, naming conventions if present
8. **Transitions & Animations** — easing functions, durations, keyframe names, motion patterns
9. **Component Patterns** — detected component types with DOM structure and style signatures
10. **Layout System** — grid column patterns, flex direction usage, container widths, gap values, justify/align patterns
11. **Responsive Design** — how the system behaves across 4 breakpoints (if `--responsive` flag used)
12. **Interaction States** — hover, focus, active state styles (if `--interactions` flag used)
13. **Accessibility (WCAG 2.1)** — contrast ratios for all color pairs, pass/fail per level (AA, AAA)
14. **Quick Start** — copy-paste import block for immediate use

---

## Design scoring (DESIGN_SCORE_MODE)

```bash
designlang score https://yourapp.com
```

Scores across 7 categories with a letter grade A–F:

| Category | What it measures |
|---|---|
| Color Discipline | Palette size control, consistent semantic usage, duplicate/near-duplicate detection |
| Typography | Type scale consistency, font weight discipline, line height normalization |
| Spacing System | Regularity of spacing values, adherence to a base unit |
| Shadows | Elevation consistency, shadow vocabulary size |
| Border Radii | Radius consistency, vocabulary control |
| Accessibility | WCAG 2.1 AA/AAA contrast ratios across color pairs |
| Tokenization | CSS custom property coverage, token naming consistency |

**Quality gate**: call `designlang score` before closing any UI PR. Document the grade. Target ≥ B. If any category scores D or F, that category is a blocker.

---

## Design watch (DESIGN_WATCH_MODE)

```bash
designlang watch https://yourapp.com
```

Runs on a configurable interval (default: hourly). Detects changes in:
- Color values
- Font families or sizes
- Accessibility scores

On change, auto-updates local:
- `design-tokens.json`
- `tailwind.config.js`
- `variables.css`

**Use cases:**
- CI/CD job to catch unintentional design drift before it reaches production
- Design consistency enforcement in multi-team repos
- Competitor monitoring — run watch against a competitor URL and get alerted when they rebrand or change their design system

**Integration pattern (n8n):**
```
Schedule trigger → shell: designlang watch <url> --once → compare output to stored baseline → Telegram/Slack alert on diff
```

---

## Design compare (DESIGN_COMPARE_MODE)

```bash
designlang brands site1.com site2.com site3.com
```

Generates an N-site comparison matrix with:
- Color overlap analysis (shared palette colors, divergence)
- Typography comparison (font families, scale similarity)
- Spacing system comparison (base unit, scale coverage)
- Accessibility scores per site
- Output: `brands.md` (AI-ready) + `brands.html` (visual)

**Use cases:**
- Competitive design intelligence (pair with Intel Mode tech stack profiling)
- Pre-rebrand brand audit
- Design system merge/acquisition work
- Validating that your redesign actually differentiates from competitors

---

## DESIGN_EXTRACT_MODE workflow

Use as the opening phase of any Clone Mode, Full Redesign, or UI spec work that starts from a live site.

```
1. RUN    designlang <url> [--full | --responsive --interactions --dark]
2. STORE  output to design/tokens/ directory:
          design/tokens/tokens.md        ← AI-ready context
          design/tokens/tokens.json      ← W3C format
          design/tokens/tailwind.config.js
          design/tokens/variables.css
3. REVIEW tokens.md — flag any anomalies (e.g. 47 blue shades = bad tokenization)
4. ULTRA  (optional) if visual evidence is needed:
          skillui --url <url> --mode ultra --screens 10 --out design/visual/
          Produces: scroll screenshots, ANIMATIONS.md, LAYOUT.md,
          INTERACTIONS.md, COMPONENTS.md, VISUAL_GUIDE.md
5. DERIVE a cleaned token set if the extracted system is messy:
          - collapse near-duplicates (within 5% luminance/hue delta)
          - name semantic roles (--color-primary, --color-surface, etc.)
          - document the mapping: raw extracted → cleaned semantic
6. COMMIT the token artifacts before writing any component code
7. FEED   tokens.md as context to all downstream build tasks;
          feed ANIMATIONS.md + INTERACTIONS.md for motion/state fidelity
```

**Never start component code until step 6 is complete.**

### When to add the ULTRA step (step 4)

Add it when:
- the build requires motion fidelity (animations, scroll effects, transitions)
- hover/focus interaction states need to be matched precisely
- visual documentation of the current state is needed for review or handoff
- DOM component fingerprinting helps identify reusable patterns

Skip it when:
- the task is token extraction only (colors, fonts, spacing)
- the site is a simple static page with no animations
- you are scoring or comparing, not building

---

## Integration with RECON_MODE

RECON_MODE in v8 has a mandatory `designlang` sub-step and an optional `skillui` visual capture sub-step:

```
capture → EXTRACT (designlang) → VISUAL (skillui ultra, optional) → catalog → assess → document
```

After screenshots and before component cataloging, run:

```bash
# Mandatory: design token extraction
designlang <url> --full --out docs/research/design-tokens/

# Optional: visual evidence capture (when motion/interaction fidelity matters)
skillui --url <url> --mode ultra --screens 7 --out docs/research/visual-capture/
```

The designlang extraction output goes into `docs/research/design-tokens/`. The skillui visual capture goes into `docs/research/visual-capture/`. Component specs in `docs/research/components/` reference the token file for values and the visual capture for motion/interaction behavior.

**Before v8:** component spec might say `background: #1a1a2e`
**After v8:** component spec says `background: var(--color-surface-dark)` referencing `tokens.md §1`
**With skillui:** component spec adds `transition: opacity 200ms ease-out` referencing `ANIMATIONS.md §Transitions`

---

## Integration with CLONE_MODE

Updated Clone Mode pipeline with `designlang` and optional `skillui`:

```
intel (BuiltWith tech stack) →
DESIGN_EXTRACT (designlang tokens) →          ← mandatory step
VISUAL_CAPTURE (skillui ultra, optional) →     ← new optional step
recon (screenshots + component inventory) →
foundation (scaffold + install design tokens from extraction) →
component specs (reference token file + animation specs) →
parallel build →
assembly →
verification (designlang score against reference + clone)
```

**When to add VISUAL_CAPTURE:** when the original site has significant animation, scroll effects, hover/focus states, or complex interaction patterns that need to be matched in the clone.

**Verification step** in Clone Mode now runs:
```bash
# Score the clone
designlang score https://your-clone.dev

# Compare clone vs original
designlang brands original.com your-clone.dev
```

If category scores diverge by more than one letter grade vs the original, the clone fails visual QA.

---

## Integration with INTEL_MODE

Intel Mode v8 runs a dual-track analysis:

| Track | Tool | Output |
|---|---|---|
| Tech stack | BuiltWith / `bw` CLI | Stack, scale signals, funnel signals, ad signals |
| Design system | `designlang score` | Design grade, token discipline, accessibility posture |

Both outputs feed the Intel Brief:

```
## Target: competitor.com
### Scale: HIGH (Optimizely, Segment, Salesforce, CloudFlare Enterprise)
### Funnel: VSL → email nurture (ClickFunnels + Klaviyo + Stripe)
### Ad Spend: ACTIVE (FB Pixel, Google Ads, TikTok Pixel)
### Stack: Shopify, Next.js, Vercel, Algolia
### Design Grade: B (Color: A, Typography: B, Spacing: C, A11y: A, Tokenization: A)
### Design Notes: Strong color discipline; spacing system is inconsistent — opportunity
### Gaps: No A/B testing detected, no CDN on blog subdomain
### Similar Sites: [list from `bw lists` query]
```

A competitor with a D-grade design system is a product positioning opportunity. A competitor with an A-grade system is a benchmark to beat.

---

## Token artifact spec

All design token artifacts follow this directory convention:

```
project/
└── design/
    ├── tokens/                          ← designlang output (primary)
    │   ├── tokens.md                    ← AI context (primary — load this for agent tasks)
    │   ├── tokens.json                  ← W3C Design Tokens format
    │   ├── tailwind.config.js           ← Tailwind theme extension
    │   ├── variables.css                ← CSS custom properties
    │   └── extraction-meta.json         ← { url, extractedAt, designlangVersion, score }
    ├── visual/                          ← skillui output (secondary, optional)
    │   ├── SKILL.md                     ← skillui-generated skill file
    │   ├── DESIGN.md                    ← skillui-generated token summary
    │   ├── references/
    │   │   ├── ANIMATIONS.md            ← motion specs and keyframes
    │   │   ├── LAYOUT.md                ← layout containers and grid
    │   │   ├── COMPONENTS.md            ← DOM component patterns
    │   │   ├── INTERACTIONS.md          ← hover/focus state diffs
    │   │   └── VISUAL_GUIDE.md          ← all screenshots in sequence
    │   ├── screens/
    │   │   ├── scroll/                  ← 7 scroll journey screenshots
    │   │   ├── pages/                   ← full-page screenshots (ultra)
    │   │   └── sections/               ← section clip screenshots (ultra)
    │   ├── tokens/
    │   │   ├── colors.json
    │   │   ├── spacing.json
    │   │   └── typography.json
    │   └── fonts/                       ← bundled Google Fonts (woff2)
    ├── design.md                        ← human-authored design system spec (extends tokens)
    └── page-map.md                      ← page inventory and component routing
```

`extraction-meta.json` format:
```json
{
  "url": "https://example.com",
  "extractedAt": "2026-04-16T00:00:00Z",
  "designlangVersion": "x.x.x",
  "score": {
    "overall": 72,
    "grade": "C",
    "categories": {
      "colorDiscipline": 50,
      "typography": 70,
      "spacingSystem": 80,
      "shadows": 50,
      "borderRadii": 40,
      "accessibility": 94,
      "tokenization": 100
    }
  }
}
```

Commit this file. Version it. Diff it on re-extraction. The score delta is your design quality trend.

---

## Design extract anti-rationalizations

| Rationalization | Reality |
|---|---|
| "I know what this site's colors look like, I'll just match them by eye" | The eye is wrong at 6% accuracy on hex values. `designlang` is exact. Extract, don't guess. |
| "The site uses a common design system, I can just use the defaults" | Defaults are starting points. Production sites customise heavily. Always extract the actual tokens. |
| "Extraction takes too long, I'll add the tokens later" | Token debt compounds. Every component built without real tokens requires a second pass. Extract first — it takes 30 seconds. |
| "We're not cloning it exactly, just inspired by it — tokens don't matter" | Even loose inspiration benefits from knowing the actual type scale, spacing rhythm, and color temperature. Extract and selectively apply. |
| "Our design is original, scoring doesn't apply" | Scoring reveals your own system's internal consistency, not just similarity to others. Run it before shipping. |
| "The CI passed, the design is fine" | CI tests behavior. `designlang score` tests design system quality. Both are required. |

---

## Design extract red flags

- UI work started without a `tokens.md` artifact when source site exists
- `#3B82F6` hardcoded in source while `--color-primary` is defined in extracted variables
- No `designlang score` run before UI milestone sign-off
- `extraction-meta.json` is older than the last design push (stale tokens)
- Clone pass deemed "done" without running `designlang brands` to compare vs original
- Watch job not set up on production URL (design drift undetected)
- Multiple near-duplicate colors in token file not collapsed before use
- Extracted tokens stored in chat message, not committed as files

---

## Quick reference

```bash
# ── designlang (primary) ─────────────────────────────────────────────

# Extract full design language
npx designlang https://example.com --full --out design/tokens/

# Score your own app
npx designlang score https://yourapp.com

# Compare against competitors
npx designlang brands competitor1.com competitor2.com yourapp.com

# Watch for design changes (run in CI or as n8n scheduled job)
npx designlang watch https://yourapp.com

# Clone the design into a running Next.js app
npx designlang clone https://example.com

# In Claude Code
/extract-design https://example.com

# ── skillui (secondary) ──────────────────────────────────────────────

# Ultra mode: full visual capture from live URL
skillui --url https://example.com --mode ultra --screens 10 --out design/visual/

# Default mode: token extraction from live URL (no Playwright needed)
skillui --url https://example.com --out design/visual/

# Local codebase scan
skillui --dir ./my-app --name "MyApp" --out design/visual/

# Git repo scan
skillui --repo https://github.com/org/repo --name "Repo" --out design/visual/

# Output DESIGN.md only (skip .skill packaging)
skillui --url https://example.com --format design-md
```

---

## Local codebase scanning (skillui --dir / --repo)

`designlang` is URL-first — it extracts from live sites. `skillui` fills the gap for **local projects and git repos** that aren't deployed or are behind auth.

### When to use

- auditing your own codebase for design token consistency before shipping
- extracting tokens from a private repo before a redesign
- comparing the tokens in source code vs what's live (source drift detection)
- onboarding to an existing project — get a design system snapshot without reading every CSS file

### Workflow

```
1. RUN    skillui --dir <path> --name "ProjectName" --out design/local-tokens/
          OR
          skillui --repo <git-url> --name "RepoName" --out design/local-tokens/
2. REVIEW DESIGN.md output for extracted tokens (colors, fonts, spacing, CSS vars, Tailwind theme)
3. COMPARE against designlang extraction from the live URL (if deployed):
          - token values match? → source and live are in sync
          - token values differ? → source drift detected — investigate
4. FEED   DESIGN.md as context for refactoring or extension tasks
```

### What skillui dir/repo mode extracts

- CSS custom properties (`:root` variables)
- Tailwind config (`tailwind.config.js`/`tailwind.config.ts`) theme values
- Color, font, spacing tokens from `.css`, `.scss`, `.ts`, `.tsx`, `.js`, `.jsx` files
- Component patterns (class name analysis, layout patterns)
- Framework detection (React, Vue, Svelte, Next.js, Nuxt, etc.)

### What it does NOT extract (use designlang for these)

- Computed styles from rendered pages
- WCAG accessibility scores
- Design quality grades (A–F)
- Design drift over time (watch mode)
- Multi-site comparison matrices

---

## skillui ultra mode reference

### CLI flags

```
skillui --url <url>            Crawl a live website
        --mode ultra           Enable cinematic extraction (requires Playwright)
        --screens <n>          Pages to crawl (default: 5, max: 20)
        --out <path>           Output directory (default: ./)
        --name <string>        Override project name
        --format design-md|skill|both   Output format (default: both)
        --no-skill             Output DESIGN.md only, skip .skill packaging
```

### Ultra mode output (beyond default)

| Feature | What it captures |
|---|---|
| Scroll journey screenshots | 7 frames capturing the full scroll experience |
| Hover/focus interaction diffs | Before/after screenshots of interactive elements |
| CSS keyframes | Extracted from `document.styleSheets` via Playwright |
| Animation library detection | Checks `window.*` globals for GSAP, AOS, Framer Motion, etc. |
| Layout extraction | Flex/grid containers, gap values, justify/align patterns |
| DOM component fingerprinting | Component type classification from DOM structure and class patterns |

### Playwright requirement

Ultra mode requires Playwright with Chromium:
```bash
npm install playwright
npx playwright install chromium
```

**Without Playwright:** ultra mode falls back to default mode. Default mode uses `api.microlink.io` for screenshots — this leaks the target URL to a third party. **Always install Playwright when analyzing private or staging URLs.**

---

## Design extract anti-rationalizations (updated)

| Rationalization | Reality |
|---|---|
| "I know what this site's colors look like, I'll just match them by eye" | The eye is wrong at 6% accuracy on hex values. `designlang` is exact. Extract, don't guess. |
| "The site uses a common design system, I can just use the defaults" | Defaults are starting points. Production sites customise heavily. Always extract the actual tokens. |
| "Extraction takes too long, I'll add the tokens later" | Token debt compounds. Every component built without real tokens requires a second pass. Extract first — it takes 30 seconds. |
| "We're not cloning it exactly, just inspired by it — tokens don't matter" | Even loose inspiration benefits from knowing the actual type scale, spacing rhythm, and color temperature. Extract and selectively apply. |
| "Our design is original, scoring doesn't apply" | Scoring reveals your own system's internal consistency, not just similarity to others. Run it before shipping. |
| "The CI passed, the design is fine" | CI tests behavior. `designlang score` tests design system quality. Both are required. |
| "I don't need ultra mode, default extraction is enough" | If the site has animations, scroll effects, or hover states, default mode misses them. Ultra captures what static extraction cannot. |
| "I'll just read the source CSS instead of running skillui --dir" | Manual CSS reading is slow, incomplete, and misses Tailwind config, CSS variable scoping, and cross-file token distribution. Run the scan. |
| "skillui and designlang will give me the same tokens, I only need one" | They have different extraction methods. `designlang` extracts computed styles from rendered pages. `skillui --dir` extracts from source files. Both are needed to detect source-vs-live drift. |

---

## Security audit provenance — skillui

**Audit date:** 2026-04-19
**Source:** [github.com/amaancoderx/npxskillui](https://github.com/amaancoderx/npxskillui) — 6 commits, 6,631 lines TypeScript
**Version audited:** 1.3.3
**License:** MIT

### Verdict: PASS (with notes)

| Check | Result |
|---|---|
| Exfiltration (Feishu/ByteDance/webhook/telemetry) | Clean — zero outbound data calls beyond target URL |
| Shell injection | Clean — only `execSync('npm root -g')` (hardcoded, no user input) |
| `eval`/`Function()` | One instance: `tailwind.ts:337` — parses local `tailwind.config.js` `module.exports`. Same risk as `require()`. Acceptable for `--dir` mode |
| Install hooks (postinstall/preinstall) | None |
| Dependencies | All well-known: commander, chalk, archiver, postcss, css-tree, babel, simple-git, culori. No suspicious packages |
| File writes | All scoped to output directory + `~/.claude/skills/` (auto-install) |
| Network calls | Fetches target URL HTML/CSS (expected). Google Fonts API (hardcoded key). `api.microlink.io` fallback for screenshots (see note) |
| Playwright usage | Standard `page.evaluate()` extracting DOM data. No script injection |
| Git clone (repo mode) | `simple-git` with `--depth 1` shallow clone to temp dir. No shell interpolation |

### Notes

1. **Microlink fallback:** without Playwright, `screenshot.ts` sends the target URL to `api.microlink.io`. Install Playwright to keep everything local.
2. **Auto-install to `~/.claude/skills/`:** `cli.ts:241` writes SKILL.md to Claude Code skills directory without confirmation. Could overwrite existing skills if names collide. Run with `--no-skill` flag if this is a concern.
3. **Hardcoded Google Fonts API key:** `font-resolver.ts:12`. Public/free-tier key — common practice, not a risk.
4. **Maturity:** first published April 8, 2026. 23 npm versions in 2 days. Code is clean but churn suggests active instability. Pin the version in production pipelines.

### Re-audit triggers

Re-audit if:
- major version bump (2.x)
- new dependencies added
- new network calls or install hooks appear
- npm weekly downloads exceed 10K (increased attack surface value)
