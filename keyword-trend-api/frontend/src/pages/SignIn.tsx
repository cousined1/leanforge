import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Breadcrumbs, PageContainer } from '../components/Breadcrumbs';
import { SOCIAL_PROVIDERS, signInWithProvider, type SocialProvider } from '../lib/insforge';

export default function SignIn() {
  const [loading, setLoading] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOAuth(provider: SocialProvider) {
    setError(null);
    setLoading(provider);
    try {
      // Redirects the browser to the InsForge OAuth (PKCE) flow.
      await signInWithProvider(provider);
    } catch {
      setError('Could not start sign-in. Please try again in a moment.');
      setLoading(null);
    }
  }

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
            {SOCIAL_PROVIDERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleOAuth(id)}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-semibold hover:bg-white/10 hover:border-white/20 transition disabled:opacity-50"
              >
                {loading === id ? 'Redirecting…' : label}
              </button>
            ))}

            {error && (
              <p className="text-xs text-brand-red text-center pt-1" role="alert">
                {error}
              </p>
            )}
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
        </section>
      </PageContainer>
    </>
  );
}
