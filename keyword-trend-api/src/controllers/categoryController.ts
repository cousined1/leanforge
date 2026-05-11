// src/controllers/categoryController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().optional(),
});

export const categoryController = {
  async list(_req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      res.json({ data: categories });
    } catch (error) {
      console.error('List categories error:', error);
      res.status(500).json({ error: 'Failed to list categories' });
    }
  },

  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          keywords: {
            where: { isActive: true },
            orderBy: { trendScore: 'desc' },
          },
        },
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ data: category });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const validation = createCategorySchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.flatten() });
      }

      const { name, description, icon, color, sortOrder } = validation.data;

      const category = await prisma.category.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          description,
          icon,
          color,
          sortOrder,
        },
      });

      res.status(201).json({ data: category });
    } catch (error: any) {
      console.error('Create category error:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Category already exists' });
      }

      res.status(500).json({ error: 'Failed to create category' });
    }
  },
};
