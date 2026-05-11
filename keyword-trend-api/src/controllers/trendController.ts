// src/controllers/trendController.ts
import { Request, Response } from 'express';
import { googleTrendsService } from '../services/googleTrendsService';
import { prisma } from '../config/database';
import { z } from 'zod';

const compareSchema = z.object({
  keywords: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .refine((val) => val.length >= 2 && val.length <= 5, {
      message: 'Must provide 2-5 keywords',
    }),
  geo: z.string().length(2).default('US'),
});

const trendsQuerySchema = z.object({
  category: z.string().optional(),
  direction: z.enum(['rising', 'falling', 'flat']).optional(),
  limit: z.string().default('50').transform((v) => Math.min(parseInt(v, 10) || 50, 100)),
  offset: z.string().default('0').transform((v) => parseInt(v, 10) || 0),
});

const dailyTrendsSchema = z.object({
  geo: z.string().length(2).default('US'),
});

const realtimeTrendsSchema = z.object({
  category: z.string().default('all'),
  geo: z.string().length(2).default('US'),
});

const timelineSchema = z.object({
  days: z.string().default('90').transform((v) => Math.min(parseInt(v, 10) || 90, 365)),
});

export const trendController = {
  async getTrends(req: Request, res: Response) {
    try {
      const validation = trendsQuerySchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const { category, direction, limit, offset } = validation.data;

      const where: any = { isActive: true };
      if (category) where.category = category;
      if (direction) where.direction = direction;

      const keywords = await prisma.keyword.findMany({
        where,
        orderBy: { trendScore: 'desc' },
        take: limit,
        skip: offset,
        include: { categoryRel: true },
      });

      res.json({
        data: keywords,
        count: keywords.length,
        offset,
      });
    } catch (error) {
      console.error('Get trends error:', error);
      res.status(500).json({ error: 'Failed to fetch trends' });
    }
  },

  async getDailyTrends(req: Request, res: Response) {
    try {
      const validation = dailyTrendsSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const { geo } = validation.data;
      const trends = await googleTrendsService.getDailyTrends(geo);

      // Store trending topics
      for (const trend of trends.slice(0, 20)) {
        await prisma.trendingTopic.upsert({
          where: {
            id: `${trend.keyword}-${new Date().toISOString().split('T')[0]}`,
          },
          create: {
            keyword: trend.keyword,
            interest: trend.interest,
            source: 'google_trends',
            region: geo as string,
          },
          update: { interest: trend.interest },
        });
      }

      res.json({ data: trends });
    } catch (error) {
      console.error('Daily trends error:', error);
      res.status(500).json({ error: 'Failed to fetch daily trends' });
    }
  },

  async getRealtimeTrends(req: Request, res: Response) {
    try {
      const validation = realtimeTrendsSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const { category, geo } = validation.data;
      const trends = await googleTrendsService.getRealtimeTrends(category, geo);

      res.json({ data: trends });
    } catch (error) {
      console.error('Realtime trends error:', error);
      res.status(500).json({ error: 'Failed to fetch realtime trends' });
    }
  },

  async compareKeywords(req: Request, res: Response) {
    try {
      const validation = compareSchema.safeParse(req.query);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const { keywords, geo } = validation.data;
      const comparison = await googleTrendsService.compareKeywords(keywords, geo);

      res.json({ data: comparison });
    } catch (error) {
      console.error('Compare keywords error:', error);
      res.status(500).json({ error: 'Failed to compare keywords' });
    }
  },

  async getTimeline(req: Request, res: Response) {
    try {
      const { keywordId } = req.params;

      const validation = timelineSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const { days } = validation.data;

      const trends = await prisma.trend.findMany({
        where: { keywordId },
        orderBy: { date: 'asc' },
        take: days,
      });

      if (trends.length === 0) {
        return res.status(404).json({ error: 'No trends found for keyword' });
      }

      res.json({ data: trends });
    } catch (error) {
      console.error('Get timeline error:', error);
      res.status(500).json({ error: 'Failed to fetch timeline' });
    }
  },
};
