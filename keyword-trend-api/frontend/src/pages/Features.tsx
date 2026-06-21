import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';

interface Feature {
  title: string;
  description: string;
  emoji: string;
}

const features: Feature[] = [
  {
    emoji: '📈',
    title: 'Real-Time Trend Tracking',
    description:
      'Monitor keyword interest trends over time. Data refreshed on a recurring cadence from Google Trends and Serper.dev.',
  },
  {
    emoji: '⚡',
    title: 'Velocity Scoring',
    description:
      'Composite 0-100 trend score combining 7-day velocity, 30-day velocity, absolute interest, search volume, and direction consistency.',
  },
  {
    emoji: '🔌',
    title: 'Public API',
    description:
      'Access keyword intelligence programmatically via a clean JSON API. TypeScript types included, no auth required for free tier.',
  },
  {
    emoji: '🧭',
    title: 'Direction Indicators',
    description:
      'Instantly see which keywords are rising, falling, or flat with 7-day and 30-day velocity metrics on every card.',
  },
  {
    emoji: '📅',
    title: 'Daily Snapshots',
    description:
      'Historical snapshots with 7-day and 30-day velocity comparisons for every tracked keyword. Replay any day.',
  },
  {
    emoji: '🗂️',
    title: 'Category Browsing',
    description:
      'Filter keywords by industry: SEO, AI, SaaS, Developer Tools, Security, and Carbon & ESG. One click per category.',
  },
  {
    emoji: '🔍',
    title: 'Search & Filter',
    description:
      'Search across 80+ keywords by term, category, or trend direction. Find opportunities in seconds.',
  },
  {
    emoji: '📱',
    title: 'Mobile-Friendly',
    description:
      'Responsive design works on phones, tablets, and desktops. Track trends wherever you are.',
  },
  {
    emoji: '🛡️',
    title: 'GDPR & Privacy First',
    description:
      'Clear cookie consent, transparent privacy policy, no tracking without opt-in. Operated by Developer312, a subsidiary of NIGHT LITE USA LLC.',
  },
];

export default function Features() {
  return (
    <>
      <Seo
        title="Features"
        description="Real-time keyword trend tracking, velocity scoring, category filtering, public API, and a privacy-first design. Everything you need to discover trending keywords."
        path="/features"
        jsonLd={{
          '@type': 'WebPage',
          name: 'Features',
          description: 'LeanForge feature list',
        }}
      />
      <Breadcrumbs items={[{ label: 'Features' }]} />
      <PageContainer>
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Powerful <span className="gradient-text">Keyword Intelligence</span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            Everything you need to discover, track, and act on keyword trends before your competitors.
          </p>
        </section>

        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-5 space-y-2">
                <div className="text-2xl" aria-hidden>
                  {f.emoji}
                </div>
                <h3 className="font-bold text-sm">{f.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center space-y-3">
          <h2 className="text-xl font-bold">Ready to get started?</h2>
          <p className="text-white/50 text-sm">
            Free to use. Browse trending keywords now.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/" className="btn-primary text-sm">
              Browse Keywords
            </Link>
            <Link to="/api-docs" className="btn-outline text-sm">
              Read the API Docs
            </Link>
            <Link to="/pricing" className="btn-outline text-sm">
              View Pricing
            </Link>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
