import { Link } from 'react-router-dom';
import { Seo, webPageLd, breadcrumbLd } from '../../components/Seo';
import { SITE_URL, absoluteUrl } from '../../lib/site';
import { TOOLS } from './toolsConfig';

const TITLE = 'Free SEO Keyword Tools — No Signup Required';
const DESCRIPTION =
  'A free toolkit for keyword research: volume checker, difficulty checker, trend charts, a Google Trends alternative, long-tail finder and more. No account needed.';

export default function ToolsIndex() {
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: TOOLS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.h1,
      url: `${SITE_URL}/tools/${t.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        path="/tools"
        jsonLd={[
          webPageLd(absoluteUrl('/tools'), TITLE, DESCRIPTION),
          breadcrumbLd([
            { name: 'Home', url: SITE_URL },
            { name: 'Free Tools', url: `${SITE_URL}/tools` },
          ]),
          itemListLd,
        ]}
      />

      <header className="space-y-4 max-w-2xl">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-medium">
          ✓ Free forever — no signup
        </span>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text">Free SEO Keyword Tools</h1>
        <p className="text-lg text-white/60">
          A growing toolkit for keyword research — search volume, difficulty, trend charts and
          more. Every tool is free and runs against live LeanForge data. No account required.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map((t) => (
          <Link key={t.slug} to={`/tools/${t.slug}`} className="glass-card-hover p-5 block">
            <h2 className="font-semibold text-lg">{t.h1}</h2>
            <p className="text-sm text-white/50 mt-1">{t.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
