import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl, businessConfig } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description:
    'Get in touch with the LeanForge team. Email us at hello@developer312.com or call (510) 401-1225.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Contact', url: absoluteUrl('/contact') },
        ])}
      />
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-3xl">
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'ContactPage',
              url: 'https://lean-forge.net/contact',
              name: 'Contact LeanForge',
              description:
                'Get in touch with the LeanForge team. Email or call us.',
              mainEntity: {
                '@type': 'Organization',
                name: businessConfig.name,
                legalName: businessConfig.legalName,
                email: businessConfig.email,
                telephone: businessConfig.phoneHref.replace('tel:', ''),
              },
            }}
          />
          <div className="space-y-8">
            <p className="text-lg text-muted-foreground">
              Have a question, feedback, or need help with the LeanForge Keyword
              Trend Index? We respond within 1-2 business days.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h2 className="font-semibold text-lg mb-3">Email</h2>
                <a
                  href={`mailto:${businessConfig.email}`}
                  className="text-primary hover:underline text-lg"
                >
                  {businessConfig.email}
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Best for detailed questions, partnership inquiries, and feedback.
                </p>
              </div>
              <div className="card p-6">
                <h2 className="font-semibold text-lg mb-3">Phone</h2>
                <a
                  href={businessConfig.phoneHref}
                  className="text-primary hover:underline text-lg"
                >
                  {businessConfig.phone}
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Available during US business hours (Pacific).
                </p>
              </div>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-3">Business Information</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="font-medium min-w-32">Operated by:</dt>
                  <dd>{businessConfig.name}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium min-w-32">Legal entity:</dt>
                  <dd>{businessConfig.legalName}</dd>
                </div>
              </dl>
            </div>
            <div className="pt-6 border-t">
              <Link href="/about" className="text-primary hover:underline text-sm">
                Learn more about us →
              </Link>
              {' · '}
              <Link href="/faq" className="text-primary hover:underline text-sm">
                Read FAQ →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
