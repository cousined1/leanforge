import type { Metadata } from 'next';
import { ApiDocsContent } from './ApiDocsContent';
import { JsonLd, webPageLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'API Documentation',
  description:
    'Build with the LeanForge Keyword Trend API. REST API with 15+ endpoints for keywords, trends, categories, and trend comparisons.',
  path: '/api-docs',
});

export default function ApiDocsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'API Documentation' }]} />
      <JsonLd
        data={webPageLd(
          absoluteUrl('/api-docs'),
          'API Documentation - LeanForge',
          'Build with the LeanForge Keyword Trend API. REST API with 15+ endpoints.'
        )}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'API Docs', url: absoluteUrl('/api-docs') },
        ])}
      />
      <ApiDocsContent />
    </>
  );
}
