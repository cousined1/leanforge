'use client';

import { useEffect, useState } from 'react';
import { getCategoryBySlug, Category, Keyword } from '@/lib/api';
import { KeywordGrid } from '@/components/KeywordGrid';
import { RegentCTA } from '@/components/RegentCTA';
import { RelatedLinks } from '@/components/RelatedLinks';
import Link from 'next/link';
import { Loader, Search, TrendingUp, Code2 } from 'lucide-react';

interface CategoryContentProps {
  slug: string;
}

export function CategoryContent({ slug }: CategoryContentProps) {
  const [category, setCategory] = useState<(Category & { keywords: Keyword[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const result = await getCategoryBySlug(slug);
        setCategory(result.data);
      } catch (error) {
        console.error('Failed to fetch category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Category not found</h1>
          <p className="text-muted-foreground mb-6">
            The category you&apos;re looking for doesn&apos;t exist.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm">
            <Link href="/categories" className="btn-primary px-4 py-2">All categories</Link>
            <Link href="/keywords" className="btn-outline px-4 py-2">Browse keywords</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="border-b py-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
      </section>

      <section className="py-12 border-b">
        <div className="container">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Trending Keywords</h2>
              <p className="text-muted-foreground">
                {category.keywords.length} keywords in this category
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/categories"
                className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                ← All categories
              </Link>
              <Link
                href="/keywords?direction=rising"
                className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                Rising keywords →
              </Link>
              <Link
                href="/pricing"
                className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                API pricing
              </Link>
            </div>
          </div>
          <KeywordGrid keywords={category.keywords} />
        </div>
      </section>

      <RelatedLinks
        title="Take it further"
        description="Compare the API, dig into the data, or try the rising-only filter."
        columns={3}
        links={[
          {
            href: '/keywords?direction=rising',
            label: 'All rising keywords',
            description: 'Keywords trending up across every category.',
            icon: TrendingUp,
          },
          {
            href: '/keywords',
            label: 'Browse all keywords',
            description: 'Filter by direction, category, and free-text search.',
            icon: Search,
          },
          {
            href: '/api-docs',
            label: 'API documentation',
            description: 'Pull this category programmatically.',
            icon: Code2,
          },
        ]}
      />

      <section className="py-16">
        <div className="container max-w-4xl">
          <RegentCTA />
        </div>
      </section>
    </div>
  );
}
