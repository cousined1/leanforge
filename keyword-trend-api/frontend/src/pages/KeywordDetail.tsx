import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { KeywordWithTrends } from '../types';
import { fetchKeywordBySlug } from '../api';
import TrendChart from '../components/TrendChart';
import ScoreBadge from '../components/ScoreBadge';

export default function KeywordDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<KeywordWithTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchKeywordBySlug(slug)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="glass-card p-8 animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/3" />
          <div className="h-4 bg-white/5 rounded w-1/2" />
          <div className="h-48 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="glass-card p-8 space-y-4">
          <p className="text-brand-red text-sm">{error || 'Keyword not found'}</p>
          <Link to="/" className="btn-outline text-sm">
            ← Back to trending
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-white/40">
        <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
        <span>/</span>
        {data.categoryRel && (
          <>
            <Link to={`/category/${data.categoryRel.slug}`} className="hover:text-white/70 transition-colors">
              {data.categoryRel.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-white/70">{data.term}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{data.term}</h1>
          {data.categoryRel && (
            <Link
              to={`/category/${data.categoryRel.slug}`}
              className="text-xs text-cyan-400 hover:underline mt-1 inline-block"
            >
              {data.categoryRel.name}
            </Link>
          )}
        </div>
        <span
          className={`text-xl font-mono font-bold ${
            data.direction === 'rising' ? 'text-brand-green' : data.direction === 'falling' ? 'text-brand-red' : 'text-white/40'
          }`}
        >
          {data.direction === 'rising' ? '↑' : data.direction === 'falling' ? '↓' : '→'}
        </span>
      </div>

      {/* Score cards */}
      <div className="flex flex-wrap gap-3">
        <ScoreBadge label="Trend Score" value={data.trendScore} variant="trend" />
        <ScoreBadge label="Search Volume" value={data.searchVolume.toLocaleString()} />
        <ScoreBadge label="Difficulty" value={data.difficulty} variant="difficulty" />
        <ScoreBadge label="Velocity" value={Number(data.velocity.toFixed(1))} variant="velocity" />
        {data.cpc > 0 && <ScoreBadge label="CPC" value={`$${data.cpc.toFixed(2)}`} />}
      </div>

      {/* Trend chart */}
      <TrendChart data={data.trends || []} height={250} />

      {/* Raw data footer */}
      <div className="text-xs text-white/30 flex flex-wrap gap-4">
        <span>Source: {data.source}</span>
        {data.updatedAt && <span>Updated: {new Date(data.updatedAt).toLocaleDateString()}</span>}
      </div>
    </div>
  );
}
