'use client';

import { useEffect, useState } from 'react';
import { getKeywordBySlug, Keyword, Trend } from '@/lib/api';
import { TrendChart } from '@/components/TrendChart';
import { RegentCTA } from '@/components/RegentCTA';
import { formatNumber, getDirectionColor, getDirectionIcon } from '@/lib/utils';
import { Loader } from 'lucide-react';
import Link from 'next/link';

interface KeywordDetailContentProps {
  slug: string;
}

export function KeywordDetailContent({ slug }: KeywordDetailContentProps) {
  const [keyword, setKeyword] = useState<(Keyword & { trends: Trend[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKeyword = async () => {
      try {
        setLoading(true);
        const result = await getKeywordBySlug(slug);
        setKeyword(result.data);
      } catch (error) {
        console.error('Failed to fetch keyword:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKeyword();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!keyword) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Keyword not found</h1>
          <p className="text-muted-foreground">
            The keyword you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const chartData = keyword.trends.map((trend) => ({
    date: new Date(trend.date).toISOString().split('T')[0],
    interest: trend.interest,
    volume: trend.volume,
  }));

  return (
    <div>
      <section className="border-b py-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">{keyword.term}</h1>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                keyword.direction === 'rising'
                  ? 'bg-green-50 text-green-700'
                  : keyword.direction === 'falling'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-50 text-gray-700'
              }`}
            >
              <span className="mr-1">{getDirectionIcon(keyword.direction)}</span>
              {keyword.direction.charAt(0).toUpperCase() + keyword.direction.slice(1)}
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
              Category: {keyword.category}
            </span>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/keywords" className="text-primary hover:underline">← Browse all keywords</Link>
            <Link href={`/categories/${keyword.category.toLowerCase()}`} className="text-primary hover:underline">Browse {keyword.category} keywords →</Link>
          </div>
        </div>
      </section>

      <section className="py-12 border-b">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <p className="text-muted-foreground text-sm mb-2">Trend Score</p>
              <p className="text-4xl font-bold">{keyword.trendScore}</p>
              <p className="text-xs text-muted-foreground mt-2">out of 100</p>
            </div>
            <div className="card p-6">
              <p className="text-muted-foreground text-sm mb-2">Velocity (7d)</p>
              <p className={`text-4xl font-bold ${getDirectionColor(keyword.direction)}`}>
                {keyword.velocity > 0 ? '+' : ''}{keyword.velocity.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-2">week-over-week change</p>
            </div>
            <div className="card p-6">
              <p className="text-muted-foreground text-sm mb-2">Search Volume</p>
              <p className="text-4xl font-bold">{formatNumber(keyword.searchVolume)}</p>
              <p className="text-xs text-muted-foreground mt-2">estimated monthly</p>
            </div>
            <div className="card p-6">
              <p className="text-muted-foreground text-sm mb-2">Difficulty</p>
              <p className="text-4xl font-bold">{keyword.difficulty.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-2">competition level</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-b">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6">Interest Over Time (90 days)</h2>
          <div className="card p-6">
            <TrendChart data={chartData} height={400} />
          </div>
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
