import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl, businessConfig } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description:
    'LeanForge Terms of Service — the rules governing use of the Keyword Trend Index.',
  path: '/terms',
});

export default function TermsPage() {
  const effectiveDate = 'May 2026';
  const email = businessConfig.email;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Terms of Service', url: absoluteUrl('/terms') },
        ])}
      />
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">
            Effective: {effectiveDate}
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="prose max-w-none space-y-6 text-sm leading-relaxed">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of the
              LeanForge Keyword Trend Index website and API (&quot;the Service&quot;),
              operated by Developer312, a subsidiary of NIGHT LITE USA LLC (&quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;). By accessing or using the Service,
              you agree to these Terms.
            </p>

            <h2 className="text-xl font-bold">1. Service Description</h2>
            <p>
              LeanForge provides keyword trend data, trend scores, velocity
              indicators, and related informational content through its website and
              public API. Data is sourced from Google Trends and related public
              sources. The Service is provided on a free-tier basis at launch; paid
              tiers may be introduced in the future.
            </p>

            <h2 className="text-xl font-bold">2. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service for any unlawful purpose.</li>
              <li>
                Attempt to circumvent rate limits, scrape data at excessive volume,
                or degrade the Service for other users.
              </li>
              <li>
                Resell or redistribute raw API data as a competing service without
                written permission.
              </li>
              <li>
                Misrepresent your affiliation with LeanForge, Developer312, or
                NIGHT LITE USA LLC.
              </li>
            </ul>

            <h2 className="text-xl font-bold">3. API Usage</h2>
            <p>
              The public API is subject to rate limits (currently 100 requests per 15
              minutes per IP). We reserve the right to adjust limits, require
              authentication in the future, or block usage that violates these Terms.
            </p>

            <h2 className="text-xl font-bold">4. Accounts and Social Login</h2>
            <p>
              If you sign in with Google, Apple, or another enabled identity
              provider, you are responsible for maintaining control of that provider
              account and for activity that occurs through your LeanForge session.
              We may suspend or revoke account access if we believe the account is
              being used in violation of these Terms or to harm the Service.
            </p>

            <h2 className="text-xl font-bold">5. Intellectual Property</h2>
            <p>
              The LeanForge name, branding, website design, and original content are
              owned by Developer312 / NIGHT LITE USA LLC. Keyword trend data derived
              from public sources is provided for informational use. You retain
              ownership of content you create using data from the Service, subject to
              these Terms.
            </p>

            <h2 className="text-xl font-bold">6. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot;
              without warranties of any kind, express or implied. We do not guarantee
              the accuracy, completeness, or timeliness of any keyword trend data,
              scores, or recommendations. SEO results depend on many factors beyond
              our data. See our{' '}
              <Link href="/disclaimer" className="text-primary underline">
                Disclaimer
              </Link>{' '}
              for details.
            </p>

            <h2 className="text-xl font-bold">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Developer312 and NIGHT LITE USA
              LLC shall not be liable for any indirect, incidental, consequential, or
              punitive damages arising from your use of the Service, including but
              not limited to lost profits, lost data, or business interruption, even
              if advised of the possibility.
            </p>

            <h2 className="text-xl font-bold">8. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Material changes will be noted
              on this page with an updated effective date. Continued use of the
              Service after changes constitutes acceptance of the revised Terms.
            </p>

            <h2 className="text-xl font-bold">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate access to the Service at
              our discretion, without notice, for conduct that violates these Terms or
              is otherwise harmful to us or other users.
            </p>

            <h2 className="text-xl font-bold">10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of California, United
              States, without regard to conflict of law principles.
            </p>

            <h2 className="text-xl font-bold">11. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
              <a href={`mailto:${email}`} className="text-primary underline">
                {email}
              </a>
              {' '}or{' '}
              <a href="tel:+15104011225" className="text-primary underline">
                (510) 401-1225
              </a>.
            </p>

            <p className="text-xs text-muted-foreground mt-8 pt-6 border-t">
              <strong>Review note:</strong> These terms are a draft for review.
              If paid tiers, authentication, or additional services are introduced,
              the terms must be updated before launch.
            </p>

            <div className="flex gap-4 pt-4">
              <Link href="/" className="text-sm text-primary hover:underline">
                ← Back to Home
              </Link>
              <Link href="/privacy" className="text-sm text-primary hover:underline">
                Privacy Policy →
              </Link>
              <Link href="/disclaimer" className="text-sm text-primary hover:underline">
                Disclaimer →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
