// src/index.ts
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

// Health check early return
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', apiRoutes);

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
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
