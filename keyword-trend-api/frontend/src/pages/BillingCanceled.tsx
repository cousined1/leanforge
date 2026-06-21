import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { PageContainer } from '../components/Breadcrumbs';

export default function BillingCanceled() {
  return (
    <>
      <Seo
        title="Checkout canceled"
        description="Your LeanForge checkout was canceled."
        path="/billing/canceled"
        noindex
      />
      <PageContainer>
        <section className="max-w-md mx-auto text-center space-y-4">
          <div className="text-4xl text-white/40" aria-hidden>
            ✕
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Checkout canceled</h1>
          <p className="text-sm text-white/60">
            No worries — you haven't been charged. You can upgrade anytime.
          </p>
          <Link to="/pricing" className="btn-outline justify-center inline-flex">
            View pricing
          </Link>
        </section>
      </PageContainer>
    </>
  );
}
