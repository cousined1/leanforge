import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BillingStatusCard } from '@/components/BillingStatusCard';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Subscription Active',
  description: 'Your LeanForge subscription is active.',
  path: '/billing/success',
  noindex: true,
});

export default function BillingSuccessPage() {
  return (
    <div>
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Subscription</h1>
          <p className="text-muted-foreground">Welcome aboard.</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-md">
          <Suspense
            fallback={
              <div className="card p-8 text-sm text-muted-foreground text-center">
                Loading subscription status...
              </div>
            }
          >
            <BillingStatusCard />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
