// src/config/redis.ts
import Redis from 'ioredis';
import { config } from './env';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const isTest = config.NODE_ENV === 'test';

    redis = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: isTest ? 1 : 3,
      retryStrategy(times) {
        if (isTest) return null;
        return Math.min(times * 200, 5000);
      },
      // Avoid opening long-lived sockets during unit tests.
      lazyConnect: isTest,
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }

  return redis;
}

export async function closeRedisClient(): Promise<void> {
  if (!redis) return;

  await redis.quit();
  redis = null;
}

export default getRedisClient();
