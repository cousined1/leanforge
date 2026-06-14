import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { RelatedLinks } from '@/components/RelatedLinks';
import { CtaSection } from '@/components/CtaSection';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import {
  Search,
  BarChart3,
  Code2,
  Users,
  Briefcase,
  Newspaper,
} from 'lucide-react';

export const metadata: Metadata = buildMetadata({
  title: 'Use Cases',
  description:
    'See how SEO professionals, content teams, agencies, and developers use LeanForge keyword trend data to plan and prioritize work.',
  path: '/use-cases',
});

const useCases = [
  {
    icon: Search,
    title: 'SEO professionals',
    summary: 'Spot rising keywords before competitors do.',
    detail:
      'Filter by category and direction to build a weekly shortlist of high-momentum keywords. Pair with the API to feed trends into your existing rank-tracking workflow.',
  },
  {
    icon: Newspaper,
    title: 'Content teams',
    summary: 'Plan editorial calendars around real demand.',
    detail:
      'Use 90-day trend timelines to decide which topics deserve an article this week versus next quarter. See velocity, search volume, and direction in one view.',
  },
  {
    icon: Briefcase,
    title: 'Agencies',
    summary: 'Show clients the trends you found for them.',
    detail:
      'Send clients directly to a keyword detail page as part of your monthly report. They see a clean, branded view of the data without needing a dashboard login.',
  },
  {
    icon: Code2,
    title: 'Developers',
    summary: 'Integrate trend data into your own tools.',
    detail:
      'Use the public REST API to pull keyword trends, categories, and timelines into internal dashboards, Slack bots, or notebooks. JSON responses, TypeScript types included.',
  },
  {
    icon: BarChart3,
    title: 'Analysts',
    summary: 'Compare 2–5 keywords side by side.',
    detail:
      'Use the comparison endpoint to chart interest over time for a shortlist of candidate keywords. Pick the winner based on velocity and consistency, not gut feel.',
  },
  {
    icon: Users,
    title: 'Founders and PMs',
    summary: 'Validate demand before you build.',
    detail:
      'Before committing engineering time to a new feature or topic, check whether the relevant keywords are rising, flat, or falling. LeanForge is the fastest sanity check.',
  },
];

export default function UseCasesPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Use Cases' }]} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Use Cases', url: absoluteUrl('/use-cases') },
        ])}
      />

      <section className="border-b py-12">
        <div className="container max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4">How teams use LeanForge</h1>
          <p className="text-muted-foreground">
            Real-time keyword trend data, useful for SEO, content, product, and
            engineering teams. Pick the workflow that matches your role.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <li key={useCase.title} className="card p-6 h-full">
                <useCase.icon className="w-8 h-8 text-primary mb-3" aria-hidden="true" />
                <h2 className="font-bold text-lg mb-1">{useCase.title}</h2>
                <p className="text-sm font-medium text-foreground/80 mb-2">
                  {useCase.summary}
                </p>
                <p className="text-sm text-muted-foreground">{useCase.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RelatedLinks
        title="Get started"
        description="Pick a starting point based on your role or skip ahead to the data."
        columns={3}
        links={[
          {
            href: '/keywords',
            label: 'Browse all keywords',
            description: 'Filter by category, direction, and search term.',
            icon: Search,
          },
          {
            href: '/features',
            label: 'See all features',
            description: 'Trend tracking, velocity scoring, REST API, and more.',
            icon: BarChart3,
          },
          {
            href: '/api-docs',
            label: 'Read the API docs',
            description: 'Endpoints, examples, and TypeScript types.',
            icon: Code2,
          },
        ]}
      />

      <CtaSection
        title="Not sure where to start?"
        description="Browse a few keywords to see how the data looks, or reach out and we will point you to the workflows other teams use most."
        primary={{ label: 'Browse Keywords', href: '/keywords' }}
        secondary={{ label: 'Contact Us', href: '/contact' }}
        tertiary={{ label: 'Read FAQ', href: '/faq' }}
      />
    </div>
  );
}
