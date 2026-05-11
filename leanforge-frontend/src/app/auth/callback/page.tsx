import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCallbackClient } from '@/components/AuthCallbackClient';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Completing Sign In',
  description: 'Complete your LeanForge social login callback.',
  path: '/auth/callback',
});

export default function AuthCallbackPage() {
  return (
    <div>
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Completing sign-in</h1>
          <p className="text-muted-foreground">
            LeanForge is validating your social login redirect.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-md">
          <Suspense
            fallback={<div className="card p-8 text-sm text-muted-foreground">Completing sign-in...</div>}
          >
            <AuthCallbackClient />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
