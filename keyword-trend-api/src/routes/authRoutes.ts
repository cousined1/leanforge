// src/routes/authRoutes.ts
// GET /api/v1/auth/me — validates the InsForge JWT, lazy-creates a Subscription
// row for the user, and returns { user, subscription }. The Subscription row
// is the seam for Phase 2: Stripe webhooks upsert the same row by insforgeUserId
// to set plan + stripeCustomerId, so the read path never overwrites billing state.

import { Router } from 'express';
import { prisma } from '../config/database';
import { requireInsForgeUser } from '../middleware/insforgeAuth';

export const authRoutes = Router();

authRoutes.get('/me', requireInsForgeUser, async (req, res) => {
  const user = req.insforgeUser!;

  const subscription = await prisma.subscription.upsert({
    where: { insforgeUserId: user.id },
    create: { insforgeUserId: user.id, plan: 'free' },
    update: {},
  });

  res.json({
    data: {
      user: { id: user.id, email: user.email, role: user.role },
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      },
    },
  });
});
