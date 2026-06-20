'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { analyticsEvents } from '@/lib/analytics';

const AUTH_CALLBACK_TIMEOUT_MS = 10_000;

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, authError, refreshUser } = useAuth();
  const rawError = searchParams.get('insforge_error');
  const callbackStatus = searchParams.get('insforge_status');
  const [timedOut, setTimedOut] = useState(false);

  const safeErrorMessage = rawError
    ? 'The social sign-in could not be completed. Please try again.'
    : null;

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!loading && user) {
      analyticsEvents.signupCompleted({ method: 'social' });
      router.replace('/keywords');
    }
  }, [loading, router, user]);

  // Timeout fallback: if auth takes too long, show a helpful message.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || !user) {
        setTimedOut(true);
      }
    }, AUTH_CALLBACK_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [loading, user]);

  if (rawError || callbackStatus === 'error' || authError) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-xl font-bold mb-2">Sign-in failed</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {safeErrorMessage || authError || 'The social sign-in callback could not be completed.'}
        </p>
        <Link href="/sign-in" className="btn-primary px-5 py-3">
          Try again
        </Link>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-xl font-bold mb-2">Taking longer than expected</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The sign-in process is taking longer than usual. This can happen if the authentication provider is slow to respond.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => { setTimedOut(false); window.location.reload(); }}
            className="btn-primary px-5 py-3"
          >
            Retry
          </button>
          <Link href="/sign-in" className="btn-outline px-5 py-3">
            Start over
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-5 h-10 w-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
      <h1 className="text-xl font-bold mb-2">Finishing sign-in</h1>
      <p className="text-sm text-muted-foreground">
        We are completing the secure social login flow.
      </p>
    </div>
  );
}
