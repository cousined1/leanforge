export interface RouteDef {
  path: string;
  label: string;
  shortLabel?: string;
  description?: string;
}

export const routes: Record<string, RouteDef> = {
  home: { path: '/', label: 'Home' },
  keywords: { path: '/keywords', label: 'Keywords', description: 'Browse and search trending keywords across SEO, AI, SaaS, and more.' },
  keywordDetail: { path: '/keywords/[slug]', label: 'Keyword Detail' },
  categories: { path: '/categories', label: 'Categories', description: 'Explore keyword trends organized by category.' },
  categoryDetail: { path: '/categories/[slug]', label: 'Category Detail' },
  apiDocs: { path: '/api-docs', label: 'API Documentation', shortLabel: 'API' },
  pricing: { path: '/pricing', label: 'Pricing', description: 'Choose the plan that fits your keyword intelligence needs.' },
  features: { path: '/features', label: 'Features', description: 'Discover LeanForge features for keyword trend analysis.' },
  about: { path: '/about', label: 'About' },
  contact: { path: '/contact', label: 'Contact' },
  helpCenter: { path: '/help-center', label: 'Help Center', description: 'Find answers and get support for LeanForge.' },
  faq: { path: '/faq', label: 'FAQ', description: 'Frequently asked questions about LeanForge.' },
  signIn: { path: '/sign-in', label: 'Sign In' },
  privacy: { path: '/privacy', label: 'Privacy Policy' },
  terms: { path: '/terms', label: 'Terms of Service' },
  cookies: { path: '/cookies', label: 'Cookie Policy' },
  disclaimer: { path: '/disclaimer', label: 'Disclaimer' },
};

export type RouteKey = keyof typeof routes;

export const headerNavRoutes: RouteKey[] = ['features', 'pricing', 'keywords', 'categories', 'apiDocs'];

export const footerProductRoutes: RouteKey[] = ['keywords', 'categories', 'features', 'pricing', 'apiDocs'];

export const footerCompanyRoutes: RouteKey[] = ['about', 'contact', 'helpCenter'];

export const footerResourceRoutes: RouteKey[] = ['faq', 'apiDocs'];

export const footerLegalRoutes: RouteKey[] = ['privacy', 'terms', 'cookies', 'disclaimer'];

export const sitemapPublicRoutes: Array<{
  path: string;
  label: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}> = [
  { path: '/', label: 'Home', changefreq: 'daily', priority: 1.0 },
  { path: '/keywords', label: 'Keywords', changefreq: 'daily', priority: 0.9 },
  { path: '/categories', label: 'Categories', changefreq: 'weekly', priority: 0.8 },
  { path: '/features', label: 'Features', changefreq: 'monthly', priority: 0.8 },
  { path: '/pricing', label: 'Pricing', changefreq: 'monthly', priority: 0.8 },
  { path: '/api-docs', label: 'API Documentation', changefreq: 'weekly', priority: 0.7 },
  { path: '/help-center', label: 'Help Center', changefreq: 'monthly', priority: 0.6 },
  { path: '/faq', label: 'FAQ', changefreq: 'monthly', priority: 0.6 },
  { path: '/sign-in', label: 'Sign In', changefreq: 'monthly', priority: 0.4 },
];

export const sitemapLegalRoutes: Array<{
  path: string;
  label: string;
}> = [
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms of Service' },
  { path: '/cookies', label: 'Cookie Policy' },
  { path: '/disclaimer', label: 'Disclaimer' },
];

export function getRoute(key: RouteKey): RouteDef {
  return routes[key];
}