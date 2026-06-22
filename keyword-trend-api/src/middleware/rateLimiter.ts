// src/middleware/rateLimiter.ts
// Plan-aware rate limiter. Per (plan, ip) bucket so a paying user on a shared
// IP (office NAT, mobile carrier) doesn't share the free bucket.
//
// Free=100, Starter=1000, Growth=10000 requests per RATE_LIMIT_WINDOW_MS.
// Plan resolution requires an InsForge JWT; unauthenticated traffic always
// gets the free bucket. On Redis error we fall back to an in-memory store
// keyed the same way so the limiter never goes offline.

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@insforge/sdk';
import { getRedisClient } from '../config/redis';
import { prisma } from '../config/database';
import { config } from '../config/env';

const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  growth: 10000,
};

const insforge = createClient({
  baseUrl: config.INSFORGE_URL,
  anonKey: config.INSFORGE_ANON_KEY,
  isServerMode: true,
});

async function resolveUserPlan(
  authorization: string | undefined
): Promise<{ plan: string; limit: number }> {
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

type FallbackEntry = { count: number; resetAt: number };
const fallbackStore = new Map<string, FallbackEntry>();

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { plan, limit } = await resolveUserPlan(req.headers.authorization);
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `rate-limit:${plan}:${ip}`;

  res.setHeader('X-Plan', plan);
  res.setHeader('X-RateLimit-Limit', limit);

  try {
    const redis = getRedisClient();
    const windowSeconds = Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000);
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));

    if (current > limit) {
      res.status(429).json({
        error: 'Too many requests',
        plan,
        retryAfter: windowSeconds,
        upgrade: plan === 'free' ? '/pricing' : undefined,
      });
      return;
    }
    next();
  } catch (error) {
    console.error('Rate limiter error; using in-memory fallback:', error);
    const now = Date.now();
    const existing = fallbackStore.get(key);
    const entry =
      existing && existing.resetAt > now
        ? { count: existing.count + 1, resetAt: existing.resetAt }
        : { count: 1, resetAt: now + config.RATE_LIMIT_WINDOW_MS };
    fallbackStore.set(key, entry);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - entry.count));
    if (entry.count > limit) {
      res.status(429).json({
        error: 'Too many requests',
        plan,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
      return;
    }
    next();
  }
}
