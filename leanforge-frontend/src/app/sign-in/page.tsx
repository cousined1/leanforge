import type { Metadata } from 'next';
import { Suspense } from 'react';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SignInPanel } from '@/components/SignInPanel';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Sign In',
  description: 'Sign in to LeanForge with Google or Apple social login.',
  path: '/sign-in',
});

export default function SignInPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Sign In' }]} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Sign In', url: absoluteUrl('/sign-in') },
        ])}
      />
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Sign in</h1>
          <p className="text-muted-foreground">
            Access LeanForge with a configured social identity provider.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-md">
          <Suspense
            fallback={<div className="card p-8 text-sm text-muted-foreground">Loading sign-in...</div>}
          >
            <SignInPanel />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
