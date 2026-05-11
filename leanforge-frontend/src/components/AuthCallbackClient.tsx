'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, authError, refreshUser } = useAuth();
  const rawError = searchParams.get('insforge_error');
  const callbackStatus = searchParams.get('insforge_status');

  const safeErrorMessage = rawError
    ? 'The social sign-in could not be completed. Please try again.'
    : null;

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/keywords');
    }
  }, [loading, router, user]);

  if (rawError || callbackStatus === 'error' || authError) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Sign-in failed</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {safeErrorMessage || authError || 'The social sign-in callback could not be completed.'}
        </p>
        <Link href="/sign-in" className="btn-primary px-5 py-3">
          Try again
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-5 h-10 w-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
      <h2 className="text-xl font-bold mb-2">Finishing sign-in</h2>
      <p className="text-sm text-muted-foreground">
        We are completing the secure social login flow.
      </p>
    </div>
  );
}
