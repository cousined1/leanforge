import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response } from 'express';

type MockResponse = Response & {
  statusCode: number;
  body: unknown;
};

type KeywordControllerModule = typeof import('./keywordController');
type DatabaseModule = typeof import('../config/database');

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

async function getControllerAndPrisma(): Promise<{
  keywordController: KeywordControllerModule['keywordController'];
  prisma: DatabaseModule['prisma'];
}> {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'https://example.com/db';
  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  process.env.SERPER_API_KEY = process.env.SERPER_API_KEY || 'test-serper-key';
  process.env.API_SECRET_KEY =
    process.env.API_SECRET_KEY || 'test-api-secret-key-with-at-least-32-chars';
  process.env.API_SECRET_KEY_NEXT =
    process.env.API_SECRET_KEY_NEXT || 'next-api-secret-key-with-at-least-32-chars';

  const [{ keywordController }, { prisma }] = await Promise.all([
    import('./keywordController'),
    import('../config/database'),
  ]);

  return { keywordController, prisma };
}

test('trending returns 400 for invalid limit instead of querying with NaN', async () => {
  const { keywordController, prisma } = await getControllerAndPrisma();
  const originalFindMany = prisma.keyword.findMany;
  let queried = false;

  (prisma.keyword as any).findMany = async () => {
    queried = true;
    return [];
  };

  try {
    const req = { query: { limit: 'abc' } } as unknown as Request;
    const res = createMockResponse();

    await keywordController.trending(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(queried, false);
    assert.ok((res.body as any).error);
  } finally {
    (prisma.keyword as any).findMany = originalFindMany;
  }
});

test('create rejects overlong keyword terms', async () => {
  const { keywordController, prisma } = await getControllerAndPrisma();
  const originalCreate = prisma.keyword.create;
  let created = false;

  (prisma.keyword as any).create = async () => {
    created = true;
    return {};
  };

  try {
    const req = {
      body: { term: 'x'.repeat(201) },
    } as unknown as Request;
    const res = createMockResponse();

    await keywordController.create(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(created, false);
    assert.ok((res.body as any).error);
  } finally {
    (prisma.keyword as any).create = originalCreate;
  }
});
