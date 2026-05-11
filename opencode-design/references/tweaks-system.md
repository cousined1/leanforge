# Tweaks system — live parameter tuning

A "Tweaks" panel lets the user adjust design variables (color, spacing, font weight, layout split, copy variants) in real time and see the effect immediately. Two reasons to ship one:

1. **Variant exploration without N copies** — instead of generating 5 versions of a hero, ship 1 with a Tweaks panel for color / typography / layout.
2. **Live design review** — the user can play with the design while looking at it, which produces sharper feedback than "what do you think?"

This skill uses a **pure-frontend version** with `localStorage` so it works in any agent environment (no parent window, no `postMessage` host, no Claude.ai-specific APIs).

---

## When to add a Tweaks panel

✅ Add when:
- The brief is exploratory ("I'm not sure about the color")
- 2-4 specific parameters drive the look (color, type scale, density)
- You want the user to play and report back

❌ Don't add when:
- The deliverable is a final asset (slide deck, exported video)
- The "tweak" would change the whole structure (those are different variants — use `DesignCanvas` instead)
- The design has 10+ knobs (that's a config UI, not a tweak panel)

Sweet spot: **2-5 controls, one screen, instant feedback.**

---

## API contract

```jsx
<Tweaks
  storageKey="hero-v1"
  controls={[
    { id: "accent",      label: "Accent color", type: "color",   default: "#0066ff" },
    { id: "headline",    label: "Headline",     type: "text",    default: "Ship faster" },
    { id: "density",     label: "Density",      type: "range",   default: 1.0, min: 0.7, max: 1.4, step: 0.05 },
    { id: "font",        label: "Headline font",type: "select",  default: "fraunces",
      options: [
        { value: "fraunces",   label: "Fraunces (serif)" },
        { value: "diatype",    label: "ABC Diatype (grotesque)" },
        { value: "berkeley",   label: "Berkeley Mono (mono)" },
      ]},
    { id: "darkMode",    label: "Dark mode",    type: "toggle",  default: false },
  ]}
>
  {(values) => <Hero {...values} />}
</Tweaks>
```

The render-prop receives the current values. State changes are debounced and persisted to `localStorage[`tweaks:${storageKey}`]` so reloading the page keeps your edits.

---

## Implementation

```jsx
const Tweaks = ({ storageKey, controls, children }) => {
  const { useState, useEffect, useCallback } = React;
  const key = `tweaks:${storageKey}`;

  const initial = useCallback(() => {
    const defaults = Object.fromEntries(controls.map(c => [c.id, c.default]));
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      return { ...defaults, ...saved };
    } catch { return defaults; }
  }, [key, controls]);

  const [values, setValues] = useState(initial);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(values)); } catch {}
  }, [key, values]);

  const set = (id) => (v) => setValues(prev => ({ ...prev, [id]: v }));

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Render area */}
      <div>{children(values)}</div>

      {/* Tweaks panel */}
      <div style={{
        position: "fixed", top: 16, right: 16, width: open ? 280 : 44,
        background: "rgba(20,20,22,0.96)", color: "#f5f5f5",
        borderRadius: 12, padding: open ? 16 : 8,
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        fontFamily: "-apple-system, system-ui, sans-serif", fontSize: 13,
        backdropFilter: "blur(20px)",
        transition: "width 200ms ease, padding 200ms ease",
        zIndex: 9999,
      }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: "transparent", color: "#f5f5f5", border: "none",
            cursor: "pointer", width: "100%", textAlign: "left",
            padding: 0, fontSize: open ? 11 : 16, fontWeight: 600,
            letterSpacing: open ? "0.08em" : 0, textTransform: "uppercase",
            color: "rgba(245,245,245,0.5)",
          }}>
          {open ? "TWEAKS · click to collapse" : "⚙"}
        </button>
        {open && (
          <>
            {controls.map(c => (
              <div key={c.id} style={{ marginTop: 14 }}>
                <label style={{ display: "block", color: "rgba(245,245,245,0.7)", marginBottom: 6, fontSize: 12 }}>
                  {c.label}
                </label>
                <Control control={c} value={values[c.id]} onChange={set(c.id)} />
              </div>
            ))}
            <button
              onClick={() => {
                const defaults = Object.fromEntries(controls.map(c => [c.id, c.default]));
                setValues(defaults);
              }}
              style={{
                marginTop: 16, width: "100%",
                background: "rgba(255,255,255,0.06)", color: "#f5f5f5",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
                padding: "8px 0", fontSize: 12, cursor: "pointer",
              }}>Reset</button>
          </>
        )}
      </div>
    </div>
  );
};

const Control = ({ control, value, onChange }) => {
  const inputBase = {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f5f5f5", padding: "6px 10px", borderRadius: 6, fontSize: 13,
  };
  switch (control.type) {
    case "color":
      return <input type="color" value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputBase, padding: 2, height: 32 }} />;
    case "text":
      return <input type="text" value={value} onChange={e => onChange(e.target.value)} style={inputBase} />;
    case "range":
      return (
        <div>
          <input type="range" min={control.min} max={control.max} step={control.step}
            value={value} onChange={e => onChange(parseFloat(e.target.value))}
            style={{ width: "100%" }} />
          <div style={{ fontSize: 11, color: "rgba(245,245,245,0.5)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
            {value.toFixed(2)}
          </div>
        </div>
      );
    case "select":
      return (
        <select value={value} onChange={e => onChange(e.target.value)} style={inputBase}>
          {control.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case "toggle":
      return (
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
          <span style={{ color: "rgba(245,245,245,0.7)" }}>{value ? "on" : "off"}</span>
        </label>
      );
    default: return null;
  }
};

window.Tweaks = Tweaks;
```

---

## URL sharing

When the user wants to send a specific tweak combination to a colleague:

```jsx
// In the panel, add a "Copy share link" button that does:
const url = new URL(window.location.href);
url.searchParams.set("tweaks", btoa(JSON.stringify(values)));
navigator.clipboard.writeText(url.toString());

// On load, override defaults from URL:
const fromUrl = (() => {
  try {
    const p = new URL(location.href).searchParams.get("tweaks");
    return p ? JSON.parse(atob(p)) : null;
  } catch { return null; }
})();
```

`localStorage` survives reloads on the same machine; the URL trick survives Slack pastes.

---

## Anti-patterns

- **Tweaks for things that change structure**. If turning a knob requires re-laying out the whole page, that's a variant, not a tweak. Ship two pages or use `DesignCanvas`.
- **Bare RGB sliders for color**. Use a color picker or a curated swatch palette — RGB sliders produce ugly colors 90% of the time.
- **Range sliders without numerical readout**. Always show the current value (and ideally the unit).
- **Persisting controversial defaults**. If the saved tweaks include something broken, the user reloads and sees broken design. Always provide a Reset button.
- **More than 5 controls**. If you genuinely need 10 knobs, that's a config UI; design it as such (collapsible groups, labels, tooltips).
