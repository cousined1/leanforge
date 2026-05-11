'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AuthUser,
  PublicAuthConfig,
  SocialAuthProvider,
  getOAuthRedirectUrl,
  insforge,
  isInsForgeConfigured,
  supportedSocialProviders,
} from '@/lib/insforge';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  configLoading: boolean;
  authConfig: PublicAuthConfig | null;
  enabledSocialProviders: SocialAuthProvider[];
  authError: string | null;
  signInWithProvider: (provider: SocialAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Authentication failed. Please try again.';
}

function normalizeUser(user: AuthUser | null | undefined): AuthUser | null {
  if (!user) return null;

  return {
    id: String(user.id),
    email: String(user.email),
    role: String(user.role),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState<PublicAuthConfig | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!isInsForgeConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error) {
      setUser(null);
      setAuthError(getErrorMessage(error));
    } else {
      setUser(normalizeUser(data?.user));
      setAuthError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateAuth() {
      if (!isInsForgeConfigured) {
        if (!cancelled) {
          setConfigLoading(false);
          setLoading(false);
          setAuthError('InsForge auth is not configured.');
        }
        return;
      }

      const [{ data: configData, error: configError }, { data: userData, error: userError }] =
        await Promise.all([
          insforge.auth.getPublicAuthConfig(),
          insforge.auth.getCurrentUser(),
        ]);

      if (cancelled) return;

      setAuthConfig(configData as PublicAuthConfig | null);
      setUser(userError ? null : normalizeUser(userData?.user));
      setAuthError(configError || userError ? getErrorMessage(configError || userError) : null);
      setConfigLoading(false);
      setLoading(false);
    }

    void hydrateAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const enabledSocialProviders = useMemo(() => {
    const enabled = new Set(authConfig?.oAuthProviders ?? []);
    return supportedSocialProviders
      .map((provider) => provider.id)
      .filter((provider) => enabled.has(provider));
  }, [authConfig]);

  const signInWithProvider = useCallback(async (provider: SocialAuthProvider) => {
    setAuthError(null);

    const { error } = await insforge.auth.signInWithOAuth({
      provider,
      redirectTo: getOAuthRedirectUrl(),
    });

    if (error) {
      setAuthError(getErrorMessage(error));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await insforge.auth.signOut();
    if (error) {
      setAuthError(getErrorMessage(error));
      throw error;
    }

    setUser(null);
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      configLoading,
      authConfig,
      enabledSocialProviders,
      authError,
      signInWithProvider,
      signOut,
      refreshUser,
    }),
    [
      user,
      loading,
      configLoading,
      authConfig,
      enabledSocialProviders,
      authError,
      signInWithProvider,
      signOut,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
