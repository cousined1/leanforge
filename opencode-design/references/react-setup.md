# React + Babel Setup · Pinned Versions and Pitfalls

This skill produces standalone HTML files that run React in-browser via Babel. No build step. Three things matter: pinned CDN URLs, scope rules, and known pitfalls.

---

## Required script tags (top of every React HTML)

```html
<!-- Pinned versions — do NOT use latest tags -->
<script crossorigin src="https://unpkg.com/react@18.2.0/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.22.5/babel.min.js"></script>
```

**Why pinned**:
- `latest` tags break when CDN updates push breaking changes
- Dev builds give better error messages than `production.min.js`
- 18.2.0 has stable concurrent features without 18.3+'s newer experimentals

**For production-feel**: switch to `react.production.min.js` only at final delivery, not during dev.

---

## Mounting pattern

```html
<div id="root"></div>

<script type="text/babel">
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
</script>
```

NOT `ReactDOM.render(<App />, container)` — that's React 17 API and warns in 18.

---

## Three uncrossable lines

### 1. Never use `const styles = {...}`

Multiple `<script type="text/babel">` blocks all see each other's top-level declarations after Babel transpiles. A `const styles` in block A and `const styles` in block B = "Identifier 'styles' has already been declared".

**ALWAYS namespace**:

```javascript
// ❌ BAD
const styles = { container: { padding: 20 } };

// ✅ GOOD
const terminalStyles = { container: { padding: 20 } };
const dashboardStyles = { container: { padding: 16 } };
```

### 2. Scope is shared across `<script type="text/babel">` blocks

Components from one block ARE NOT directly visible in another block. To share, attach to `window`:

```javascript
// In script block 1
function TerminalView() { /* ... */ }
function StatusBar() { /* ... */ }
Object.assign(window, { TerminalView, StatusBar });

// In script block 2
function App() {
  return <TerminalView />;  // works — found on window
}
```

### 3. Never use `scrollIntoView`

`element.scrollIntoView()` walks UP the DOM and scrolls every scrollable ancestor. This breaks containers that have their own scroll (sidebars, modals, lists). Use:

```javascript
// ✅ GOOD — scoped to the container
const container = document.querySelector('.my-list');
const target = container.querySelector('.target-item');
container.scrollTop = target.offsetTop - container.offsetTop;
```

---

## Common errors → fixes

| Error | Cause | Fix |
|---|---|---|
| `Cannot use import statement outside a module` | Trying to use ES modules in inline Babel | Babel standalone doesn't support `import` — paste code directly |
| `Identifier 'X' has already been declared` | Multiple script blocks declaring same `const` | Namespace each (`xxxStyles`, `yyyData`) |
| `useState is not defined` | Forgot React import | Use `React.useState` directly, or destructure: `const { useState } = React;` |
| Component renders but nothing shows | Forgot to wrap JSX in `<>...</>` when returning siblings | Use Fragment |
| `crossorigin` warnings | Some CDN files need crossorigin attribute | Always include `crossorigin` on react/react-dom |
| Slow first render (1-2s) | Babel transpiling at runtime | Move logic-heavy code outside Babel blocks |
| Production-mode error overlay missing | Using `.production.min.js` during dev | Use dev builds while iterating |

---

## Splitting strategy for large files

When the single-file approach exceeds 1000 lines:

```
project/
├── index.html              ← React entry point
├── components.jsx          ← UI components
├── data.js                 ← static data
└── styles.js               ← style objects
```

Load via separate `<script>` tags in order:

```html
<script type="text/babel" src="data.js"></script>
<script type="text/babel" src="styles.js"></script>
<script type="text/babel" src="components.jsx"></script>
<script type="text/babel">
  // entry — uses everything above (which has Object.assign'd to window)
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
```

End each external `.jsx`/`.js` file with `Object.assign(window, { ...exports });` to make declarations cross-block visible.

⚠️ **Caveat**: external scripts only load over HTTP, not `file://`. For double-click-to-open prototypes, keep everything inline. Add a server start command to delivery (`python3 -m http.server 8000`).

---

## Tweaks panel pattern (live parameter tuning)

For interactive variant exploration, see `references/tweaks-system.md`. Quick version:

```jsx
function App() {
  const [accent, setAccent] = useState('#E85020');
  const [density, setDensity] = useState('relaxed');

  return (
    <>
      <TweaksPanel
        controls={[
          { type: 'color', label: 'Accent', value: accent, onChange: setAccent },
          { type: 'select', label: 'Density', value: density, options: ['tight', 'relaxed', 'loose'], onChange: setDensity },
        ]}
      />
      <Design accent={accent} density={density} />
    </>
  );
}
```

Tweaks state goes to localStorage so refresh doesn't lose changes.

---

## Mock data in dev

Don't fabricate fake data that LOOKS real (per SKILL.md core principle 5). When you NEED some data to render layout:

```javascript
const MOCK_DATA = [
  { id: 1, label: '<placeholder — user provides>', value: '???' },
  { id: 2, label: '<placeholder — user provides>', value: '???' },
];
```

Visible `???` and `<placeholder>` flag what's missing. Don't write `{ label: 'Q3 Revenue', value: '$2.4M' }` — that looks real, the user might miss that it's fake.

---

## Working with `window.claude.complete` (if available)

Some agent environments expose an LLM via `window.claude.complete()`. If yours doesn't, mock it:

```javascript
window.claude = window.claude || {
  complete: async (prompt) => {
    console.warn('LLM not available — using mock');
    return `[Mock response for: ${prompt.slice(0, 50)}...]`;
  },
};
```

This lets your design-with-LLM-features prototype run without a real API key.

---

## Performance heuristics

- Babel transpile takes 200-500ms on first load — fine for prototypes
- Each `useState` triggers re-render of the subtree — limit shared state
- For >100 list items, use virtualization (react-window via CDN)
- For animations: see `references/animation-pitfalls.md` — different rules apply
