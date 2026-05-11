'use client';

import { createClient } from '@insforge/sdk';
import { absoluteUrl } from '@/lib/site';

export type SocialAuthProvider = 'google' | 'apple';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export type PublicAuthConfig = {
  oAuthProviders: string[];
  customOAuthProviders: string[];
  requireEmailVerification: boolean;
  passwordMinLength: number;
  requireNumber: boolean;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireSpecialChar: boolean;
  verifyEmailMethod: 'code' | 'link';
  resetPasswordMethod: 'code' | 'link';
};

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

export const isInsForgeConfigured = Boolean(baseUrl && anonKey);

export const insforge = createClient({
  baseUrl,
  anonKey,
});

export const supportedSocialProviders: Array<{
  id: SocialAuthProvider;
  label: string;
}> = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'apple', label: 'Continue with Apple' },
];

export function getOAuthRedirectUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  return absoluteUrl('/auth/callback');
}
