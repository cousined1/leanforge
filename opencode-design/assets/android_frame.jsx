// assets/android_frame.jsx
// Android device frame · Pixel 8 Pro proportions · 412×892 logical px
//
// Use for any Material You / Android prototype. Pairs with iosFrame.jsx
// when you need to compare iOS and Android renderings of the same screen.
//
// Usage:
//   <AndroidFrame theme="dark"> ...your screen content... </AndroidFrame>
//
// Hard rules:
//   • Children render inside .android-content (top: 36, the gap below the
//     status bar). Do NOT manually draw a status bar inside your screen.
//   • The center punch-hole camera is decorative. Do not put text under it.
//   • Bottom gesture pill is part of the chrome — do not duplicate it.

const AndroidFrame = ({ children, theme = "light", time = "9:41" }) => {
  const isDark = theme === "dark";
  const screenBg = isDark ? "#0d0d0d" : "#ffffff";
  const statusFg = isDark ? "#f5f5f5" : "#1a1a1a";
  const pillBg = isDark ? "#f5f5f5" : "#1a1a1a";

  return (
    <div style={{
      width: 412, height: 892, position: "relative",
      borderRadius: 44, background: "#0a0a0a",
      padding: 10, boxSizing: "border-box",
      boxShadow: "0 24px 60px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.04)",
      fontFamily: "Roboto, 'Google Sans', system-ui, sans-serif",
    }}>
      {/* Screen */}
      <div style={{
        width: "100%", height: "100%", borderRadius: 36,
        background: screenBg, overflow: "hidden", position: "relative",
      }}>
        {/* Punch-hole camera */}
        <div style={{
          position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
          width: 14, height: 14, borderRadius: "50%",
          background: "#000",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
          zIndex: 10,
        }} />

        {/* Status bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 36,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 22px", color: statusFg, fontSize: 13, fontWeight: 500,
          letterSpacing: 0.1, zIndex: 5,
        }}>
          <span>{time}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            {/* signal */}
            <svg width="14" height="10" viewBox="0 0 14 10" fill={statusFg}>
              <rect x="0" y="7" width="2" height="3" rx="0.5"/>
              <rect x="3" y="5" width="2" height="5" rx="0.5"/>
              <rect x="6" y="3" width="2" height="7" rx="0.5"/>
              <rect x="9" y="0" width="2" height="10" rx="0.5"/>
            </svg>
            {/* wifi */}
            <svg width="14" height="10" viewBox="0 0 14 10" fill={statusFg}>
              <path d="M7 9.5a1 1 0 100-2 1 1 0 000 2zM3.5 6.2a5 5 0 017 0l-1 1a3.5 3.5 0 00-5 0l-1-1zM1.5 4.2a8 8 0 0111 0l-1 1a6.5 6.5 0 00-9 0l-1-1z"/>
            </svg>
            {/* battery */}
            <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
              <rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke={statusFg} strokeOpacity="0.5"/>
              <rect x="2" y="2" width="14" height="6" rx="1" fill={statusFg}/>
              <rect x="19.5" y="3.5" width="2" height="3" rx="0.5" fill={statusFg} fillOpacity="0.5"/>
            </svg>
          </span>
        </div>

        {/* Content area */}
        <div className="android-content" style={{
          position: "absolute", top: 36, left: 0, right: 0, bottom: 0,
          overflow: "hidden",
        }}>
          {children}
        </div>

        {/* Gesture pill */}
        <div style={{
          position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
          width: 108, height: 4, borderRadius: 2, background: pillBg, opacity: 0.85,
          zIndex: 5,
        }} />
      </div>
    </div>
  );
};

window.AndroidFrame = AndroidFrame;
