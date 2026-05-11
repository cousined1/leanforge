import type { Metadata } from 'next';
import { KeywordDetailContent } from './KeywordDetailContent';
import { JsonLd, webPageLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

interface KeywordDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: KeywordDetailPageProps): Promise<Metadata> {
  const formattedTerm = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return buildMetadata({
    title: `${formattedTerm} Trends & Scores`,
    description: `Trend data, scores, velocity, and search volume for "${formattedTerm}". Track interest over time and keyword momentum.`,
    path: `/keywords/${params.slug}`,
  });
}

export default function KeywordDetailPage({ params }: KeywordDetailPageProps) {
  const formattedTerm = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <>
      <Breadcrumbs items={[{ label: 'Keywords', href: '/keywords' }, { label: formattedTerm }]} />
      <JsonLd
        data={webPageLd(
          absoluteUrl(`/keywords/${params.slug}`),
          `${formattedTerm} Trends & Scores`,
          `Trend data, scores, velocity, and search volume for "${formattedTerm}".`
        )}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Keywords', url: absoluteUrl('/keywords') },
          { name: formattedTerm, url: absoluteUrl(`/keywords/${params.slug}`) },
        ])}
      />
      <KeywordDetailContent slug={params.slug} />
    </>
  );
}
