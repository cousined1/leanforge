// assets/ios_frame.jsx
// IPhone 15 Pro frame, spec-aligned. Dynamic Island 124×36 at top:12 centered.
// Status bar avoids island. Home Indicator at bottom. Content area starts at top:54.
//
// Usage:
//   1. Paste this entire file's contents into your <script type="text/babel">
//   2. Wrap your screen in <IosFrame>...</IosFrame>
//   3. Don't manually draw island, status bar, or home indicator — they're handled here

const iosFrameStyles = {
  device: {
    position: 'relative',
    width: 393,
    height: 852,
    background: '#000',
    borderRadius: 56,
    boxShadow: '0 24px 48px -12px rgba(0,0,0,0.4), 0 0 0 1.5px #1a1a1a',
    padding: 6,
    boxSizing: 'border-box',
  },
  screen: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: '#fff',
    borderRadius: 50,
    overflow: 'hidden',
  },
  island: {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 124,
    height: 36,
    background: '#000',
    borderRadius: 18,
    zIndex: 100,
    pointerEvents: 'none',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 54,  // 60 of total, 12 top inset to island, island is 36 tall
    display: 'flex',
    alignItems: 'center',
    paddingTop: 18,
    paddingLeft: 28,
    paddingRight: 28,
    fontSize: 17,
    fontWeight: 600,
    color: 'inherit',  // inherit from screen so dark/light mode work
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    zIndex: 99,
    pointerEvents: 'none',
  },
  statusTime: {
    flex: '0 0 auto',
    width: 100,  // narrow column on left of island
    textAlign: 'left',
    paddingLeft: 6,
  },
  statusSpacer: {
    flex: 1,
    minWidth: 124,  // matches island width
  },
  statusRight: {
    flex: '0 0 auto',
    width: 100,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  signalDots: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },
  battery: {
    width: 24,
    height: 12,
    border: '1.5px solid currentColor',
    borderRadius: 3,
    position: 'relative',
    opacity: 0.95,
  },
  batteryFill: {
    position: 'absolute',
    top: 1,
    left: 1,
    bottom: 1,
    background: 'currentColor',
    borderRadius: 1.5,
  },
  batteryNub: {
    position: 'absolute',
    right: -3,
    top: 3,
    width: 2,
    height: 6,
    background: 'currentColor',
    borderRadius: '0 1px 1px 0',
    opacity: 0.6,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 134,
    height: 5,
    background: 'currentColor',
    borderRadius: 3,
    opacity: 0.4,
    zIndex: 99,
    pointerEvents: 'none',
  },
  content: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
};

function IosFrame({ time = '9:41', battery = 85, theme = 'light', children }) {
  const ink = theme === 'dark' ? '#fff' : '#000';
  return (
    <div style={iosFrameStyles.device}>
      <div style={{ ...iosFrameStyles.screen, color: ink, background: theme === 'dark' ? '#000' : '#fff' }}>
        {/* Dynamic Island */}
        <div style={iosFrameStyles.island} />

        {/* Status Bar */}
        <div style={iosFrameStyles.statusBar}>
          <div style={iosFrameStyles.statusTime}>{time}</div>
          <div style={iosFrameStyles.statusSpacer} />
          <div style={iosFrameStyles.statusRight}>
            {/* Signal dots */}
            <div style={iosFrameStyles.signalDots}>
              <div style={{ width: 3, height: 4, background: 'currentColor', borderRadius: 1 }} />
              <div style={{ width: 3, height: 6, background: 'currentColor', borderRadius: 1 }} />
              <div style={{ width: 3, height: 8, background: 'currentColor', borderRadius: 1 }} />
              <div style={{ width: 3, height: 10, background: 'currentColor', borderRadius: 1 }} />
            </div>
            {/* Wi-fi (simple icon) */}
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
              <path d="M8 8.5C8.55 8.5 9 8.95 9 9.5S8.55 10.5 8 10.5 7 10.05 7 9.5 7.45 8.5 8 8.5Z" fill="currentColor"/>
              <path d="M3.5 5C5 3.5 11 3.5 12.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85"/>
              <path d="M1 2.5C3.5 0 12.5 0 15 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7"/>
            </svg>
            {/* Battery */}
            <div style={iosFrameStyles.battery}>
              <div style={{ ...iosFrameStyles.batteryFill, right: `${100 - battery}%` }} />
              <div style={iosFrameStyles.batteryNub} />
            </div>
          </div>
        </div>

        {/* Content slot (top: 54 to give status bar room) */}
        <div style={iosFrameStyles.content}>
          {children}
        </div>

        {/* Home Indicator */}
        <div style={iosFrameStyles.homeIndicator} />
      </div>
    </div>
  );
}

// Export to window for cross-script-block visibility
Object.assign(window, { IosFrame, iosFrameStyles });
