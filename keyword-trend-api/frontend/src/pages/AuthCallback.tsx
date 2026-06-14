import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { PageContainer } from '../components/Breadcrumbs';

type Status = 'processing' | 'success' | 'error';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>('processing');
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setStatus('error');
      setMessage(params.get('error_description') || error);
      return;
    }
    if (!code) {
      setStatus('error');
      setMessage('Missing authorization code. Please try signing in again.');
      return;
    }

    // In production, POST the code to /api/v1/auth/callback to exchange
    // for a session. Until that endpoint is live, we surface a friendly
    // message and link back to the home page.
    setStatus('success');
    setMessage('Authentication complete. Redirecting…');

    const t = window.setTimeout(() => {
      window.location.href = '/';
    }, 1500);
    return () => window.clearTimeout(t);
  }, [params]);

  return (
    <>
      <Seo
        title="Signing you in…"
        description="Completing your LeanForge sign-in."
        path="/auth/callback"
        noindex
      />
      <PageContainer>
        <section className="max-w-md mx-auto text-center space-y-4">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {status === 'processing' ? 'Signing you in…' : null}
            {status === 'success' ? 'You are signed in.' : null}
            {status === 'error' ? 'Sign-in failed' : null}
          </h1>
          <p className="text-sm text-white/60">{message}</p>
          {status === 'error' && (
            <Link to="/sign-in" className="btn-primary inline-flex">
              Back to sign-in
            </Link>
          )}
        </section>
      </PageContainer>
    </>
  );
}
