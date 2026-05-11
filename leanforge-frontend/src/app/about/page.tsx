import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, organizationLd, breadcrumbLd } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'LeanForge delivers real-time keyword trend intelligence for SEO professionals. Operated by Developer312.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'About' }]} />
      <JsonLd data={breadcrumbLd([
        { name: 'Home', url: absoluteUrl('/') },
        { name: 'About', url: absoluteUrl('/about') },
      ])} />
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">About LeanForge</h1>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-3xl">
          <JsonLd data={organizationLd()} />
          <div className="prose max-w-none space-y-6">
            <p>
              LeanForge is a keyword intelligence platform that helps SEO professionals
              track, analyze, and act on keyword trends in real time. We combine Google
              Trends data with search volume estimates to surface the keywords gaining
              momentum across SEO, AI, SaaS, developer tools, security, and carbon/ESG
              categories.
            </p>
            <h2 className="text-xl font-bold mt-8">What We Offer</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Daily-refreshed trend data across 80+ keywords and 6 categories.</li>
              <li>Velocity tracking, trend scoring, and directional indicators.</li>
              <li>A public REST API for programmatic access to keyword intelligence.</li>
              <li>Free tier access with no account required.</li>
            </ul>
            <h2 className="text-xl font-bold mt-8">Who We Are</h2>
            <p>
              LeanForge is operated by Developer312, a subsidiary of NIGHT LITE USA LLC.
              We build tools for developers and SEOs who need data-driven insight without
              the enterprise price tag.
            </p>
            <p>
              Questions? Reach us at{' '}
              <a href="mailto:hello@developer312.com" className="text-primary underline">
                hello@developer312.com
              </a>
              {' '}or{' '}
              <a href="tel:+15104011225" className="text-primary underline">
                (510) 401-1225
              </a>.
            </p>
            <div className="mt-8 pt-6 border-t flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary px-4 py-2 text-sm">
                Contact Us
              </Link>
              <Link href="/features" className="btn-outline px-4 py-2 text-sm">
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
