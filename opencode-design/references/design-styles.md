# Design Styles Library · 20 Philosophies × 5 Schools

Use this when the brief is vague and the agent has entered Design Direction Advisor mode. Pick **3 directions from 3 different schools** for clear visual contrast. Never recommend 2+ from the same school — the user can't distinguish them.

## How to use this file

1. Read the user's content + audience + emotional tone
2. Browse the 5 schools for 3 differentiated directions
3. For each pick, copy: designer name + signature features + mood keywords + AI prompt template
4. Show the user the 3 picks (with optional preset showcase images)
5. Generate 3 demos using the prompt templates below
6. User picks one → enter main flow

---

## School 01 · Information Architecture

**Visual mood**: rational, data-driven, restrained
**Best for**: financial reports, B2B SaaS, technical docs, professional services
**Anti-pattern**: pure decoration — every visual element must encode information

### 01 · Pentagram (Massimo Vignelli school)

- **Signature**: Helvetica + Bodoni pairing · grid system · meaningful color blocks · zero ornament
- **Mood**: authoritative, classical, structural
- **Reference works**: NYC Subway map, IBM annual reports, Knoll catalogs
- **Use when**: corporate communications, large-organization branding, info-dense reports
- **AI prompt template**:
  ```
  Pentagram-style information design. Helvetica Neue + Bodoni pairing.
  Strict 12-column grid. Black on cream (#F4F1E8) with one accent: vermilion (#D03A2C).
  Zero decoration. Each element justified by content. Generous whitespace.
  Output: 1920×1080.
  ```

### 02 · Edward Tufte (Information Design)

- **Signature**: data-ink ratio maximized · sparklines · small multiples · serif body
- **Mood**: scholarly, precise, restrained
- **Reference works**: *The Visual Display of Quantitative Information*, climate-science papers
- **Use when**: scientific reports, complex data viz, academic content
- **AI prompt template**:
  ```
  Tufte-style data design. ET Book serif throughout. No gridlines, no chartjunk.
  Sparklines inline with body text. Small multiples in 4×3 layout.
  Earth tones: ink #1A1A1A, paper #FAF8F3, accent #8B3A3A. 
  Margin notes in 80% size, italic. Output: 1920×1080.
  ```

### 03 · Müller-Brockmann (Swiss Style)

- **Signature**: ratio-based grid · Akzidenz-Grotesk · primary colors · object-oriented imagery
- **Mood**: rational, mid-century modern, geometric
- **Reference works**: Zurich Tonhalle posters, IBM design language
- **Use when**: cultural / academic / institutional communications
- **AI prompt template**:
  ```
  Swiss International Style. Akzidenz-Grotesk Bold. 1:√2 ratio grid. 
  Pure red (#E32119), pure blue (#0066CC), pure black on pure white.
  One large geometric shape per layout. Functional photography (no people unless purposeful).
  Output: 1920×1080.
  ```

### 04 · Stripe / Linear (Modern SaaS Information Design)

- **Signature**: subtle gradients · Inter or Söhne · monochrome with one accent · screenshot hero
- **Mood**: contemporary, trustworthy, technically polished
- **Reference works**: stripe.com homepage, linear.app, vercel.com
- **Use when**: developer tools, modern B2B SaaS, fintech
- **AI prompt template**:
  ```
  Stripe-modern style. Söhne or Inter typography. Off-white #FAFAFA bg.
  Subtle aurora gradient in hero (very low opacity, oklch defined).
  Single accent: Stripe purple #635BFF or Linear's #5E6AD2.
  Product screenshot as hero. Output: 1920×1080.
  ```

---

## School 02 · Motion Poetics

**Visual mood**: dynamic, immersive, technical aesthetic
**Best for**: tech launches, product hero animations, agency portfolios
**Anti-pattern**: motion for its own sake — every movement must serve narrative

### 05 · Field.io / Active Theory

- **Signature**: real-time generative · particle systems · WebGL · synthwave palettes
- **Mood**: futuristic, generative, emergent
- **Reference works**: Field.io site, Active Theory installations
- **Use when**: tech / AI product hero, gallery installations, brand films
- **AI prompt template**:
  ```
  Field.io-style generative motion. Black void background.
  Particle field flowing in laminar streams. One bright color: cyan #00F0FF or magenta #FF00AA.
  Dynamic Mathematica-like math behind motion. Mono type overlay (JetBrains Mono).
  Output: 1920×1080 motion frame.
  ```

