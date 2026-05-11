# Slide Decks · Architecture First, Code Second

🛑 **Decide architecture BEFORE the first line of HTML.** Wrong choice = repeated CSS specificity and scoping pain. This is the single biggest time sink in slide work.

---

## Open with: confirm the delivery format

Before any code, ask:

```
What's the final delivery format?
1. Browser presentation (HTML deck, you click through)
2. PDF (printed or shared as a file)
3. Editable PPTX (opens in PowerPoint / Keynote, text editable)

#3 changes the architecture from line 1. Retrofitting costs 2-3 hours.
```

If they pick **editable PPTX**, switch to `references/editable-pptx.md` and follow its 4 hard constraints from the very start.

---

## Architecture choice

Two patterns. Pick by slide count and team setup.

### Multi-file (default for ≥10 slides)

```
project/
├── deck_index.html              ← aggregator (uses assets/deck_index.html template)
├── slides/
│   ├── 01-hero.html             ← each slide is its own complete HTML
│   ├── 02-problem.html
│   ├── 03-solution.html
│   └── ...
└── assets/
    ├── images/
    └── shared.css               ← only used if explicitly imported
```

**Pros**:
- Each slide is independently openable (`open slides/03-solution.html`)
- No CSS bleed between slides — collisions impossible
- Multi-agent parallel work (each agent owns N slides)
- Easy to reorder (just edit `deck_index.html`)
- PDF export iterates per-file (`scripts/export_deck_pdf.mjs`)

**Cons**:
- Cross-slide state (e.g. cumulative animation, "click here on slide 3 reveals on slide 5") is harder
- More files to manage

### Single-file (default for ≤10 slides, pitch decks)

Use `assets/deck_stage.js` web component. All slides in one HTML, separated by `<section>` tags inside `<deck-stage>`.

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
  <script src="deck_stage.js"></script>
</head>
<body>
  <deck-stage>
    <section><!-- slide 1 --></section>
    <section><!-- slide 2 --></section>
    <section><!-- slide 3 --></section>
  </deck-stage>
</body>
</html>
```

**Pros**:
- Cross-slide state easy
- Single file to manage
- localStorage saves position automatically

**Cons**:
- CSS scope must be careful (use `:scope` or sufficient class specificity)
- Long HTML files
- Multi-agent collisions

⚠️ **Two hard rules for `deck_stage.js`**:

1. **Script must come AFTER `</deck-stage>`** — if you put it in `<head>`, the web component initializes before its children exist, breaking things.
2. **`section`'s `display: flex` must go to `.active`**, not the base `section` selector. The stage hides inactive slides via `display: none` — if your CSS forces flex on every section, all slides render at once.

```css
/* ✅ CORRECT */
deck-stage section.active { display: flex; align-items: center; }

/* ❌ WRONG — fights the stage's display:none */
deck-stage section { display: flex; align-items: center; }
```

---

## Auto-scaling for 1920×1080

Slides are FIXED at 1920×1080 in design. The stage scales to viewport. NEVER use viewport-relative units (vw / vh / %) inside a slide — they re-scale wrong. Use absolute pixels.

```css
/* ✅ CORRECT — fixed dimensions */
.slide-content {
  width: 1920px;
  height: 1080px;
  font-size: 64px;  /* px, not rem */
  padding: 80px;
}

