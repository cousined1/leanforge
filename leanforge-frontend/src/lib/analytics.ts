'use client';

export type ConsentChoice = 'accepted' | 'rejected' | null;

export type AnalyticsEventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const CONSENT_STORAGE_KEY = 'cookie-consent';
export const CONSENT_CHANGE_EVENT = 'leanforge:consent-change';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
let analyticsInitialized = false;

export function getConsentChoice(): ConsentChoice {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (stored === 'accepted' || stored === 'rejected') return stored;
  return null;
}

export function hasAnalyticsConsent(): boolean {
  return getConsentChoice() === 'accepted';
}

export function isAnalyticsEnvironmentEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  return ANALYTICS_ENABLED;
}

export function isAnalyticsReady(): boolean {
  return Boolean(GTM_ID && isAnalyticsEnvironmentEnabled() && hasAnalyticsConsent());
}

export function getGtmId(): string | undefined {
  return GTM_ID;
}

export function pushDataLayer(event: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !isAnalyticsReady()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export function initAnalytics(): void {
  if (typeof window === 'undefined' || !isAnalyticsReady()) return;
  if (analyticsInitialized) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'analytics_initialized',
    analytics_provider: 'google_tag_manager',
  });
  analyticsInitialized = true;
}

export function trackPageView(
  url: string,
  title: string,
  referrer?: string
): void {
  pushDataLayer({
    event: 'page_view',
    page_location: url,
    page_title: title,
    page_referrer: referrer,
  });
}

export function trackEvent(name: string, params: AnalyticsEventParams = {}): void {
  pushDataLayer({
    event: name,
    ...params,
  });
}

export const analyticsEvents = {
  signupStarted: (params?: AnalyticsEventParams) =>
    trackEvent('signup_started', params),
  signupCompleted: (params?: AnalyticsEventParams) =>
    trackEvent('signup_completed', params),
  trialStarted: (params?: AnalyticsEventParams) =>
    trackEvent('trial_started', params),
  subscriptionPurchased: (params?: AnalyticsEventParams) =>
    trackEvent('subscription_purchased', params),
};
