import type { Metadata } from 'next';
import { CategoriesContent } from './CategoriesContent';
import { JsonLd, webPageLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Browse by Category',
  description:
    'Browse trending keywords by industry and topic. Categories include SEO, AI, SaaS, Developer Tools, Security, and Carbon & ESG.',
  path: '/categories',
});

export default function CategoriesPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Categories' }]} />
      <JsonLd
        data={webPageLd(
          absoluteUrl('/categories'),
          'Browse by Category - LeanForge',
          'Browse trending keywords by industry and topic.'
        )}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Categories', url: absoluteUrl('/categories') },
        ])}
      />
      <CategoriesContent />
    </>
  );
}
