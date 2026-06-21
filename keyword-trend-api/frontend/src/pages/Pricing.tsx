import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';
import { REGENT_PARTNER_URL } from '../lib/site';

interface Tier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Browse trending keywords and category insights at no cost during MVP.',
    features: [
      'Keyword trend browsing',
      'Category and direction filters',
      'Public API endpoints',
      'No credit card required',
    ],
    cta: 'Browse Keywords',
    ctaHref: '/',
    highlighted: true,
  },
  {
    name: 'Regent Partner',
    price: 'From $29',
    period: '/month',
    description: 'Need on-page optimization? Use our partner product for guided content actions.',
    features: [
      'SEO optimization score',
      'Actionable content recommendations',
      'Built for execution after keyword discovery',
      'Separate account and billing',
    ],
    cta: 'Try SEO AI Regent',
    ctaHref: REGENT_PARTNER_URL,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Planning private datasets, custom SLAs, or dedicated support?',
    features: [
      'Custom integrations',
      'Private data feeds',
      'Roadmap collaboration',
      'Commercial support',
    ],
    cta: 'Contact Us',
    ctaHref: '/contact',
  },
];

export default function Pricing() {
  return (
    <>
      <Seo
        title="Pricing"
        description="LeanForge pricing — free tier for browsing trends, Regent partner offer for on-page optimization, and enterprise plans for custom needs."
        path="/pricing"
        jsonLd={{
          '@type': 'WebPage',
          name: 'Pricing',
          description: 'Simple, transparent pricing for LeanForge.',
        }}
      />
      <Breadcrumbs items={[{ label: 'Pricing' }]} />
      <PageContainer>
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            LeanForge is free during MVP. Paid partner options are clearly labeled.
          </p>
        </section>

        <section>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`glass-card p-6 flex flex-col ${
                  tier.highlighted ? 'border-cyan-500/40 ring-1 ring-cyan-500/20' : ''
                }`}
              >
                {tier.highlighted && (
                  <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mb-2">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold">{tier.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-white/40 text-sm">{tier.period}</span>}
                </div>
                <p className="text-xs text-white/50 mb-6">{tier.description}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="text-xs text-white/60 flex items-center gap-2">
                      <span className="text-cyan-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {tier.ctaHref.startsWith('http') ? (
                  <a
                    href={tier.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={tier.highlighted ? 'btn-primary justify-center' : 'btn-outline justify-center'}
                  >
                    {tier.cta}
                  </a>
                ) : (
                  <Link
                    to={tier.ctaHref}
                    className={tier.highlighted ? 'btn-primary justify-center' : 'btn-outline justify-center'}
                  >
                    {tier.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl font-bold">Questions about pricing?</h2>
          <p className="text-white/50 text-sm">
            Check our{' '}
            <Link to="/faq" className="text-cyan-400 hover:underline">
              FAQ
            </Link>{' '}
            for answers to common questions, or{' '}
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
