'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getKeywords, Keyword } from '@/lib/api';
import { KeywordGrid } from '@/components/KeywordGrid';
import { RegentCTA } from '@/components/RegentCTA';
import { analyticsEvents, trackEvent } from '@/lib/analytics';
import Link from 'next/link';
import { Search } from 'lucide-react';

export function KeywordsContent() {
  const searchParams = useSearchParams();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDirection, setSelectedDirection] = useState(searchParams.get('direction') || '');
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current && !loading && keywords.length > 0) {
      hasTracked.current = true;
      trackEvent('keyword_browsed', { count: keywords.length });
    }
  }, [loading, keywords]);

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        setLoading(true);
        const result = await getKeywords({
          q: searchQuery || undefined,
          category: selectedCategory || undefined,
          direction: selectedDirection || undefined,
          limit,
          offset,
        });
        setKeywords(result.data);
        setTotal(result._meta.total);
      } catch (error) {
        console.error('Failed to fetch keywords:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKeywords();
  }, [searchQuery, selectedCategory, selectedDirection, offset, limit]);

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div>
      <section className="border-b py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">Keyword Trends</h1>
          <p className="text-muted-foreground">
            {selectedCategory ? `Keywords in ${selectedCategory}` : 'All tracked keywords'}
            {selectedDirection ? ` • Showing ${selectedDirection} trends` : ''}
            {searchQuery ? ` • Matching "${searchQuery}"` : ''}
          </p>
        </div>
      </section>

      <section className="py-4 border-b">
        <div className="container">
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">Not sure where to start?</span>
            <Link href="/categories" className="text-primary hover:underline">Browse by category →</Link>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Need API access?</span>
            <Link href="/api-docs" className="text-primary hover:underline">View API Documentation →</Link>
          </div>
        </div>
      </section>

      <section className="py-8 border-b">
        <div className="container">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search keywords..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setOffset(0);
                  }}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border rounded-lg bg-background"
              value={selectedDirection}
              onChange={(event) => {
                setSelectedDirection(event.target.value);
                setOffset(0);
              }}
            >
              <option value="">All Directions</option>
              <option value="rising">Rising</option>
              <option value="falling">Falling</option>
              <option value="flat">Flat</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg bg-background"
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value);
                setOffset(0);
              }}
            >
              <option value="">All Categories</option>
              <option value="seo">SEO</option>
              <option value="ai">AI</option>
              <option value="saas">SaaS</option>
              <option value="devtools">Developer Tools</option>
              <option value="security">Security</option>
              <option value="carbon">Carbon & ESG</option>
            </select>
          </div>
        </div>
      </section>

      <section className="py-12 border-b">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4 h-48 bg-muted animate-pulse"></div>
              ))}
            </div>
          ) : keywords.length > 0 ? (
            <>
              <div className="mb-6 text-sm text-muted-foreground">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} keywords
              </div>
              <KeywordGrid keywords={keywords} />

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    className="btn-outline px-4 py-2 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setOffset(offset + limit)}
                    disabled={currentPage === totalPages}
                    className="btn-outline px-4 py-2 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No keywords match your filters</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery
                  ? `We couldn't find any keywords matching "${searchQuery}". Try a broader search term or browse by category.`
                  : selectedCategory
                  ? `No keywords found in the "${selectedCategory}" category with the current filters. Try removing some filters.`
                  : 'No keywords match the selected direction filter. Try expanding your search.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSelectedDirection('');
                    setOffset(0);
                  }}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Clear all filters
                </button>
                <Link href="/categories" className="btn-outline px-4 py-2 text-sm">
                  Browse by category
                </Link>
              </div>
            </div>
          )}
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
