// src/index.ts
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env';
import { apiRoutes } from './routes/apiRoutes';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { startTrendPoller } from './jobs/trendPoller';
import { prisma } from './config/database';
import { closeRedisClient, getRedisClient } from './config/redis';
import { initializeMonitoring, Sentry } from './config/monitoring';

initializeMonitoring();

const app = express();
const allowedOrigins =
  config.CORS_ORIGINS && config.CORS_ORIGINS.length > 0
    ? config.CORS_ORIGINS
    : [
        config.FRONTEND_URL,
        ...(config.NODE_ENV === 'development'
          ? ['http://localhost:3000', 'http://localhost:3001']
          : []),
      ];

if (config.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security & compression
app.use(helmet());
app.use(compression());
app.use((req, res, next) => {
  if (
    config.ENFORCE_HTTPS &&
    req.headers['x-forwarded-proto'] !== 'https' &&
    !req.secure
  ) {
    return res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
  }

  next();
});
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

// Rate limiting
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      db: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed — database unreachable:', error);
    res.status(503).json({
      status: 'error',
      db: 'unreachable',
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/health/deep', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const redis = getRedisClient();
    await redis.ping();

    res.json({
      status: 'ok',
      db: 'ok',
      redis: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Deep health check failed:', error);
    res.status(503).json({
      status: 'error',
      db: 'unknown',
      redis: 'unknown',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use('/api/v1', apiRoutes);

// In production, serve the built frontend SPA
if (config.NODE_ENV === 'production') {
  const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));

  // SPA fallback: non-API routes serve index.html so React Router handles them
  app.get(/^\/(?!api\/|health).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = config.PORT;
const server = app.listen(PORT, async () => {
  console.log(`LeanForge Keyword Trend API running on port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);

  if (config.NODE_ENV === 'production' && !config.ENFORCE_HTTPS) {
    console.warn('[SECURITY] ENFORCE_HTTPS is false in production — ensure HTTPS is enforced at the load balancer.');
  }

  // Start cron jobs in production only
  if (config.NODE_ENV === 'production') {
    startTrendPoller();
  } else {
    console.log('Cron jobs disabled in development mode');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    await closeRedisClient();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    await closeRedisClient();
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  Sentry.captureException(error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  Sentry.captureException(reason instanceof Error ? reason : new Error(String(reason)));
});

export default app;
