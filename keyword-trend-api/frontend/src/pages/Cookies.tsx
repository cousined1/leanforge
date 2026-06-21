import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';

export default function Cookies() {
  return (
    <>
      <Seo
        title="Cookie Policy"
        description="LeanForge uses one essential cookie for consent. We do not set advertising or analytics cookies without your consent."
        path="/cookies"
      />
      <Breadcrumbs items={[{ label: 'Cookie Policy' }]} />
      <PageContainer>
        <section className="max-w-3xl mx-auto space-y-6 text-sm text-white/70 leading-relaxed">
          <header className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Cookie Policy</h1>
            <p className="text-xs text-white/40">Last updated: January 2026</p>
          </header>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">The short version</h2>
            <p>
              We use exactly one first-party cookie: <code className="text-xs font-mono">cookie-consent</code>.
              It records your Accept/Decline choice so we don't show the banner again. No
              personal data, no tracking, no advertising.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">What we do not use</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>No Google Analytics or other third-party analytics by default.</li>
              <li>No Facebook Pixel, no ad network cookies.</li>
              <li>No cross-site tracking, no fingerprinting.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Change your mind</h2>
            <p>
              You can clear the <code className="text-xs font-mono">cookie-consent</code>{' '}
              cookie (or localStorage entry) at any time. The banner will reappear on your
              next visit so you can re-choose.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Browser controls</h2>
            <p>
              You can also block or delete cookies in your browser settings. Blocking the
              consent cookie will cause the banner to reappear on every visit but will not
              affect core functionality of the site.
            </p>
          </section>
        </section>
      </PageContainer>
    </>
  );
}
