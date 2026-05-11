import { Request, Response, NextFunction } from 'express';

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
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']?.substring(0, 200) || 'unknown',
      ...(req.method !== 'GET' && { apiKeyProvided: !!req.headers['x-api-key'] }),
    };
    console.log(JSON.stringify(log));
  });

  next();
}