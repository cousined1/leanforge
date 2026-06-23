// src/routes/billingWebhook.ts
// Stripe webhook handler. Called from src/index.ts with the raw request body
// (Buffer) and the Stripe-Signature header for signature verification.
//
// Handled events:
//   - checkout.session.completed     — first payment; set plan + customerId
//   - customer.subscription.updated  — renewals, plan changes, status changes
//   - customer.subscription.deleted  — cancellation; revert to free plan
//   - invoice.payment_failed         — log only; Stripe sends dunning emails
//
// The Subscription table from Phase 1 is the seam. All writes upsert by
// insforgeUserId (set in checkout.session.completed) or stripeCustomerId
// (matched on subsequent subscription events).

import Stripe from 'stripe';
import { prisma } from '../config/database';
import { config } from '../config/env';

const PLAN_PRICE_IDS: Record<'starter' | 'growth', string | undefined> = {
  starter: config.STRIPE_PRICE_ID_STARTER,
  growth: config.STRIPE_PRICE_ID_GROWTH,
};

function planFromPriceId(priceId: string | undefined): 'free' | 'starter' | 'growth' {
  if (priceId && priceId === PLAN_PRICE_IDS.starter) return 'starter';
  if (priceId && priceId === PLAN_PRICE_IDS.growth) return 'growth';
  return 'free';
}

function getStripe() {
  if (!config.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(config.STRIPE_SECRET_KEY);
}

export async function handleStripeWebhook(
  body: Buffer,
  signature: string
): Promise<{ received: true }> {
  if (!config.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  const stripe = getStripe();
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    config.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
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
      const sub = event.data.object as any;
      const item = sub.items?.data?.[0];
      const priceId = item?.price?.id;
      const isActive = sub.status === 'active' || sub.status === 'trialing';
      const plan = isActive ? planFromPriceId(priceId) : 'free';
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          plan,
          status: sub.status,
          currentPeriodEnd: item?.current_period_end
            ? new Date(item.current_period_end * 1000)
            : null,
        },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as any;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: { plan: 'free', status: 'canceled', currentPeriodEnd: null },
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any;
      console.warn(`[stripe] payment_failed for customer ${invoice.customer}`);
      break;
    }
  }

  return { received: true };
}
