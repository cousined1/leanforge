import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';
import { REGENT_PARTNER_URL } from '../lib/site';
import { useAuth } from '../components/AuthProvider';
import { STRIPE_PRICE_IDS, startSubscriptionCheckout } from '../lib/insforge';

interface Tier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  plan?: 'starter' | 'growth'; // present => paid tier (Stripe checkout)
  cta: string;
  ctaHref?: string; // present => link tier (no checkout)
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Browse trending keywords and use every free SEO tool at no cost.',
    features: [
      'Keyword trend browsing',
      'Category and direction filters',
      'All free SEO tools',
      'No credit card required',
    ],
    cta: 'Browse Keywords',
    ctaHref: '/',
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For professionals who need deeper, faster keyword intelligence.',
    features: [
      '1,000 API calls / day',
      '90-day trend history',
      'Category filtering',
      'Email support',
    ],
    plan: 'starter',
    cta: 'Start Starter',
    highlighted: true,
  },
  {
    name: 'Growth',
    price: '$99',
    period: '/month',
    description: 'For teams that need comprehensive keyword intelligence.',
    features: [
      '10,000 API calls / day',
      '365-day trend history',
      'Keyword comparison',
      'Priority support',
    ],
    plan: 'growth',
    cta: 'Start Growth',
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(plan: 'starter' | 'growth') {
    setError(null);
    const priceId = STRIPE_PRICE_IDS[plan];
    if (!priceId) {
      setError('Paid plans are launching soon — check back shortly.');
      return;
    }
    if (!user) {
      navigate('/sign-in');
      return;
    }
    setLoading(plan);
    try {
      await startSubscriptionCheckout({ stripePriceId: priceId, userId: user.id, email: user.email });
    } catch {
      setError('Could not start checkout. Please try again.');
      setLoading(null);
    }
  }

  return (
    <>
      <Seo
        title="Pricing"
        description="LeanForge pricing — a free tier for browsing trends and free SEO tools, plus Starter and Growth plans for deeper keyword intelligence and API access."
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
            Start free. Upgrade for more API calls, longer trend history, and priority support.
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
                {tier.ctaHref ? (
                  <Link
                    to={tier.ctaHref}
                    className={tier.highlighted ? 'btn-primary justify-center' : 'btn-outline justify-center'}
                  >
                    {tier.cta}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubscribe(tier.plan!)}
                    disabled={loading !== null}
                    className={`${tier.highlighted ? 'btn-primary' : 'btn-outline'} justify-center disabled:opacity-50`}
                  >
                    {loading === tier.plan ? 'Redirecting…' : tier.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
          {error && (
            <p className="text-center text-brand-red text-sm mt-4" role="alert">
              {error}
            </p>
          )}
        </section>

        <section className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-white/50 text-sm">
            Need on-page optimization?{' '}
            <a
              href={REGENT_PARTNER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              Try SEO AI Regent
            </a>
            . Custom datasets or SLAs?{' '}
            <Link to="/contact" className="text-cyan-400 hover:underline">
              Contact us
            </Link>
            .
          </p>
          <p className="text-white/40 text-xs">
            Questions? See the{' '}
            <Link to="/faq" className="text-cyan-400 hover:underline">
              FAQ
            </Link>
            .
          </p>
        </section>
      </PageContainer>
    </>
  );
}
