import { MetadataRoute } from 'next';
import { siteConfig, publicRoutes, legalRoutes, absoluteUrl } from '@/lib/site';

async function fetchDynamicRoutes(): Promise<{
  keywords: { slug: string; updatedAt: string }[];
  categories: { slug: string; updatedAt: string }[];
}> {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    const [kwRes, catRes] = await Promise.allSettled([
      fetch(`${API_URL}/keywords?limit=100`, {
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`${API_URL}/categories`, {
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    let keywords: { slug: string; updatedAt: string }[] = [];
    let categories: { slug: string; updatedAt: string }[] = [];

    if (kwRes.status === 'fulfilled' && kwRes.value.ok) {
      const body = await kwRes.value.json();
      keywords = (body.data || []).map((k: { slug: string; updatedAt: string }) => ({
        slug: k.slug,
        updatedAt: k.updatedAt,
      }));
    }

    if (catRes.status === 'fulfilled' && catRes.value.ok) {
      const body = await catRes.value.json();
      categories = (body.data || []).map((c: { slug: string; updatedAt: string }) => ({
        slug: c.slug,
        updatedAt: c.updatedAt,
      }));
    }

    return { keywords, categories };
  } catch {
    return { keywords: [], categories: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of publicRoutes) {
    entries.push({
      url: absoluteUrl(route.path),
      lastModified: new Date(),
      changeFrequency: route.changefreq,
      priority: route.priority,
    });
  }

  for (const route of legalRoutes) {
    entries.push({
      url: absoluteUrl(route.path),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    });
  }

  try {
    const { keywords, categories } = await fetchDynamicRoutes();

    for (const kw of keywords) {
      entries.push({
        url: absoluteUrl(`/keywords/${kw.slug}`),
        lastModified: kw.updatedAt ? new Date(kw.updatedAt) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      });
    }

    for (const cat of categories) {
      entries.push({
        url: absoluteUrl(`/categories/${cat.slug}`),
        lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      });
    }
  } catch {
    // Dynamic routes skipped — API not available at build time
  }

  return entries;
}
