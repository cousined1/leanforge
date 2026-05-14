import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response, NextFunction } from 'express';

type MockResponse = Response & {
  statusCode: number;
  body: unknown;
};

function createMockResponse(): MockResponse {
  const res: {
    statusCode: number;
    body: unknown;
    status: (code: number) => unknown;
    json: (payload: unknown) => unknown;
  } = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return res as MockResponse;
}

async function getAuthMiddleware() {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'https://example.com/db';
  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  process.env.SERPER_API_KEY = process.env.SERPER_API_KEY || 'test-serper-key';
  process.env.API_SECRET_KEY = 'current-api-secret-key-with-at-least-32-chars';
  process.env.API_SECRET_KEY_NEXT =
    process.env.API_SECRET_KEY_NEXT || 'next-api-secret-key-with-at-least-32-chars';

  return import('./auth');
}

test('requireApiKey accepts the configured next key during rotation', async () => {
  const { requireApiKey } = await getAuthMiddleware();
  const req = {
    headers: { 'x-api-key': 'next-api-secret-key-with-at-least-32-chars' },
  } as unknown as Request;
  const res = createMockResponse();
  let calledNext = false;
  const next: NextFunction = () => {
    calledNext = true;
  };

  requireApiKey(req, res, next);

  assert.equal(calledNext, true);
  assert.equal(res.statusCode, 200);
});
