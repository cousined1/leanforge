// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SERPER_API_KEY: z.string(),
  API_SECRET_KEY: z.string().min(32).default('dev-only-api-secret-key-change-in-production-32chars'),
  FRONTEND_URL: z.string().url().default('https://lean-forge.net'),
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((value) =>
      value
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    ),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),
  TREND_POLL_CRON: z.string().default('0 */6 * * *'),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnv(): Environment {
  const env = process.env as Record<string, string>;
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten());
    process.exit(1);
  }

  return result.data;
}

// Validate required vars with clear error messages before Zod parse
const requiredKeys = ['DATABASE_URL', 'REDIS_URL', 'SERPER_API_KEY'] as const;
for (const key of requiredKeys) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const config = validateEnv();