### 06 · Apple (Product Reveal)

- **Signature**: cinematic camera moves · soft shadows · single-spotlight stage · serif display
- **Mood**: premium, considered, theatrical
- **Reference works**: WWDC keynote opens, AirPods Max launch film
- **Use when**: hardware launches, premium brand reveals, executive presentations
- **AI prompt template**:
  ```
  Apple keynote-style. Pure black stage with single rim light.
  Product photographed with three-point soft lighting, sharp on subject.
  SF Pro Display Light for type, kerning at -0.02em.
  Single-spotlight reveal animation. Output: 1920×1080 hero frame.
  ```

### 07 · Tendril / Mr. Wong (Editorial Motion)

- **Signature**: 3D typography · liquid metal materials · shifting gradients · narrative pacing
- **Mood**: editorial, sensual, art-directed
- **Reference works**: Adobe MAX titles, Cannes title sequences
- **Use when**: branded films, opening titles, art-direction-heavy moments
- **AI prompt template**:
  ```
  Tendril-style editorial motion. Volumetric 3D type rendering.
  Liquid chrome material with iridescent gradient. 
  Stage with subtle gradient backdrop oklch(0.2 0.05 270).
  Slow camera dolly-in. Type slowly assembles from particle pieces.
  Output: 1920×1080 keyframe.
  ```

### 08 · Buck (Brand Motion)

- **Signature**: 2D illustration in motion · paper-cut layering · saturated color · charm
- **Mood**: friendly, hand-crafted, charming
- **Reference works**: Slack, Headspace, Asana brand films
- **Use when**: B2C SaaS launches, kid's products, friendly brand storytelling
- **AI prompt template**:
  ```
  Buck-style 2D motion. Flat illustration with paper-cut depth (3-4 layers parallax).
  Warm saturated palette: peach #FFB088, sage #8FB89A, navy #2E3A59.
  Soft handmade textures. Bouncy easing. Charming character beat.
  Output: 1920×1080 frame.
  ```

---

## School 03 · Minimalist

**Visual mood**: order, whitespace, refinement
**Best for**: luxury brands, premium products, editorial content
**Anti-pattern**: minimalism as laziness — every removed element must justify its absence

### 09 · Dieter Rams (Less, but better)

- **Signature**: functional surfaces · neutral palette · grid order · zero ornament
- **Mood**: industrial, honest, durable
- **Reference works**: Braun product line, Vitsoe shelving
- **Use when**: industrial design contexts, premium hardware, durable goods
- **AI prompt template**:
  ```
  Dieter Rams principle. Cool grays #ECEEF1 / #C8CDD3 / #353A40.
  One accent: Rams orange #E85020 or Braun green #76A373.
  Helvetica with mathematical spacing. Functional photography only — product showing exactly what it does.
  Output: 1920×1080.
  ```

### 10 · Jony Ive (Apple Industrial)

- **Signature**: white seamless · soft sculptural shadows · ultra-thin type · precise geometry
- **Mood**: refined, luminous, premium
- **Reference works**: iPhone product photography, Apple Park imagery
- **Use when**: high-end consumer hardware, jewelry, watches
- **AI prompt template**:
  ```
  Jony Ive industrial style. White seamless backdrop with subtle gradient.
  Object in 3/4 view with sculptural soft shadows.
  Type: SF Pro Display Ultralight, max kerning, never bold.
  Geometric precision in object positioning. Single accent if any: pale gold #D4AF77.
  Output: 1920×1080.
  ```

### 11 · Ken-ya Hara (Eastern Minimalism)

- **Signature**: emptiness as content · earth-clay palette · Mincho serif · whitespace as breath
- **Mood**: contemplative, poetic, restrained
- **Reference works**: MUJI brand identity, *White* book, Kenzo Tange catalogs
- **Use when**: lifestyle brands, wellness products, mindful tech
- **AI prompt template**:
  ```
  Kenya Hara-style emptiness design. Cream paper background #F4F1EA.
  Single small object 1/3 frame, drawn in single brush ink stroke.
  Mincho serif Japanese-inspired typography. 
  Clay orange accent #C04A1A used at 5% area max.
  70% whitespace. Output: 1920×1080.
  ```

