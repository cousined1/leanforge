import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl, businessConfig } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Cookie Policy',
  description:
    'LeanForge Cookie Policy — how we use cookies and your consent options.',
  path: '/cookies',
});

export default function CookiesPage() {
  const effectiveDate = 'May 2026';
  const email = businessConfig.email;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Cookie Policy' }]} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Cookie Policy', url: absoluteUrl('/cookies') },
        ])}
      />
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective: {effectiveDate}
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="prose max-w-none space-y-6 text-sm leading-relaxed">
            <p>
              This Cookie Policy explains how LeanForge (&quot;we,&quot; &quot;us,&quot;
              or &quot;our&quot;) uses cookies and similar technologies on the
              LeanForge Keyword Trend Index website (&quot;the Service&quot;).
            </p>

            <h2 className="text-xl font-bold">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device by websites you
              visit. They are widely used to make websites work efficiently and to
              provide information to site operators.
            </p>

            <h2 className="text-xl font-bold">2. Cookies Used on This Site</h2>
            <p>
              The Service uses essential consent storage and can load analytics
              cookies only after you accept analytics.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Cookie consent preference</strong> - a first-party browser
                storage value that remembers your cookie consent choice
                (<code>cookie-consent</code>). This is strictly necessary for
                compliance.
              </li>
              <li>
                <strong>Authentication cookies</strong> - if you sign in, InsForge
                may set first-party session or anti-CSRF cookies required to keep you
                securely authenticated and complete OAuth redirects.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> use:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Advertising or targeting cookies by default.</li>
              <li>Analytics cookies before consent.</li>
              <li>Third-party tracking pixels before consent.</li>
              <li>Social media tracking pixels.</li>
            </ul>

            <h2 className="text-xl font-bold">3. Analytics</h2>
            <p>
              If you accept analytics, Google Tag Manager may load measurement tags
              such as Google Analytics 4. The app owns route-change page view
              tracking and pushes page views to <code>dataLayer</code>; GTM/GA4
              enhanced measurement should not also track browser history changes.
            </p>

            <h2 className="text-xl font-bold">4. How to Manage Cookies</h2>
            <p>
              Most browsers allow you to block or delete cookies through their
              settings. You can also manage your consent preference using the cookie
              banner on our site. If you clear your browser storage, you may need to
              re-confirm your preference.
            </p>
            <p>
              <strong>Managing consent:</strong> To change your cookie consent
              preference, clear your browser&apos;s local storage for this site and
              reload the page. The consent banner will reappear.
            </p>

            <h2 className="text-xl font-bold">5. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy if we introduce new cookies or change
              our analytics provider. Changes will be posted on this page with an
              updated effective date.
            </p>

            <h2 className="text-xl font-bold">6. Contact</h2>
            <p>
              For questions about this Cookie Policy, contact us at{' '}
              <a href={`mailto:${email}`} className="text-primary underline">
                {email}
              </a>.
            </p>

            <p className="text-xs text-muted-foreground mt-8 pt-6 border-t">
              <strong>Review note:</strong> This cookie policy is a draft. If
              additional analytics, marketing, or tracking cookies are added to the
              Service, this policy must be updated and the consent banner must be
              reconfigured to include relevant categories.
            </p>

            <div className="flex gap-4 pt-4">
              <Link href="/" className="text-sm text-primary hover:underline">
                ← Back to Home
              </Link>
              <Link href="/privacy" className="text-sm text-primary hover:underline">
                Privacy Policy →
              </Link>
              <Link href="/terms" className="text-sm text-primary hover:underline">
                Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
