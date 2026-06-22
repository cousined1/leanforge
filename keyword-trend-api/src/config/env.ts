// src/config/env.ts
import { z } from 'zod';

// Backward-compatible aliases for environment variables previously set under
// different names. Map them to the names Zod expects before validation, so
// the live Railway env (which already has INSFORGE_BASE_URL) keeps working
// without requiring a rename.
if (process.env.INSFORGE_BASE_URL && !process.env.INSFORGE_URL) {
  process.env.INSFORGE_URL = process.env.INSFORGE_BASE_URL;
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SERPER_API_KEY: z.string(),
  API_SECRET_KEY: z.string().min(32),
  API_SECRET_KEY_NEXT: z.string().min(32).optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  REGENT_PARTNER_URL: z
    .string()
    .url()
    .default('https://seo-ai-regent.com/?ref=keyword-trend-api'),
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
  ANONYMIZE_LOG_IPS: z
    .string()
    .default('true')
    .transform((value) => value !== 'false'),
  ENFORCE_HTTPS: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  TREND_POLL_CRON: z.string().default('0 */6 * * *'),
  // InsForge (server-side JWT validation). Optional in dev — required for any
  // /api/v1/auth/* route to function. The middleware throws a clear 500 if
  // these are missing when a protected route is hit.
  INSFORGE_URL: z.string().url().optional(),
  INSFORGE_ANON_KEY: z.string().optional(),

  // Stripe (Phase 2). Optional in Zod so the schema can be loaded without
  // these set; billing routes throw a clear 500 if missing when hit.
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID_STARTER: z.string().optional(),
  STRIPE_PRICE_ID_GROWTH: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnv(): Environment {
  const env = process.env as Record<string, string>;
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten());
    process.exit(1);
  }

  if (
    result.data.NODE_ENV === 'production' &&
    (!result.data.CORS_ORIGINS || result.data.CORS_ORIGINS.length === 0)
  ) {
    console.warn(
      '[ENV] CORS_ORIGINS is not set in production. Falling back to FRONTEND_URL only.'
    );
  }

  return result.data;
}

// Validate required vars with clear error messages before Zod parse
const requiredKeys = ['DATABASE_URL', 'SERPER_API_KEY'] as const;
for (const key of requiredKeys) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const hasRedisUrl = Boolean(process.env.REDIS_URL);
const hasUpstashRest =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

if (!hasRedisUrl && !hasUpstashRest) {
  console.error(
    '❌ Missing Redis configuration: set REDIS_URL or both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN'
  );
  process.exit(1);
}

export const config = validateEnv();
