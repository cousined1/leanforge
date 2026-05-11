// src/services/cacheService.ts
import Redis from 'ioredis';
import { getRedisClient } from '../config/redis';

export class CacheService {
  private client: Redis;

  constructor() {
    this.client = getRedisClient();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key "${key}":`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key "${key}":`, error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      console.error(`Cache invalidate error for pattern "${pattern}":`, error);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async addToLeaderboard(
    leaderboard: string,
    member: string,
    score: number
  ): Promise<void> {
    try {
      await this.client.zadd(leaderboard, score, member);
    } catch (error) {
      console.error(`Leaderboard add error:`, error);
    }
  }

  async getLeaderboard(
    leaderboard: string,
    limit = 20
  ): Promise<Array<{ member: string; score: number }>> {
    try {
      const results = await this.client.zrevrangebyscore(
        leaderboard,
        '+inf',
        '-inf',
        'WITHSCORES',
        'LIMIT',
        0,
        limit
      );

      const entries: Array<{ member: string; score: number }> = [];
      for (let i = 0; i < results.length; i += 2) {
        entries.push({ member: results[i], score: parseFloat(results[i + 1]) });
      }
      return entries;
    } catch (error) {
      console.error('Leaderboard get error:', error);
      return [];
    }
  }
}

export const cacheService = new CacheService();
