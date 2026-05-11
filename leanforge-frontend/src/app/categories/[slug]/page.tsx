import type { Metadata } from 'next';
import { CategoryContent } from './CategoryContent';
import { JsonLd, webPageLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const formattedName = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return buildMetadata({
    title: `${formattedName} Keyword Trends`,
    description: `Explore trending keywords in the ${formattedName} category. Track keyword momentum, scores, and search volume.`,
    path: `/categories/${params.slug}`,
  });
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const formattedName = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <>
      <Breadcrumbs items={[{ label: 'Categories', href: '/categories' }, { label: formattedName }]} />
      <JsonLd
        data={webPageLd(
          absoluteUrl(`/categories/${params.slug}`),
          `${formattedName} Keyword Trends`,
          `Explore trending keywords in the ${formattedName} category.`
        )}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Categories', url: absoluteUrl('/categories') },
          { name: formattedName, url: absoluteUrl(`/categories/${params.slug}`) },
        ])}
      />
      <CategoryContent slug={params.slug} />
    </>
  );
}
