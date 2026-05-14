import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response } from 'express';

type MockResponse = Response & {
  statusCode: number;
  body: unknown;
};

type TrendControllerModule = typeof import('./trendController');
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
  trendController: TrendControllerModule['trendController'];
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

  const [{ trendController }, { prisma }] = await Promise.all([
    import('./trendController'),
    import('../config/database'),
  ]);

  return { trendController, prisma };
}

test('getTimeline applies limit/offset pagination and metadata', async () => {
  const { trendController, prisma } = await getControllerAndPrisma();
  const originalCount = prisma.trend.count;
  const originalFindMany = prisma.trend.findMany;

  (prisma.trend as any).count = async () => 240;
  (prisma.trend as any).findMany = async () => [
    { id: 't1', keywordId: 'kw1', date: new Date('2026-05-01'), interest: 80, source: 'google' },
    { id: 't2', keywordId: 'kw1', date: new Date('2026-05-02'), interest: 82, source: 'google' },
  ];

  try {
    const req = {
      params: { keywordId: 'kw1' },
      query: { limit: '50', offset: '100' },
    } as unknown as Request;
    const res = createMockResponse();

    await trendController.getTimeline(req, res);

    assert.equal(res.statusCode, 200);
    const payload = res.body as any;
    assert.equal(payload._meta.total, 240);
    assert.equal(payload._meta.limit, 50);
    assert.equal(payload._meta.offset, 100);
    assert.equal(payload._meta.hasMore, true);
    assert.equal(payload.data.length, 2);
  } finally {
    (prisma.trend as any).count = originalCount;
    (prisma.trend as any).findMany = originalFindMany;
  }
});

test('getTimeline supports backward-compatible days alias when limit is omitted', async () => {
  const { trendController, prisma } = await getControllerAndPrisma();
  const originalCount = prisma.trend.count;
  const originalFindMany = prisma.trend.findMany;

  (prisma.trend as any).count = async () => 30;
  (prisma.trend as any).findMany = async () => [
    { id: 't1', keywordId: 'kw1', date: new Date('2026-05-01'), interest: 80, source: 'google' },
  ];

  try {
    const req = {
      params: { keywordId: 'kw1' },
      query: { days: '30', offset: '0' },
    } as unknown as Request;
    const res = createMockResponse();

    await trendController.getTimeline(req, res);

    assert.equal(res.statusCode, 200);
    const payload = res.body as any;
    assert.equal(payload._meta.limit, 30);
    assert.equal(payload._meta.offset, 0);
    assert.equal(payload._meta.hasMore, true);
  } finally {
    (prisma.trend as any).count = originalCount;
    (prisma.trend as any).findMany = originalFindMany;
  }
});

test('getTimeline returns 400 for invalid pagination values', async () => {
  const { trendController } = await getControllerAndPrisma();
  const req = {
    params: { keywordId: 'kw1' },
    query: { limit: '0', offset: '-1' },
  } as unknown as Request;
  const res = createMockResponse();

  await trendController.getTimeline(req, res);

  assert.equal(res.statusCode, 400);
  const payload = res.body as any;
  assert.ok(payload.error);
});
