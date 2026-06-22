import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { PricingTable } from '@/components/PricingTable';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Pricing',
  description:
    'Choose the LeanForge plan that fits your keyword intelligence needs. Start free, scale to Starter or Growth as your API usage grows.',
  path: '/pricing',
});

export default function PricingPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Pricing' }]} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Pricing', url: absoluteUrl('/pricing') },
        ])}
      />
      <section className="border-b py-12">
        <div className="container max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground">
            Start free. Upgrade when you need more API capacity, longer trend history, or team features.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container">
          <PricingTable />
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
