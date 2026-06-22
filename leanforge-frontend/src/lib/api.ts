// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') return config;
  const headers = config.headers as Record<string, string> | undefined;
  if (headers?.Authorization) return config;
  const { getInsForgeAccessToken } = await import('@/lib/insforgeToken');
  const token = await getInsForgeAccessToken();
  if (token && headers) {
    headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Keyword {
  id: string;
  term: string;
  slug: string;
  category: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  trendScore: number;
  velocity: number;
  direction: 'rising' | 'falling' | 'flat';
  source: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Trend {
  id: string;
  keywordId: string;
  date: string;
  interest: number;
  volume?: number;
  source: string;
  createdAt: string;
}

export interface DailySnapshot {
  id: string;
  keywordId: string;
  date: string;
  interest: number;
  volume?: number;
  velocity7d?: number;
  velocity30d?: number;
  direction7d?: string;
  direction30d?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

// Keywords
export async function getKeywords(
  params?: Record<string, any>
) {
  const { data } = await api.get<{
    data: Keyword[];
    _meta: { total: number; limit: number; offset: number };
  }>('/keywords', { params });
  return data;
}

export async function getTrendingKeywords(params?: Record<string, any>) {
  const { data } = await api.get<{
    data: Keyword[];
    _meta: any;
  }>('/keywords/trending', { params });
  return data;
}

export async function getKeywordBySlug(slug: string) {
  const { data } = await api.get<{
    data: Keyword & { trends: Trend[]; snapshots: DailySnapshot[] };
    _meta: any;
  }>(`/keywords/${slug}`);
  return data;
}

// Trends
export async function getTrends(params?: Record<string, any>) {
  const { data } = await api.get<{ data: Keyword[] }>('/trends', { params });
  return data;
}

export async function getDailyTrends(geo = 'US') {
  const { data } = await api.get<{ data: any[] }>('/trends/daily', {
    params: { geo },
  });
  return data;
}

export async function compareKeywords(keywords: string[], geo = 'US') {
  const { data } = await api.get('/trends/compare', {
    params: { keywords, geo },
  });
  return data;
}

type TimelineParams = {
  days?: number;
  limit?: number;
  offset?: number;
};

export async function getKeywordTimeline(
  keywordId: string,
  paramsOrDays: number | TimelineParams = 90
) {
  const params: TimelineParams =
    typeof paramsOrDays === 'number' ? { days: paramsOrDays } : paramsOrDays;

  const { data } = await api.get<{ data: Trend[] }>(
    `/trends/${keywordId}/timeline`,
    { params }
  );
  return data;
}

// Categories
export async function getCategories() {
  const { data } = await api.get<{ data: Category[] }>('/categories');
  return data;
}

export async function getCategoryBySlug(slug: string) {
  const { data } = await api.get<{
    data: Category & { keywords: Keyword[] };
  }>(`/categories/${slug}`);
  return data;
}

export interface MeResponse {
  user: { id: string; email: string; role: string };
  subscription: {
    plan: 'free' | 'starter' | 'growth';
    status: string | null;
    currentPeriodEnd: string | null;
  };
}

export async function getMe(token: string): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export type Plan = 'free' | 'starter' | 'growth';

export interface PlanResponse {
  plan: Plan;
  status: string | null;
  currentPeriodEnd: string | null;
  limit: number;
}

export async function createCheckoutSession(
  plan: 'starter' | 'growth'
): Promise<{ url: string; sessionId: string }> {
  const { data } = await api.post<{ url: string; sessionId: string }>(
    '/billing/checkout',
    { plan }
  );
  return data;
}

export async function createPortalSession(): Promise<{ url: string }> {
  const { data } = await api.post<{ url: string }>('/billing/portal');
  return data;
}

export async function getPlan(): Promise<PlanResponse> {
  const { data } = await api.get<{ data: PlanResponse }>('/billing/plan');
  return data.data;
}

export default api;
