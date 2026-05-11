// assets/browser_window.jsx
// Browser chrome with URL bar · for web product mockups
//
// Use when the deliverable is a website or web app and you want to show
// it "in-browser" — i.e. the URL is part of the brand. Don't use for
// pure landing-page hero shots; those should be edge-to-edge.
//
// Usage:
//   <BrowserWindow url="acme.com/launch" theme="light">
//     ...page content...
//   </BrowserWindow>
//
// Default size: 1280×800. Override via width/height.

const BrowserWindow = ({
  children,
  url = "example.com",
  theme = "light",
  width = 1280,
  height = 800,
  tabs = null, // optional: array of {title, active}
}) => {
  const isDark = theme === "dark";
  const chromeBg = isDark ? "#202124" : "#f1f3f4";
  const chromeFg = isDark ? "#e8eaed" : "#3c4043";
  const urlBg = isDark ? "#303134" : "#ffffff";
  const bodyBg = isDark ? "#202124" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const muted = isDark ? "rgba(232,234,237,0.6)" : "rgba(60,64,67,0.6)";

  const renderedTabs = tabs && tabs.length ? tabs : [{ title: url, active: true }];

  return (
    <div style={{
      width, height, borderRadius: 12, overflow: "hidden",
      background: bodyBg,
      boxShadow: "0 30px 60px rgba(0,0,0,0.25), 0 0 0 1px " + border,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar: traffic lights + tab strip */}
      <div style={{
        background: chromeBg, color: chromeFg,
        padding: "10px 14px 0", flexShrink: 0,
        display: "flex", alignItems: "flex-end", gap: 12,
      }}>
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 10 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, flex: 1, overflow: "hidden" }}>
          {renderedTabs.map((t, i) => (
            <div key={i} style={{
              background: t.active ? urlBg : "transparent",
              color: t.active ? chromeFg : muted,
              padding: "8px 16px",
              borderTopLeftRadius: 8, borderTopRightRadius: 8,
              fontSize: 12,
              maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{t.title}</div>
          ))}
        </div>
      </div>

      {/* URL bar */}
      <div style={{
        background: chromeBg,
        padding: "6px 14px 10px",
        borderBottom: `1px solid ${border}`,
        flexShrink: 0,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 4, color: muted }}>
          <span style={{ width: 28, height: 28, display: "grid", placeItems: "center", fontSize: 16 }}>‹</span>
          <span style={{ width: 28, height: 28, display: "grid", placeItems: "center", fontSize: 16 }}>›</span>
          <span style={{ width: 28, height: 28, display: "grid", placeItems: "center", fontSize: 14 }}>↻</span>
        </div>
        {/* URL */}
        <div style={{
          flex: 1, background: urlBg, color: chromeFg,
          padding: "6px 14px", borderRadius: 16,
          fontSize: 13, display: "flex", alignItems: "center", gap: 8,
          border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="5" width="8" height="6" rx="1" stroke={muted} strokeWidth="1"/>
            <path d="M4 5V3.5a2 2 0 014 0V5" stroke={muted} strokeWidth="1" fill="none"/>
          </svg>
          {url}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", background: bodyBg }}>
        {children}
      </div>
    </div>
  );
};

window.BrowserWindow = BrowserWindow;
