# Critique Guide · 5-Dimension Expert Review

When the user asks "review this", "is it any good?", "score it", or you want to self-check before delivery — walk this 5-dimension review. Each dimension scores 0-10. Output: total + Keep / Fix / Quick Wins.

**Critique the design, not the designer.** Always specific, always actionable.

---

## The 5 dimensions

### 1. Philosophy consistency (0-10)

Does the design hold one coherent philosophy throughout, or does it drift between styles?

| Score | Meaning |
|---|---|
| 9-10 | Every element traces back to one design philosophy. A reviewer could identify the school in 3 seconds. |
| 7-8 | Mostly coherent, one or two weak signals. |
| 5-6 | Visible drift — some sections feel like a different deck. |
| 3-4 | Multiple philosophies wrestling for dominance, no clear winner. |
| 0-2 | Generic AI-default look — no philosophy at all. |

**Common deductions**:

- Type from one school + color from another (Helvetica + Apple gradients = mismatch)
- Component A is glassmorphic, component B is brutalist
- "Adding things to make it richer" diluting the original direction
- Using AI defaults (purple gradient, emoji icons) inside an otherwise designed work

### 2. Visual hierarchy (0-10)

Can the viewer parse the information in the right order? Does the eye land where the design wants it to?

| Score | Meaning |
|---|---|
| 9-10 | Eye lands on hero in <0.5s, second priority is unambiguous, supporting info follows naturally. |
| 7-8 | Hierarchy is clear with one minor sequence break. |
| 5-6 | Reader has to hunt for the main message. |
| 3-4 | Multiple equally-loud elements competing. |
| 0-2 | Flat — no element pulls more weight than another. |

**Common deductions**:

- Hero text and body text within 30% of each other in size
- All-bold or all-regular (no weight contrast)
- Color used to "make things pop" everywhere = nothing pops
- Decorative icons stealing attention from real content

### 3. Detail execution (0-10)

Are the small details treated with care? This is where premium / polish lives.

| Score | Meaning |
|---|---|
| 9-10 | Pixel-precise alignment, considered hover/active states, typography micro-corrections, kerning right, text-wrap pretty. |
| 7-8 | One detail at 120% (signature element), most others good. |
| 5-6 | Visible misalignments, default kerning, generic transitions. |
| 3-4 | Multiple alignment errors, unconsidered hover states, default everything. |
| 0-2 | Looks like a wireframe shipped as final. |

**Common deductions**:

- Hover states absent or default browser
- Misaligned baselines (text columns off by 2-4px)
- Inconsistent spacing scale (using random padding values)
- Default `letter-spacing: normal` on display type
- Forgotten focus states for keyboard nav
- Mismatched icon weights / sizes

### 4. Functionality (0-10)

Does it actually work? Click-tests pass? Mobile renders? Edge cases handled?

| Score | Meaning |
|---|---|
| 9-10 | All tested interactions work, error states exist, mobile renders, accessibility considered. |
| 7-8 | Main flows work, one edge case missed. |
| 5-6 | Core happy path works, error states ignored. |
| 3-4 | Multiple broken interactions, mobile breaks. |
| 0-2 | Static screenshot dressed as "interactive". |

**Common deductions**:

- Button lacks `cursor: pointer`
- Tab nav doesn't actually switch
- Mobile breakpoint absent
- Loading state shows "undefined" or empty
- Keyboard shortcuts broken
- Focus order doesn't follow visual order

### 5. Innovation (0-10)

Does the work bring something new to its category? Or is it a competent execution of an existing pattern?

| Score | Meaning |
|---|---|
| 9-10 | Genuinely fresh — breaks a category convention in a way that serves the content. |
| 7-8 | Has one signature move that differentiates from the obvious solution. |
| 5-6 | Solid execution of a known pattern, but no surprise. |
| 3-4 | Almost identical to the top 5 examples in the category. |
| 0-2 | Indistinguishable from a generic template. |

**Note on innovation**: this dimension SHOULD score lower than the others sometimes. A perfectly executed B2B SaaS landing page that scores 9/9/9/9 on the others can score 5 on innovation — and that's correct. Innovation is bonus, not requirement, depending on context.

---

## Output format

