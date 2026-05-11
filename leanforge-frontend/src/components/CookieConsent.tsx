'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  ConsentChoice,
  getConsentChoice,
} from '@/lib/analytics';

export function CookieConsent() {
  const choice = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
      window.addEventListener('storage', onStoreChange);

      return () => {
        window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
        window.removeEventListener('storage', onStoreChange);
      };
    },
    getConsentChoice,
    () => null
  );

  const handleChoice = (value: 'accepted' | 'rejected') => {
    localStorage.setItem(CONSENT_STORAGE_KEY, value);
    window.dispatchEvent(
      new CustomEvent(CONSENT_CHANGE_EVENT, { detail: { choice: value } })
    );
  };

  if (choice !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg">
      <div className="container py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="text-sm text-muted-foreground flex-1">
            <p>
              This site uses essential cookies to remember your consent
              preference. If you accept, Google Tag Manager may load analytics
              tags for measurement. See our{' '}
              <Link href="/cookies" className="text-primary underline">
                Cookie Policy
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>{' '}
              for details.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleChoice('rejected')}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition"
            >
              Decline
            </button>
            <button
              onClick={() => handleChoice('accepted')}
              className="px-4 py-2 text-sm btn-primary rounded-lg"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
