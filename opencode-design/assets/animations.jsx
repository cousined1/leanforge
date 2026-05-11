// assets/animations.jsx
// Stage + Sprite + useTime + Easing + interpolate
// The animation engine. All motion in this skill goes through here.
//
// Key APIs:
//   useTime()       — global time in seconds, single source of truth
//   useSprite()     — current Sprite's local progress (0-1) within its [from, to] range
//   <Stage duration loop>  — outer container, owns the timeline + chrome (scrubber, time, watermark)
//   <Sprite from to>       — children visible only between from and to seconds
//   Easing.expoOut etc.    — easing functions
//   interpolate(t, [in], [out], easing) — value mapping with auto-clamp

const { useState, useEffect, useRef, useMemo, useContext, createContext } = React;

// ─── Time context ─────────────────────────────────────────

const TimeContext = createContext({ t: 0, sprite: { from: 0, to: 0, progress: 0 } });

function useTime() {
  return useContext(TimeContext).t;
}

function useSprite() {
  return useContext(TimeContext).sprite;
}

// ─── Easing ───────────────────────────────────────────────

const Easing = {
  linear: t => t,
  expoOut: t => 1 - Math.pow(2, -10 * t),
  expoIn: t => Math.pow(2, 10 * (t - 1)),
  expoInOut: t => t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  cubicOut: t => 1 - Math.pow(1 - t, 3),
  cubicIn: t => t * t * t,
  cubicInOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  backOut: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  bounceOut: t => {
    const n = 7.5625, d = 2.75;
    if (t < 1/d) return n * t * t;
    if (t < 2/d) return n * (t -= 1.5/d) * t + 0.75;
    if (t < 2.5/d) return n * (t -= 2.25/d) * t + 0.9375;
    return n * (t -= 2.625/d) * t + 0.984375;
  },
};

// ─── interpolate ──────────────────────────────────────────

function interpolate(t, inputRange, outputRange, easing = Easing.linear) {
  const [tIn, tOut] = inputRange;
  const [vIn, vOut] = outputRange;
  if (t <= tIn) return vIn;
  if (t >= tOut) return vOut;
  const progress = (t - tIn) / (tOut - tIn);
  const eased = easing(progress);
  return vIn + eased * (vOut - vIn);
}

// ─── Stage ─────────────────────────────────────────────────

function Stage({ children, duration = 10, loop = true, showProgress = true, watermark = null, background = '#000' }) {
  const [t, setT] = useState(0);
  const startedRef = useRef(false);
  const startTimeRef = useRef(null);

  // Recording mode forces loop=false
  const recording = typeof window !== 'undefined' && window.__recording === true;
  const effectiveLoop = recording ? false : loop;

  useEffect(() => {
    let raf;
    const tick = () => {
      if (startTimeRef.current === null) {
        startTimeRef.current = performance.now();
      }
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      let displayTime = elapsed;
      if (effectiveLoop && elapsed > duration) {
        displayTime = elapsed % duration;
      } else if (elapsed > duration) {
        displayTime = duration;
      }
      setT(displayTime);

      // Set ready flag in FIRST tick (not useEffect) so recorder doesn't miss frame 0
      if (!startedRef.current) {
        startedRef.current = true;
        if (typeof window !== 'undefined') window.__ready = true;
      }

      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [duration, effectiveLoop]);

  return (
    <TimeContext.Provider value={{ t, sprite: { from: 0, to: duration, progress: t / duration } }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1920,
        aspectRatio: '16 / 9',
        background,
        margin: '0 auto',
        overflow: 'hidden',
      }}>
        {children}

        {/* Stage chrome — only rendered when NOT recording */}
        {!recording && showProgress && (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            height: 4,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
            zIndex: 1000,
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${(t / duration) * 100}%`,
              background: 'rgba(255,255,255,0.6)',
              borderRadius: 2,
              transition: 'none',
            }} />
          </div>
        )}

        {!recording && watermark && (
          <div style={{
            position: 'absolute',
            bottom: 32,
            right: 32,
            fontSize: 10,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.15em',
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 99,
          }}>
            {watermark}
          </div>
        )}
      </div>
    </TimeContext.Provider>
  );
}

// ─── Sprite ────────────────────────────────────────────────

function Sprite({ from, to, children }) {
  const { t } = useContext(TimeContext);

  // Hidden sprites return null — don't pay layout cost
  if (t < from || t > to) return null;

  const progress = (t - from) / (to - from);
  const localT = t - from;

  return (
    <TimeContext.Provider value={{ t, sprite: { from, to, progress, localT } }}>
      {children}
    </TimeContext.Provider>
  );
}

// ─── Helper: useReady (for image / font preload) ──────────

function useReady(promiseFactories = []) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const promises = [
      typeof document !== 'undefined' ? document.fonts.ready : Promise.resolve(),
      ...promiseFactories.map(fn => fn()),
    ];
    Promise.all(promises).then(() => setReady(true));
  }, []);
  return ready;
}

// ─── Helper: preloadImages ─────────────────────────────────

function preloadImages(urls) {
  return Promise.all(urls.map(src => new Promise(resolve => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = src;
  })));
}

// Export to window
Object.assign(window, {
  Stage, Sprite,
  useTime, useSprite,
  Easing, interpolate,
  useReady, preloadImages,
  TimeContext,
});
