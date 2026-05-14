import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response, NextFunction } from 'express';

type MockResponse = Response & {
  statusCode: number;
  body: unknown;
  headers: Record<string, string | number>;
};

function createMockResponse(): MockResponse {
  const res: {
    statusCode: number;
    body: unknown;
    headers: Record<string, string | number>;
    status: (code: number) => unknown;
    json: (payload: unknown) => unknown;
    setHeader: (name: string, value: string | number) => void;
  } = {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    setHeader(name: string, value: string | number) {
      this.headers[name] = value;
    },
  };

  return res as MockResponse;
}

test('fallback rate limiter returns 429 after in-memory quota is exhausted', async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'https://example.com/db';
  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  process.env.SERPER_API_KEY = process.env.SERPER_API_KEY || 'test-serper-key';
  process.env.API_SECRET_KEY =
    process.env.API_SECRET_KEY || 'test-api-secret-key-with-at-least-32-chars';
  process.env.API_SECRET_KEY_NEXT =
    process.env.API_SECRET_KEY_NEXT || 'next-api-secret-key-with-at-least-32-chars';

  const { createFallbackRateLimiter } = await import('./rateLimiter');
  const fallback = createFallbackRateLimiter({ windowMs: 60_000, max: 1 });
  const req = {
    ip: '203.0.113.10',
    socket: {},
  } as Request;

  const first = createMockResponse();
  let firstNext = false;
  fallback(req, first, (() => {
    firstNext = true;
  }) as NextFunction);

  const second = createMockResponse();
  let secondNext = false;
  fallback(req, second, (() => {
    secondNext = true;
  }) as NextFunction);

  assert.equal(firstNext, true);
  assert.equal(secondNext, false);
  assert.equal(second.statusCode, 429);
  assert.equal((second.body as any).error, 'Too many requests');
});
