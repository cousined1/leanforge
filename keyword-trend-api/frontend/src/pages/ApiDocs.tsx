import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
}

const endpoints: Endpoint[] = [
  { method: 'GET', path: '/api/v1/keywords', description: 'List all keywords with pagination' },
  { method: 'GET', path: '/api/v1/keywords/trending', description: 'Trending keywords (rising direction)' },
  { method: 'GET', path: '/api/v1/keywords/:slug', description: 'Get a single keyword with trend data' },
  { method: 'GET', path: '/api/v1/categories', description: 'List all categories' },
  { method: 'GET', path: '/api/v1/categories/:slug', description: 'Get a single category with its keywords' },
  { method: 'GET', path: '/api/v1/trends', description: 'List trend data points, filterable' },
  { method: 'GET', path: '/api/v1/trends/daily', description: 'Google Trends daily trends' },
  { method: 'GET', path: '/api/v1/trends/compare', description: 'Compare 2-5 keywords side by side' },
  { method: 'GET', path: '/api/v1/trends/:keywordId/timeline', description: '90-day timeline for a keyword' },
  { method: 'GET', path: '/health', description: 'Liveness probe (Railway healthcheck)' },
  { method: 'GET', path: '/health/deep', description: 'Deep probe: DB + Redis + uptime' },
];

const methodColor: Record<Endpoint['method'], string> = {
  GET: 'text-brand-green',
  POST: 'text-brand-cyan',
  PUT: 'text-brand-amber',
  DELETE: 'text-brand-red',
};

export default function ApiDocs() {
  return (
    <>
      <Seo
        title="API Documentation"
        description="LeanForge Keyword Trend API: 11 endpoints for keywords, trends, categories, and comparisons. JSON, REST, no auth required for free tier."
        path="/api-docs"
      />
      <Breadcrumbs items={[{ label: 'API Documentation' }]} />
      <PageContainer>
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            API <span className="gradient-text">Documentation</span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            REST JSON API. No auth required for the public endpoints. Built for
            programmatic access to LeanForge keyword data.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3 max-w-4xl mx-auto">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-extrabold gradient-text">11</div>
            <p className="text-xs text-white/50 mt-1">Endpoints</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-extrabold gradient-text">JSON</div>
            <p className="text-xs text-white/50 mt-1">Content type</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-extrabold gradient-text">100/15m</div>
            <p className="text-xs text-white/50 mt-1">Free rate limit (per IP)</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto space-y-3">
          <h2 className="text-xl font-bold">Base URL</h2>
          <pre className="glass-card p-3 text-xs font-mono overflow-x-auto">
            <code>https://lean-forge.net/api/v1</code>
          </pre>
        </section>

        <section className="max-w-4xl mx-auto space-y-3">
          <h2 className="text-xl font-bold">Endpoints</h2>
          <div className="glass-card divide-y divide-white/5">
            {endpoints.map((e) => (
              <div key={`${e.method}-${e.path}`} className="p-4 grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-3 items-center">
                <span className={`text-xs font-mono font-bold ${methodColor[e.method]}`}>
                  {e.method}
                </span>
                <div>
                  <code className="text-xs font-mono text-white/80 break-all">{e.path}</code>
                  <p className="text-xs text-white/50 mt-1">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto space-y-3">
          <h2 className="text-xl font-bold">Example: fetch trending</h2>
          <pre className="glass-card p-4 text-xs font-mono overflow-x-auto leading-relaxed">
{`curl https://lean-forge.net/api/v1/keywords/trending?limit=10

{
  "data": [
    {
      "id": "...",
      "term": "AI code review",
      "slug": "ai-code-review",
      "category": "ai",
      "trendScore": 87,
      "velocity": 23.4,
      "direction": "rising",
      "searchVolume": 12400,
      "difficulty": 42,
      "cpc": 1.85,
      "source": "google_trends",
      "isActive": true
    }
  ],
  "_meta": {
    "total": 80,
    "limit": 10,
    "offset": 0,
    "regent_cta": {
      "headline": "Ready to rank for this keyword?",
      "url": "https://seo-ai-regent.com/?ref=keyword-trend-api"
    }
  }
}`}
          </pre>
        </section>

        <section className="max-w-4xl mx-auto space-y-3">
          <h2 className="text-xl font-bold">Rate limiting</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            The public API is rate-limited to 100 requests per 15 minutes per IP. Response
            headers include <code className="text-xs font-mono">X-RateLimit-Limit</code>,{' '}
            <code className="text-xs font-mono">X-RateLimit-Remaining</code>, and{' '}
            <code className="text-xs font-mono">X-RateLimit-Reset</code>. If you need a
            higher limit, see the Regent partner offer for usage-based plans.
          </p>
        </section>
      </PageContainer>
    </>
  );
}
