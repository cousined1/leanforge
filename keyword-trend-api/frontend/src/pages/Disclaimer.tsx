import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';

export default function Disclaimer() {
  return (
    <>
      <Seo
        title="Disclaimer"
        description="LeanForge disclaimer: data is informational, not financial or professional advice. Use at your own discretion."
        path="/disclaimer"
      />
      <Breadcrumbs items={[{ label: 'Disclaimer' }]} />
      <PageContainer>
        <section className="max-w-3xl mx-auto space-y-6 text-sm text-white/70 leading-relaxed">
          <header className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Disclaimer</h1>
            <p className="text-xs text-white/40">Last updated: January 2026</p>
          </header>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Informational only</h2>
            <p>
              The keyword trend scores, velocity metrics, search volume estimates, and
              related data on lean-forge.net are computed from third-party sources and
              provided for informational purposes only. They do not constitute financial,
              investment, legal, or professional advice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">No guarantee of accuracy</h2>
            <p>
              We do our best to keep the data accurate and up to date, but we cannot
              guarantee that scores, trends, or volumes are correct at any given moment.
              Sources can change, data can be stale, and the scoring algorithm evolves.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Third-party data</h2>
            <p>
              Interest and velocity data originate from Google Trends. Search volume, CPC,
              and difficulty originate from Serper.dev. Both are subject to their respective
              terms of service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Your responsibility</h2>
            <p>
              You are responsible for any decision you make based on the data. Always
              cross-check with your own research and your SEO tooling before acting on a
              trend.
            </p>
          </section>
        </section>
      </PageContainer>
    </>
  );
}
