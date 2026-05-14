import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl, regentPartnerUrl } from '@/lib/site';
import { Check } from 'lucide-react';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing',
  description: 'LeanForge MVP is currently free. Browse keyword trends now and optionally upgrade your content workflow with our partner tool.',
  path: '/pricing',
});

const tiers = [
  {
    name: 'LeanForge MVP',
    price: '$0',
    period: '/month',
    description: 'Browse keyword trends and category insights at no cost during MVP.',
    features: [
      'Keyword trend browsing',
      'Category and direction filters',
      'Trend timeline views',
      'No credit card required',
    ],
    cta: 'Browse Keywords',
    ctaHref: '/keywords',
    highlighted: true,
  },
  {
    name: 'Regent Partner Offer',
    price: 'From $29',
    period: '/month',
    description: 'Need on-page optimization and guided content actions? Use our partner product.',
    features: [
      'SEO optimization score',
      'Actionable content recommendations',
      'Built for execution after keyword discovery',
      'Separate account and billing',
    ],
    cta: 'Try SEO AI Regent',
    ctaHref: regentPartnerUrl,
    highlighted: false,
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
            LeanForge is free during MVP. Paid partner options are clearly labeled.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Link href="/keywords" className="btn-primary px-4 py-2 text-sm">Browse Free Keywords</Link>
          </div>
        </div>
      </section>
    </div>
  );
}