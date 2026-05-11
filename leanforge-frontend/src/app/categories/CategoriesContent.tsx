'use client';

import { useEffect, useState } from 'react';
import { getCategories, Category } from '@/lib/api';
import Link from 'next/link';
import { Loader } from 'lucide-react';

export function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const result = await getCategories();
        setCategories(result.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const categoryIcons: Record<string, string> = {
    seo: '📊',
    ai: '🤖',
    saas: '🚀',
    devtools: '⚡',
    security: '🔒',
    carbon: '🌍',
  };

  return (
    <div>
      <section className="border-b py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">Keyword Categories</h1>
          <p className="text-muted-foreground">
            Browse trending keywords by industry and topic
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="mb-6 text-sm text-muted-foreground">
            Access keyword data programmatically?{' '}
            <Link href="/api-docs" className="text-primary hover:underline">View API Documentation →</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.slug} href={`/categories/${category.slug}`}>
                  <div className="card p-8 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-6xl mb-4">
                      {categoryIcons[category.slug] || '📌'}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {category.description}
                    </p>
                    <button className="text-primary text-sm font-medium">
                      Explore →
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
