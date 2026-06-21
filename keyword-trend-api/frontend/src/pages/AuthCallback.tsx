import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { PageContainer } from '../components/Breadcrumbs';
import { fetchCurrentUser } from '../lib/insforge';
import { useAuth } from '../components/AuthProvider';

type Status = 'processing' | 'error';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<Status>('processing');
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get('error') || params.get('insforge_error');
    if (errParam) {
      setStatus('error');
      setMessage(params.get('error_description') || errParam);
      return;
    }

    let cancelled = false;
    void (async () => {
      // Constructing the SDK client (inside fetchCurrentUser) auto-completes the
      // PKCE exchange for the `insforge_code` in the URL; getCurrentUser waits
      // for that pending callback before resolving.
      const user = await fetchCurrentUser().catch(() => null);
      if (cancelled) return;
      if (user) {
        await refresh().catch(() => {});
        navigate('/', { replace: true });
      } else {
        setStatus('error');
        setMessage('We could not complete sign-in. Please try again.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, refresh]);

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
          {status === 'processing' ? (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight">Signing you in…</h1>
              <p className="text-sm text-white/60 animate-pulse">{message}</p>
            </>
          ) : (
            <div className="glass-card p-8 space-y-4">
              <h1 className="text-2xl font-extrabold tracking-tight">Sign-in failed</h1>
              <p className="text-sm text-white/60">{message}</p>
              <Link to="/sign-in" className="btn-primary inline-flex">
                Back to sign-in
              </Link>
            </div>
          )}
        </section>
      </PageContainer>
    </>
  );
}
