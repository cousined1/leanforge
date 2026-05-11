'use client';

import Link from 'next/link';
import { Code } from 'lucide-react';

export function ApiDocsContent() {
  return (
    <div>
      <section className="border-b py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
          <p className="text-muted-foreground">
            Build with the LeanForge Keyword Trend API
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <p className="text-muted-foreground mb-4">
              The LeanForge API allows you to programmatically access keyword trends, scores, and historical data.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-4 font-mono text-sm overflow-x-auto">
              {`BASE URL: ${process.env.NEXT_PUBLIC_API_URL || 'https://api.keywordtrendindex.com/api/v1'}`}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <Code className="w-6 h-6 mb-3 text-primary" />
              <h3 className="font-bold mb-2">15 Endpoints</h3>
              <p className="text-sm text-muted-foreground">
                Keywords, trends, categories, and more
              </p>
            </div>
            <div className="card p-6">
              <Code className="w-6 h-6 mb-3 text-primary" />
              <h3 className="font-bold mb-2">Rate Limiting</h3>
              <p className="text-sm text-muted-foreground">
                100 requests per 15 minutes (free tier)
              </p>
            </div>
            <div className="card p-6">
              <Code className="w-6 h-6 mb-3 text-primary" />
              <h3 className="font-bold mb-2">JSON Responses</h3>
              <p className="text-sm text-muted-foreground">
                Standard REST API with predictable responses
              </p>
            </div>
            <div className="card p-6">
              <Code className="w-6 h-6 mb-3 text-primary" />
              <h3 className="font-bold mb-2">TypeScript Support</h3>
              <p className="text-sm text-muted-foreground">
                Full type definitions included
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Key Endpoints</h2>

            <div className="space-y-4">
              {[
                {
                  method: 'GET',
                  path: '/keywords',
                  description: 'List all keywords with pagination',
                },
                {
                  method: 'GET',
                  path: '/keywords/trending',
                  description: 'Get trending keywords (rising direction)',
                },
                {
                  method: 'GET',
                  path: '/keywords/:slug',
                  description: 'Get single keyword with trends and snapshots',
                },
                {
                  method: 'POST',
                  path: '/keywords',
                  description: 'Create new keyword',
                },
                {
                  method: 'GET',
                  path: '/trends',
                  description: 'List trends by category/direction',
                },
                {
                  method: 'GET',
                  path: '/trends/compare',
                  description: 'Compare 2-5 keywords',
                },
                {
                  method: 'GET',
                  path: '/trends/:keywordId/timeline',
                  description: 'Get 90-day trend timeline',
                },
                {
                  method: 'GET',
                  path: '/categories',
                  description: 'List all categories',
                },
              ].map((endpoint, i) => (
                <div key={i} className="card p-4 border-l-4 border-primary">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-primary/10 text-primary">
                          {endpoint.method}
                        </span>
                        <code className="font-mono text-sm">{endpoint.path}</code>
                      </div>
                      <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Example Request</h2>
            <div className="card p-4 bg-muted">
              <pre className="font-mono text-sm overflow-x-auto">{`// Get trending keywords
const response = await fetch('${
  process.env.NEXT_PUBLIC_API_URL || 'https://api.keywordtrendindex.com/api/v1'
}/keywords/trending?limit=10');
const data = await response.json();
console.log(data);`}</pre>
            </div>
          </div>

          <div className="card p-8 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <h3 className="text-xl font-bold mb-2">Ready to integrate?</h3>
            <p className="text-muted-foreground mb-4">
              Check out the full API documentation for complete specifications, authentication, and pricing.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="https://github.com/leanforge/keyword-trend-api"
                className="btn-primary px-6 py-3 inline-block"
              >
                View Full Documentation
              </Link>
              <Link href="/pricing" className="text-primary hover:underline font-medium">
                View Pricing →
              </Link>
              <Link href="/help-center" className="text-primary hover:underline font-medium">
                Need help? Visit Help Center →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
