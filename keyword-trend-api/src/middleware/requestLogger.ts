import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config/env';

function anonymizeIp(ip: string | undefined): string | undefined {
  if (!ip || !config.ANONYMIZE_LOG_IPS) return ip;

  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: anonymizeIp(req.ip || req.socket.remoteAddress),
      userAgent: req.headers['user-agent']?.substring(0, 200) || 'unknown',
      ...(req.method !== 'GET' && { apiKeyProvided: !!req.headers['x-api-key'] }),
    };
    console.log(JSON.stringify(log));
  });

  next();
}
