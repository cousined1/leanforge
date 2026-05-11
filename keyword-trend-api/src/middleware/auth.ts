import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const API_SECRET_KEY = process.env.API_SECRET_KEY;

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  if (!API_SECRET_KEY) {
    console.error('[AUTH] API_SECRET_KEY not configured — rejecting request');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  const providedKey = req.headers['x-api-key'] as string | undefined;

  if (!providedKey) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'X-API-Key header is required for this endpoint',
    });
    return;
  }

  const providedHash = crypto.createHash('sha256').update(providedKey).digest('hex');
  const expectedHash = crypto.createHash('sha256').update(API_SECRET_KEY).digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(providedHash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );

  if (!isValid) {
    res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid',
    });
    return;
  }

  next();
}