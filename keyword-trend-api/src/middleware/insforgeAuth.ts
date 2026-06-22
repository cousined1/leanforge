// src/middleware/insforgeAuth.ts
// Validates an InsForge-issued bearer token against the InsForge backend and
// attaches `req.insforgeUser` + `req.insforgeToken` for downstream handlers.
// The SDK's `getCurrentUser()` reads from its internal store, so we inject the
// bearer via `setAccessToken()` first. `isServerMode` switches to mobile-style
// auth flow, which is correct for server-to-server validation.

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@insforge/sdk';
import { config } from '../config/env';

const insforge = createClient({
  baseUrl: config.INSFORGE_URL,
  anonKey: config.INSFORGE_ANON_KEY,
  isServerMode: true,
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      insforgeUser?: {
        id: string;
        email: string;
        role: string;
      };
      insforgeToken?: string;
    }
  }
}

export async function requireInsForgeUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!config.INSFORGE_URL || !config.INSFORGE_ANON_KEY) {
    res.status(500).json({
      error: 'misconfigured',
      reason: 'insforge_not_configured',
    });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'unauthorized', reason: 'missing_bearer' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    insforge.setAccessToken(token);
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data?.user) {
      res.status(401).json({ error: 'unauthorized', reason: 'invalid_token' });
      return;
    }

    const u = data.user as { id: string; email?: string; role?: string };
    req.insforgeUser = {
      id: String(u.id),
      email: String(u.email ?? ''),
      role: String(u.role ?? 'user'),
    };
    req.insforgeToken = token;
    next();
  } catch (err) {
    res.status(401).json({
      error: 'unauthorized',
      reason: 'insforge_unreachable',
      detail: err instanceof Error ? err.message : 'unknown',
    });
  }
}
