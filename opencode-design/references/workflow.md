# Workflow · Question Templates

This file gives you ready-to-use clarifying-question scripts for the start of a project. The goal is **one focused round** of questions, batched, then the user answers all at once. Don't ask, get an answer, ask again, get an answer — that's exhausting for the user and slow.

---

## Master question template (any project)

Use this when you need to start clean. Adapt section by section.

```markdown
Before I dive in, a few quick questions so I don't waste cycles going in the wrong direction. Answer in any order, and skip what doesn't apply.

**Context**
1. Do you have a design system / UI kit / Figma / brand guidelines I should pull from?
2. Any reference work you love that I should match in feel?

**Audience & purpose**
3. Who's this for? (one phrase: "executives at a launch", "Twitter timeline scroll", "annual report PDF")
4. What's the one thing the viewer should feel or do?

**Output**
5. Format I should deliver: HTML page / slide deck / animation / static image / something else?
6. Final dimensions if you have them in mind: 1920×1080 / mobile / print / other?

**Variants**
7. Want me to give one polished direction, or 2-3 variations side by side so you can pick?
8. Anywhere I should be bold (color / type / motion) vs anywhere I should play it safe?

I'll wait for the batch answer before starting. If anything's unclear, I'll re-ask before assuming.
```

---

## Per-task question scripts

### Slide deck

```markdown
**Slide deck specifics**
1. Final delivery format — browser presentation / PDF / **editable PPTX** (last one drives different code from line 1)
2. Speaker present, or self-running (slides advance automatically)?
3. Approximate slide count?
4. Audience distance — boardroom 3m / conference 10m / Zoom screen-share?
5. Speaker notes wanted (yes/no)?
```

> ⚠️ Editable PPTX changes the architecture. If the user says yes, jump to `references/editable-pptx.md` BEFORE writing any HTML. Retrofitting costs 2-3 hours.

### Animation / motion demo

```markdown
**Motion specifics**
1. Final length? (8s / 30s / 90s — sets the entire structure)
2. Output: MP4 only / GIF too / both? Resolution?
3. Audio: BGM included / SFX too / silent (you'll dub it later)?
4. Will this loop, or play once?
5. Brand assets I should use: logo / product image / UI screenshots / colors?
6. References: anything from Apple keynote / Field.io / a specific Cannes title that captures the feel?
```

### App / iOS prototype

```markdown
**Prototype specifics**
1. Delivery shape: **overview tile** (all screens side-by-side, static) or **flow demo** (single device, clickable)?
2. How many screens? (Affects single-file vs multi-file architecture.)
3. Device: iPhone 15 Pro / Android / both?
4. Real product images you can send, or should I source from Wikimedia / Unsplash?
5. Interactivity scope: just visual mockup, or click-through specific user flow?
6. Light / dark / both?
```

### Landing page / marketing site

```markdown
**Landing page specifics**
1. Single page (long scroll) or multi-section with anchor nav?
2. Hero section: video / animated / static / product screenshot?
3. Sections you want (hero / features / testimonials / pricing / CTA)?
4. Mobile-first, or desktop-first?
5. Conversion goal — sign up / book demo / read more?
```

### Infographic / data viz

```markdown
**Infographic specifics**
1. Data source — can you share the dataset (CSV / Notion / paste)?
2. Final format — print PDF / web / social media post?
3. Reading time intended — 30 seconds (poster style) or 5+ minutes (article style)?
4. Categorical chart, time series, comparison, geographic — which lens?
5. Print-grade (300dpi PDF) or screen-grade?
```

### Brand identity exploration

```markdown
**Identity specifics**
1. Brand name + 1-line positioning?
2. Industry / category?
3. Audience — age / behavior / aspiration?
4. Existing assets — logo / colors / fonts already chosen, or starting clean?
5. Competitor brands you DON'T want to look like?
6. 3 adjectives that describe the brand mood?
```

---

## Reading the answer set

When the user answers, immediately:

1. **Restate** in 100-200 words ("So you want X, for Y audience, in Z format, with these constraints…"). End with: "Did I get this right?"
2. Once they nod, walk to **Step 2 of the main workflow** (resource exploration).
3. If they push back, adjust — don't power through.

---

## When the user refuses to answer

If the user says "just do it" / "don't ask" / "trust me":

1. Make 1 main solution + 1 distinctly different variant using best judgment
2. **In the delivery, list every assumption you made** — this is the user's map for changes
3. Don't apologize — just be transparent

Example assumption list:
```
Assumptions I made (let me know which to flip):
- Audience: laptop screen at ~1m
- Tone: professional but not stiff
- Format: HTML, 1920×1080
- Variant A: "safe" — Stripe-modern
- Variant B: "bolder" — Field.io-generative

If any of these are wrong, I can swap them.
```

---

## Question pacing rules

- **One round only** in the default case. Two rounds is acceptable when the first round surfaces a contradiction.
- **3-5 questions per round** is the sweet spot. More than 7 = overwhelming.
- **Group questions** by category (context / audience / output / variants) so the user can answer as a list.
- **Skip categories** if context is already clear — don't ask "do you have brand guidelines" if they just sent a Figma link.

---

## Anti-pattern: "drip questioning"

Don't do this:

```
Agent: "What's the audience?"
User: "Executives."
Agent: "Cool. What's the format?"
User: "Slides."
Agent: "Okay. How many slides?"
[and so on]
```

This is exhausting and slow. Always batch.

---

## Anti-pattern: "asking + acting in the same turn"

Don't do this:

```
Agent: "I'll need to know X, Y, Z. Meanwhile, here's a draft I made…"
[shows draft built on guesses]
```

Either ask and **wait**, or commit and **note assumptions**. Hybrid mode wastes the user's time twice.
