import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Disclaimer',
  description:
    'LeanForge Disclaimer — limitations, risks, and the informational nature of our keyword trend data.',
  path: '/disclaimer',
});

export default function DisclaimerPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Disclaimer' }]} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Disclaimer', url: absoluteUrl('/disclaimer') },
        ])}
      />
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Disclaimer</h1>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="prose max-w-none space-y-6 text-sm leading-relaxed">
            <h2 className="text-xl font-bold">Informational Purpose Only</h2>
            <p>
              The LeanForge Keyword Trend Index provides keyword trend data, trend
              scores (0-100), velocity indicators, direction labels (rising, falling,
              flat), search volume estimates, difficulty estimates, and related
              informational content (&quot;the Data&quot;). The Data is provided for
              informational and educational purposes only.
            </p>

            <h2 className="text-xl font-bold">No Guarantees</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>SEO outcomes are not guaranteed.</strong> Search engine
                rankings depend on hundreds of factors including content quality,
                backlinks, technical SEO, domain authority, algorithm updates, and
                competition. A high trend score or rising direction does not guarantee
                that you will rank for a keyword.
              </li>
              <li>
                <strong>Data accuracy is not guaranteed.</strong> Trend data is
                sourced from Google Trends and related public sources. Search volume
                estimates are approximations. CPC estimates are samples. Actual
                values may differ from what is displayed.
              </li>
              <li>
                <strong>Trends change.</strong> A keyword trending upward today may
                reverse tomorrow. Past trend data does not predict future performance.
              </li>
              <li>
                <strong>Not financial or business advice.</strong> Nothing on this
                site constitutes professional advice of any kind. Do not make
                business, marketing, or investment decisions based solely on the Data.
                Consult qualified professionals.
              </li>
            </ul>

            <h2 className="text-xl font-bold">Third-Party Data</h2>
            <p>
              The Data incorporates information from third-party sources including
              Google Trends. We do not control, endorse, or guarantee the accuracy of
              third-party data. Third-party terms of service and privacy policies may
              apply to those sources independently.
            </p>

            <h2 className="text-xl font-bold">No Affiliation</h2>
            <p>
              LeanForge is not affiliated with, endorsed by, or sponsored by Google
              LLC. Google Trends is a trademark of Google LLC.
            </p>

            <h2 className="text-xl font-bold">Use at Your Own Risk</h2>
            <p>
              You assume full responsibility for any decisions or actions you take
              based on the Data. We are not liable for any losses, damages, or missed
              opportunities resulting from your reliance on the Data.
            </p>

            <h2 className="text-xl font-bold">Earnings and Results</h2>
            <p>
              We do not make earnings claims or promise specific SEO results.
              SEO performance varies widely across industries, locations, keywords,
              and time periods. Any testimonials or case studies, if added in the
              future, reflect individual experiences and are not typical or
              guaranteed.
            </p>

            <h2 className="text-xl font-bold">Updates</h2>
            <p>
              This disclaimer may be updated at any time. Changes are effective
              immediately upon posting.
            </p>

            <div className="flex gap-4 pt-4">
              <Link href="/" className="text-sm text-primary hover:underline">
                ← Back to Home
              </Link>
              <Link href="/terms" className="text-sm text-primary hover:underline">
                Terms of Service →
              </Link>
              <Link href="/privacy" className="text-sm text-primary hover:underline">
                Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
