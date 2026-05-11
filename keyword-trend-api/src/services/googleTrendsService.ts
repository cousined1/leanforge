// src/services/googleTrendsService.ts
import * as googleTrends from 'google-trends-api';
import { cacheService } from './cacheService';

const EXTERNAL_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`External API timed out after ${ms}ms`)), ms)
    ),
  ]);
}

interface TrendResult {
  keyword: string;
  interest: number;
  date?: Date;
  volume?: number;
}

export class GoogleTrendsService {
  /**
   * Fetch daily interest for a keyword (past 90 days)
   */
  async getKeywordTimeline(keyword: string, geo = 'US'): Promise<TrendResult[]> {
    const cacheKey = `trend:timeline:${keyword}:${geo}`;
    const cached = await cacheService.get<TrendResult[]>(cacheKey);
    if (cached) return cached;

    try {
      const startTime = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const endTime = new Date();

      const results = await withTimeout(
        googleTrends.interestOverTime({
          keyword,
          geo,
          startTime,
          endTime,
        }),
        EXTERNAL_TIMEOUT_MS
      );

      const parsed = JSON.parse(results);
      const timeline: TrendResult[] = parsed.default.timelineData.map(
        (point: any) => ({
          keyword,
          interest: parseInt(point.value[0], 10),
          date: new Date(point.formattedTime),
        })
      );

      await cacheService.set(cacheKey, timeline, 3600); // 1hr TTL
      return timeline;
    } catch (error: any) {
      console.error(`Google Trends error for "${keyword}":`, error.message);
      return [];
    }
  }

  /**
   * Fetch trending searches (daily)
   */
  async getDailyTrends(geo = 'US'): Promise<any[]> {
    const cacheKey = `trend:daily:${geo}`;
    const cached = await cacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const results = await withTimeout(
        googleTrends.dailyTrends({ geo }),
        EXTERNAL_TIMEOUT_MS
      );
      const parsed = JSON.parse(results);
      const trends = parsed.default.trendingSearchesDays[0].trendingSearches.map(
        (t: any) => ({
          keyword: t.title.query,
          interest: t.formattedTraffic,
          relatedQueries: t.relatedQueries.map((q: any) => q.query),
          articles: t.articles.map((a: any) => ({
            title: a.title,
            url: a.url,
            source: a.source,
          })),
        })
      );

      await cacheService.set(cacheKey, trends, 3600);
      return trends;
    } catch (error: any) {
      console.error('Daily trends error:', error.message);
      return [];
    }
  }

  /**
   * Fetch realtime trending topics
   */
  async getRealtimeTrends(category = 'all', geo = 'US'): Promise<any[]> {
    try {
      const results = await withTimeout(
        googleTrends.realTimeTrends({ category, geo }),
        EXTERNAL_TIMEOUT_MS
      );
      const parsed = JSON.parse(results);

      return parsed.default.storySummaries.trending.map((t: any) => ({
        keyword: t.title,
        interest: t.entityNames,
        articles: t.articles,
      }));
    } catch (error: any) {
      console.error('Realtime trends error:', error.message);
      return [];
    }
  }

  /**
   * Compare multiple keywords
   */
  async compareKeywords(keywords: string[], geo = 'US'): Promise<any> {
    const cacheKey = `trend:compare:${keywords.sort().join(',')}:${geo}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const results = await withTimeout(
        googleTrends.interestOverTime({
          keyword: keywords,
          geo,
          startTime,
        }),
        EXTERNAL_TIMEOUT_MS
      );

      const parsed = JSON.parse(results);
      await cacheService.set(cacheKey, parsed, 7200);
      return parsed;
    } catch (error: any) {
      console.error('Compare keywords error:', error.message);
      return {};
    }
  }
}

export const googleTrendsService = new GoogleTrendsService();
