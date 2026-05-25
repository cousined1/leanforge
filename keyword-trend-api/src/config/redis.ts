// src/config/redis.ts
import IORedis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';
import { config } from './env';

type ScanResult = [string, string[]];

export interface RedisClient {
  ping(): Promise<unknown>;
  get(key: string): Promise<string | null>;
  setex(key: string, ttlSeconds: number, value: string): Promise<unknown>;
  set(
    key: string,
    value: string,
    mode?: 'EX',
    ttlSeconds?: number,
    condition?: 'NX'
  ): Promise<unknown>;
  del(...keys: string[]): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<unknown>;
  scan(
    cursor: string,
    matchToken: 'MATCH',
    pattern: string,
    countToken: 'COUNT',
    count: number
  ): Promise<ScanResult>;
  zadd(leaderboard: string, score: number, member: string): Promise<unknown>;
  zrevrangebyscore(
    leaderboard: string,
    max: string,
    min: string,
    withScoresToken: 'WITHSCORES',
    limitToken: 'LIMIT',
    offset: number,
    limit: number
  ): Promise<string[]>;
  quit(): Promise<void>;
}

class IORedisAdapter implements RedisClient {
  constructor(private readonly client: IORedis) {}

  ping() {
    return this.client.ping();
  }

  get(key: string) {
    return this.client.get(key);
  }

  setex(key: string, ttlSeconds: number, value: string) {
    return this.client.setex(key, ttlSeconds, value);
  }

  set(
    key: string,
    value: string,
    mode?: 'EX',
    ttlSeconds?: number,
    condition?: 'NX'
  ) {
    if (mode && ttlSeconds !== undefined && condition) {
      return this.client.set(key, value, mode, ttlSeconds, condition);
    }
    return this.client.set(key, value);
  }

  del(...keys: string[]) {
    return this.client.del(...keys);
  }

  incr(key: string) {
    return this.client.incr(key);
  }

  expire(key: string, ttlSeconds: number) {
    return this.client.expire(key, ttlSeconds);
  }

  scan(
    cursor: string,
    matchToken: 'MATCH',
    pattern: string,
    countToken: 'COUNT',
    count: number
  ) {
    return this.client.scan(cursor, matchToken, pattern, countToken, count);
  }

  zadd(leaderboard: string, score: number, member: string) {
    return this.client.zadd(leaderboard, score, member);
  }

  zrevrangebyscore(
    leaderboard: string,
    max: string,
    min: string,
    withScoresToken: 'WITHSCORES',
    limitToken: 'LIMIT',
    offset: number,
    limit: number
  ) {
    return this.client.zrevrangebyscore(
      leaderboard,
      max,
      min,
      withScoresToken,
      limitToken,
      offset,
      limit
    );
  }

  async quit() {
    await this.client.quit();
  }
}

class UpstashAdapter implements RedisClient {
  private readonly client: any;

  constructor(url: string, token: string) {
    this.client = new UpstashRedis({ url, token });
  }

  ping() {
    return this.client.ping();
  }

  get(key: string) {
    return this.client.get(key);
  }

  setex(key: string, ttlSeconds: number, value: string) {
    return this.client.set(key, value, { ex: ttlSeconds });
  }

  set(
    key: string,
    value: string,
    mode?: 'EX',
    ttlSeconds?: number,
    condition?: 'NX'
  ) {
    if (mode === 'EX' && ttlSeconds !== undefined && condition === 'NX') {
      return this.client.set(key, value, { ex: ttlSeconds, nx: true });
    }
    if (mode === 'EX' && ttlSeconds !== undefined) {
      return this.client.set(key, value, { ex: ttlSeconds });
    }
    return this.client.set(key, value);
  }

  async del(...keys: string[]) {
    if (keys.length === 0) return 0;
    if (keys.length === 1) {
      const result = await this.client.del(keys[0]);
      return typeof result === 'number' ? result : 0;
    }

    let deleted = 0;
    for (const key of keys) {
      const result = await this.client.del(key);
      deleted += typeof result === 'number' ? result : 0;
    }
    return deleted;
  }

  incr(key: string) {
    return this.client.incr(key);
  }

  expire(key: string, ttlSeconds: number) {
    return this.client.expire(key, ttlSeconds);
  }

  async scan(
    cursor: string,
    _matchToken: 'MATCH',
    pattern: string,
    _countToken: 'COUNT',
    count: number
  ): Promise<ScanResult> {
    if (typeof this.client.scan === 'function') {
      const result = await this.client.scan(cursor, {
        match: pattern,
        count,
      });

      if (Array.isArray(result) && result.length === 2) {
        return [String(result[0]), (result[1] as string[]) || []];
      }
    }

    return ['0', []];
  }

  async zadd(leaderboard: string, score: number, member: string) {
    if (typeof this.client.zadd === 'function') {
      try {
        return await this.client.zadd(leaderboard, { score, member });
      } catch {
        return this.client.zadd(leaderboard, score, member);
      }
    }

    return null;
  }

  async zrevrangebyscore(
    leaderboard: string,
    max: string,
    min: string,
    _withScoresToken: 'WITHSCORES',
    _limitToken: 'LIMIT',
    offset: number,
    limit: number
  ): Promise<string[]> {
    if (typeof this.client.zrevrangebyscore === 'function') {
      return this.client.zrevrangebyscore(
        leaderboard,
        max,
        min,
        'WITHSCORES',
        'LIMIT',
        offset,
        limit
      );
    }

    if (typeof this.client.zrange === 'function') {
      const rows = await this.client.zrange(leaderboard, max, min, {
        byScore: true,
        rev: true,
        offset,
        count: limit,
        withScores: true,
      });

      if (!Array.isArray(rows)) {
        return [];
      }

      if (rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
        const flat: string[] = [];
        for (const row of rows) {
          flat.push(String((row as any).member));
          flat.push(String((row as any).score));
        }
        return flat;
      }

      return rows.map((item: unknown) => String(item));
    }

    return [];
  }

  async quit() {
    return;
  }
}

let redis: RedisClient | null = null;

export function getRedisClient(): RedisClient {
  if (redis) {
    return redis;
  }

  const hasUpstashRest =
    Boolean(config.UPSTASH_REDIS_REST_URL) && Boolean(config.UPSTASH_REDIS_REST_TOKEN);

  if (hasUpstashRest) {
    redis = new UpstashAdapter(
      config.UPSTASH_REDIS_REST_URL as string,
      config.UPSTASH_REDIS_REST_TOKEN as string
    );
    console.log('✅ Redis connected (Upstash REST)');
    return redis;
  }

  const isTest = config.NODE_ENV === 'test';
  const ioRedis = new IORedis(config.REDIS_URL as string, {
    maxRetriesPerRequest: isTest ? 1 : 3,
    retryStrategy(times) {
      if (isTest) return null;
      return Math.min(times * 200, 5000);
    },
    lazyConnect: isTest,
  });

  ioRedis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  ioRedis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redis = new IORedisAdapter(ioRedis);
  return redis;
}

export async function closeRedisClient(): Promise<void> {
  if (!redis) return;

  await redis.quit();
  redis = null;
}

export default getRedisClient();
