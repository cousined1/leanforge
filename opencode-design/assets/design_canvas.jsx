// assets/design_canvas.jsx
// Variant grid for showing multiple design candidates side-by-side.
// Use when generating ≥2 directions for the same brief and the user
// needs to compare and pick. Pairs with the "5-10-2-8" rule:
// search 5 rounds, generate 10 candidates internally, present the 2
// best, each ≥8/10 in self-critique.
//
// Usage:
//   <DesignCanvas
//     title="Three directions for the launch hero"
//     brief="Crypto wallet · Q3 launch · target: prosumers"
//     variants={[
//       { name: "Editorial", school: "Information Architecture", node: <HeroA /> },
//       { name: "Kinetic",   school: "Motion Poetics",          node: <HeroB /> },
//       { name: "Quiet",     school: "Minimalist",              node: <HeroC /> },
//     ]}
//   />
//
// Layout rules:
//   1 variant  → full bleed
//   2 variants → 50/50 split, vertical divider
//   3 variants → 1/3 each
//   ≥4 variants → 2-column wrap (rare; usually means brief is too vague)
//
// Each tile shows: variant name, school tag, and the rendered node.
// Tiles are click-to-focus (zoom to fill); ESC restores the grid.

const { useState: _dcUseState, useEffect: _dcUseEffect } = React;

function DesignCanvas({ title, brief, variants = [], theme = "light" }) {
  const [focused, setFocused] = _dcUseState(null); // index or null
  const n = variants.length;

  _dcUseEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setFocused(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isDark = theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#fafafa";
  const fg = isDark ? "#fafafa" : "#0a0a0a";
  const muted = isDark ? "#9ca3af" : "#6b7280";
  const tileBg = isDark ? "#171717" : "#ffffff";
  const border = isDark ? "#262626" : "#e5e7eb";

  const gridCols =
    n === 1 ? "1fr" :
    n === 2 ? "1fr 1fr" :
    n === 3 ? "1fr 1fr 1fr" :
              "1fr 1fr"; // 2-col wrap for 4+

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: bg, color: fg,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      padding: "32px 40px", boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 28, maxWidth: 960 }}>
        {title && (
          <h1 style={{
            fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em",
            margin: "0 0 8px 0",
          }}>{title}</h1>
        )}
        {brief && (
          <p style={{ fontSize: 14, color: muted, margin: 0, lineHeight: 1.5 }}>
            {brief}
          </p>
        )}
      </div>

      {/* Grid */}
      {focused === null ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          gap: 20,
        }}>
          {variants.map((v, i) => (
            <div
              key={i}
              onClick={() => setFocused(i)}
              style={{
                background: tileBg,
                border: `1px solid ${border}`,
                borderRadius: 12,
                overflow: "hidden",
                cursor: "zoom-in",
                transition: "transform 120ms ease, box-shadow 120ms ease",
                display: "flex", flexDirection: "column",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = isDark
                  ? "0 8px 24px rgba(0,0,0,0.4)"
                  : "0 8px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {/* Tile header */}
              <div style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${border}`,
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
              }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{v.name || `Variant ${i + 1}`}</div>
                {v.school && (
                  <div style={{
                    fontSize: 11, color: muted, textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>{v.school}</div>
                )}
              </div>
              {/* Tile body — render the variant node */}
              <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                {v.node}
              </div>
              {v.note && (
                <div style={{
                  padding: "10px 18px",
                  borderTop: `1px solid ${border}`,
                  fontSize: 12, color: muted, lineHeight: 1.5,
                }}>{v.note}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Focused mode — single variant fills the canvas
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setFocused(null)}
            style={{
              position: "absolute", top: 0, right: 0,
              background: tileBg, color: fg, border: `1px solid ${border}`,
              borderRadius: 8, padding: "8px 14px", fontSize: 13,
              cursor: "pointer", zIndex: 10,
            }}
          >ESC · back to grid</button>
          <div style={{
            background: tileBg,
            border: `1px solid ${border}`,
            borderRadius: 12,
            overflow: "hidden",
            marginTop: 44,
            minHeight: "70vh",
          }}>
            <div style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${border}`,
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
            }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{variants[focused].name}</div>
              {variants[focused].school && (
                <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {variants[focused].school}
                </div>
              )}
            </div>
            <div style={{ position: "relative", minHeight: "60vh" }}>
              {variants[focused].node}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.DesignCanvas = DesignCanvas;
