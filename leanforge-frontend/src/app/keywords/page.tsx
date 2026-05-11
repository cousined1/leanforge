import type { Metadata } from 'next';
import { KeywordsContent } from './KeywordsContent';
import { Suspense } from 'react';
import { JsonLd, webPageLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Browse All Keywords',
  description:
    'Browse all tracked keywords with trend scores, velocity, volume, and direction indicators. Filter by category and direction.',
  path: '/keywords',
});

export default function KeywordsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Keywords' }]} />
      <JsonLd
        data={webPageLd(
          absoluteUrl('/keywords'),
          'Browse All Keywords - LeanForge',
          'Browse all tracked keywords with trend scores, velocity, volume, and direction indicators.'
        )}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Keywords', url: absoluteUrl('/keywords') },
        ])}
      />
      <Suspense fallback={<div className="flex items-center justify-center py-12">Loading...</div>}>
        <KeywordsContent />
      </Suspense>
    </>
  );
}