### 12 · Wim Crouwel (Geometric Minimalism)

- **Signature**: math-derived geometry · grid-built letterforms · 2-color systems · rigorous structure
- **Mood**: rational, geometric, modernist
- **Reference works**: Stedelijk Museum catalogs, New Alphabet typeface
- **Use when**: museum / cultural identity, architectural communications
- **AI prompt template**:
  ```
  Crouwel-style geometric minimalism. Custom-feeling geometric type (think New Alphabet).
  Two-color system: warm white #F2EFE6 and one bold: red #E0202C OR blue #1D2DA0.
  20-column grid visible behind the work. 1:1 ratio dominant compositions.
  Output: 1920×1080.
  ```

---

## School 04 · Experimental Vanguard

**Visual mood**: avant-garde, generative, visual impact
**Best for**: cultural events, fashion, indie tech, art platforms
**Anti-pattern**: weirdness for show — experimental work must still communicate

### 13 · Stefan Sagmeister (Provocative Editorial)

- **Signature**: hand-built typography · physical-world type · color-saturated · disruptive
- **Mood**: provocative, hand-crafted, witty
- **Reference works**: AIGA Detroit poster, *Things I Have Learned* series
- **Use when**: cultural events, design-conscious B2C, brand provocations
- **AI prompt template**:
  ```
  Sagmeister-style hand-built editorial. Type assembled from physical objects 
  (rope, fruit, wire), photographed in shallow DOF.
  Saturated color: hot pink #FF2F8E or yellow #FFD200 against neutral.
  Hand-written annotations layered on top. Output: 1920×1080.
  ```

### 14 · David Carson (Anti-Grid)

- **Signature**: layered chaos · ripped textures · type as image · grunge palette
- **Mood**: rebellious, raw, kinetic
- **Reference works**: *Ray Gun* magazine, Nine Inch Nails album art
- **Use when**: alt music, indie media, rebellion aesthetics
- **AI prompt template**:
  ```
  David Carson-style anti-design. Type rotated, scaled, broken across the page.
  Grunge texture layers (paper tears, photo over-exposure, scan artifacts).
  Palette: bone #DDD8CC, rust #B5421E, ink black #0A0A0A.
  Output: 1920×1080. Composition feels broken but intentional.
  ```

### 15 · Generative Art (Casey Reas / Manfred Mohr lineage)

- **Signature**: code-driven mark-making · mathematical curves · algorithmic compositions
- **Mood**: generative, computational, emergent
- **Reference works**: Processing.org gallery, Casey Reas paintings
- **Use when**: art platforms, AI-creativity products, NFT projects
- **AI prompt template**:
  ```
  Casey Reas-style generative work. Algorithmic line systems (10000+ lines).
  Reaction-diffusion patterns in 2-color: paper #F0EBE2 + indigo #1F2D5C.
  Subtle gradient shifts encoding noise function.
  Output: 1920×1080. Should look generated, not drawn.
  ```

### 16 · Brutalist Web (Yotam Hadar / Reed College / Bloomberg Businessweek)

- **Signature**: raw HTML aesthetic · Times New Roman · 1px borders · system defaults
- **Mood**: anti-design, intellectual, confrontational
- **Reference works**: Bloomberg Businessweek covers, brutalistwebsites.com
- **Use when**: art/culture sites that benefit from raw honesty, indie publications
- **AI prompt template**:
  ```
  Brutalist web aesthetic. Times New Roman everywhere. Pure white #FFF.
  Black 1px borders on every container. No rounded corners. No shadows.
  One image, photocopier-quality (over-contrasted, slightly tilted).
  One bright color used wrong (dark olive on white text). Output: 1920×1080.
  ```

---

## School 05 · Eastern Philosophy

**Visual mood**: warm, poetic, contemplative
**Best for**: lifestyle brands, wellness, cultural content, differentiated positioning
**Anti-pattern**: orientalist pastiche — depth comes from philosophy, not motifs

### 17 · MUJI / Naoto Fukasawa (Without Thought)

- **Signature**: object-as-itself · cream / linen tones · serif body · zero personality
- **Mood**: gentle, present, unobtrusive
- **Reference works**: MUJI catalog, ±0 humidifier
- **Use when**: lifestyle brands, mindful tech, "calm" software
- **AI prompt template**:
  ```
  MUJI-style "without thought" design. Cream backdrop #F2EEE6.
  Single object centered, photographed in soft natural light from one window.
  Serif body type (Garamond Premier Pro or Source Serif).
  No accent color — entire piece in warm neutrals. Output: 1920×1080.
  ```

