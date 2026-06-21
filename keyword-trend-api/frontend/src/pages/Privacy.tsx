import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';
import { COMPANY_LEGAL_NAME, COMPANY_NAME, CONTACT_EMAIL } from '../lib/site';

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description="LeanForge privacy policy: what we collect, what we do not, how to contact us, and your rights under GDPR."
        path="/privacy"
      />
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      <PageContainer>
        <section className="max-w-3xl mx-auto space-y-6 text-sm text-white/70 leading-relaxed">
          <header className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-white/40">Last updated: January 2026</p>
          </header>

          <p>
            <strong className="text-white">{COMPANY_NAME}</strong> ({COMPANY_LEGAL_NAME})
            operates lean-forge.net (the "Service"). This page informs you of our policies
            regarding the collection, use, and disclosure of personal data.
          </p>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">What we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Essential cookies</strong> — a single
                cookie-consent flag stored in localStorage and as a first-party cookie. It
                records your Accept/Decline choice. No personal data.
              </li>
              <li>
                <strong className="text-white">Server logs</strong> — IP address, user
                agent, request path, response code, and timing. Used for security, abuse
                detection, and aggregate performance analysis. Retained for 30 days.
              </li>
              <li>
                <strong className="text-white">API requests</strong> — your IP, the
                endpoint hit, and response code. Used for rate limiting and abuse
                detection. Not linked to your identity unless you sign in.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">What we do not collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>No advertising trackers, no third-party analytics by default.</li>
              <li>No browsing history, no fingerprinting, no cross-site tracking.</li>
              <li>
                No personal data unless you explicitly create an account via the sign-in
                flow.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Your rights (GDPR / CCPA)</h2>
            <p>
              You have the right to access, correct, delete, or export any personal data we
              hold about you. To exercise any of these rights, email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              . We respond within 30 days.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Data retention</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Server logs: 30 days.</li>
              <li>API rate-limit counters: 15 minutes sliding window.</li>
              <li>Account data (if you sign in): until you delete your account.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Third parties</h2>
            <p>
              We use the following processors to operate the Service. Each is bound by a
              data processing agreement:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white">Railway</strong> — application hosting
                (Frankfurt region).
              </li>
              <li>
                <strong className="text-white">Neon</strong> — managed PostgreSQL
                (US-east).
              </li>
              <li>
                <strong className="text-white">Upstash</strong> — managed Redis
                (US-east).
              </li>
              <li>
                <strong className="text-white">InsForge</strong> — authentication, only
                invoked if you sign in.
              </li>
              <li>
                <strong className="text-white">Cloudflare</strong> — DNS, edge cache, and
                DDoS protection.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Changes to this policy</h2>
            <p>
              We may update this policy. The "Last updated" date at the top will reflect
              the change. Material changes will be announced via the site banner.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Contact</h2>
            <p>
              For any privacy-related question:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </section>
      </PageContainer>
    </>
  );
}
