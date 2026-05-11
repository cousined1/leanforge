import type { Metadata } from 'next';
import { HomeContent } from './HomeContent';
import { JsonLd, webPageLd } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Discover trending keywords before your competitors',
  description:
    'Real-time keyword trend intelligence for SEO professionals. Powered by Google Trends and search volume data. Track keywords across SEO, AI, SaaS, and more.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={webPageLd(
          absoluteUrl('/'),
          'LeanForge Keyword Trend Index',
          'Real-time keyword trend intelligence for SEO professionals.'
        )}
      />
      <HomeContent />
    </>
  );
}
