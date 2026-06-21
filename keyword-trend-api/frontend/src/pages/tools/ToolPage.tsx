import { useState, useEffect, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Seo, webPageLd, breadcrumbLd } from '../../components/Seo';
import TrendChart from '../../components/TrendChart';
import ScoreBadge from '../../components/ScoreBadge';
import {
  fetchKeywordBySlug,
  fetchKeywords,
  fetchTrendingKeywords,
} from '../../api';
import type { Keyword, KeywordWithTrends } from '../../types';
import { SITE_URL, REGENT_PARTNER_URL, absoluteUrl } from '../../lib/site';
import { TOOLS, getTool, slugifyTerm, type ToolDef } from './toolsConfig';

function faqLd(tool: ToolDef) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function appLd(tool: ToolDef) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.h1,
    url: `${SITE_URL}/tools/${tool.slug}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: tool.metaDescription,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

function directionGlyph(d: Keyword['direction']) {
  return d === 'rising' ? '↑ Rising' : d === 'falling' ? '↓ Falling' : '→ Flat';
}

function directionClass(d: Keyword['direction']) {
  return d === 'rising'
    ? 'text-brand-green'
    : d === 'falling'
    ? 'text-brand-red'
    : 'text-white/40';
}

// ── Shared result card for lookup tools ─────────────────────────────
function ResultCard({ tool, kw }: { tool: ToolDef; kw: KeywordWithTrends }) {
  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold capitalize">{kw.term}</h2>
          {kw.updatedAt && (
            <p className="text-xs text-white/40 mt-1">
              Updated {new Date(kw.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <span className={`text-sm font-mono font-bold ${directionClass(kw.direction)}`}>
          {directionGlyph(kw.direction)}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <ScoreBadge label="Search Volume" value={kw.searchVolume.toLocaleString()} />
        <ScoreBadge label="Difficulty" value={kw.difficulty} variant="difficulty" />
        <ScoreBadge label="CPC" value={`$${kw.cpc.toFixed(2)}`} />
        <ScoreBadge label="Trend Score" value={kw.trendScore} variant="trend" />
        <ScoreBadge label="Velocity" value={Number(kw.velocity.toFixed(1))} variant="velocity" />
      </div>

      {(tool.emphasis === 'chart' || (kw.trends && kw.trends.length > 0)) && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-2">90-day trend</h3>
          <TrendChart data={kw.trends || []} height={220} />
        </div>
      )}

      {tool.emphasis === 'cpc' && <RoiCalculator kw={kw} />}

      <Link to={`/keyword/${kw.slug}`} className="btn-outline text-sm">
        Full keyword detail →
      </Link>
    </div>
  );
}

// ── ROI calculator (keyword-calculator tool) ────────────────────────
function RoiCalculator({ kw }: { kw: Keyword }) {
  const [visits, setVisits] = useState(1000);
  const [cr, setCr] = useState(2);
  const [aov, setAov] = useState(50);

  const ppcCost = visits * kw.cpc;
  const conversions = (visits * cr) / 100;
  const revenue = conversions * aov;
  const roi = ppcCost > 0 ? ((revenue - ppcCost) / ppcCost) * 100 : null;

  const field = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm';

  return (
    <div className="border-t border-white/5 pt-5 space-y-4">
      <h3 className="text-sm font-semibold text-white/70">Estimate ROI</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="text-xs text-white/50 space-y-1 block">
          Monthly visits
          <input
            type="number"
            min={0}
            value={visits}
            onChange={(e) => setVisits(Math.max(0, Number(e.target.value)))}
            className={field}
          />
        </label>
        <label className="text-xs text-white/50 space-y-1 block">
          Conversion rate %
          <input
            type="number"
            min={0}
            step={0.1}
            value={cr}
            onChange={(e) => setCr(Math.max(0, Number(e.target.value)))}
            className={field}
          />
        </label>
        <label className="text-xs text-white/50 space-y-1 block">
          Avg order value $
          <input
            type="number"
            min={0}
            value={aov}
            onChange={(e) => setAov(Math.max(0, Number(e.target.value)))}
            className={field}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <ScoreBadge label="Est. PPC cost / mo" value={`$${ppcCost.toFixed(0)}`} />
        <ScoreBadge label="Conversions / mo" value={conversions.toFixed(0)} />
        <ScoreBadge label="Est. revenue / mo" value={`$${revenue.toFixed(0)}`} />
        <ScoreBadge label="ROI" value={roi === null ? '—' : `${roi.toFixed(0)}%`} variant="trend" />
      </div>
      {kw.cpc === 0 && (
        <p className="text-xs text-white/40">
          CPC for this keyword is not yet populated, so PPC cost shows $0. Revenue and
          conversions still reflect your inputs.
        </p>
      )}
    </div>
  );
}

// ── lookup widget ───────────────────────────────────────────────────
function LookupWidget({ tool }: { tool: ToolDef }) {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<KeywordWithTrends | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetchKeywordBySlug(slugifyTerm(term));
      setResult(res.data);
    } catch {
      setError(
        `"${term.trim()}" isn't in our index yet. Try a trending keyword below.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <label className="sr-only" htmlFor="kw-input">
          Keyword
        </label>
        <input
          id="kw-input"
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="e.g. product-led growth"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-cyan-500/50"
        />
        <button type="submit" disabled={loading || !term.trim()} className="btn-primary disabled:opacity-50">
          {loading ? 'Checking…' : 'Check keyword'}
        </button>
      </form>

      {error && (
        <div className="glass-card p-4 text-sm text-yellow-300/90 border-yellow-500/20">
          {error}
        </div>
      )}

      {result && <ResultCard tool={tool} kw={result} />}

      {!result && <KeywordGrid title="Trending right now" load={() => fetchTrendingKeywords().then((r) => r.data)} />}
    </div>
  );
}

