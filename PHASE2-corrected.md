# LeanForge — Phase 2 Corrected Spec
## Stripe Checkout + Plan-Aware Rate Limiting
**Date:** 2026-06-20
**Status:** READY TO BUILD
**Target:** Live Next.js 14 frontend (`leanforge-frontend/`) + Express backend (`keyword-trend-api/`)
**Architecture:** Stripe Checkout (hosted) + Stripe Customer Portal + webhook → upserts the `Subscription` table from Phase 1

---

## CONTEXT

Phase 1 shipped the auth foundation: InsForge JWT validation, `requireInsForgeUser` middleware, and a `Subscription` Prisma table that lazy-creates on first `/api/v1/auth/me` hit. Phase 2 wires Stripe Checkout to that seam — when a user pays, the webhook updates the same `Subscription` row, and the plan-aware rate limiter reads it.

The user will create the Stripe account, products, and provide API keys at deploy time. The code in this spec uses placeholder env vars.

### What's already built (do NOT touch)

| File | State |
|---|---|
| `keyword-trend-api/prisma/schema.prisma` | ✅ `Subscription` model exists |
| `keyword-trend-api/src/middleware/insforgeAuth.ts` | ✅ `requireInsForgeUser` ready to gate billing routes |
| `keyword-trend-api/src/routes/authRoutes.ts` | ✅ `GET /auth/me` returns `{ user, subscription }` |
| `leanforge-frontend/src/lib/api.ts` | ✅ `getMe(token)` + `MeResponse` types |
| `leanforge-frontend/src/components/AuthProvider.tsx` | ✅ Exposes `useAuth()` for client-side user state |
| `leanforge-frontend/src/app/sign-in` + `auth/callback` | ✅ Real OAuth flow |
| `leanforge-frontend/src/lib/routes.ts` | ✅ Route registry (we'll add `billingSuccess`, `billingCanceled`) |
| `keyword-trend-api/.env.example` | ✅ Has InsForge vars from Phase 1 |

---

## ARCHITECTURE

```
┌────────────┐  checkout session   ┌─────────────┐    hosted page   ┌─────────┐
│  Pricing   │ ─────────────────► │ /billing/   │ ──────────────► │ Stripe  │
│  page      │  (Bearer JWT)      │ checkout    │                  │ Checkout│
└────────────┘                    └─────────────┘                  └────┬────┘
                                                                     │
       success_url                                                    │ payment
       │ ◄──────────────────────────────────────────────────────────  │
       ▼
┌────────────┐
│ /billing/  │ refresh page → /api/v1/auth/me → reads updated plan
│ success    │
└────────────┘

Meanwhile (Stripe → us):
  Stripe Dashboard
       │  POST /api/v1/billing/webhook  (raw body, sig verified)
       ▼
┌────────────────────────┐
│ handleStripeWebhook() │  checkout.session.completed    → plan = starter | growth
│                       │  customer.subscription.updated → plan = active status
│                       │  customer.subscription.deleted → plan = free
└────────┬───────────────┘
         ▼
  prisma.subscription.upsert({ where: { insforgeUserId }, ... })

Read path:
  Every API request → rateLimiter → reads JWT → prisma.subscription.findUnique
  → applies PLAN_LIMITS[plan] (free=100, starter=1000, growth=10000)
```

---

## PREREQUISITES (user action before deploy)

1. Create Stripe account (test mode first): https://dashboard.stripe.com
2. Create 2 products in Stripe Dashboard → Products:
   - **LeanForge Starter** — $29/month, recurring
   - **LeanForge Growth** — $99/month, recurring
3. Copy the Price IDs (`price_xxx`)
4. Get API keys from Stripe Dashboard → Developers → API keys
5. For local webhook testing: `stripe listen --forward-to localhost:3001/api/v1/billing/webhook` and copy the `whsec_...` signing secret
6. Add to Railway `leanforge-api` env vars (see step 2.2)

---

## Step 2.1 — Install Stripe SDK in backend

```bash
cd keyword-trend-api
npm install stripe
```

Pin to a specific version in `package.json` after install. Latest stable as of 2026-06 is `^17.x`.

---

## Step 2.2 — Add Stripe env vars to backend

**File:** `keyword-trend-api/.env.example` — APPEND:

```env
# Stripe (Phase 2)
STRIPE_SECRET_KEY=sk_test_replace_at_deploy
STRIPE_WEBHOOK_SECRET=whsec_replace_at_deploy
STRIPE_PRICE_ID_STARTER=price_replace_at_deploy
STRIPE_PRICE_ID_GROWTH=price_replace_at_deploy
FRONTEND_URL=https://lean-forge.net
```

**Also add to Railway `leanforge-api` env vars.** Use `sk_live_...` for production.

---

## Step 2.3 — Expose Stripe env vars in Zod schema

**File:** `keyword-trend-api/src/config/env.ts` — ADD inside the `envSchema` object (before the closing `})`):

```typescript
  // Stripe (Phase 2) — required for /api/v1/billing/* routes
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID_STARTER: z.string().optional(),
  STRIPE_PRICE_ID_GROWTH: z.string().optional(),
  FRONTEND_URL: z.string().url().default('https://lean-forge.net'),
```

Note: optional in Zod so existing local dev runs work. The `billingRoutes` mount function throws a clear 500 if missing when a billing route is hit.

---

## Step 2.4 — Create billing routes

**File:** `keyword-trend-api/src/routes/billingRoutes.ts` — CREATE:

```typescript
import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../config/database';
import { requireInsForgeUser } from '../middleware/insforgeAuth';
import { config } from '../config/env';

const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  growth: 10000,
};

function getStripe(): Stripe {
  if (!config.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any });
}

function getPriceIdForPlan(plan: 'starter' | 'growth'): string {
  const id =
    plan === 'starter' ? config.STRIPE_PRICE_ID_STARTER : config.STRIPE_PRICE_ID_GROWTH;
  if (!id) throw new Error(`STRIPE_PRICE_ID_${plan.toUpperCase()} not configured`);
  return id;
}

export const billingRoutes = Router();

billingRoutes.post('/checkout', requireInsForgeUser, async (req: Request, res: Response) => {
  try {
    const { plan } = req.body as { plan: 'starter' | 'growth' };
    if (plan !== 'starter' && plan !== 'growth') {
      return res.status(400).json({ error: 'invalid_plan', reason: 'plan must be starter or growth' });
    }

    const user = req.insforgeUser!;
    const stripe = getStripe();
    const priceId = getPriceIdForPlan(plan);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.FRONTEND_URL}/billing/canceled`,
      customer_email: user.email || undefined,
      metadata: { insforgeUserId: user.id, plan },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'checkout_failed' });
  }
});

