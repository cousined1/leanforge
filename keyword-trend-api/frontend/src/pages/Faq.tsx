import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'What is LeanForge Keyword Trend Index?',
    a: 'LeanForge is a real-time keyword trend intelligence platform. We track 80+ keywords across 6 categories (SEO, AI, SaaS, Developer Tools, Security, Carbon & ESG) and surface trend scores, velocity, search volume, and direction so you can spot opportunities before your competitors.',
  },
  {
    q: 'Is the API free to use?',
    a: 'Yes — the public API endpoints are free during MVP. You get 100 requests per 15 minutes per IP. No API key required. For higher limits and historical data, see the Regent partner offer or contact us about enterprise plans.',
  },
  {
    q: 'How often is the data refreshed?',
    a: 'Keyword trend data is refreshed on a recurring cadence (typically every 6 hours) via Google Trends and Serper.dev. The API caches responses for a few minutes to keep things fast.',
  },
  {
    q: 'Where does the data come from?',
    a: 'Interest and velocity come from Google Trends. Search volume, CPC, and difficulty come from Serper.dev. We aggregate both sources and compute a composite 0-100 trend score.',
  },
  {
    q: 'What is the trend score (0-100)?',
    a: 'A composite score combining 7-day velocity (30%), 30-day velocity (15%), absolute interest (25%), search volume (15%), and direction consistency (15%). Higher score = stronger momentum.',
  },
  {
    q: 'Can I add my own keywords?',
    a: 'Not via the public UI yet. For custom keywords or private datasets, contact us about an enterprise plan.',
  },
  {
    q: 'How do I report bad or missing data?',
    a: 'Email hello@developer312.com with the keyword slug and a description of the issue. We investigate and re-poll the source if needed.',
  },
  {
    q: 'Is the site GDPR-compliant?',
    a: 'Yes. We do not set non-essential cookies without your consent. Our cookie banner records your choice in localStorage. See our Privacy Policy for details.',
  },
  {
    q: 'Do you have an SLA?',
    a: 'SLA is available on enterprise plans. The free tier is provided as-is during MVP.',
  },
  {
    q: 'Who operates LeanForge?',
    a: 'LeanForge is operated by Developer312, a subsidiary of NIGHT LITE USA LLC. Contact: hello@developer312.com.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <Seo
        title="FAQ"
        description="Frequently asked questions about LeanForge Keyword Trend Index: data sources, API, pricing, privacy, and more."
        path="/faq"
        jsonLd={{
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />
      <Breadcrumbs items={[{ label: 'FAQ' }]} />
      <PageContainer>
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            Quick answers about LeanForge, the data, and how to use it.
          </p>
        </section>

        <section className="max-w-3xl mx-auto space-y-2">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="glass-card">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left"
                >
                  <span className="text-sm font-semibold">{f.q}</span>
                  <span
                    aria-hidden
                    className={`shrink-0 text-white/40 transition-transform ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-white/60 leading-relaxed">{f.a}</div>
                )}
              </div>
            );
          })}
        </section>

        <section className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xl font-bold">Still have questions?</h2>
          <p className="text-white/50 text-sm">
            Visit our{' '}
            <Link to="/help-center" className="text-cyan-400 hover:underline">
              Help Center
            </Link>{' '}
            or{' '}
            <Link to="/contact" className="text-cyan-400 hover:underline">
              contact our team
            </Link>
            .
          </p>
        </section>
      </PageContainer>
    </>
  );
}
