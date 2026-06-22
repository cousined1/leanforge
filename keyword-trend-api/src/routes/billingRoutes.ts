// src/routes/billingRoutes.ts
// POST /api/v1/billing/checkout — create Stripe Checkout session for a paid plan
// POST /api/v1/billing/portal — create Stripe Customer Portal session
// GET  /api/v1/billing/plan    — return the current plan + limit for the user
//
// All three require an InsForge JWT (gated by requireInsForgeUser). The
// Subscription row from Phase 1 is the source of truth for plan + customerId.

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../config/database';
import { requireInsForgeUser } from '../middleware/insforgeAuth';
import { config } from '../config/env';

export const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  growth: 10000,
};

function getStripe(): Stripe {
  if (!config.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(config.STRIPE_SECRET_KEY);
}

function getPriceIdForPlan(plan: 'starter' | 'growth'): string {
  const id =
    plan === 'starter' ? config.STRIPE_PRICE_ID_STARTER : config.STRIPE_PRICE_ID_GROWTH;
  if (!id) {
    throw new Error(`STRIPE_PRICE_ID_${plan.toUpperCase()} not configured`);
  }
  return id;
}

export const billingRoutes = Router();

billingRoutes.post('/checkout', requireInsForgeUser, async (req: Request, res: Response) => {
  try {
    const { plan } = req.body as { plan?: string };
    if (plan !== 'starter' && plan !== 'growth') {
      return res
        .status(400)
        .json({ error: 'invalid_plan', reason: 'plan must be "starter" or "growth"' });
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
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('Checkout error:', message);
    res.status(500).json({ error: 'checkout_failed', reason: message });
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
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('Portal error:', message);
    res.status(500).json({ error: 'portal_failed', reason: message });
  }
});

billingRoutes.get('/plan', requireInsForgeUser, async (req: Request, res: Response) => {
  try {
    const user = req.insforgeUser!;
    const subscription = await prisma.subscription.findUnique({
      where: { insforgeUserId: user.id },
    });
    const plan = subscription?.plan ?? 'free';
    res.json({
      data: {
        plan,
        status: subscription?.status ?? null,
        currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
        limit: PLAN_LIMITS[plan] ?? PLAN_LIMITS.free,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    res.status(500).json({ error: 'plan_lookup_failed', reason: message });
  }
});
