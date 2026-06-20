import { Router } from 'express';
import { keywordController } from '../controllers/keywordController';
import { trendController } from '../controllers/trendController';
import { categoryController } from '../controllers/categoryController';
import { requireApiKey } from '../middleware/auth';
import { cacheControl, noCache } from '../middleware/cacheControl';

export const apiRoutes = Router();

// Public read endpoints: rate-limited per IP (see rateLimiter middleware).
// Cache-Control headers are set by the cacheControl middleware.
// Public reads: 5-minute cache. Authenticated writes: no-store.

// ── Keywords (public reads, authenticated writes) ──
apiRoutes.get('/keywords', cacheControl(300), (req, res) => keywordController.list(req, res));
apiRoutes.get('/keywords/trending', cacheControl(300), (req, res) => keywordController.trending(req, res));
apiRoutes.get('/keywords/:slug', cacheControl(300), (req, res) => keywordController.getBySlug(req, res));
apiRoutes.post('/keywords', noCache, requireApiKey, (req, res) => keywordController.create(req, res));
apiRoutes.put('/keywords/:slug', noCache, requireApiKey, (req, res) => keywordController.update(req, res));
apiRoutes.delete('/keywords/:slug', noCache, requireApiKey, (req, res) => keywordController.deactivate(req, res));

// ── Trends (all reads, public) ──
apiRoutes.get('/trends', cacheControl(300), (req, res) => trendController.getTrends(req, res));
apiRoutes.get('/trends/daily', cacheControl(300), (req, res) => trendController.getDailyTrends(req, res));
apiRoutes.get('/trends/realtime', cacheControl(300), (req, res) => trendController.getRealtimeTrends(req, res));
apiRoutes.get('/trends/compare', cacheControl(300), (req, res) => trendController.compareKeywords(req, res));
apiRoutes.get('/trends/:keywordId/timeline', cacheControl(300), (req, res) =>
  trendController.getTimeline(req, res)
);

// ── Categories (public reads, authenticated writes) ──
apiRoutes.get('/categories', cacheControl(300), (req, res) => categoryController.list(req, res));
apiRoutes.get('/categories/:slug', cacheControl(300), (req, res) => categoryController.getBySlug(req, res));
apiRoutes.post('/categories', noCache, requireApiKey, (req, res) => categoryController.create(req, res));
