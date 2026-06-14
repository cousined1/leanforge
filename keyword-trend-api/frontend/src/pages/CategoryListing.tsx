import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { CategoryDetail } from '../types';
import { fetchCategoryBySlug } from '../api';
import KeywordCard from '../components/KeywordCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function CategoryListing() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchCategoryBySlug(slug)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="glass-card p-6 mb-6 animate-pulse">
          <div className="h-6 bg-white/5 rounded w-1/4 mb-2" />
          <div className="h-4 bg-white/5 rounded w-2/3" />
        </div>
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="glass-card p-8 space-y-4">
          <p className="text-brand-red text-sm">{error || 'Category not found'}</p>
          <Link to="/" className="btn-outline text-sm">← Back to trending</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-white/70">{data.name}</span>
      </div>

      {/* Category header */}
      <div>
        <h1 className="text-3xl font-bold">{data.name}</h1>
        <p className="text-white/50 text-sm mt-1">{data.description}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
          {data.icon && <span>{data.icon}</span>}
          <span>{data.keywords?.length || 0} keywords</span>
        </div>
      </div>

      {/* Keyword grid */}
      {data.keywords && data.keywords.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.keywords.map((kw) => (
            <KeywordCard key={kw.id} keyword={kw} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/30 text-sm">
          No keywords in this category yet.
        </div>
      )}
    </div>
  );
}
