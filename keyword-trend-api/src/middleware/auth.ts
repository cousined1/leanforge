import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config/env';

function hashKey(key: string): Buffer {
  return crypto.createHash('sha256').update(key).digest();
}

function secureCompare(providedKey: string, expectedKey: string): boolean {
  return crypto.timingSafeEqual(hashKey(providedKey), hashKey(expectedKey));
}

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const providedKey = req.headers['x-api-key'] as string | undefined;

  if (!providedKey) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'X-API-Key header is required for this endpoint',
    });
    return;
  }

  const isValid =
    secureCompare(providedKey, config.API_SECRET_KEY) ||
    (config.API_SECRET_KEY_NEXT
      ? secureCompare(providedKey, config.API_SECRET_KEY_NEXT)
      : false);

  if (!isValid) {
    res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid',
    });
    return;
  }

  next();
}
