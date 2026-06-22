// src/lib/insforgeToken.ts
'use client';

import { insforge } from '@/lib/insforge';

let cachedToken: string | null = null;
let cachedExpiry = 0;

export async function getInsForgeAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (cachedToken && Date.now() < cachedExpiry - 30_000) {
    return cachedToken;
  }
  try {
    const headers = insforge.getHttpClient().getHeaders();
    const auth = (headers as Record<string, string | undefined>).Authorization
      ?? (headers as Record<string, string | undefined>).authorization;
    if (auth && auth.startsWith('Bearer ')) {
      cachedToken = auth.slice(7);
      cachedExpiry = Date.now() + 55 * 60 * 1000;
      return cachedToken;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearInsForgeTokenCache(): void {
  cachedToken = null;
  cachedExpiry = 0;
}
