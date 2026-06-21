import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';

interface Article {
  title: string;
  description: string;
  href: string;
}

const articles: Article[] = [
  {
    title: 'Getting started with LeanForge',
    description: 'A 5-minute tour of the home page, categories, and keyword cards.',
    href: '/',
  },
  {
    title: 'Reading the trend score',
    description: 'What the 0-100 composite score means and how to use it.',
    href: '/features',
  },
  {
    title: 'Using the API',
    description: 'How to fetch trending keywords, get a single keyword, and paginate.',
    href: '/api-docs',
  },
  {
    title: 'Understanding velocity',
    description: 'Rising vs falling vs flat, 7-day vs 30-day, and what to trust.',
    href: '/features',
  },
  {
    title: 'Pricing & plans',
    description: 'Free tier, Regent partner offer, and enterprise plans.',
    href: '/pricing',
  },
  {
    title: 'Privacy & cookies',
    description: 'What we store, what we do not, and how to control cookies.',
    href: '/privacy',
  },
];

export default function HelpCenter() {
  return (
    <>
      <Seo
        title="Help Center"
        description="LeanForge help center — articles, guides, and answers about the platform, the data, and the API."
        path="/help-center"
      />
      <Breadcrumbs items={[{ label: 'Help Center' }]} />
      <PageContainer>
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Help <span className="gradient-text">Center</span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            Guides and answers to help you get the most out of LeanForge.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 max-w-4xl mx-auto">
          {articles.map((a) => (
            <Link
              key={a.title}
              to={a.href}
              className="glass-card-hover p-5 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <h2 className="text-sm font-bold">{a.title}</h2>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">{a.description}</p>
              <span className="text-xs text-cyan-400 mt-3 inline-block">Read more →</span>
            </Link>
          ))}
        </section>

        <section className="text-center space-y-3">
          <h2 className="text-xl font-bold">Need a human?</h2>
          <p className="text-white/50 text-sm">
            Email{' '}
            <a href="mailto:hello@developer312.com" className="text-cyan-400 hover:underline">
              hello@developer312.com
            </a>{' '}
            or use the{' '}
            <Link to="/contact" className="text-cyan-400 hover:underline">
              contact form
            </Link>
            .
          </p>
        </section>
      </PageContainer>
    </>
  );
}
