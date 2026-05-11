# opencode-design

> HTML-native design skill — build hi-fi prototypes, slide decks, motion animations, and design variants from a single command. Agent-agnostic.

OpenCode, Claude Code, Codex, Cursor, Trae, OpenClaw, or any agent that supports markdown-based skills can install this and start producing design work that doesn't look AI-generated.

## What it does

- **Hi-fi product mockups** — clickable iOS / Android / web prototypes with real device frames, real images (Wikimedia, Met, Unsplash), and realistic content (no Lorem ipsum, no purple gradients).
- **Slide decks** — 1920×1080 HTML decks with auto-scale, keyboard navigation, speaker notes, PDF export. Multi-file (default) or single-file (≤10 slides).
- **Motion animations** — timeline-driven React animations exportable to MP4 (25fps base + 60fps interpolation), GIF (palette-optimized), and WebM. Includes optional BGM mixing.
- **Design variant exploration** — 2-4 directions side-by-side (`DesignCanvas`) or 1 design with live Tweaks panel for parameter tuning.
- **5-dimension critique** — post-delivery review on philosophy / hierarchy / detail / functionality / innovation, each 0-10, plus a prioritized fix list.

## How it's different

The agent runs a **Junior Designer workflow**: assumptions and questions before execution, anti-AI-slop checklist on every output, brand asset protocol when a real product is involved (logo > product image > UI > colors > fonts, in that priority order).

Vague brief? It runs the **Design Direction Advisor** — picks 3 differentiated directions from 20 design philosophies (Pentagram editorial / Field.io kinetic / Kenya Hara minimalism / Sagmeister vanguard / etc.), generates miniatures, lets the user pick before committing.

Building animation? It reads `references/animation-pitfalls.md` first — 14 rules from real bugs (global time, Sprite ranges, recording loop=false, useEffect timing, font loading races, layout-property animations, etc.).

## Install

### OpenCode

```bash
mkdir -p ~/.opencode/skills/opencode-design
cp -r ./opencode-design/* ~/.opencode/skills/opencode-design/
```

Then in any OpenCode session:

> "Use the opencode-design skill to build a landing page for a Postgres-on-the-edge product."

### Claude Code

Drop the folder in your project under `.claude/skills/opencode-design/`, or globally at `~/.claude/skills/opencode-design/`.

### Generic skills.sh-compatible agents

```bash
curl -L https://github.com/<your-fork>/opencode-design/archive/main.tar.gz | tar xz
cp -r opencode-design-main ~/.skills/opencode-design
```

The skill discovers itself via `SKILL.md` frontmatter (`name: opencode-design`) — most skill loaders pick it up automatically.

## What's in the box

```
opencode-design/
├── SKILL.md                  # The doctrine — agent reads this first
├── README.md                 # This file
├── LICENSE
├── references/               # Deeper guides loaded on demand
│   ├── workflow.md           # Question template, per-task scripts
│   ├── content-guidelines.md # Anti-slop rules, copy tone, density
│   ├── design-styles.md      # 20 design philosophies × 5 schools
│   ├── design-context.md     # Thin fallback — defaults when starting from zero
│   ├── react-setup.md        # Pinned React+Babel CDN, mount pattern
│   ├── slide-decks.md        # Multi-file vs single-file architecture
│   ├── animation-pitfalls.md # 14 rules from real motion bugs
│   ├── tweaks-system.md      # Live parameter panel (localStorage-based)
│   ├── verification.md       # Render-and-look protocol
│   ├── critique-guide.md     # 5-dimension scoring rubric
│   └── video-export.md       # Recording → 60fps → GIF → BGM pipeline
├── assets/                   # Drop-in components
│   ├── deck_index.html       # Multi-file slide aggregator (default)
│   ├── deck_stage.js         # Single-file slide web component
│   ├── design_canvas.jsx     # Variant grid for side-by-side display
│   ├── animations.jsx        # Stage / Sprite / useTime / Easing / interpolate
│   ├── ios_frame.jsx         # iPhone 15 Pro frame
│   ├── android_frame.jsx     # Pixel 8 Pro frame
│   ├── macos_window.jsx      # macOS window chrome
│   └── browser_window.jsx    # Browser chrome with URL bar
├── scripts/
│   ├── verify.py             # Playwright HTML→PNG (look at your work)
│   ├── render-video.js       # Playwright HTML→25fps MP4 recorder
│   ├── convert-formats.sh    # ffmpeg 25→60fps + palette GIF + WebM
│   └── add-music.sh          # ffmpeg BGM mixer with fades + SFX
└── demos/                    # Sample outputs you can crib from
```

## Usage examples

```
"Build a landing page for Linear-aesthetic, but for a database tool."
"Make a 10-slide pitch deck on AI alignment, Pentagram editorial style."
"Animate the hero icon for our launch — 4 seconds, export to GIF and 60fps MP4."
"Show me 3 directions for the onboarding screen — minimalist, kinetic, editorial."
"Build a clickable iOS prototype for a habit tracker."
"Review this design and score it on the 5-dimension rubric."
```

For vague briefs, the skill will ask 1-3 sharp questions before building. For rich briefs (the user gave a brand reference, color, type, density), it goes straight to producing.

## Verification

The agent runs `python3 scripts/verify.py <output.html>` before claiming a deliverable is done. The PNG goes back through its own perception (or the user's eyes) to catch the 80% of bugs that text-based review misses — overflowed text, broken images, wrong fonts, accidental scrollbars, etc.

## Requirements

- **For HTML output**: any modern browser. Pinned React 18.2.0 + Babel 7.22.5 from cdn.jsdelivr.net.
- **For verification**: `pip install playwright` + `python3 -m playwright install chromium`
- **For video export**: `npm install playwright`, `npx playwright install chromium`, `ffmpeg ≥ 4.4` on PATH.

## Credits

Inspired by:

- [**huashu-design**](https://github.com/alchaincyf/huashu-design) by Alchain — the upstream Chinese-language HTML-native design skill that pioneered most of the architecture (Stage/Sprite animation engine, multi-file slide aggregator, anti-slop checklist, brand asset protocol).
- [**Anthropic Claude Design**](https://www.anthropic.com/) — the original specialist-design pattern for Claude.

This is an English-language adaptation tailored for OpenCode and other agent CLIs, with original prose and several adapted patterns (localStorage Tweaks instead of postMessage host, agent-agnostic verification flow). Where it follows huashu-design's architecture, it credits openly. Where it diverges, the divergences are noted in the relevant reference file.

## License

See [LICENSE](LICENSE). Personal and educational use is free; commercial use requires permission. This mirrors the upstream's terms.
