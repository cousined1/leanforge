# Verification — look at your work before claiming it's done

The most common reason "the design looks great" turns out to be wrong: **the agent never actually rendered the file**. It wrote the HTML, ran zero checks, and described what it *thinks* the output looks like.

This file is the verification protocol. It's short because the rule is simple: **render the file, look at the screenshot, then write the wrap-up message.**

---

## The minimum verification step

Every design deliverable that produces an HTML file gets one of these before the wrap-up message:

```bash
python3 scripts/verify.py path/to/output.html
```

That writes `output.png` next to the HTML. Look at the PNG. If it doesn't look right, fix the HTML and re-render. Repeat until it actually matches what you said you'd build.

---

## What to look for in the screenshot

Run this checklist on every render. **Don't skip it because "I know what it looks like."** You don't.

### Layout
- Is anything cut off at the edges?
- Are there unexpected scrollbars?
- Is the focal point where you intended it?
- Are columns / cards / grid items aligned?
- Does the spacing feel rhythmic, or is it cluttered/sparse in spots?

### Content
- Is any text overflowing its container?
- Did any image fail to load (broken icon, alt text showing, blank square)?
- Are placeholder values still visible ("Lorem ipsum", "TODO", "Your text here")?
- Are the numbers / names / dates the ones you meant?

### Type
- Is the headline font actually loading (not falling back to Times)?
- Is body text readable at the intended scale?
- Are line breaks natural, or are they breaking on weird words?

### Color
- Does the brand color match what you specified?
- Is contrast sufficient (especially body text on background)?
- In dark mode, are any areas accidentally still light?

### Mobile
- If the deliverable has a mobile breakpoint, render at 393×852 too:
  ```bash
  python3 scripts/verify.py output.html --width 393 --height 852 --full-page
  ```

---

## Verification by deliverable type

### Static page (landing page, infographic, doc)

```bash
python3 scripts/verify.py page.html --full-page
```

Look at the full-page PNG. Scroll through every section in your head. Anything broken, fix.

### Interactive prototype (clickable app demo)

Render multiple states. If your prototype has 5 screens, verify all 5 — don't just check the home screen.

```bash
# Initial state
python3 scripts/verify.py app.html --out app_home.png

# Specific state via URL fragment or query
python3 scripts/verify.py "app.html#/profile" --out app_profile.png
python3 scripts/verify.py "app.html?step=2" --out app_step2.png
```

For state-machine prototypes, instrument an `?initial=state-name` URL parameter so verification can capture each screen.

### Slide deck

Verify at least the title slide, one mid-deck slide, and the closing slide. Each is its own state:

```bash
python3 scripts/verify.py deck.html --out deck_01.png  # default = first slide
python3 scripts/verify.py "deck.html?slide=5" --out deck_05.png
```

(For this to work, your `deck-stage` instance reads `?slide=N` on load. Adding that is one extra `URLSearchParams` line.)

### Animation

Animations are verified differently — see `animation-pitfalls.md` rule #14 (5-second thumbnail test) and `video-export.md`. The summary:

```bash
# Render a single representative frame at the time you care about
python3 scripts/verify.py anim.html --out anim_frame.png
# (animation should set window.__frame to a representative time when window.__verifying=true)

# Or render the full video and visually scrub through it
node scripts/render-video.js anim.html
```

### Variants (DesignCanvas)

```bash
python3 scripts/verify.py variants.html --full-page --width 1920
```

Each variant tile should be visible and visually distinct. If two variants look the same, the brief is too vague — go back to the user.

---

## What to do with the screenshot

You have two options depending on context:

1. **Inline review**: open the PNG yourself (in IDE preview, image viewer, etc.) and assess visually before sending the wrap-up message.

2. **Tool-based review**: in environments that support image inputs (Claude.ai with vision, Claude Code with screenshot tools), feed the PNG back through your own perception. Read it as a reviewer, not as the author. Apply the [`critique-guide.md`](critique-guide.md) 5-dimension rubric.

The point of either approach is the same: **catch the bugs and the slop before the user does.**

---

## When to skip verification

Almost never, but:

- Pure markdown output (no HTML rendering) — there's nothing to render.
- HTML so simple it can't fail (a single `<h1>`) — but those are rare in this skill.
- The user is iterating quickly and asks you not to verify between turns — respect it, but resume verification before the final delivery.

If you skip, **say so explicitly in the wrap-up message**: "I haven't run verify.py on this iteration — let me know if anything looks off and I'll adjust." Don't quietly skip.

---

## Anti-patterns

- ❌ Writing "the page looks clean and professional" without ever rendering it. You don't know.
- ❌ Verifying once at the start, making 4 more changes, never re-verifying.
- ❌ Verifying only desktop when the brief mentioned mobile.
- ❌ Using `verify.py` as the only check on a deliverable that's actually an animation (see `video-export.md` instead).
- ❌ Sending the user a screenshot you took and saying "looks good" without looking at it. *You* look first.
