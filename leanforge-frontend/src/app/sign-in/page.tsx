import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { SignInPanel } from '@/components/SignInPanel';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { routes, preAuthExploreRoutes } from '@/lib/routes';

export const metadata: Metadata = buildMetadata({
  title: 'Sign In',
  description: 'Sign in to LeanForge with Google or Apple social login.',
  path: '/sign-in',
});

export default function SignInPage() {
  return (
    <div>
      {/* Per design rule, no breadcrumb on auth pages. */}
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
            Sign in with Google or Apple to save your progress as new account features roll out.
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

          <nav
            aria-label="Explore without signing in"
            className="mt-8 pt-6 border-t text-sm text-muted-foreground text-center"
          >
            <p className="mb-3">Or explore without an account:</p>
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {preAuthExploreRoutes.map((key) => {
                const route = routes[key];
                return (
                  <li key={key}>
                    <Link
                      href={route.path}
                      className="text-primary hover:underline"
                    >
                      {route.shortLabel || route.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-xs">
              Trouble signing in?{' '}
              <Link href="/help-center" className="text-primary hover:underline">
                Visit the Help Center
              </Link>
              .
            </p>
          </nav>
        </div>
      </section>
    </div>
  );
}
