import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';
import { REGENT_PARTNER_URL } from '../lib/site';

export default function SignIn() {
  const [params] = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/auth/callback';
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = (provider: 'google' | 'apple') => {
    setLoading(provider);
    // LeanForge uses InsForge for auth. Until that integration is wired
    // through to the live API, we send the user to the partner product.
    window.location.href =
      provider === 'google' ? REGENT_PARTNER_URL : REGENT_PARTNER_URL;
  };

  return (
    <>
      <Seo
        title="Sign In"
        description="Sign in to LeanForge to save keywords, track your API usage, and access private endpoints."
        path="/sign-in"
        noindex
      />
      <Breadcrumbs items={[{ label: 'Sign In' }]} />
      <PageContainer>
        <section className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Sign in to <span className="gradient-text">LeanForge</span>
            </h1>
            <p className="text-sm text-white/50">
              Save keywords, track usage, and access private endpoints.
            </p>
          </div>

          <div className="glass-card p-6 space-y-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#0B0C10] font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50"
            >
              {loading === 'google' ? 'Redirecting…' : 'Continue with Google'}
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white border border-white/20 font-semibold rounded-lg hover:bg-white/10 transition disabled:opacity-50"
            >
              {loading === 'apple' ? 'Redirecting…' : 'Continue with Apple'}
            </button>

            <p className="text-xs text-white/40 text-center pt-2">
              Auth is currently routed through our partner product (SEO AI Regent) while we
              complete the native InsForge integration.
            </p>
          </div>

          <p className="text-xs text-white/40 text-center">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-cyan-400 hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-cyan-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <input type="hidden" value={callbackUrl} readOnly />
        </section>
      </PageContainer>
    </>
  );
}
