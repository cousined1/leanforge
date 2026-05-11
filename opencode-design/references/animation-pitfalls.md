# Animation Pitfalls · 14 Rules from Real Bugs

Every rule in this file came from a real animation bug — skipping any of them costs 1-3 rounds of rework. Read this BEFORE writing motion code.

---

## 1. Time is global, frames are local

The animation HTML has one global clock. Every Sprite reads from `useTime()` to know where it is in the timeline. Don't try to track per-Sprite time with `requestAnimationFrame` — when the user scrubs the timeline or the recorder snaps a frame, your local timer is wrong.

```jsx
// ❌ BAD — local timer drifts from global timeline
function MyShape() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT(s => s + 16), 16);
    return () => clearInterval(id);
  }, []);
  return <div style={{ transform: `translateX(${t}px)` }} />;
}

// ✅ GOOD — reads global Stage time
function MyShape() {
  const t = useTime();  // from animations.jsx
  return <div style={{ transform: `translateX(${t}px)` }} />;
}
```

## 2. Sprite must declare its time range explicitly

A Sprite that says "I exist from t=2.0 to t=4.5" lets the recorder skip frames where the Sprite isn't visible, and lets the scrubber color-code the timeline. Sprites without explicit ranges are invisible to tooling.

```jsx
<Sprite from={2.0} to={4.5}>
  <MyShape />
</Sprite>
```

## 3. Recording mode forces `loop=false`

When recording video, your animation must play exactly once and stop. If `Stage.loop = true` during a record, the recorder captures multiple loops and the output MP4 has stuttery seams.

In your Stage component:

```jsx
function Stage({ children, duration, loop = true }) {
  const recording = window.__recording === true;
  const effectiveLoop = recording ? false : loop;
  // ...
}
```

## 4. First-frame readiness flag

The recorder waits for `window.__ready === true` before starting frame capture. Set this in the FIRST tick of your time loop, not in `useEffect` (which fires on next paint, missing frame 0).

```jsx
function useTime() {
  const [t, setT] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      setT(elapsed);
      if (!startedRef.current) {
        startedRef.current = true;
        window.__ready = true;  // ← set HERE, not in a separate useEffect
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}
```

## 5. Easing functions: prefer Expo over generic ease-in-out

Apple keynote, Field.io, and most "premium" motion uses Expo or strong cubic eases — not the wishy-washy default `ease-in-out`. The motion language difference between an expo curve and a generic ease is the difference between "feels designed" and "feels like a CSS transition".

```javascript
const Easing = {
  expoOut: t => 1 - Math.pow(2, -10 * t),
  expoIn: t => Math.pow(2, 10 * (t - 1)),
  expoInOut: t => t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2,
  cubicOut: t => 1 - Math.pow(1 - t, 3),
};
```

## 6. `interpolate` over manual math

Don't write `t * 200 - 100`. Write `interpolate(t, [0, 1], [-100, 100])`. The latter clamps automatically, supports easing, and reads at a glance.

```javascript
function interpolate(t, inputRange, outputRange, easing = x => x) {
  const [tIn, tOut] = inputRange;
  const [vIn, vOut] = outputRange;
  if (t <= tIn) return vIn;
  if (t >= tOut) return vOut;
  const progress = (t - tIn) / (tOut - tIn);
  const eased = easing(progress);
  return vIn + eased * (vOut - vIn);
}
```

## 7. Don't draw progress bars / time codes / copyright lines INSIDE the canvas

The Stage chrome (scrubber, time display, watermark) is owned by the Stage component, not the canvas. Drawing them inside your scene means they collide with Stage chrome AND get baked into the recorded MP4 (where they look unprofessional).

```jsx
// ❌ BAD — inside the scene
<Sprite from={0} to={10}>
  <div className="my-scene">
    {/* content */}
    <div className="my-fake-progress-bar" style={{ position: 'absolute', bottom: 8 }}>
      {Math.floor(t)}s / 10s
    </div>
  </div>
</Sprite>

// ✅ GOOD — Stage owns chrome
<Stage duration={10} showProgress watermark="Made with opencode-design">
  <Sprite from={0} to={10}>
    <div className="my-scene">
      {/* content only — no progress bar, no time code */}
    </div>
  </Sprite>
</Stage>
```

## 8. Hidden Sprites must opt out of rendering

When `t < from` or `t > to`, the Sprite should return `null`, NOT an invisible div. Browser still pays layout cost for invisible divs, and at 60fps your animation drops frames.

```jsx
function Sprite({ from, to, children }) {
  const t = useTime();
  if (t < from || t > to) return null;
  return <>{children}</>;
}
```