### 18 · Studio Ghibli / Eiko Ishioka (Cinematic Eastern Romance)

- **Signature**: painterly skies · saturated nature · narrative posing · serif title type
- **Mood**: romantic, painterly, narrative
- **Reference works**: Ghibli films, Eiko Ishioka's *The Cell* posters
- **Use when**: storytelling content, books, films, narrative-heavy brands
- **AI prompt template**:
  ```
  Ghibli-Ishioka style cinematic Eastern romance.
  Painterly sky gradient (cobalt → coral → cream).
  Single foreground figure or object with strong narrative pose.
  Serif display: PT Serif Display or Source Serif Pro Bold Italic.
  Saturated accent: scarlet #C42A1F or jade #4F8B6C. Output: 1920×1080.
  ```

### 19 · Wabi-Sabi (Imperfect / Impermanent / Incomplete)

- **Signature**: aged textures · earthy tones · asymmetry · negative space honors imperfection
- **Mood**: humble, weathered, authentic
- **Reference works**: Axel Vervoordt interiors, Leonard Koren's *Wabi-Sabi* book
- **Use when**: artisan brands, slow-food / slow-fashion, wellness with depth
- **AI prompt template**:
  ```
  Wabi-sabi aesthetic. Hand-made paper texture background, slight stain at corner.
  Asymmetric composition — content not centered, weighted to one side.
  Earthy palette: bone #E8E1D4, moss #6F7A57, rust #A4593A.
  Subtle imperfections preserved (a crooked line, a paper crease). Output: 1920×1080.
  ```

### 20 · Chinese Ink Wash (Zhang Daqian / Modern Reinterpretation)

- **Signature**: ink gradient · single brushstroke as composition · vermillion seal · breathing white
- **Mood**: scholarly, poetic, contemplative
- **Reference works**: Zhang Daqian landscapes, Lin Tianmiao installations
- **Use when**: cultural products, tea / wellness brands, modern Chinese identity
- **AI prompt template**:
  ```
  Chinese ink-wash aesthetic. Mulberry paper background #F6F0E1.
  Single ink-wash gradient as composition (mountain or branch suggestion).
  One vermillion seal-stamp #C5252B in lower-right at 4% area.
  Mincho-style serif (KaiTi-inspired) for type, light weight.
  85% whitespace as breath. Output: 1920×1080.
  ```

---

## How to recommend 3 directions (template)

When recommending, use this exact structure:

```markdown
Based on your brief — [restate one line] — I'd recommend three directions, each from a different school for clear contrast:

### Direction A · [School name] · [Designer name school]
**Why this fits you**: [50-100 words tying signature features to user's context]
**Visual signatures**:
- [Feature 1]
- [Feature 2]
- [Feature 3]
**Mood**: [keyword 1] · [keyword 2] · [keyword 3]
**Reference works**: [1-2 specific works]

### Direction B · [Different school] · [Designer school]
[Same structure]

### Direction C · [Third school] · [Designer school]
[Same structure]

---

I'll generate visual demos for all three so you can see, not just imagine. Want me to start, or would you like to adjust the directions first?
```

---

## Common combinations (3-pick patterns)

When the brief gives little to go on, these are reliable trios:

| User signal | Pick A (safe) | Pick B (bold) | Pick C (different) |
|---|---|---|---|
| "Looks professional" | 04 Stripe modern | 06 Apple cinematic | 11 Kenya Hara |
| "Tech / AI launch" | 04 Stripe | 05 Field.io generative | 19 Wabi-sabi |
| "Lifestyle / wellness" | 17 MUJI | 11 Kenya Hara | 14 David Carson (contrast option) |
| "Editorial / magazine" | 02 Tufte | 13 Sagmeister | 18 Ghibli-Ishioka |
| "B2B SaaS" | 04 Stripe | 01 Pentagram | 09 Rams |
| "Cultural / artistic" | 03 Müller-Brockmann | 15 Generative | 20 Chinese ink wash |

Don't follow these blindly — the trio should reflect what you learned from the brief, not pattern-match the surface keyword.
