import { Router } from 'express';
import { keywordController } from '../controllers/keywordController';
import { trendController } from '../controllers/trendController';
import { categoryController } from '../controllers/categoryController';
import { requireApiKey } from '../middleware/auth';

export const apiRoutes = Router();

// ── Keywords (public reads, authenticated writes) ──
apiRoutes.get('/keywords', (req, res) => keywordController.list(req, res));
apiRoutes.get('/keywords/trending', (req, res) => keywordController.trending(req, res));
apiRoutes.get('/keywords/:slug', (req, res) => keywordController.getBySlug(req, res));
apiRoutes.post('/keywords', requireApiKey, (req, res) => keywordController.create(req, res));
apiRoutes.put('/keywords/:slug', requireApiKey, (req, res) => keywordController.update(req, res));
apiRoutes.delete('/keywords/:slug', requireApiKey, (req, res) => keywordController.deactivate(req, res));

// ── Trends (all reads, public) ──
apiRoutes.get('/trends', (req, res) => trendController.getTrends(req, res));
apiRoutes.get('/trends/daily', (req, res) => trendController.getDailyTrends(req, res));
apiRoutes.get('/trends/realtime', (req, res) => trendController.getRealtimeTrends(req, res));
apiRoutes.get('/trends/compare', (req, res) => trendController.compareKeywords(req, res));
apiRoutes.get('/trends/:keywordId/timeline', (req, res) =>
  trendController.getTimeline(req, res)
);

// ── Categories (public reads, authenticated writes) ──
apiRoutes.get('/categories', (req, res) => categoryController.list(req, res));
apiRoutes.get('/categories/:slug', (req, res) => categoryController.getBySlug(req, res));
apiRoutes.post('/categories', requireApiKey, (req, res) => categoryController.create(req, res));

// ── Health ──
apiRoutes.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});