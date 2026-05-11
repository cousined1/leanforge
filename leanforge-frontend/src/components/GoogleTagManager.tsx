'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  CONSENT_CHANGE_EVENT,
  getConsentChoice,
  getGtmId,
  initAnalytics,
  isAnalyticsEnvironmentEnabled,
  trackPageView,
} from '@/lib/analytics';

function GoogleTagManagerRuntime() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consentChoice, setConsentChoice] = useState(getConsentChoice);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const previousUrlRef = useRef<string | null>(null);
  const gtmId = getGtmId();

  useEffect(() => {
    const handleConsentChange = () => {
      setConsentChoice(getConsentChoice());
    };

    handleConsentChange();
    window.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChange);
    window.addEventListener('storage', handleConsentChange);

    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChange);
      window.removeEventListener('storage', handleConsentChange);
    };
  }, []);

  const analyticsAllowed = Boolean(
    gtmId && isAnalyticsEnvironmentEnabled() && consentChoice === 'accepted'
  );

  const currentUrl = useMemo(() => {
    if (typeof window === 'undefined') return pathname;
    const query = searchParams.toString();
    return `${window.location.origin}${pathname}${query ? `?${query}` : ''}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!analyticsAllowed || !scriptLoaded) return;

    initAnalytics();

    if (previousUrlRef.current === currentUrl) return;

    const referrer = previousUrlRef.current ?? document.referrer;
    previousUrlRef.current = currentUrl;
    trackPageView(currentUrl, document.title, referrer || undefined);
  }, [analyticsAllowed, currentUrl, scriptLoaded]);

  if (!analyticsAllowed) return null;

  return (
    <>
      <Script
        id="google-tag-manager-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              'gtm.start': new Date().getTime(),
              event: 'gtm.js'
            });
          `,
        }}
      />
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        onLoad={() => setScriptLoaded(true)}
      />
    </>
  );
}

export function GoogleTagManager() {
  return (
    <Suspense fallback={null}>
      <GoogleTagManagerRuntime />
    </Suspense>
  );
}
