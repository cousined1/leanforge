import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { Check } from 'lucide-react';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing',
  description: 'Choose the LeanForge plan that fits your keyword intelligence needs. Free tier available with 100 API calls per day.',
  path: '/pricing',
});

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Get started with basic keyword trend data.',
    features: [
      '100 API calls per day',
      '7-day trend history',
      'Basic keyword search',
      'Community support',
    ],
    cta: 'Get Started',
    ctaHref: '/sign-in',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For professionals who need deeper insights.',
    features: [
      '1,000 API calls per day',
      '90-day trend history',
      'Category filtering',
      'Email support',
    ],
    cta: 'Start Free Trial',
    ctaHref: 'https://seo-ai-regent.com/?ref=keyword-trend-api',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$99',
    period: '/month',
    description: 'For teams that need comprehensive keyword intelligence.',
    features: [
      '10,000 API calls per day',
      '365-day trend history',
      'Keyword comparison',
      'Leaderboard access',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    ctaHref: 'https://seo-ai-regent.com/?ref=keyword-trend-api',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced requirements.',
    features: [
      'Unlimited API calls',
      'Custom history retention',
      'White-label options',
      'SLA guarantees',
      'Dedicated support',
    ],
    cta: 'Contact Us',
    ctaHref: '/contact',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Pricing' }]} />
      <JsonLd data={breadcrumbLd([
        { name: 'Home', url: absoluteUrl('/') },
        { name: 'Pricing', url: absoluteUrl('/pricing') },
      ])} />
      <section className="border-b py-12">
        <div className="container max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground">
            Start free and scale as your keyword intelligence needs grow.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`card p-6 flex flex-col ${tier.highlighted ? 'ring-2 ring-primary' : ''}`}
              >
                <h3 className="font-bold text-lg">{tier.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {tier.ctaHref.startsWith('/') ? (
                  <Link href={tier.ctaHref} className={`btn ${tier.highlighted ? 'btn-primary' : 'btn-outline'} w-full text-center`}>
                    {tier.cta}
                  </Link>
                ) : (
                  <a href={tier.ctaHref} className={`btn ${tier.highlighted ? 'btn-primary' : 'btn-outline'} w-full text-center`} target="_blank" rel="noopener noreferrer">
                    {tier.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 border-t">
        <div className="container max-w-2xl text-center">
          <h2 className="text-xl font-bold mb-4">Questions about pricing?</h2>
          <p className="text-muted-foreground mb-6">
            Check our <Link href="/faq" className="text-primary hover:underline">FAQ</Link> for answers to common questions,
            or <Link href="/contact" className="text-primary hover:underline">contact our team</Link> for help.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/features" className="btn-outline px-4 py-2 text-sm">Compare Features</Link>
            <Link href="/sign-in" className="btn-primary px-4 py-2 text-sm">Get Started Free</Link>
          </div>
        </div>
      </section>
    </div>
  );
}