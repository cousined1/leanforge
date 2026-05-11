// src/controllers/keywordController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { z } from 'zod';

const REGENT_CTA = {
  headline: 'Ready to rank for this keyword?',
  description:
    'SEO AI Regent analyzes your content against trending keywords and gives you a 0-100 optimization score with actionable fixes.',
  cta: 'Start Free Trial',
  url: 'https://seo-ai-regent.com/?ref=keyword-trend-api',
};

const createKeywordSchema = z.object({
  term: z.string().min(1),
  category: z.string().optional(),
  searchVolume: z.number().optional(),
  difficulty: z.number().optional(),
  cpc: z.number().optional(),
});

const updateKeywordSchema = z.object({
  term: z.string().min(1).optional(),
  category: z.string().optional(),
  searchVolume: z.number().optional(),
  difficulty: z.number().optional(),
  cpc: z.number().optional(),
  source: z.string().optional(),
}).strict();

export const keywordController = {
  async list(req: Request, res: Response) {
    try {
      const { category, direction, limit = '50', offset = '0' } = req.query;

      const where: any = { isActive: true };
      if (category) where.category = category;
      if (direction) where.direction = direction;

      const [keywords, total] = await Promise.all([
        prisma.keyword.findMany({
          where,
          orderBy: { trendScore: 'desc' },
          take: Math.min(parseInt(limit as string, 10), 100),
          skip: parseInt(offset as string, 10),
          include: { categoryRel: true },
        }),
        prisma.keyword.count({ where }),
      ]);

      res.json({
        data: keywords,
        _meta: {
          regent_cta: REGENT_CTA,
          total,
          limit: parseInt(limit as string, 10),
          offset: parseInt(offset as string, 10),
        },
      });
    } catch (error) {
      console.error('List keywords error:', error);
      res.status(500).json({ error: 'Failed to list keywords' });
    }
  },

  async trending(req: Request, res: Response) {
    try {
      const { limit = '20', category } = req.query;

      const where: any = { isActive: true, direction: 'rising' };
      if (category) where.category = category;

      const keywords = await prisma.keyword.findMany({
        where,
        orderBy: { trendScore: 'desc' },
        take: Math.min(parseInt(limit as string, 10), 100),
      });

      res.json({
        data: keywords,
        _meta: { regent_cta: REGENT_CTA },
      });
    } catch (error) {
      console.error('Trending keywords error:', error);
      res.status(500).json({ error: 'Failed to fetch trending keywords' });
    }
  },

  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const keyword = await prisma.keyword.findUnique({
        where: { slug },
        include: {
          categoryRel: true,
          trends: {
            orderBy: { date: 'desc' },
            take: 30,
          },
          snapshots: {
            orderBy: { date: 'desc' },
            take: 30,
          },
        },
      });

      if (!keyword) {
        return res.status(404).json({ error: 'Keyword not found' });
      }

      res.json({
        data: keyword,
        _meta: { regent_cta: REGENT_CTA },
      });
    } catch (error) {
      console.error('Get keyword error:', error);
      res.status(500).json({ error: 'Failed to fetch keyword' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const validation = createKeywordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const { term, category, searchVolume, difficulty, cpc } = validation.data;

      const keyword = await prisma.keyword.create({
        data: {
          term,
          slug: term.toLowerCase().replace(/\s+/g, '-'),
          category,
          searchVolume: searchVolume || 0,
          difficulty: difficulty || 0,
          cpc: cpc || 0,
          source: 'manual',
        },
      });

      res.status(201).json({
        data: keyword,
        _meta: { regent_cta: REGENT_CTA },
      });
    } catch (error: any) {
      console.error('Create keyword error:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Keyword already exists' });
      }

      res.status(500).json({ error: 'Failed to create keyword' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const validation = updateKeywordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const keyword = await prisma.keyword.update({
        where: { slug },
        data: validation.data,
      });

      res.json({
        data: keyword,
        _meta: { regent_cta: REGENT_CTA },
      });
    } catch (error: any) {
      console.error('Update keyword error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Keyword not found' });
      }

      res.status(500).json({ error: 'Failed to update keyword' });
    }
  },

  async deactivate(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const keyword = await prisma.keyword.update({
        where: { slug },
        data: { isActive: false },
      });

      res.json({
        data: keyword,
        message: 'Keyword deactivated',
      });
    } catch (error: any) {
      console.error('Deactivate keyword error:', error);

      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Keyword not found' });
      }

      res.status(500).json({ error: 'Failed to deactivate keyword' });
    }
  },
};
