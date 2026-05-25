// src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { config } from '../config/env';

type FallbackOptions = {
  windowMs: number;
  max: number;
};

type FallbackEntry = {
  count: number;
  resetAt: number;
};

export function createFallbackRateLimiter({ windowMs, max }: FallbackOptions) {
  const requests = new Map<string, FallbackEntry>();

  return function fallbackRateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const existing = requests.get(ip);
    const entry =
      existing && existing.resetAt > now
        ? { count: existing.count + 1, resetAt: existing.resetAt }
        : { count: 1, resetAt: now + windowMs };

    requests.set(ip, entry);

    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));

    if (entry.count > max) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter,
      });
    }

    next();
  };
}

const fallbackRateLimiter = createFallbackRateLimiter({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
});

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const redis = getRedisClient();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `rate-limit:${ip}`;

  try {
    const windowSeconds = Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000);
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    res.setHeader('X-RateLimit-Limit', config.RATE_LIMIT_MAX);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.RATE_LIMIT_MAX - current));

    if (current > config.RATE_LIMIT_MAX) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: windowSeconds,
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error; using in-memory fallback:', error);
    fallbackRateLimiter(req, res, next);
  }
}
