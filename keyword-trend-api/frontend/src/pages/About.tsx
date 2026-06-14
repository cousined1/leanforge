import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';

export default function About() {
  return (
    <>
      <Seo
        title="About"
        description="LeanForge is operated by Developer312, a subsidiary of NIGHT LITE USA LLC. We build keyword intelligence tools for SEO professionals."
        path="/about"
      />
      <Breadcrumbs items={[{ label: 'About' }]} />
      <PageContainer>
        <section className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            About <span className="gradient-text">LeanForge</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            LeanForge is a real-time keyword trend intelligence platform. We help SEO
            professionals, content teams, and growth marketers discover trending keywords
            before their competitors do.
          </p>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            The platform tracks 80+ keywords across 6 categories (SEO, AI, SaaS, Developer
            Tools, Security, Carbon & ESG), surfacing trend scores, velocity, search volume,
            and direction so you can spot opportunities at a glance.
          </p>
        </section>

        <section className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl font-bold">Our mission</h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Make keyword intelligence fast, transparent, and accessible. We surface the data
            that matters — interest, momentum, and direction — without the noise of bloated
            dashboards or paywalled basics.
          </p>
        </section>

        <section className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl font-bold">Who operates it</h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            LeanForge is operated by{' '}
            <strong className="text-white">Developer312</strong>, a subsidiary of{' '}
            <strong className="text-white">NIGHT LITE USA LLC</strong>. Contact:{' '}
            <a href="mailto:hello@developer312.com" className="text-cyan-400 hover:underline">
              hello@developer312.com
            </a>
            .
          </p>
        </section>

        <section className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-xl font-bold">Get started</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/" className="btn-primary text-sm">
              Browse Trending Keywords
            </Link>
            <Link to="/api-docs" className="btn-outline text-sm">
              Read the API Docs
            </Link>
            <Link to="/features" className="btn-outline text-sm">
              See Features
            </Link>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
