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
  useCases: { path: '/use-cases', label: 'Use Cases', description: 'Common ways SEO and content teams use LeanForge keyword trend data.' },
  apiDocs: { path: '/api-docs', label: 'API Documentation', shortLabel: 'API' },
  pricing: { path: '/pricing', label: 'Pricing', description: 'Choose the plan that fits your keyword intelligence needs.' },
  features: { path: '/features', label: 'Features', description: 'Discover LeanForge features for keyword trend analysis.' },
  about: { path: '/about', label: 'About' },
  contact: { path: '/contact', label: 'Contact' },
  helpCenter: { path: '/help-center', label: 'Help Center', description: 'Find answers and get support for LeanForge.' },
  faq: { path: '/faq', label: 'FAQ', description: 'Frequently asked questions about LeanForge.' },
  signIn: { path: '/sign-in', label: 'Sign In' },
  billingSuccess: { path: '/billing/success', label: 'Subscription Active' },
  billingCanceled: { path: '/billing/canceled', label: 'Checkout Canceled' },
  privacy: { path: '/privacy', label: 'Privacy Policy' },
  terms: { path: '/terms', label: 'Terms of Service' },
  cookies: { path: '/cookies', label: 'Cookie Policy' },
  disclaimer: { path: '/disclaimer', label: 'Disclaimer' },
};

export type RouteKey = keyof typeof routes;

/**
 * Primary navigation shown in the header. Order is the visual order.
 * 5-6 items to avoid overcrowding on desktop and mobile.
 */
export const headerNavRoutes: RouteKey[] = ['features', 'pricing', 'keywords', 'categories', 'apiDocs', 'useCases'];

/**
 * Footer product section: core product surfaces.
 */
export const footerProductRoutes: RouteKey[] = ['features', 'pricing', 'keywords', 'categories', 'useCases', 'apiDocs'];

/**
 * Footer company section: trust + team.
 */
export const footerCompanyRoutes: RouteKey[] = ['about', 'contact', 'helpCenter'];

/**
 * Footer resources section: learning material.
 */
export const footerResourceRoutes: RouteKey[] = ['faq', 'helpCenter', 'apiDocs'];

/**
 * Footer legal section: required disclosures.
 */
export const footerLegalRoutes: RouteKey[] = ['privacy', 'terms', 'cookies', 'disclaimer'];

/**
 * Pages reachable from the Sign-In call-to-action (logged-out users).
 * Drives the "Or explore:" strip on /sign-in and the auth callback page.
 */
export const preAuthExploreRoutes: RouteKey[] = ['features', 'pricing', 'keywords', 'useCases'];

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
  { path: '/use-cases', label: 'Use Cases', changefreq: 'monthly', priority: 0.7 },
  { path: '/api-docs', label: 'API Documentation', changefreq: 'weekly', priority: 0.7 },
  { path: '/help-center', label: 'Help Center', changefreq: 'monthly', priority: 0.6 },
  { path: '/faq', label: 'FAQ', changefreq: 'monthly', priority: 0.6 },
  { path: '/about', label: 'About', changefreq: 'monthly', priority: 0.5 },
  { path: '/contact', label: 'Contact', changefreq: 'monthly', priority: 0.5 },
];

export const sitemapLegalRoutes: Array<{
  path: string;
  label: string;
}> = [
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms of Service' },
  { path: '/cookies', label: 'Cookie Policy' },
  { path: '/disclaimer', label: 'Disclaimer' },
];

export function getRoute(key: RouteKey): RouteDef {
  return routes[key];
}
