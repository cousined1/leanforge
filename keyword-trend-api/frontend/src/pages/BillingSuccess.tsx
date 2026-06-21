import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { PageContainer } from '../components/Breadcrumbs';
import { useAuth } from '../components/AuthProvider';

export default function BillingSuccess() {
  const { refresh } = useAuth();

  // Re-check the session so any updated entitlement is picked up after the
  // Stripe redirect. Durable plan state comes from InsForge's webhook-backed
  // fulfillment, so this page is a confirmation, not proof of payment.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <>
      <Seo
        title="Subscription activated"
        description="Your LeanForge subscription is being activated."
        path="/billing/success"
        noindex
      />
      <PageContainer>
        <section className="max-w-md mx-auto text-center space-y-4">
          <div className="text-4xl text-brand-green" aria-hidden>
            ✓
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">You're all set</h1>
          <p className="text-sm text-white/60">
            Your LeanForge subscription is being activated. It can take a few seconds to
            reflect on your account.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Link to="/" className="btn-primary justify-center">
              Start exploring keywords
            </Link>
            <Link to="/pricing" className="btn-outline justify-center">
              Back to pricing
            </Link>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
