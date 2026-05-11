'use client';

import { useEffect, useState } from 'react';
import { getTrendingKeywords, Keyword } from '@/lib/api';
import { KeywordGrid } from '@/components/KeywordGrid';
import { RegentCTA } from '@/components/RegentCTA';
import { TrendChart } from '@/components/TrendChart';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function HomeContent() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const result = await getTrendingKeywords({ limit: 6 });
        setKeywords(result.data);
      } catch (error) {
        console.error('Failed to fetch trending keywords:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div>
      <section className="border-b py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Real-time Trend Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Discover trending keywords before your competitors
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Powered by Google Trends and search volume data. Track keywords across SEO, AI, SaaS, and more.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/keywords">
                <button className="btn-primary px-6 py-3 text-lg">
                  Explore Keywords
                </button>
              </Link>
              <Link href="/api-docs">
                <button className="btn-outline px-6 py-3 text-lg">
                  API Documentation
                </button>
              </Link>
              <Link href="/pricing" className="text-primary hover:underline text-lg font-medium ml-2">
                View Pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">80+</div>
              <p className="text-muted-foreground">Keywords Tracked</p>
            </div>
            <div>
              <div className="text-3xl font-bold">6</div>
              <p className="text-muted-foreground">Categories</p>
            </div>
            <div>
              <div className="text-3xl font-bold">6h</div>
              <p className="text-muted-foreground">Update Frequency</p>
            </div>
            <div>
              <div className="text-3xl font-bold">API</div>
              <p className="text-muted-foreground">Free Tier Available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 border-b">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
              <p className="text-muted-foreground">Keywords with the highest momentum</p>
            </div>
            <Link href="/keywords?direction=rising">
              <button className="btn-outline px-4 py-2">View All</button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4 h-48 bg-muted animate-pulse"></div>
              ))}
            </div>
          ) : (
            <KeywordGrid keywords={keywords} />
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 border-b">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
              <p className="text-muted-foreground">Explore keywords by industry</p>
            </div>
            <Link href="/categories">
              <button className="btn-outline px-4 py-2">View All Categories</button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'SEO & Content', icon: '📊', slug: 'seo' },
              { name: 'AI & ML', icon: '🤖', slug: 'ai' },
              { name: 'SaaS & Startups', icon: '🚀', slug: 'saas' },
              { name: 'Developer Tools', icon: '⚡', slug: 'devtools' },
              { name: 'Security', icon: '🔒', slug: 'security' },
              { name: 'Carbon & ESG', icon: '🌍', slug: 'carbon' },
            ].map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`}>
                <div className="card p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="font-semibold">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-b">
        <div className="container max-w-4xl text-center">
          <h3 className="text-xl font-bold mb-2">Have questions?</h3>
          <p className="text-muted-foreground">
            Check out our{' '}
            <Link href="/faq" className="text-primary hover:underline">FAQ</Link>
            {' '}or learn about our{' '}
            <Link href="/features" className="text-primary hover:underline">features</Link>.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <RegentCTA />
        </div>
      </section>
    </div>
  );
}
