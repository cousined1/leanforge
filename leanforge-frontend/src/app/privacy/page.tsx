import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl, businessConfig } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description:
    'LeanForge Privacy Policy — how we collect, use, and protect your information.',
  path: '/privacy',
});

export default function PrivacyPage() {
  const effectiveDate = 'May 2026';
  const email = businessConfig.email;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Privacy Policy', url: absoluteUrl('/privacy') },
        ])}
      />
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective: {effectiveDate}
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="prose max-w-none space-y-6 text-sm leading-relaxed">
            <p>
              This Privacy Policy describes how Developer312, a subsidiary of
              NIGHT LITE USA LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
              collects, uses, and protects information when you use the LeanForge
              Keyword Trend Index website and API (&quot;the Service&quot;).
            </p>

            <h2 className="text-xl font-bold">1. Information We Collect</h2>
            <p>We collect minimal information to provide and improve the Service:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Usage data:</strong> If you accept analytics cookies, we may
                use Google Tag Manager to load measurement tags such as Google
                Analytics 4. These tools can collect page views, route changes,
                events, browser metadata, approximate location, and referral
                information.
              </li>
              <li>
                <strong>Server logs:</strong> Our hosting infrastructure may
                temporarily log request metadata (URL, timestamp, status code) for
                operational monitoring. These logs are not used for user profiling
                and are rotated regularly.
              </li>
              <li>
                <strong>Voluntary contact:</strong> If you email us at{' '}
                <a href={`mailto:${email}`} className="text-primary underline">
                  {email}
                </a>
                , we receive whatever information you include in your message.
              </li>
              <li>
                <strong>Account data:</strong> If you sign in with Google or Apple,
                InsForge processes the authentication response and provides us with
                basic account information such as your email address, user ID, role,
                and any profile fields returned by the provider or configured in
                InsForge.
              </li>
            </ul>

            <h2 className="text-xl font-bold">2. How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To operate, maintain, and improve the Service.</li>
              <li>To understand aggregate usage patterns (e.g., popular pages).</li>
              <li>To respond to your inquiries sent via email.</li>
              <li>To authenticate users and provide account-based features.</li>
            </ul>

            <h2 className="text-xl font-bold">3. Cookies</h2>
            <p>
              The Service uses an essential consent preference cookie or browser
              storage value. Google Tag Manager and any analytics tags it manages are
              gated until you accept analytics cookies. Rejecting analytics does not
              affect essential site functionality.
            </p>

            <h2 className="text-xl font-bold">4. Data Sharing</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                We do not sell, trade, or rent personal information to third parties.
              </li>
              <li>
                Google Tag Manager may process analytics events and route-change
                page views after consent. Google Analytics 4 may be configured inside
                GTM for reporting and DebugView verification.
              </li>
              <li>
                InsForge provides authentication infrastructure, including Google and
                Apple social login when enabled in our project configuration.
              </li>
              <li>
                We may disclose information if required by law or to protect our
                rights.
              </li>
            </ul>

            <h2 className="text-xl font-bold">5. Data Retention</h2>
            <p>
              Aggregate analytics data is retained indefinitely for trend analysis.
              Server logs are retained for a limited period (typically 30 days or
              fewer) and then deleted. Email correspondence is retained as needed for
              business purposes.
            </p>

            <h2 className="text-xl font-bold">6. Your Rights</h2>
            <p>
              Depending on your jurisdiction (including the EU/EEA under GDPR and
              California under CCPA), you may have the right to access, correct, or
              delete your personal data, or to object to or restrict processing. To
              exercise these rights, contact us at{' '}
              <a href={`mailto:${email}`} className="text-primary underline">
                {email}
              </a>.
            </p>

            <h2 className="text-xl font-bold">7. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites (e.g., SEO AI
              Regent). We are not responsible for the privacy practices of those
              sites. Review their policies independently.
            </p>

            <h2 className="text-xl font-bold">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes are
              posted on this page with an updated effective date. Continued use of
              the Service after changes constitutes acceptance.
            </p>

            <h2 className="text-xl font-bold">9. Contact</h2>
            <p>
              For privacy-related questions, contact us at{' '}
              <a href={`mailto:${email}`} className="text-primary underline">
                {email}
              </a>
              {' '}or{' '}
              <a href="tel:+15104011225" className="text-primary underline">
                (510) 401-1225
              </a>.
            </p>

            <p className="text-xs text-muted-foreground mt-8 pt-6 border-t">
              <strong>Review note:</strong> This privacy policy is a draft for review.
              If additional processors or analytics services are added to the Service,
              this policy must be updated before use.
            </p>

            <div className="flex gap-4 pt-4">
              <Link href="/" className="text-sm text-primary hover:underline">
                ← Back to Home
              </Link>
              <Link href="/terms" className="text-sm text-primary hover:underline">
                Terms of Service →
              </Link>
              <Link href="/cookies" className="text-sm text-primary hover:underline">
                Cookie Policy →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
