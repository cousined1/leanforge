# Content guidelines — anti-AI-slop, tone, scale, density

The visual chrome can be perfect and the work can still feel AI-generated because of *what's inside the frame*. This file is the content checklist.

---

## The AI-slop signature (avoid all of these)

These patterns instantly read as "made by an AI" to anyone who looks at design work for a living. They're banned by default; only break a rule with a specific reason.

### Visuals

- **Purple-pink gradients** as primary brand color, especially diagonal `linear-gradient(135deg, #a855f7, #ec4899)`. Used in literally every AI-generated landing page since 2022.
- **Emoji as UI icons** (🚀 📊 ✨ 🎯 in feature lists). Use real icon sets: Lucide, Heroicons, Material Symbols, Phosphor, Tabler.
- **Rounded card + thick left border in the brand color**. The "I learned web design from a Tailwind tutorial" combo.
- **SVG faces** for testimonials/team. Use real photos from Unsplash People, or omit faces entirely.
- **CSS-shaped product silhouettes** (a "phone" made of `border-radius: 36px` with a pill notch on top). Use a real device frame component (`ios_frame.jsx`, `android_frame.jsx`).
- **Inter as the display font for everything**. Inter is fine for UI body text; it's a "no opinion" choice for hero type. Pair it with something distinctive: a serif (Fraunces, Instrument Serif, Source Serif 4), a grotesque (Neue Haas, ABC Diatype, GT America), a mono (Berkeley Mono, JetBrains Mono).
- **Glassmorphism with no reason**. Frosted blur layered over an abstract gradient blob. If the page has nothing to show through the glass, it's just a gimmick.
- **3D blob illustrations** in the hero (those purple/blue Spline shapes). Date-stamps the work to 2021.
- **Light grey on white**, low-contrast everywhere. Reads as "I copied the color from a Figma file without checking it on a real screen."

### Copy

- **"Empower" / "unlock" / "harness" / "leverage" / "supercharge" / "revolutionize"** as verbs. Every AI-generated marketing site uses these. Use plain verbs: build, ship, run, send, see, find, fix.
- **Em-dashes for emphasis everywhere**. They're fine sparingly. Three in a paragraph reads as ChatGPT.
- **"Lorem ipsum"**. Even for placeholders. Write specific, plausible content — even if you have to make up a fake company. "Acme Corp's onboarding email open rate jumped from 18% to 41%" beats "Lorem ipsum dolor sit amet."
- **Three-bullet feature lists** where every bullet is "Adjective Noun · vague benefit". Real product copy is uneven — one bullet might be one word, another might be a sentence.
- **Generic testimonials** ("This product changed my life!" — Sarah J., Marketing Manager). Use realistic specifics: the company, the role, the actual outcome.
- **Numbers ending in 0 or 5**. "10,000 customers / 50% faster / 100x productivity." Real metrics are weird: 47%, 12,400, 3.2×.

### Layout

- **Centered everything**. Real design has tension and rhythm — left-aligned hero, centered modal, right-aligned metadata.
- **Equal-height cards in a 3-column grid** for "features." Vary the layout: one big card + four small, or a list with images, or a single-column scroll.
- **Hero → 3 feature cards → CTA → footer** as the entire page. That's the AI default landing page. If the brief is a landing page, ask what's *interesting* about the product and lead with that.

---

## Copywriting tone

The design is only as good as the words inside it. Write like a human, not like marketing copy bot.

### Voice rules

- **Prefer concrete to abstract**. "Cuts onboarding from 2 weeks to 2 days" beats "Streamlines onboarding."
- **Use second person sparingly**. "You'll love it" is filler. "It opens in 200ms" is information.
- **One claim per sentence**. If you wrote "fast, secure, and easy," pick one and put it in the headline.
- **No exclamation marks** unless the design's whole tone is playful. Even then, max 1 per screen.
- **Contractions are fine** unless the brand is explicitly formal (legal, medical, banking).

### Headline patterns that work

- **Specific verb + specific object**: "Ship a Postgres database in 30 seconds" (Neon)
- **A claim you'd argue with**: "The fastest way to build internal tools" (Retool)
- **A direct invitation**: "Write better, together" (Notion-style)
- **A category redefinition**: "The everything app for work" (intentionally bold)

### Headline patterns to avoid

- ❌ "Empower your team to do more" (every word is meaningless)
- ❌ "The future of [category] is here" (so confident, says nothing)
- ❌ "Unlock the full potential of your data" (LinkedIn-bro voice)

---

## Scale & density

Different output media have different scale rules. Don't carry web-page sizing into a slide deck or vice versa.

### Slide deck (1920×1080, viewed from across a room)

- Body text: ≥ 32px. Anything under 28 is unreadable from row 5.
- Headlines: 64-120px. Bold weights, generous line-height (1.05-1.2).
- Max words per slide: ~30. If you wrote more, split the slide.
- One idea per slide. Two ideas = two slides.

### Web landing page (1440-1920 desktop, 393 mobile)

- Body: 16-18px desktop, 16px minimum mobile. 14px is too small.
- Headlines: 48-96px desktop. Reserve 96+ for actual hero text.
- Line length: 50-75 characters per line (use `max-width: 65ch`).
- Vertical rhythm: 80-120px between major sections on desktop.

### App prototype (iPhone 393×852, Android 412×892)

- Body: 15-17px (matches iOS Body), 14sp on Android.
- Tap targets: ≥ 44×44 (iOS) / 48×48 (Android).
- Density follows the platform — iOS is airier (more whitespace), Material is denser (more tightly packed).

### Infographic (poster, print-grade)

- Hierarchy is everything. The eye should land on the headline first, then the chart, then the source.
- Font choices matter more than on a webpage — print scrutiny is harsher. Pair a serif headline with a grotesque body, or vice versa.
- Color count: 3-5 max. Every additional color costs you legibility.

---

## Quick anti-slop checklist before delivery

- [ ] No emoji used as UI icons (real icon set instead)
- [ ] No purple-pink hero gradient unless the brand is actually purple-pink
- [ ] No CSS-shaped device silhouettes (use frame components)
- [ ] No SVG faces (real photos or no faces)
- [ ] No "empower / unlock / leverage" in headlines
- [ ] No lorem ipsum anywhere
- [ ] At least one specific number that doesn't end in 0 or 5
- [ ] At least one design choice that's not the default (asymmetric layout, distinctive font pairing, unusual color combination)
- [ ] Body text scale matches the medium (slides ≥ 32, web ≥ 16)
- [ ] One clear focal point per screen (the eye knows where to land)
