// src/components/RegentCTA.tsx
'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function RegentCTA() {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6 md:p-8">
      <div className="max-w-2xl">
        <h3 className="text-xl font-semibold mb-2">Ready to rank for these keywords?</h3>
        <p className="text-muted-foreground mb-4">
          SEO AI Regent analyzes your content against trending keywords and gives you a 0-100 
          optimization score with actionable fixes.
        </p>
        <Link
          href="https://seo-ai-regent.com/?ref=keyword-trend-api"
          className="inline-flex items-center gap-2 btn-primary px-6 py-3"
        >
          Start Free Trial
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
