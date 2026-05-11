'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqCategories: Array<{ title: string; items: FaqItem[] }> = [
  {
    title: 'General',
    items: [
      {
        question: 'What is LeanForge?',
        answer: 'LeanForge is a keyword intelligence platform that tracks trending keywords across SEO, AI, SaaS, DevTools, security, and carbon categories. It combines Google Trends data with search volume signals to surface rising keywords before they peak.',
      },
      {
        question: 'How often is the data updated?',
        answer: 'Keyword trends are refreshed every 6 hours. Daily snapshots are generated at midnight UTC with 7-day and 30-day velocity comparisons.',
      },
      {
        question: 'Is there a free tier?',
        answer: 'Yes. The free tier includes 100 API calls per day with 7-day trend history. No account required for the website dashboard.',
      },
      {
        question: 'How many keywords does LeanForge track?',
        answer: 'LeanForge tracks 80+ keywords across 6 categories, with new keywords added regularly based on trend signals.',
      },
    ],
  },
  {
    title: 'API & Technical',
    items: [
      {
        question: 'How do I access the API?',
        answer: 'Visit the API Documentation page for endpoint details, authentication setup, and code examples. The API returns JSON responses with TypeScript type support.',
      },
      {
        question: 'What are the API rate limits?',
        answer: 'Rate limits depend on your plan: Free (100 calls/day), Starter (1,000/day), Growth (10,000/day), Enterprise (unlimited). Rate limit headers are included in every response.',
      },
      {
        question: 'Do you provide TypeScript types?',
        answer: 'Yes. All API responses follow a consistent JSON schema with documented types. See the API documentation for full details.',
      },
    ],
  },
  {
    title: 'Account & Billing',
    items: [
      {
        question: 'How do I sign in?',
        answer: 'Click "Sign in" in the header to authenticate with Google or Apple. Your account determines your API plan and rate limits.',
      },
      {
        question: 'Can I change my plan?',
        answer: 'Yes. Visit the pricing page to compare plans and upgrade or downgrade at any time. Changes take effect immediately.',
      },
      {
        question: 'How do I cancel?',
        answer: 'Contact our support team at hello@developer312.com or visit the Help Center for step-by-step instructions.',
      },
    ],
  },
];

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors rounded-lg"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-medium text-sm">{item.question}</span>
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="px-4 pb-3 text-sm text-muted-foreground">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function FaqContent() {
  return (
    <>
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Find answers to common questions about LeanForge, our API, and keyword intelligence features.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-3xl space-y-8">
          {faqCategories.map((category) => (
            <div key={category.title}>
              <h2 className="text-xl font-bold mb-4">{category.title}</h2>
              <FaqAccordion items={category.items} />
            </div>
          ))}
        </div>
      </section>
      <section className="py-8 border-t">
        <div className="container max-w-3xl text-center">
          <p className="text-muted-foreground">
            Still have questions? <Link href="/contact" className="text-primary hover:underline">Contact our team</Link> or visit the <Link href="/help-center" className="text-primary hover:underline">Help Center</Link>.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            For technical details, see the <Link href="/api-docs" className="text-primary hover:underline">API Documentation</Link>.
          </p>
        </div>
      </section>
    </>
  );
}