## 9. Image preloading before recording

The recorder takes frames as fast as it can. If image loads are still pending, recorded frames will show broken images. Preload all images BEFORE setting `window.__ready = true`.

```javascript
const imageUrls = ['/img/a.png', '/img/b.png', '/img/c.png'];
Promise.all(imageUrls.map(src => new Promise(res => {
  const img = new Image();
  img.onload = res;
  img.onerror = res;  // count failed too
  img.src = src;
}))).then(() => {
  window.__ready = true;
});
```

## 10. Font loading races

Custom fonts (Newsreader, Source Serif, etc.) load asynchronously. Frame 0 may render in a fallback font, frame 1 in the real font — flicker. Use `document.fonts.ready` before signaling ready.

```javascript
Promise.all([
  document.fonts.ready,
  ...imageLoadPromises,
]).then(() => {
  window.__ready = true;
});
```

## 11. CSS transitions are NOT animation timeline

`transition: all 0.3s ease` is invisible to the Stage timeline. You can't scrub it, can't record it deterministically. Either use the Stage's `interpolate()` for everything, OR accept that CSS transitions only work for live-preview demos, not recording.

For recording-quality motion: ALL motion goes through `useTime()` + `interpolate()`. No CSS transitions inside Sprites.

## 12. `useEffect` side effects run AFTER paint

If you compute a value in `useEffect` and use it for the current frame's render, you're one frame behind. For recording, this means frame N captures frame N-1's data.

Use `useMemo` for derived values that depend on time:

```jsx
const t = useTime();
const x = useMemo(() => interpolate(t, [0, 1], [0, 100]), [t]);
return <div style={{ transform: `translateX(${x}px)` }} />;
```

## 13. Don't animate `width` / `height` / `top` / `left` (layout properties)

Animating layout properties triggers layout recalculation each frame — at 60fps, you'll drop frames. Use `transform` (translate / scale / rotate) and `opacity` only.

```jsx
// ❌ BAD — triggers layout
<div style={{ width: `${size}px` }} />

// ✅ GOOD — only compositing
<div style={{ transform: `scale(${size / 100})`, transformOrigin: 'top left' }} />
```

## 14. The 5-second thumbnail test

Before writing motion code, sketch 5 thumbnails on paper representing the keyframes (1s, 3s, 5s, 7s, 9s for a 10s animation). If you can't articulate what's on screen at each moment, the structure is wrong — go back to scripting.

This catches "I'll figure it out as I code" failures, which always result in busywork motion that doesn't tell a story.

---

## Quick recording checklist

Before exporting video:

- [ ] Stage component sets `loop=false` when `window.__recording === true`
- [ ] First time-tick sets `window.__ready = true` (in the tick function, not useEffect)
- [ ] All images preloaded before `window.__ready`
- [ ] All custom fonts loaded (`document.fonts.ready`)
- [ ] No CSS transitions inside Sprites
- [ ] No layout-property animations
- [ ] No fake progress bars / time codes inside canvas
- [ ] All Sprites have explicit `from` and `to`
- [ ] Stage `duration` matches the longest Sprite's `to`

If any of these fail, the recorder will produce broken output.

---

## Audio sync notes (when adding BGM / SFX)

- BGM is added in post via `scripts/add-music.sh` — your animation HTML should have NO audio elements
- SFX cue points are timeline events you describe in `references/audio-design-rules.md`, NOT `<audio>` tags in HTML
- If you accidentally include `<audio>` tags, the recorder may capture broken audio + the post-processing audio will conflict

---

## Frame-rate gotchas

- Animation HTML targets 60fps for buttery preview
- Recorder defaults to 25fps for size + delivery
- Post-process upsamples to 60fps via interpolation (`scripts/convert-formats.sh`)
- This means: if your animation has fast micro-motion at 60fps, it may look choppy at recorder's 25fps. Test by setting `?fps=25` URL param to preview.

---

## Common errors and what they mean

| Error | Likely cause |
|---|---|
| Recorded MP4 has frame 0 missing | `window.__ready` set in `useEffect`, not first tick |
| Recorded MP4 has stutter at end | `Stage.loop=true` not switched to false during recording |
| Images broken in recording | Missing image preload before ready signal |
| Text in fallback font for some frames | Missing `document.fonts.ready` |
| Animation drops frames in browser | Animating layout properties; switch to transform |
| Scrubber doesn't show Sprite | Missing `from`/`to` on Sprite |
| Progress bar appears twice | Drew chrome inside canvas — remove |

Each of these is a 30+ minute debug session unless you check this list first.
