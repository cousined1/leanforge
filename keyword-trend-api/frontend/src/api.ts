import type { Category, CategoryDetail, Keyword, KeywordWithTrends, ListResponse } from './types';

const BASE = '/api/v1';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function fetchTrendingKeywords(): Promise<ListResponse<Keyword>> {
  return fetchJson(`${BASE}/keywords/trending`);
}

export function fetchKeywords(params?: {
  category?: string;
  direction?: string;
  limit?: number;
  offset?: number;
}): Promise<ListResponse<Keyword> & { count: number }> {
  const sp = new URLSearchParams();
  if (params?.category) sp.set('category', params.category);
  if (params?.direction) sp.set('direction', params.direction);
  if (params?.limit) sp.set('limit', String(params.limit));
  if (params?.offset) sp.set('offset', String(params.offset));
  const qs = sp.toString();
  return fetchJson(`${BASE}/keywords${qs ? `?${qs}` : ''}`);
}

export function fetchKeywordBySlug(slug: string): Promise<{ data: KeywordWithTrends }> {
  return fetchJson(`${BASE}/keywords/${slug}`);
}

export function fetchCategories(): Promise<{ data: Category[] }> {
  return fetchJson(`${BASE}/categories`);
}

export function fetchCategoryBySlug(slug: string): Promise<{ data: CategoryDetail }> {
  return fetchJson(`${BASE}/categories/${slug}`);
}
