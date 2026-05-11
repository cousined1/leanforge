import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import {
  BookOpen,
  Code2,
  Settings,
  CreditCard,
  HelpCircle,
  Mail,
} from 'lucide-react';

export const metadata: Metadata = buildMetadata({
  title: 'Help Center',
  description: 'Find answers and get support for LeanForge. Browse guides, API documentation, and contact options.',
  path: '/help-center',
});

const helpCategories = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Learn how to use LeanForge to discover trending keywords and track interest over time.',
    links: [
      { label: 'Browse Keywords', href: '/keywords' },
      { label: 'Explore Categories', href: '/categories' },
      { label: 'View Features', href: '/features' },
    ],
  },
  {
    icon: Code2,
    title: 'API Usage',
    description: 'Integrate keyword trend data into your applications with our RESTful API.',
    links: [
      { label: 'API Documentation', href: '/api-docs' },
      { label: 'View Pricing', href: '/pricing' },
    ],
  },
  {
    icon: Settings,
    title: 'Account & Settings',
    description: 'Manage your account, plan, and preferences.',
    links: [
      { label: 'Sign In', href: '/sign-in' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Billing',
    description: 'Questions about plans, invoices, or cancellations.',
    links: [
      { label: 'View Pricing', href: '/pricing' },
      { label: 'Contact Support', href: '/contact' },
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Help Center' }]} />
      <JsonLd data={breadcrumbLd([
        { name: 'Home', url: absoluteUrl('/') },
        { name: 'Help Center', url: absoluteUrl('/help-center') },
      ])} />
      <section className="border-b py-12">
        <div className="container max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers, learn how to use LeanForge, and get in touch with our team.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpCategories.map((cat) => (
              <div key={cat.title} className="card p-6">
                <cat.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">{cat.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
                <ul className="space-y-2">
                  {cat.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-primary hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-8 border-t">
        <div className="container max-w-2xl text-center">
          <h2 className="text-lg font-bold mb-2">Still need help?</h2>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact" className="btn-outline px-4 py-2 text-sm inline-flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Support
            </Link>
            <Link href="/faq" className="btn-outline px-4 py-2 text-sm inline-flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Read FAQ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}