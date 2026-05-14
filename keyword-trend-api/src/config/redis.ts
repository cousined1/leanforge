// src/config/redis.ts
import Redis from 'ioredis';
import { config } from './env';

let _client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!_client) {
    _client = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 200, 5000);
      },
      lazyConnect: false,
    });

    _client.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });

    _client.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }

  return _client;
}

export async function closeRedisClient(): Promise<void> {
  if (_client) {
    try {
      await _client.quit();
    } catch (err) {
      console.error('Error closing Redis client:', err);
      _client.disconnect();
    }
    _client = null;
  }
}