billingRoutes.post('/portal', requireInsForgeUser, async (req: Request, res: Response) => {
  try {
    const user = req.insforgeUser!;
    const subscription = await prisma.subscription.findUnique({
      where: { insforgeUserId: user.id },
    });
    if (!subscription?.stripeCustomerId) {
      return res.status(400).json({ error: 'no_subscription' });
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${config.FRONTEND_URL}/account`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err);
    res.status(500).json({ error: 'portal_failed' });
  }
});

billingRoutes.get('/plan', requireInsForgeUser, async (req: Request, res: Response) => {
  const user = req.insforgeUser!;
  const subscription = await prisma.subscription.findUnique({
    where: { insforgeUserId: user.id },
  });
  res.json({
    data: {
      plan: subscription?.plan ?? 'free',
      status: subscription?.status ?? null,
      currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
      limit: PLAN_LIMITS[subscription?.plan ?? 'free'],
    },
  });
});
```

**Note on `apiVersion`:** Stripe's TypeScript types pin a specific API version. If your installed `stripe` SDK version uses a different default, cast as `as any` or update to match. The runtime accepts any valid API version.

---

## Step 2.5 — Create webhook handler

**File:** `keyword-trend-api/src/routes/billingWebhook.ts` — CREATE:

```typescript
import Stripe from 'stripe';
import { prisma } from '../config/database';
import { config } from '../config/env';

const PLAN_PRICE_IDS: Record<string, string> = {
  starter: config.STRIPE_PRICE_ID_STARTER ?? '',
  growth: config.STRIPE_PRICE_ID_GROWTH ?? '',
};

function planFromPriceId(priceId: string | undefined): 'free' | 'starter' | 'growth' {
  if (priceId === PLAN_PRICE_IDS.starter) return 'starter';
  if (priceId === PLAN_PRICE_IDS.growth) return 'growth';
  return 'free';
}

export async function handleStripeWebhook(
  body: Buffer,
  signature: string
): Promise<{ received: true }> {
  if (!config.STRIPE_SECRET_KEY || !config.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe not configured');
  }
  const stripe = new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any });
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    config.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const insforgeUserId = session.metadata?.insforgeUserId;
      if (insforgeUserId && session.customer) {
        const plan = (session.metadata?.plan as 'starter' | 'growth') ?? 'starter';
        await prisma.subscription.upsert({
          where: { insforgeUserId },
          create: {
            insforgeUserId,
            stripeCustomerId: session.customer as string,
            plan,
            status: 'active',
          },
          update: {
            stripeCustomerId: session.customer as string,
            plan,
            status: 'active',
          },
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id;
      const plan =
        sub.status === 'active' || sub.status === 'trialing'
          ? planFromPriceId(priceId)
          : 'free';
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          plan,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : null,
        },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: { plan: 'free', status: 'canceled', currentPeriodEnd: null },
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.warn(`Payment failed for customer ${invoice.customer}`);
      break;
    }
  }

  return { received: true };
}
```

---

## Step 2.6 — Mount webhook in Express (raw body)

**File:** `keyword-trend-api/src/index.ts` — EDIT to add webhook route **before** `app.use(express.json())`:

```typescript
import { handleStripeWebhook } from './routes/billingWebhook';
import { billingRoutes } from './routes/billingRoutes';
// ... existing imports ...

// Existing middleware up to this point:
//   app.use(helmet());
//   app.use(compression());
//   app.use(cors(...));

// Stripe webhook MUST receive raw body for signature verification.
app.post(
  '/api/v1/billing/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    try {
      await handleStripeWebhook(req.body, sig);
      res.json({ received: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      console.error('Webhook error:', message);
      res.status(400).send(`Webhook Error: ${message}`);
    }
  }
);

// Then continue with the existing global JSON parser:
app.use(express.json({ limit: '1mb' }));
```

Then later (after `app.use('/api/v1', apiRoutes)`):

```typescript
app.use('/api/v1/billing', billingRoutes);
```

**Order matters:** webhook route MUST be registered before `app.use(express.json())`. The other billing routes (checkout, portal) come after the JSON parser like any normal API route.

---

## Step 2.7 — Plan-aware rate limiter

**File:** `keyword-trend-api/src/middleware/rateLimiter.ts` — EDIT to add plan detection before counting:

```typescript
// Add at the top:
import { prisma } from '../config/database';
import { createClient } from '@insforge/sdk';
import { config } from '../config/env';

const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  growth: 10000,
};

// Build a singleton InsForge client for token validation in the rate limiter.
const insforge = createClient({
  baseUrl: config.INSFORGE_URL,
  anonKey: config.INSFORGE_ANON_KEY,
  isServerMode: true,
});

async function resolveUserPlan(authorization: string | undefined): Promise<{ plan: string; limit: number }> {
  const fallback = { plan: 'free', limit: PLAN_LIMITS.free };
  if (!authorization?.startsWith('Bearer ')) return fallback;
  if (!config.INSFORGE_URL || !config.INSFORGE_ANON_KEY) return fallback;

  const token = authorization.slice(7);
  try {
    insforge.setAccessToken(token);
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data?.user) return fallback;

    const sub = await prisma.subscription.findUnique({
      where: { insforgeUserId: data.user.id },
      select: { plan: true },
    });
    const plan = sub?.plan ?? 'free';
    return { plan, limit: PLAN_LIMITS[plan] ?? PLAN_LIMITS.free };
  } catch {
    return fallback;
  }
}
```

Then inside the `rateLimiter` function, replace the IP-only logic with:

```typescript
export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const { plan, limit } = await resolveUserPlan(req.headers.authorization);
  const redis = getRedisClient();
  const key = plan === 'free'
    ? `rate-limit:ip:${req.ip || 'unknown'}`
    : `rate-limit:plan:${plan}:${req.ip || 'unknown'}`;

  try {
    const windowSeconds = Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000);
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    res.setHeader('X-Plan', plan);
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));

    if (current > limit) {
      return res.status(429).json({
        error: 'Too many requests',
        plan,
        retryAfter: windowSeconds,
        upgrade: plan === 'free' ? '/pricing' : undefined,
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error; using in-memory fallback:', error);
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const fallbackKey = `ip:${ip}`;
    const entry = fallbackStore.get(fallbackKey) ?? { count: 0, resetAt: Date.now() + config.RATE_LIMIT_WINDOW_MS };
    entry.count += 1;
    fallbackStore.set(fallbackKey, entry);
    res.setHeader('X-Plan', plan);
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - entry.count));
    if (entry.count > limit) {
      return res.status(429).json({ error: 'Too many requests', plan, retryAfter: Math.ceil((entry.resetAt - Date.now()) / 1000) });
    }
    next();
  }
}
```

**Caveat:** the above uses a new `fallbackStore` Map. Refactor the existing in-memory fallback (`createFallbackRateLimiter`) into a shared module-level Map, or import the existing helper and use it. Either works; the goal is that the rate-limit decision factors in the plan, not just the IP.

---

## Step 2.8 — Frontend env vars

**File:** `leanforge-frontend/.env.example` — APPEND:

```env
# Stripe Price IDs (frontend — used by PricingTable to call checkout)
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER=price_replace_at_deploy
NEXT_PUBLIC_STRIPE_PRICE_ID_GROWTH=price_replace_at_deploy
```

**Also add to Railway `leanforge-frontend` env vars.**

The frontend does NOT need the Stripe secret key. The backend creates checkout sessions; the frontend just opens the returned `url`.

---

## Step 2.9 — Add billing API helpers to frontend

**File:** `leanforge-frontend/src/lib/api.ts` — APPEND:

```typescript
export async function createCheckoutSession(
  plan: 'starter' | 'growth'
): Promise<{ url: string; sessionId: string }> {
  const { data } = await api.post<{ url: string; sessionId: string }>('/billing/checkout', { plan });
  return data;
}

export async function createPortalSession(): Promise<{ url: string }> {
  const { data } = await api.post<{ url: string }>('/billing/portal');
  return data;
}

export async function getPlan(): Promise<{
  plan: 'free' | 'starter' | 'growth';
  status: string | null;
  currentPeriodEnd: string | null;
  limit: number;
}> {
  const { data } = await api.get('/billing/plan');
  return data;
}
```

**Note:** These endpoints all require auth. The caller must pass the InsForge bearer token via the `Authorization` header. We need a helper to grab the token from the SDK's session. See step 2.10.

---

## Step 2.10 — InsForge access-token helper for axios

**File:** `leanforge-frontend/src/lib/insforgeToken.ts` — CREATE:

```typescript
'use client';

import { insforge } from '@/lib/insforge';

let cachedToken: string | null = null;
let cachedExpiry = 0;

export async function getInsForgeAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedExpiry - 30_000) {
    return cachedToken;
  }
  const session = await insforge.auth.getSession();
  if (!session?.accessToken) return null;
  cachedToken = session.accessToken;
  cachedExpiry = session.expiresAt ? session.expiresAt.getTime() : Date.now() + 55 * 60 * 1000;
  return cachedToken;
}
```

Then in `api.ts`, add an axios request interceptor that injects the bearer:

```typescript
api.interceptors.request.use(async (config) => {
  if (config.headers && !config.headers.Authorization) {
    const token = await getInsForgeAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
```

This makes all billing + auth calls automatically authenticated without threading tokens through every helper.

---

## Step 2.11 — New pricing page (4 tiers, real checkout)

**File:** `leanforge-frontend/src/app/pricing/page.tsx` — REPLACE the file with a 4-tier grid:

```typescript
// 4 tiers:
//   1. Free ($0) — current plan for unauth users
//   2. Starter ($29/mo) — Stripe checkout
//   3. Growth ($99/mo) — Stripe checkout, highlighted
//   4. Recommended Partner (Regent) — affiliate link
//
// The component needs to be a client component to call createCheckoutSession.
// Move the existing metadata into a separate file (e.g. pricing/metadata.ts) and
// the page into a thin server wrapper that renders <PricingTable /> client comp.

import type { Metadata } from 'next';
import { PricingTable } from '@/components/PricingTable';
// ... existing imports for metadata, breadcrumb, etc.

export const metadata: Metadata = buildMetadata({ ... });

export default function PricingPage() {
  return (
    <div>
      {/* existing breadcrumb / hero / footer copy */}
      <PricingTable />
    </div>
  );
}
```

The `PricingTable` client component:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { createCheckoutSession } from '@/lib/api';
import { absoluteUrl, regentPartnerUrl } from '@/lib/site';

const STRIPE_PRICE_ID_STARTER = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER ?? '';
const STRIPE_PRICE_ID_GROWTH = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_GROWTH ?? '';

const tiers = [
  { name: 'Free', price: '$0', plan: 'free' as const, /* ... */ },
  { name: 'Starter', price: '$29', plan: 'starter' as const, /* ... */ },
  { name: 'Growth', price: '$99', plan: 'growth' as const, highlighted: true, /* ... */ },
  { name: 'Recommended Partner', /* Regent affiliate */ },
];

export function PricingTable() {
  const { user, loading } = useAuth();
  const [pending, setPending] = useState<string | null>(null);

  async function handleCheckout(plan: 'starter' | 'growth') {
    if (!user) {
      window.location.href = `/sign-in?redirect=${encodeURIComponent('/pricing')}`;
      return;
    }
    setPending(plan);
    try {
      const { url } = await createCheckoutSession(plan);
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiers.map((tier) => (
        <div key={tier.name} className={`card p-6 ${tier.highlighted ? 'ring-2 ring-primary' : ''}`}>
          <h3>{tier.name}</h3>
          <div><span>{tier.price}</span>{tier.period && <span>{tier.period}</span>}</div>
          <p>{tier.description}</p>
          <ul>{/* features */}</ul>
          {tier.plan === 'free' ? (
            <Link href="/keywords" className="btn-outline w-full">Browse Keywords</Link>
          ) : tier.plan === 'starter' || tier.plan === 'growth' ? (
            <button
              onClick={() => handleCheckout(tier.plan)}
              disabled={pending !== null}
              className="btn-primary w-full"
            >
              {pending === tier.plan ? 'Redirecting…' : 'Start Free Trial'}
            </button>
          ) : (
            <a href={regentPartnerUrl} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
              Try SEO AI Regent
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Step 2.12 — Billing success and canceled pages

**File:** `leanforge-frontend/src/app/billing/success/page.tsx` — CREATE:

```typescript
import { BillingStatusCard } from '@/components/BillingStatusCard';

export const metadata = { title: 'Subscription Active', robots: { index: false } };

export default function BillingSuccessPage() {
  return (
    <BillingStatusCard
      title="You're all set!"
      message="Your subscription is being activated. Refresh the page in a few seconds to see your updated plan."
    />
  );
}
```

**File:** `leanforge-frontend/src/app/billing/canceled/page.tsx` — CREATE:

```typescript
import Link from 'next/link';

export const metadata = { title: 'Checkout Canceled', robots: { index: false } };

export default function BillingCanceledPage() {
  return (
    <div className="container max-w-md py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Checkout canceled</h1>
      <p className="text-muted-foreground mb-6">No charge was made. You can upgrade anytime.</p>
      <Link href="/pricing" className="btn-outline px-4 py-2">View Pricing</Link>
    </div>
  );
}
```

The `BillingStatusCard` component calls `getPlan()` on mount, shows a spinner while the webhook propagates, and offers a "refresh" button if the plan hasn't updated within 5 seconds.

---

## Step 2.13 — Add billing routes to `routes.ts` (for nav, sitemap)

**File:** `leanforge-frontend/src/lib/routes.ts` — ADD (and add to relevant nav arrays if needed):

```typescript
billingSuccess: { path: '/billing/success', label: 'Subscription Active' },
billingCanceled: { path: '/billing/canceled', label: 'Checkout Canceled' },
```

These are `noindex` so they don't need to be in the public sitemap.

---

## Step 2.14 — Manual smoke test

```bash
# 1. Stripe CLI in one terminal:
stripe listen --forward-to localhost:3001/api/v1/billing/webhook
#    Copy the whsec_... from this output to STRIPE_WEBHOOK_SECRET in .env

# 2. Backend in another terminal (with all env vars set):
cd keyword-trend-api && npm run dev

# 3. Frontend:
cd leanforge-frontend && npm run dev

# 4. In browser:
#    - Sign in at /sign-in
#    - Visit /pricing
#    - Click "Start Free Trial" on Starter
#    - Use Stripe test card 4242 4242 4242 4242 (any future date, any CVC)
#    - On success, /billing/success loads
#    - After ~2s, refresh — Header should reflect new plan
#    - prisma.subscription row should now show plan='starter', status='active',
#      stripeCustomerId='cus_...'

# 5. Direct webhook test (no browser):
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
#    Each should log success in the backend console.

# 6. Rate limit test:
#    Free user: 100 requests in 15 min then 429
#    Starter user: 1000 requests, then 429
#    Verify X-Plan header reflects the user's plan.
```

---

## Step 2.15 — Deploy to Railway

1. Push branch
2. `leanforge-api` service env vars:
   - `STRIPE_SECRET_KEY=sk_live_...` (or `sk_test_...` for staging)
   - `STRIPE_WEBHOOK_SECRET=whsec_...` (from Stripe dashboard webhook endpoint signing secret)
   - `STRIPE_PRICE_ID_STARTER=price_...`
   - `STRIPE_PRICE_ID_GROWTH=price_...`
   - `FRONTEND_URL=https://lean-forge.net`
3. `leanforge-frontend` service env vars:
   - `NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER=price_...`
   - `NEXT_PUBLIC_STRIPE_PRICE_ID_GROWTH=price_...`
4. Create Stripe webhook endpoint: `https://api.leans-forge.net/api/v1/billing/webhook` listening to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the signing secret from this endpoint into `STRIPE_WEBHOOK_SECRET`

---

## FILE MANIFEST (Phase 2)

| File | Action |
|---|---|
| `keyword-trend-api/package.json` | EDIT — add `stripe` dependency |
| `keyword-trend-api/.env.example` + `.env` | EDIT — add `STRIPE_*`, `FRONTEND_URL` |
| `keyword-trend-api/src/config/env.ts` | EDIT — add Stripe Zod fields |
| `keyword-trend-api/src/routes/billingRoutes.ts` | **CREATE** — checkout, portal, plan endpoints |
| `keyword-trend-api/src/routes/billingWebhook.ts` | **CREATE** — Stripe webhook handler |
| `keyword-trend-api/src/index.ts` | EDIT — mount webhook (raw body) + billing routes |
| `keyword-trend-api/src/middleware/rateLimiter.ts` | EDIT — plan-aware limits |
| `leanforge-frontend/.env.example` | EDIT — add `NEXT_PUBLIC_STRIPE_PRICE_ID_*` |
| `leanforge-frontend/src/lib/api.ts` | EDIT — add billing helpers + axios auth interceptor |
| `leanforge-frontend/src/lib/insforgeToken.ts` | **CREATE** — get InsForge access token |
| `leanforge-frontend/src/components/PricingTable.tsx` | **CREATE** — client pricing component |
| `leanforge-frontend/src/components/BillingStatusCard.tsx` | **CREATE** — billing success card |
| `leanforge-frontend/src/app/pricing/page.tsx` | EDIT — render `<PricingTable />` |
| `leanforge-frontend/src/app/billing/success/page.tsx` | **CREATE** |
| `leanforge-frontend/src/app/billing/canceled/page.tsx` | **CREATE** |
| `leanforge-frontend/src/lib/routes.ts` | EDIT — register `billingSuccess`, `billingCanceled` |
| `PHASE2-corrected.md` | **CREATE** — this file |

---

## WHAT THIS UNLOCKS (post-Phase 2)

- Real revenue: $29/mo (Starter) and $99/mo (Growth) tiers
- Plan-aware rate limits: free users throttled, paid users get more headroom
- Customer Portal: Stripe-hosted self-service for plan/cancel/payment updates
- Webhook → Subscription table → plan read path is fully automated
- Header plan badge becomes possible (just read `getPlan()` and render)

---

*Spec by Sisyphus · June 20, 2026 · Phase 2 (corrected for live Next.js frontend)*