```markdown
# Design Critique · [project name]

## Scores
- Philosophy consistency: X/10
- Visual hierarchy: X/10
- Detail execution: X/10
- Functionality: X/10
- Innovation: X/10
- **Total: XX/50**

## Keep ✅
- [Specific element or decision that's working]
- [Another one]
- [Another one]

## Fix
### ⚠️ Critical (delivery-blocking)
- [Specific issue + specific fix]

### ⚡ Important (should fix before final)
- [Specific issue + specific fix]
- [Specific issue + specific fix]

### 💡 Polish (nice to have)
- [Specific issue + specific fix]

## Quick Wins (5 minutes each, do these first)
1. [Tiny change with high return]
2. [Tiny change with high return]
3. [Tiny change with high return]
```

---

## Critique principles

### Specific over general

❌ "The hierarchy is unclear."
✅ "The 32px section header and 28px body text are too close in size. Bump the header to 48px or change its weight to 700."

### Actionable over evaluative

❌ "Color palette feels off."
✅ "The accent #E85020 hits 68% saturation while the base palette is 35-45%. Drop accent to ~50% saturation (try `oklch(0.62 0.18 35)`) for harmony."

### Trace to philosophy

When you cite a problem, link it back to the design intent:

> "This page committed to Kenya Hara minimalism, but the `box-shadow: 0 4px 12px` on every card pulls toward Material. Either drop the shadow to keep the philosophy, or commit to a different philosophy for the whole page."

### Calibrate praise

Don't pad the Keep section to be nice. If only one thing is working, list one thing. Padding dilutes the real signal.

### Quick Wins are not "obvious things"

Quick Wins are tiny investments that disproportionately raise quality:

- Add `text-wrap: pretty` to headlines (5 sec, big polish jump)
- Tighten kerning on display type (`letter-spacing: -0.02em`)
- Replace one decorative icon with a meaningful divider
- Switch one font weight from 600 to 700
- Add `transition: opacity 200ms` to hover states

NOT Quick Wins:
- "Redesign the navigation"
- "Pick different colors"
- "Add real data"

Those are full-rework items, not 5-minute fixes.

---

## Self-critique mode

Before delivery, run yourself through this checklist (no scoring needed, just yes/no):

- [ ] Can I name the design philosophy in one sentence?
- [ ] Does my eye land on the right thing first?
- [ ] Have I clicked every interactive element in browser?
- [ ] Did I check mobile at 375px width?
- [ ] Are all my colors from the brand spec (or oklch-defined)?
- [ ] Did I avoid all 6 anti-AI-slop tropes from SKILL.md?
- [ ] Are there any AI defaults I let slip in (emoji, purple gradient)?
- [ ] Have I included one detail at 120%?
- [ ] Are placeholders honest (gray block + label) where data is missing?
- [ ] Are assumptions documented if the user didn't fully spec?

If 3+ are "no", the design isn't ready.

---

## Common critique anti-patterns

### "I love it!"

Useless. The user knows it's not perfect. Pretending it is wastes the opportunity to improve.

### "It's good, just maybe…" + 30 vague suggestions

Death by a thousand cuts. Pick the top 3-5 fixes and rank them. Vague suggestions = no fix.

### "Make it more X"

Where X is "polished", "modern", "clean". These aren't actionable. What specifically? Which element? Replaced with what?

### "Try Y instead"

Without explaining why Y > current. If the alternative is better, articulate the reason — that's how the user learns the principle.

### Critiquing the brief, not the work

If the design follows the brief, don't critique the brief in the review. ("Why are we doing landing pages, doesn't everyone know they don't convert?") Stay scoped to the actual artifact.

---

## Calibration: what 8/10 feels like

A common error is grade inflation. Use these anchors to calibrate:

| Score | Real-world example |
|---|---|
| 10/10 | Apple keynote opener, peak Pentagram annual report |
| 9/10 | Strong agency portfolio piece |
| 8/10 | Polished mid-size SaaS site (Stripe, Linear) |
| 7/10 | Solid in-house design team output |
| 6/10 | Capable freelancer or junior designer |
| 5/10 | Good template execution |
| 4/10 | Default Bootstrap site |
| 3/10 | First-pass AI output |
| 2/10 | Wireframe shipped as final |
| 1/10 | "I don't even know what this was supposed to be" |

If you give a score >= 9, the work better be remarkable. If it's just "good", that's a 7-8.

---

## When the user disagrees with your critique

Listen first. They know their context better than you. Sometimes the constraint you don't see (legal, brand-stipulated, user-requested) explains the choice. If after their explanation you still think the issue stands, restate it as a tradeoff, not a verdict:

"I still think [X] reduces hierarchy, but I see why the brand mandate forces it. If you can negotiate flexibility there, [Y] would be sharper."
