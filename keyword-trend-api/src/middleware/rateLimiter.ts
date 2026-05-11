// src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { config } from '../config/env';

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const redis = getRedisClient();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `rate-limit:${ip}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000));
    }

    res.setHeader('X-RateLimit-Limit', config.RATE_LIMIT_MAX);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.RATE_LIMIT_MAX - current));

    if (current > config.RATE_LIMIT_MAX) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000),
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next();
  }
}
