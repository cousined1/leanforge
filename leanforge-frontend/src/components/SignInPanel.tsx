'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { SocialAuthProvider, isInsForgeConfigured, supportedSocialProviders } from '@/lib/insforge';

function providerIcon(provider: SocialAuthProvider) {
  if (provider === 'google') return 'G';
  return 'A';
}

export function SignInPanel() {
  const searchParams = useSearchParams();
  const {
    user,
    loading,
    configLoading,
    enabledSocialProviders,
    authError,
    signInWithProvider,
  } = useAuth();
  const [pendingProvider, setPendingProvider] = useState<SocialAuthProvider | null>(null);
  const rawError = searchParams.get('insforge_error');
  const callbackStatus = searchParams.get('insforge_status');

  const safeErrorMessage = rawError
    ? 'The social sign-in could not be completed. Please try again.'
    : null;

  const handleProviderClick = async (provider: SocialAuthProvider) => {
    setPendingProvider(provider);
    try {
      await signInWithProvider(provider);
    } finally {
      setPendingProvider(null);
    }
  };

  if (loading) {
    return (
      <div className="card p-8">
        <div className="space-y-4">
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="h-11 w-full rounded bg-muted animate-pulse" />
          <div className="h-11 w-full rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-xl font-bold mb-2">You are signed in</h2>
        <p className="text-sm text-muted-foreground mb-6">{user.email}</p>
        <Link href="/keywords" className="btn-primary px-5 py-3">
          Explore keyword trends
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Sign in to LeanForge</h2>
        <p className="text-sm text-muted-foreground">
          Use a configured social account to access saved trend workflows and
          future API account features.
        </p>
      </div>

      {!isInsForgeConfigured && (
        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          InsForge auth is not configured. Add
          <code className="mx-1 rounded bg-muted px-1">NEXT_PUBLIC_INSFORGE_URL</code>
          and
          <code className="mx-1 rounded bg-muted px-1">NEXT_PUBLIC_INSFORGE_ANON_KEY</code>
          to enable social login.
        </div>
      )}

      {(authError || rawError || callbackStatus === 'error') && (
        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          {safeErrorMessage || authError || 'The social sign-in redirect failed.'}
        </div>
      )}

      <div className="space-y-3">
        {supportedSocialProviders.map((provider) => {
          const isEnabled = enabledSocialProviders.includes(provider.id);
          const isPending = pendingProvider === provider.id;

          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleProviderClick(provider.id)}
              disabled={!isInsForgeConfigured || configLoading || !isEnabled || Boolean(pendingProvider)}
              className="btn-outline w-full justify-center gap-3 px-5 py-3 disabled:opacity-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold">
                {providerIcon(provider.id)}
              </span>
              {isPending ? 'Redirecting...' : provider.label}
            </button>
          );
        })}
      </div>

      {isInsForgeConfigured && !configLoading && enabledSocialProviders.length === 0 && (
        <p className="mt-5 text-sm text-muted-foreground">
          Google and Apple are not enabled in the InsForge public auth
          configuration yet.
        </p>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        By signing in, you agree to the{' '}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>{' '}
        and acknowledge the{' '}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
