import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cookie-consent';
type Consent = 'accepted' | 'declined';

function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null;
  try {
    return (localStorage.getItem(STORAGE_KEY) as Consent | null) ?? null;
  } catch {
    return null;
  }
}

function writeConsent(value: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
    document.cookie = `${STORAGE_KEY}=${value}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* noop */
  }
}

/**
 * Clear the stored consent choice so the banner reappears.
 * Used by the footer "Cookie Settings" link.
 */
export function reopenConsent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
  // Clear the cookie as well so server-side checks also reset.
  document.cookie = `${STORAGE_KEY}=; path=/; max-age=0`;
  // Force a re-render by reloading — the banner will appear again.
  window.location.reload();
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readConsent() === null);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[#0B0C10]/95 backdrop-blur-md"
    >
      <div className="mx-auto max-w-4xl px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="text-xs text-white/60 flex-1">
            This site uses essential cookies to remember your consent preference. Analytics
            cookies are only loaded if you accept.{' '}
            <a href="/cookies" className="text-cyan-400 hover:underline">
              Cookie Policy
            </a>{' '}&middot;{' '}
            <a href="/privacy" className="text-cyan-400 hover:underline">
              Privacy Policy
            </a>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                writeConsent('declined');
                setOpen(false);
              }}
              className="px-4 py-2 text-xs border border-white/10 hover:border-white/25 rounded-lg transition"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => {
                writeConsent('accepted');
                setOpen(false);
              }}
              className="px-4 py-2 text-xs bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === 'accepted';
}
