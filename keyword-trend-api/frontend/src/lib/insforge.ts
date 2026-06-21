// InsForge auth client for the Vite SPA.
//
// SSR-safety: the SDK is loaded via dynamic import() and the client is only
// constructed on first use in the browser. The prerender (entry-server.tsx /
// prerender.mjs) renders App in Node and must NEVER evaluate the SDK, or it
// would break the build-time SEO render. Only `import type` is used at module
// scope (erased at compile), and getInsforge() runs solely from browser
// effects / event handlers.

import type { InsForgeClient } from '@insforge/sdk';

const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL ?? '';
const INSFORGE_ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY ?? '';

export type SocialProvider = 'google' | 'github' | 'apple';

// Providers shown on the sign-in page. Keep in sync with the providers enabled
// in the InsForge dashboard (Authentication → OAuth Providers).
export const SOCIAL_PROVIDERS: Array<{ id: SocialProvider; label: string }> = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'github', label: 'Continue with GitHub' },
];

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

export function isAuthConfigured(): boolean {
  return Boolean(INSFORGE_URL && INSFORGE_ANON_KEY);
}

let clientPromise: Promise<InsForgeClient> | null = null;

// Lazily import + construct the client (browser only). The SDK constructor
// auto-detects `insforge_code` in the URL and completes the PKCE exchange, so
// simply constructing it on the /auth/callback page resolves the session.
function getInsforge(): Promise<InsForgeClient> {
  if (!clientPromise) {
    clientPromise = import('@insforge/sdk').then(({ createClient }) =>
      createClient({ baseUrl: INSFORGE_URL, anonKey: INSFORGE_ANON_KEY })
    );
  }
  return clientPromise;
}

function normalizeUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object') return null;
  const u = raw as Record<string, any>;
  if (!u.id) return null;
  return {
    id: String(u.id),
    email: u.email ?? undefined,
    name: u.name ?? u.profile?.name ?? undefined,
  };
}

/** Start the OAuth/PKCE flow — redirects the browser to the provider. */
export async function signInWithProvider(provider: SocialProvider): Promise<void> {
  const insforge = await getInsforge();
  await insforge.auth.signInWithOAuth({
    provider,
    redirectTo: `${window.location.origin}/auth/callback`,
  });
}

/** Resolve the current session (waits for a pending OAuth callback exchange). */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  if (!isAuthConfigured()) return null;
  const insforge = await getInsforge();
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error) return null;
  return normalizeUser(data?.user);
}

export async function signOut(): Promise<void> {
  const insforge = await getInsforge();
  await insforge.auth.signOut();
}

// ── Payments (InsForge native Stripe) ──────────────────────────────
// Requires Stripe configured in InsForge (npx @insforge/cli payments ...) AND
// RLS on payments.checkout_sessions / customer_portal_sessions. Price IDs come
// from the InsForge-synced Stripe catalog, supplied via env. Inert until set.
const STRIPE_ENV: 'test' | 'live' =
  import.meta.env.VITE_STRIPE_ENV === 'live' ? 'live' : 'test';

export const STRIPE_PRICE_IDS: Record<'starter' | 'growth', string> = {
  starter: import.meta.env.VITE_STRIPE_PRICE_ID_STARTER ?? '',
  growth: import.meta.env.VITE_STRIPE_PRICE_ID_GROWTH ?? '',
};

export async function startSubscriptionCheckout(args: {
  stripePriceId: string;
  userId: string;
  email?: string;
}): Promise<void> {
  const insforge = await getInsforge();
  const { data, error } = await insforge.payments.createCheckoutSession(STRIPE_ENV, {
    mode: 'subscription',
    lineItems: [{ priceId: args.stripePriceId, quantity: 1 }],
    successUrl: `${window.location.origin}/billing/success`,
    cancelUrl: `${window.location.origin}/billing/canceled`,
    subject: { type: 'user', id: args.userId },
    customerEmail: args.email ?? null,
    idempotencyKey: `sub:${args.userId}:${args.stripePriceId}`,
  });
  if (error) throw new Error((error as { message?: string }).message ?? 'Checkout failed');
  const url = (data as { checkoutSession?: { url?: string } } | null)?.checkoutSession?.url;
  if (url) window.location.assign(url);
}

export async function openCustomerPortal(userId: string): Promise<void> {
  const insforge = await getInsforge();
  const { data, error } = await insforge.payments.createCustomerPortalSession(STRIPE_ENV, {
    subject: { type: 'user', id: userId },
    returnUrl: `${window.location.origin}/pricing`,
  });
  if (error) throw new Error((error as { message?: string }).message ?? 'Portal failed');
  const url = (data as { customerPortalSession?: { url?: string } } | null)?.customerPortalSession?.url;
  if (url) window.location.assign(url);
}
