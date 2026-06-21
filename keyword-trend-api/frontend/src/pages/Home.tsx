'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Category, Keyword } from '../types';
import { fetchTrendingKeywords, fetchCategories } from '../api';
import KeywordCard from '../components/KeywordCard';
import CategoryChip from '../components/CategoryChip';
import { RegentCtaConditional } from '../components/RegentCta';
import PricingTable from '../components/PricingTable';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Seo } from '../components/Seo';

export default function Home() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [regentCta, setRegentCta] = useState<{ headline: string; description: string; cta: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchTrendingKeywords(), fetchCategories()])
      .then(([kwRes, catRes]) => {
        setKeywords(kwRes.data);
        setRegentCta(kwRes._meta?.regent_cta ?? null);
        setCategories(catRes.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredKeywords = activeCategory
    ? keywords.filter((k) => k.category === activeCategory)
    : keywords;

  const keywordCount = keywords.length;
  const categoryCount = categories.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Seo
        title="Keyword Trend Intelligence"
        description="Real-time keyword trend scoring, velocity tracking, and competitive intelligence for SEO professionals. Browse 80+ keywords across SEO, AI, SaaS, and more."
        path="/"
        jsonLd={{
          '@type': 'WebPage',
          name: 'LeanForge Keyword Trend Index',
          description:
            'Discover trending keywords before your competitors. Powered by Google Trends and search volume data.',
        }}
      />

      <section className="text-center py-12 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Keyword <span className="gradient-text">Trend Intelligence</span>
        </h1>
        <p className="text-white/50 max-w-xl mx-auto text-sm sm:text-base">
          Real-time scoring, velocity tracking, and competitive intelligence for SEO professionals.
        </p>
        <div className="flex items-center justify-center gap-3 text-xs">
          {loading ? (
            <span className="flex items-center gap-1.5 text-white/40">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block animate-pulse" />
              Loading&hellip;
            </span>
          ) : error || keywordCount === 0 ? (
            <span className="flex items-center gap-1.5 text-white/40">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
              Data refreshing soon
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-white/40">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                {keywordCount} keywords tracked
              </span>
              <span className="text-white/20">&middot;</span>
              <span className="text-white/40">{categoryCount} categories</span>
            </>
          )}
        </div>
      </section>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <CategoryChip
            name="All"
            slug=""
            isActive={!activeCategory}
            onClick={() => setActiveCategory(null)}
          />
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              name={cat.name}
              slug={cat.slug}
              isActive={activeCategory === cat.slug}
              onClick={() => setActiveCategory(cat.slug === activeCategory ? null : cat.slug)}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-4 text-center">
          <p className="text-brand-red text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-outline mt-3 text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Keyword grid */}
      {loading ? (
        <LoadingSkeleton count={9} />
      ) : keywordCount === 0 && !error ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Trending keywords loading soon</h3>
          <p className="text-white/50 text-sm mb-4">
            We are refreshing keyword data. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredKeywords.map((kw) => (
            <KeywordCard key={kw.id} keyword={kw} />
          ))}
        </div>
      )}

      {!loading && filteredKeywords.length === 0 && keywordCount > 0 && (
        <div className="text-center py-12 text-white/30 text-sm">
          No keywords found for this category.
        </div>
      )}

      {/* Regent CTA */}
      <RegentCtaConditional cta={regentCta} />

      {/* Pricing */}
      <PricingTable />

      {/* API Badge */}
      <section className="text-center pb-8">
        <a
          href="/api/v1/keywords/trending"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 glass-card text-xs text-white/50 hover:text-white/70 transition-colors"
        >
          <span className="font-mono">GET /api/v1/keywords/trending</span>
          <span className="text-cyan-400">&rarr;</span>
        </a>
      </section>
    </div>
  );
}
