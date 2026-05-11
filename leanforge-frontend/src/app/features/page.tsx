import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import {
  TrendingUp,
  BarChart3,
  Code2,
  Zap,
  Calendar,
  Filter,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = buildMetadata({
  title: 'Features',
  description: 'Discover LeanForge features for keyword trend intelligence: real-time tracking, velocity scoring, category filtering, and a powerful API.',
  path: '/features',
});

const features = [
  {
    icon: TrendingUp,
    title: 'Trend Tracking',
    description: 'Monitor keyword interest trends over time with data refreshed every 6 hours from Google Trends.',
  },
  {
    icon: BarChart3,
    title: 'Velocity Scoring',
    description: 'Get composite 0-100 trend scores combining velocity, interest, volume, and direction consistency.',
  },
  {
    icon: Code2,
    title: 'RESTful API',
    description: 'Access keyword intelligence programmatically with a clean JSON API. TypeScript types included.',
  },
  {
    icon: Zap,
    title: 'Direction Indicators',
    description: 'Instantly see which keywords are rising, falling, or flat with 7-day and 30-day velocity metrics.',
  },
  {
    icon: Calendar,
    title: 'Daily Snapshots',
    description: 'Historical snapshots with 7-day and 30-day velocity comparisons for every tracked keyword.',
  },
  {
    icon: Filter,
    title: 'Category Filtering',
    description: 'Browse keywords across SEO, AI, SaaS, DevTools, Security, and Carbon categories.',
  },
];

export default function FeaturesPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Features' }]} />
      <JsonLd data={breadcrumbLd([
        { name: 'Home', url: absoluteUrl('/') },
        { name: 'Features', url: absoluteUrl('/features') },
      ])} />
      <section className="border-b py-12">
        <div className="container max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4">Powerful Keyword Intelligence</h1>
          <p className="text-muted-foreground">
            Everything you need to discover, track, and act on keyword trends before your competitors.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6">
                <feature.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 border-t">
        <div className="container max-w-2xl text-center">
          <h2 className="text-xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Start with the free tier or explore our pricing plans.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/pricing" className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">
              View Pricing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/sign-in" className="btn-outline px-4 py-2 text-sm">Get Started Free</Link>
            <Link href="/api-docs" className="btn-outline px-4 py-2 text-sm">Read the API Docs</Link>
          </div>
        </div>
      </section>
    </div>
  );
}