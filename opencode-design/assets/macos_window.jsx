// assets/macos_window.jsx
// macOS window chrome · Sonoma/Sequoia aesthetic
//
// Use for desktop app mockups — IDE, design tool, mail client, etc.
// Pairs with deck_stage for "look at this product on a Mac" framing.
//
// Usage:
//   <MacWindow title="Cursor — main.py" theme="dark" toolbar={<Toolbar />}>
//     ...your app content...
//   </MacWindow>
//
// Default size: 1280×800. Override via width/height props.
// The traffic lights are decorative; they don't close anything.

const MacWindow = ({
  children,
  title = "",
  theme = "light",
  toolbar = null,
  width = 1280,
  height = 800,
  sidebar = null, // optional left panel; rendered with its own scroll
}) => {
  const isDark = theme === "dark";
  const chromeBg = isDark ? "#2c2c2e" : "#ececec";
  const chromeFg = isDark ? "#e5e7eb" : "#3f3f46";
  const bodyBg = isDark ? "#1c1c1e" : "#ffffff";
  const sidebarBg = isDark ? "#252527" : "#f5f5f7";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div style={{
      width, height, borderRadius: 12, overflow: "hidden",
      background: bodyBg,
      boxShadow: "0 30px 60px rgba(0,0,0,0.25), 0 0 0 1px " + border,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Title bar */}
      <div style={{
        height: 38, background: chromeBg, color: chromeFg,
        display: "flex", alignItems: "center", padding: "0 14px",
        borderBottom: `1px solid ${border}`, flexShrink: 0,
        position: "relative",
      }}>
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.15)" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.15)" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.15)" }} />
        </div>
        {/* Centered title */}
        {title && (
          <div style={{
            position: "absolute", left: 0, right: 0, textAlign: "center",
            fontSize: 13, fontWeight: 500, pointerEvents: "none",
          }}>{title}</div>
        )}
      </div>

      {/* Optional toolbar */}
      {toolbar && (
        <div style={{
          background: chromeBg, color: chromeFg,
          padding: "8px 14px",
          borderBottom: `1px solid ${border}`,
          flexShrink: 0,
        }}>
          {toolbar}
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {sidebar && (
          <div style={{
            width: 220, background: sidebarBg, color: chromeFg,
            borderRight: `1px solid ${border}`,
            overflow: "auto", flexShrink: 0,
          }}>
            {sidebar}
          </div>
        )}
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

window.MacWindow = MacWindow;
