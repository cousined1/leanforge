export const SITE_URL = 'https://lean-forge.net';
export const SITE_NAME = 'LeanForge Keyword Trend Index';
export const SITE_SHORT_NAME = 'LeanForge';
export const SITE_DESCRIPTION =
  'Discover trending keywords before your competitors. Powered by Google Trends and search volume data. Track keywords across SEO, AI, SaaS, and more.';
export const SITE_LOCALE = 'en_US';
export const REGENT_PARTNER_URL =
  'https://seo-ai-regent.com/?ref=keyword-trend-api';
export const CONTACT_EMAIL = 'hello@developer312.com';
export const CONTACT_PHONE = '+15104011225';
export const COMPANY_NAME = 'Developer312';
export const COMPANY_LEGAL_NAME = 'NIGHT LITE USA LLC';

// Real on-brand 1200x630 PNG at frontend/public/og-image.png (social-unfurl compatible).
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const TWITTER_HANDLE = '@leanforge';

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/+$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export interface SeoParams {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  jsonLd?: object | object[];
}

export const defaultSeo: Required<Pick<SeoParams, 'title' | 'description' | 'ogType'>> & {
  path: string;
} = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  path: '/',
  ogType: 'website',
};

