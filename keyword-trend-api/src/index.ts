// src/index.ts
import path from 'path';
import fs from 'fs';
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
// helmet does not set Permissions-Policy; lock down powerful features we never use.
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
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

  // Prerender (frontend/prerender.mjs) writes static HTML per marketing route and a
  // pristine SPA shell. Dynamic/unmatched routes fall back to the shell so they don't
  // inherit the prerendered homepage's content/canonical. If prerender didn't run,
  // gracefully fall back to the plain index.html.
  const appShell = path.join(frontendDist, 'app-shell.html');
  const spaFallback = fs.existsSync(appShell)
    ? appShell
    : path.join(frontendDist, 'index.html');

  app.get('/sitemap.xml', (_req, res) => {
    const SITE = 'https://lean-forge.net';
    const now = new Date().toISOString().slice(0, 10);
    const publicRoutes: Array<{ path: string; priority: number; changefreq: string }> = [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/features', priority: 0.8, changefreq: 'monthly' },
      { path: '/pricing', priority: 0.8, changefreq: 'monthly' },
      { path: '/api-docs', priority: 0.7, changefreq: 'weekly' },
      { path: '/help-center', priority: 0.6, changefreq: 'monthly' },
      { path: '/faq', priority: 0.6, changefreq: 'monthly' },
      { path: '/about', priority: 0.5, changefreq: 'monthly' },
      { path: '/contact', priority: 0.5, changefreq: 'monthly' },
      { path: '/privacy', priority: 0.5, changefreq: 'monthly' },
      { path: '/terms', priority: 0.5, changefreq: 'monthly' },
      { path: '/cookies', priority: 0.5, changefreq: 'monthly' },
      { path: '/disclaimer', priority: 0.5, changefreq: 'monthly' },
      // Free SEO tool pages (keep in sync with frontend toolsConfig.ts)
      { path: '/tools', priority: 0.9, changefreq: 'weekly' },
      { path: '/tools/keyword-volume-checker', priority: 0.8, changefreq: 'weekly' },
      { path: '/tools/trending-keywords', priority: 0.9, changefreq: 'daily' },
      { path: '/tools/keyword-difficulty-checker', priority: 0.8, changefreq: 'weekly' },
      { path: '/tools/google-trends-alternative', priority: 0.8, changefreq: 'weekly' },
      { path: '/tools/keyword-velocity-tracker', priority: 0.8, changefreq: 'weekly' },
      { path: '/tools/keyword-comparison-tool', priority: 0.8, changefreq: 'weekly' },
      { path: '/tools/seo-keyword-research', priority: 0.8, changefreq: 'weekly' },
      { path: '/tools/keyword-trend-chart', priority: 0.7, changefreq: 'monthly' },
      { path: '/tools/long-tail-keyword-finder', priority: 0.8, changefreq: 'weekly' },
      { path: '/tools/keyword-calculator', priority: 0.7, changefreq: 'monthly' },
    ];

    const urls = publicRoutes
      .map(
        (r) =>
          `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  app.get('/robots.txt', (_req, res) => {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(
      [
        'User-Agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Disallow: /auth/',
        'Disallow: /sign-in',
        '',
        'Sitemap: https://lean-forge.net/sitemap.xml',
      ].join('\n')
    );
  });

  // SPA fallback: non-API routes serve the SPA shell so React Router handles them.
  // Prerendered marketing routes are already served above by express.static.
  app.get(/^\/(?!api\/|health|sitemap\.xml|robots\.txt).*/, (_req, res) => {
    res.sendFile(spaFallback);
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
