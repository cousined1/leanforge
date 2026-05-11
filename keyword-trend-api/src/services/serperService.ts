// src/services/serperService.ts
import axios from 'axios';
import { config } from '../config/env';
import { cacheService } from './cacheService';

interface SerperResult {
  keyword: string;
  searchVolume: number;
  cpc: number;
  difficulty: number;
}

export class SerperService {
  private apiKey: string;
  private baseUrl = 'https://google.serper.dev';

  constructor() {
    this.apiKey = config.SERPER_API_KEY || '';
  }

  /**
   * Get search volume + competition for a keyword
   */
  async getKeywordData(keyword: string): Promise<SerperResult | null> {
    const cacheKey = `serper:keyword:${keyword}`;
    const cached = await cacheService.get<SerperResult>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.post(
        `${this.baseUrl}/search`,
        { q: keyword, gl: 'us', hl: 'en' },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const result: SerperResult = {
        keyword,
        searchVolume: response.data.searchInformation?.totalResults
          ? parseInt(response.data.searchInformation.totalResults, 10)
          : 0,
        cpc: 0, // Use Serper's /metrics endpoint if available
        difficulty: response.data.organic?.length || 0, // Proxy: more organic results = harder
      };

      await cacheService.set(cacheKey, result, 86400); // 24hr TTL
      return result;
    } catch (error: any) {
      console.error(`Serper error for "${keyword}":`, error.message);
      return null;
    }
  }

  /**
   * Batch keyword lookup
   */
  async getBatchKeywordData(keywords: string[]): Promise<SerperResult[]> {
    const results: SerperResult[] = [];

    // Process in batches of 5 with 1s delay to respect rate limits
    for (let i = 0; i < keywords.length; i += 5) {
      const batch = keywords.slice(i, i + 5);
      const batchResults = await Promise.all(batch.map((kw) => this.getKeywordData(kw)));
      results.push(...(batchResults.filter(Boolean) as SerperResult[]));

      if (i + 5 < keywords.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

export const serperService = new SerperService();