/* ❌ WRONG — viewport-relative */
.slide-content {
  width: 100vw;
  height: 100vh;
  font-size: 4vw;
  padding: 5%;
}
```

The stage component handles scaling via CSS `transform: scale()` + `transform-origin: top left` + outer `<div>` wrapper. If your CSS uses vw/vh, the scale and the vw both fight, producing tiny or huge text.

---

## Position-four for every slide

Before designing each slide, answer the four questions from SKILL.md "Workflow Step 3":

- **Narrative role**: hero / transition / data / pull-quote / closer?
- **Audience distance**: 3m boardroom / 10m conference / Zoom screen-share?
- **Visual temperature**: quiet / excited / cool / authoritative?
- **Capacity estimate**: thumbnail-sketch — does the content fit?

Different slides in the same deck have DIFFERENT answers. A hero slide is "excited / 10m / hero / minimal content". A data slide is "cool / 3m / data / dense content". Style them differently.

---

## Font sizing by slide role

Rough heuristics for 1920×1080:

| Role | Display size | Body size |
|---|---|---|
| Hero (title slide) | 180-240px | n/a |
| Section divider | 120-160px | 32px subhead |
| Content (mostly text) | 64-72px headline | 32-36px body |
| Data / chart | 48-56px headline | 24-28px labels |
| Pull-quote | 96px italic | 24px attribution |
| Closer | 120-160px | n/a |

Below 24px is unreadable at 3m. Above 60px body is yelling.

---

## Slide transitions

Within a deck, restraint wins. Hard cuts > fades > slides > flashy.

```javascript
// In deck_stage.js, default is hard cut:
slide.style.opacity = active ? 1 : 0;
slide.style.transition = 'opacity 200ms';
```

Don't add slide-in / slide-out transitions unless the deck's purpose REQUIRES kinetic energy (a Field.io-style demo deck, e.g.). For executive presentations, hard cuts feel premium; fade transitions feel webinar-cheap.

---

## Speaker notes

The `<deck-stage>` component supports speaker notes via attribute:

```html
<section data-notes="Open with the Q3 numbers, pause for emphasis on the 47% growth.">
  <h1>Q3 Results</h1>
  <p>$47M in revenue</p>
</section>
```

In presenter mode (URL with `?presenter=1`), notes appear on a second screen. In normal mode, they're hidden.

---

## Print / PDF export

For multi-file architecture: `scripts/export_deck_pdf.mjs` iterates files, runs each through Playwright `page.pdf()`, then merges with `pdf-lib`. Text stays vector and searchable.

```bash
node scripts/export_deck_pdf.mjs --input deck_index.html --output deck.pdf
```

For single-file `deck_stage.js`: use `scripts/export_deck_stage_pdf.mjs` (handles shadow-DOM slot rendering and absolute-position overflow). Don't use the multi-file script for single-file decks — it produces only the first slide.

---

## Editable PPTX

If the user wants editable PPTX (text frames editable in PowerPoint, not images):

1. Read `references/editable-pptx.md`
2. Follow its 4 hard constraints from the start (you can't retrofit)
3. Use `scripts/export_deck_pptx.mjs --mode editable`

If you only need image-fidelity PPTX (slides as images, no text editing): use `--mode image`. Faster, simpler, still works for "send me the deck".

---

## Common deck failures

| Symptom | Cause |
|---|---|
| All slides render simultaneously | `display: flex` on base `section`, not `.active` |
| Slide 1 displays, others blank | `<script>` in `<head>` instead of after `</deck-stage>` |
| Text microscopic on first load | Stage scaling fighting vw/vh units in slide CSS |
| Fonts wrong on first slide only | Custom fonts not preloaded; first slide rendered in fallback |
| PDF export only has page 1 | Used multi-file script on single-file deck (or vice versa) |
| Transition jank between slides | Mixed transitions on properties that trigger layout (top/left) |
| Editable PPTX has flat images | Used image mode; need `--mode editable` |

---

## Slide-by-slide rhythm

A good deck has macro-rhythm. For a 30-slide deck, try:

- 1 hero
- 3 sections × ~8 content slides each
- 3 section dividers (between sections)
- 2 pull-quotes (mid-deck breathing room)
- 1 closer

Pure content slide-after-slide-after-slide reads flat. Section dividers and pull-quotes give the audience a moment to land before the next push.

---

## Asset pacing

Don't put a hero image on every slide. Don't put a chart on every slide either. Macro-rhythm:

- Image-led slide
- Type-only slide
- Image-led slide
- Type-only slide
- Data-led slide
- Type-only slide
- ...

Variation between media types keeps the audience visually engaged. All-image = magazine. All-type = lecture. Mix = presentation.
