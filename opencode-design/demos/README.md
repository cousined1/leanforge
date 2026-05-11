# Demos

Sample outputs that exercise the skill's components end-to-end. Open the `.html` files directly in any modern browser.

## What's here

### `hero-variants.html`
Shows `DesignCanvas` with three differentiated landing-page hero directions for the same brief ("ship a Postgres database in 30 seconds"):

- **Editorial** (Information Architecture school) — Fraunces serif headline with italic accent, footnote-style metadata
- **Kinetic** (Motion Poetics school) — black background, mono build tag, orange-on-black urgency
- **Quiet** (Minimalist · Eastern school) — soft gray, single sentence, link instead of CTA

Demonstrates: the variant-grid pattern, three of the 20 design philosophies in `references/design-styles.md`, anti-AI-slop in practice (no purple gradients, no emoji, no "empower" copy, real numerical specifics like `47ms p50`).

### `ios-prototype.html`
Shows `IosFrame` rendering a habit-tracker app in both light and dark themes:

- iPhone 15 Pro proportions (393×852 logical px) with Dynamic Island, status bar, Home Indicator
- Realistic content (5 habits with varying streak lengths, a stat dashboard, a week-grid)
- Mono numerals for tabular data (JetBrains Mono on streak counts)

Demonstrates: device-frame component drop-in, `9:41` canonical screenshot time, dark/light theming, content density appropriate for mobile (15-17px body, ≥44px tap targets).

## How verification was run

Both demos were rendered through `scripts/verify.py`:

```bash
python3 scripts/verify.py demos/hero-variants.html --width 1920 --height 1080 --full-page
python3 scripts/verify.py demos/ios-prototype.html --width 1200 --height 1000
```

The resulting `.png` files are committed alongside as proof of working state.

## About the `_vendor/` folder

Both demos load React 18.2.0 + Babel Standalone 7.22.5 from `./_vendor/` (offline-friendly), so they verify in air-gapped environments. For production, swap the script tags back to the jsdelivr CDN URLs (commented at the top of each demo).

The vendored bundles are the **same** files that ship from `cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js` and `cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js` — copied via `npm install` to skip the network in this sandbox. Total `_vendor/` weight: ~3.9 MB.

## Building your own from these starters

Pick the closer demo to your task, copy the file to your project, and replace:

- the `Editorial` / `Kinetic` / `Quiet` components with your variants, OR
- the `HabitScreen` component with your app screen

Keep the inlined `DesignCanvas` / `IosFrame` definition at the top — those are the components from `assets/`. For non-trivial work, read those source files in the skill's `assets/` folder and inline the latest version, since they may be updated.
