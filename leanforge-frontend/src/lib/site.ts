const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lean-forge.net';

export const siteConfig = {
  url: SITE_URL,
  name: 'LeanForge Keyword Trend Index',
  shortName: 'LeanForge',
  tagline: 'Real-time keyword trend intelligence for SEO professionals',
  description:
    'Discover trending keywords before your competitors. Powered by Google Trends and search volume data. Track keywords across SEO, AI, SaaS, and more.',
  locale: 'en_US',
  twitter: {
    site: '@leanforge',
    creator: '@leanforge',
    card: 'summary_large_image' as const,
  },
  og: {
    image: `${SITE_URL}/og-image.png`,
    imageWidth: 1200,
    imageHeight: 630,
  },
};

export const businessConfig = {
  name: 'Developer312',
  legalName: 'NIGHT LITE USA LLC',
  subsidiaryNote: 'a subsidiary of NIGHT LITE USA LLC',
  email: 'hello@developer312.com',
  phone: '(510) 401-1225',
  phoneHref: 'tel:+15104011225',
  address: undefined as string | undefined,
};

import { sitemapPublicRoutes, sitemapLegalRoutes } from './routes';

export { sitemapPublicRoutes as publicRoutes, sitemapLegalRoutes as legalRoutes };

export const productPages = [
  ...sitemapPublicRoutes,
  ...sitemapLegalRoutes,
];

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/+$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