// ── list widget (browse / velocity / long-tail / research) ──────────
function ListWidget({ tool }: { tool: ToolDef }) {
  const sortFn = (a: Keyword, b: Keyword): number => {
    switch (tool.listSort) {
      case 'velocity':
        return b.velocity - a.velocity;
      case 'trendScore':
        return b.trendScore - a.trendScore;
      case 'difficulty':
        return a.difficulty - b.difficulty; // easiest first
      default:
        return 0;
    }
  };

  return (
    <KeywordGrid
      title="Results"
      load={async () => {
        const res = await fetchKeywords(tool.listParams);
        return tool.listSort ? [...res.data].sort(sortFn) : res.data;
      }}
    />
  );
}

// ── trending widget ─────────────────────────────────────────────────
function TrendingWidget() {
  return (
    <KeywordGrid title="Trending keywords" load={() => fetchTrendingKeywords().then((r) => r.data)} />
  );
}

// ── compare widget ──────────────────────────────────────────────────
function CompareWidget() {
  const [terms, setTerms] = useState<string[]>(['', '']);
  const [rows, setRows] = useState<Keyword[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setTerm = (i: number, v: string) =>
    setTerms((t) => t.map((x, idx) => (idx === i ? v : x)));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const wanted = terms.map((t) => t.trim()).filter(Boolean);
    if (wanted.length < 2) {
      setError('Enter at least two keywords to compare.');
      return;
    }
    setLoading(true);
    setError(null);
    setRows(null);
    const results = await Promise.all(
      wanted.map((t) =>
        fetchKeywordBySlug(slugifyTerm(t))
          .then((r) => r.data as Keyword)
          .catch(() => null)
      )
    );
    const found = results.filter((r): r is Keyword => r !== null);
    if (found.length === 0) {
      setError('None of those keywords are in our index yet.');
    } else {
      setRows(found);
    }
    setLoading(false);
  };

  const field = 'flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm';

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-3">
        {terms.map((t, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={t}
              onChange={(e) => setTerm(i, e.target.value)}
              placeholder={`Keyword ${i + 1}`}
              aria-label={`Keyword ${i + 1}`}
              className={field}
            />
            {terms.length > 2 && (
              <button
                type="button"
                onClick={() => setTerms((arr) => arr.filter((_, idx) => idx !== i))}
                className="px-3 text-white/40 hover:text-white"
                aria-label={`Remove keyword ${i + 1}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <div className="flex gap-3">
          {terms.length < 5 && (
            <button type="button" onClick={() => setTerms((t) => [...t, ''])} className="btn-outline text-sm">
              + Add keyword
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Comparing…' : 'Compare'}
          </button>
        </div>
      </form>

      {error && <div className="glass-card p-4 text-sm text-yellow-300/90">{error}</div>}

      {rows && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 border-b border-white/5">
                <th className="p-3 font-medium">Keyword</th>
                <th className="p-3 font-medium">Volume</th>
                <th className="p-3 font-medium">Difficulty</th>
                <th className="p-3 font-medium">CPC</th>
                <th className="p-3 font-medium">Trend</th>
                <th className="p-3 font-medium">Direction</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((kw) => (
                <tr key={kw.id} className="border-b border-white/5 last:border-0">
                  <td className="p-3">
                    <Link to={`/keyword/${kw.slug}`} className="text-cyan-400 hover:underline capitalize">
                      {kw.term}
                    </Link>
                  </td>
                  <td className="p-3 font-mono">{kw.searchVolume.toLocaleString()}</td>
                  <td className="p-3 font-mono">{kw.difficulty}</td>
                  <td className="p-3 font-mono">${kw.cpc.toFixed(2)}</td>
                  <td className="p-3 font-mono">{kw.trendScore}</td>
                  <td className={`p-3 font-mono ${directionClass(kw.direction)}`}>
                    {directionGlyph(kw.direction)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── reusable keyword grid (client-loaded) ───────────────────────────
function KeywordGrid({ title, load }: { title: string; load: () => Promise<Keyword[]> }) {
  const [items, setItems] = useState<Keyword[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    load()
      .then((d) => alive && setItems(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) return null;
  if (!items) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card h-20 animate-pulse" />
        ))}
      </div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/70">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((kw) => (
          <Link
            key={kw.id}
            to={`/keyword/${kw.slug}`}
            className="glass-card-hover p-4 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-medium capitalize truncate">{kw.term}</p>
              <p className="text-xs text-white/40">
                Vol {kw.searchVolume.toLocaleString()} · Diff {kw.difficulty}
              </p>
            </div>
            <span className={`text-xs font-mono shrink-0 ${directionClass(kw.direction)}`}>
              {directionGlyph(kw.direction)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ToolWidget({ tool }: { tool: ToolDef }) {
  switch (tool.kind) {
    case 'lookup':
      return <LookupWidget tool={tool} />;
    case 'list':
      return <ListWidget tool={tool} />;
    case 'trending':
      return <TrendingWidget />;
    case 'compare':
      return <CompareWidget />;
  }
}

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = getTool(slug);

  if (!tool) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Tool not found</h1>
        <Link to="/tools" className="btn-outline text-sm">
          ← All free tools
        </Link>
      </div>
    );
  }

  const path = `/tools/${tool.slug}`;
  const related = TOOLS.filter((t) => t.slug !== tool.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Seo
        title={tool.metaTitle}
        description={tool.metaDescription}
        path={path}
        jsonLd={[
          webPageLd(absoluteUrl(path), tool.metaTitle, tool.metaDescription),
          breadcrumbLd([
            { name: 'Home', url: SITE_URL },
            { name: 'Free Tools', url: `${SITE_URL}/tools` },
            { name: tool.h1, url: absoluteUrl(path) },
          ]),
          faqLd(tool),
          appLd(tool),
        ]}
      />

      {/* Hero (server-rendered) */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <Link to="/tools" className="text-white/40 hover:text-white/70">
            Free Tools
          </Link>
          <span className="text-white/20">/</span>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-medium">
          ✓ Free forever — no signup
        </span>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text">{tool.h1}</h1>
        <p className="text-lg text-white/60">{tool.tagline}</p>
      </header>

      {/* Interactive tool (client) */}
      <ToolWidget tool={tool} />

      {/* SEO body (server-rendered) */}
      <section className="prose-tool space-y-4 text-white/70 leading-relaxed">
        <p>{tool.intro}</p>
      </section>

      {/* FAQ (server-rendered + JSON-LD) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Frequently asked questions</h2>
        <div className="space-y-3">
          {tool.faqs.map((f) => (
            <details key={f.q} className="glass-card p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-white/60">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Regent CTA */}
      <section className="glass-card p-5 space-y-2 border-cyan-500/15">
        <p className="text-sm text-white/60">
          Want 365-day history, larger exports and full API access?
        </p>
        <a href={REGENT_PARTNER_URL} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
          Try SEO AI Regent →
        </a>
      </section>

      {/* Related tools (internal linking) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white/70">More free tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {related.map((t) => (
            <Link key={t.slug} to={`/tools/${t.slug}`} className="glass-card-hover p-4">
              <p className="font-medium">{t.h1}</p>
              <p className="text-xs text-white/40 mt-1">{t.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
