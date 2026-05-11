// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

export async function getKeywordTimeline(keywordId: string, days = 90) {
  const { data } = await api.get<{ data: Trend[] }>(
    `/trends/${keywordId}/timeline`,
    { params: { days } }
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

export default api;
