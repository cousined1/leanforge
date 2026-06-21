import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';
import { COMPANY_LEGAL_NAME, COMPANY_NAME, CONTACT_EMAIL } from '../lib/site';

export default function Terms() {
  return (
    <>
      <Seo
        title="Terms of Service"
        description="LeanForge terms of service: acceptable use, no warranty, limitation of liability, and governing law."
        path="/terms"
      />
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
      <PageContainer>
        <section className="max-w-3xl mx-auto space-y-6 text-sm text-white/70 leading-relaxed">
          <header className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
            <p className="text-xs text-white/40">Last updated: January 2026</p>
          </header>

          <p>
            By accessing lean-forge.net (the "Service") operated by{' '}
            <strong className="text-white">{COMPANY_NAME}</strong> ({COMPANY_LEGAL_NAME}),
            you agree to be bound by these Terms of Service ("Terms"). If you disagree with
            any part, you may not use the Service.
          </p>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Acceptable use</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Do not abuse the API (respect rate limits; no scraping beyond fair use).</li>
              <li>Do not attempt to disrupt or compromise the Service.</li>
              <li>Do not use the Service to violate any law or third-party right.</li>
              <li>Do not redistribute the data as a competing product.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. The data is informational</h2>
            <p>
              Keyword scores, velocity, and direction are computed from third-party sources
              (Google Trends, Serper.dev) and are provided for informational purposes only.
              Results are not guaranteed. You are responsible for any decision you make
              based on the data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. No warranty</h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any
              kind, express or implied, including but not limited to warranties of
              merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, {COMPANY_LEGAL_NAME} and its
              affiliates shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits or revenues,
              whether incurred directly or indirectly, or any loss of data, use, or
              goodwill, resulting from your use of the Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Changes</h2>
            <p>
              We may modify or discontinue the Service at any time, with or without
              notice. We may update these Terms; the "Last updated" date will reflect the
              change.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">6. Governing law</h2>
            <p>
              These Terms are governed by the laws of the State of California, USA,
              without regard to conflict of law principles.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">7. Contact</h2>
            <p>
              Questions about these Terms? Email{' '}
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
