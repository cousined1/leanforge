// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log full details server-side only; never expose internals in responses.
  console.error('[ERROR]', err.name, err.message, config.NODE_ENV === 'development' ? err.stack : '');

  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Invalid request data';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Authentication required';
  }

  // In production, never expose internal error details, stack traces,
  // or database error codes. The development stack is logged server-side only.
  const response: { error: string; requestId?: string } = { error: message };

  // Include a request-scoped ID for support correlation in development only.
  if (config.NODE_ENV === 'development' && _req.headers['x-request-id']) {
    response.requestId = _req.headers['x-request-id'] as string;
  }

  res.status(statusCode).json(response);
}
