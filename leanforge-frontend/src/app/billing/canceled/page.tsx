import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Checkout Canceled',
  description: 'You canceled the checkout. No charge was made.',
  path: '/billing/canceled',
  noindex: true,
});

export default function BillingCanceledPage() {
  return (
    <div>
      <section className="border-b py-12">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Checkout canceled</h1>
          <p className="text-muted-foreground">No charge was made.</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container max-w-md text-center">
          <p className="text-muted-foreground mb-6">
            You can upgrade anytime — your free plan is still active.
          </p>
          <Link href="/pricing" className="btn-outline px-4 py-2 text-sm">
            View Pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
