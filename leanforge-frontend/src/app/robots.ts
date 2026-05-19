import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app', '/api/', '/admin/', '/auth/', '/sign-in'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
