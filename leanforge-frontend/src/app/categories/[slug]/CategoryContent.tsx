'use client';

import { useEffect, useState } from 'react';
import { getCategoryBySlug, Category, Keyword } from '@/lib/api';
import { KeywordGrid } from '@/components/KeywordGrid';
import { RegentCTA } from '@/components/RegentCTA';
import Link from 'next/link';
import { Loader } from 'lucide-react';

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Trending Keywords</h2>
            <p className="text-muted-foreground">
              {category.keywords.length} keywords in this category
            </p>
            </div>
            <div className="flex gap-4 text-sm">
              <Link href="/categories" className="text-primary hover:underline">← All categories</Link>
              <Link href="/pricing" className="text-primary hover:underline">View pricing for API access →</Link>
            </div>
          </div>
          <KeywordGrid keywords={category.keywords} />
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          <RegentCTA />
        </div>
      </section>
    </div>
  );
}
