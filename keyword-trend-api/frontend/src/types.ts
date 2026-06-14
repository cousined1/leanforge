export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  categoryRel?: Category;
  trends?: Trend[];
}

export interface Trend {
  id: string;
  keywordId: string;
  date: string;
  interest: number;
  volume: number | null;
  source: string;
}

export interface DailySnapshot {
  id: string;
  keywordId: string;
  date: string;
  interest: number;
  volume: number | null;
  velocity7d: number | null;
  velocity30d: number | null;
  direction7d: string | null;
  direction30d: string | null;
}

export interface CategoryDetail extends Category {
  keywords: Keyword[];
}

export interface RegentCta {
  headline: string;
  description: string;
  cta: string;
  url: string;
}

export interface ListResponse<T> {
  data: T[];
  _meta?: {
    regent_cta?: RegentCta;
    total?: number;
    limit?: number;
    offset?: number;
  };
  count?: number;
}

export interface CategoryKeywordsResponse {
  data: CategoryDetail;
}

export interface KeywordWithTrends extends Keyword {
  trends: Trend[];
}
