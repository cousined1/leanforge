# Design context — when there's no design system to anchor in

This file is the **thin fallback** for "we have no brand, no UI kit, no Figma, no codebase to copy from." If the brief is *vague* on top of that ("make me something nice"), use [`design-styles.md`](design-styles.md) instead — it's the thick fallback with 20 design philosophies. This one is for when the user knows roughly what they want but has no asset library to draw from.

---

## The 4 seed inputs (gather before designing)

Without a design system, you need at minimum these four anchors. If the user can give you all four, you can produce coherent work without inventing too much.

1. **One reference brand they admire** (Linear / Notion / Stripe / Apple / Brutalist Framer site / etc.). This anchors the *aesthetic register*.
2. **One color, or one mood-color**. Either a hex code or a word: "muted", "energetic", "warm", "cold-blue", "earthy".
3. **One type direction**: serif / grotesque / mono / display / geometric. ("I don't know" = grotesque by default — least likely to feel wrong.)
4. **One density preference**: airy / standard / dense. ("Like the Apple website" = airy. "Like Bloomberg" = dense.)

If they can't give you one of these, propose one and let them veto.

> "I'll go with Linear-aesthetic, a deep teal as accent, ABC Diatype for type, and standard density — sound right? If not, tell me which to swap."

---

## Default building blocks (use until told otherwise)

When inventing from scratch, these are the safe-but-not-boring defaults. They don't trigger AI-slop alarms and they look intentional.

### Color

| Slot | Default | Why |
|---|---|---|
| Background (light) | `#fafafa` (warm) or `#f7f7f8` (neutral) | Pure `#ffffff` is harsh on screens; off-white reads as considered |
| Background (dark) | `#0a0a0a` or `#0c0d10` | Pure `#000` plus pure `#fff` text strobes; this is calmer |
| Primary text | `#0a0a0a` on light, `#fafafa` on dark | High contrast, no gray-on-white legibility issues |
| Muted text | `#6b7280` light, `#9ca3af` dark | Tailwind gray-500/400 — calibrated for body |
| Borders | `#e5e7eb` light, `#262626` dark | Visible without being heavy |
| Accent | **One color**, picked deliberately | See picker below |

#### Accent picker

If the user gave a mood, translate:

| Mood | Hex | Note |
|---|---|---|
| Trustworthy / classic | `#0066ff` (Stripe-blue) | Default if no mood specified |
| Energetic | `#ff4f00` (Pantone 1655) | Bold but not slop-orange |
| Premium / serious | `#1a1a1a` + a single gold accent `#c9a861` | Black-tie aesthetic |
| Earthy / warm | `#8b4513` (saddle brown) or `#bc6c25` (terracotta) | Anchors organic brands |
| Quiet / Muji | No accent, just neutrals | "Color is a luxury we choose not to spend" |
| Playful | `#ffd60a` (saturated yellow) + `#0a0a0a` | High contrast, high mood |

**Avoid as accent**: pure purple (`#a855f7`), pink-to-purple gradients, and "Bootstrap blue" (`#007bff`). All AI-slop signals.

### Typography

| Role | Default | Notes |
|---|---|---|
| Display / hero | **ABC Diatype** *(commercial)* or **Inter Display** *(free)* | Distinct from body Inter; has personality |
| Body | **Inter** | Safe, available, well-hinted |
| Mono | **JetBrains Mono** or **Berkeley Mono** | Use for code, version numbers, tabular metrics |
| Optional serif accent | **Fraunces** or **Instrument Serif** | One serif word in a hero (italics for tension) |

Type scale (modular, ratio 1.25):
```
12 / 14 / 16 / 20 / 24 / 32 / 40 / 56 / 80 / 112
```

**One scale per project**. Don't introduce 18, 22, 28, 36, 48 in the same design.

### Spacing

Follow an 8px base grid: `4 8 12 16 24 32 48 64 96 128 192`. Don't use `13`, `27`, `41` — they read as "spacing was eyeballed in the browser inspector."

### Radius

| Element | Radius |
|---|---|
| Buttons, pills, badges | `8` (default) or `999` (full pill) |
| Cards, containers | `12` |
| Modals, hero blocks | `16-20` |
| Avatar / profile pic | `50%` (full circle) |

**Avoid**: 4px (twitchy), 24+ (gummy), and *especially* `border-radius` on text (it's invisible).

### Shadows

Most things shouldn't have shadows. When they do:

```css
/* Subtle lift (cards on hover) */
box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08);

/* Modal / floating panel */
box-shadow: 0 20px 60px rgba(0,0,0,0.15);

/* Dark mode equivalent — heavier, lower alpha */
box-shadow: 0 20px 60px rgba(0,0,0,0.4);
```

**Avoid**: rainbow / colored shadows, double shadows on every card, and the "neumorphism" inset+outset combo.

### Icons

Pick one set and stick to it for the whole project:

- **Lucide** — most universal, free, unobtrusive
- **Heroicons** — Tailwind-native, two weights (outline / solid)
- **Phosphor** — six weights, more visual personality
- **Tabler** — large set, flat strokes
- **Material Symbols** — if the project is Android-native

**Avoid**: emoji as icons (🚀📊✨), free Font Awesome (dated look), and Apple SF Symbols (license restricts non-Apple use).

### Imagery

If the design needs photos:

- **Unsplash** for general photography (people, landscapes, products) — search for editorial-looking results, avoid the over-saturated "Instagram-aesthetic" frontpage
- **Wikimedia Commons** for objects, brands (logos in known contexts), historical reference
- **Pexels** as a backup for Unsplash
- **The Met Open Access** for art / texture / classical imagery

**Avoid**: stock photos with watermarks, AI-generated images for "people" headshots (uncanny), and abstract 3D blob renders unless the brand is explicitly that aesthetic.

---

## When the user gives you no inputs at all

If the user says "make me something" with zero context, **do not start designing**. Switch to the Design Direction Advisor pattern in [`design-styles.md`](design-styles.md):

1. Pick 3 differentiated directions from the 20 philosophies (one each from Information Architecture, Motion Poetics, Minimalist or Eastern).
2. Sketch each in 1-2 sentences with a reference brand.
3. Ask the user to pick one before you build anything.

Going straight from "make me something" to a delivered design **always** produces generic work, no matter how skilled the agent.

---

## Anti-pattern: vibes-only design

The fastest way to ship slop is "I think a gradient with rounded cards would look good here." Always anchor each choice to something:

- a reference brand,
- a stated mood word,
- a functional requirement (e.g., "high density because the user needs to compare 50 rows"),
- or a deliberate contrast against an existing system.

If you can't trace the choice to one of those, you're vibing — and vibing produces the same Tailwind-default look every time.
