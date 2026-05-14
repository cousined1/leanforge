// src/jobs/trendPoller.ts
import cron from 'node-cron';
import { prisma } from '../config/database';
import { googleTrendsService } from '../services/googleTrendsService';
import { serperService } from '../services/serperService';
import { calculateTrendScore, velocity, direction } from '../utils/scoring';
import { config } from '../config/env';
import { getRedisClient } from '../config/redis';
import { Sentry } from '../config/monitoring';

const POLLER_LOCK_KEY = 'trend-poller:lock';
const POLLER_LOCK_TTL_SECONDS = Math.ceil(6 * 60 * 60 * 1.2);
const TRENDING_TOPIC_RETENTION_DAYS = 30;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function startTrendPoller() {
  // Every 6 hours: pull Google Trends data for tracked keywords
  cron.schedule(config.TREND_POLL_CRON, async () => {
    console.log('🔄 Trend poller starting...');

    const redis = getRedisClient();
    const lock = await redis.set(
      POLLER_LOCK_KEY,
      new Date().toISOString(),
      'EX',
      POLLER_LOCK_TTL_SECONDS,
      'NX'
    );

    if (!lock) {
      console.warn('⏭️ Trend poller is already running, skipping this cycle');
      return;
    }

    try {
      const trackedKeywords = await prisma.keyword.findMany({
        where: { isActive: true },
        select: { term: true, category: true },
      });

      for (const trackedKeyword of trackedKeywords) {
        const keyword = trackedKeyword.term;

        try {
          // Get timeline from Google Trends
          const timeline = await googleTrendsService.getKeywordTimeline(keyword);

          // Get search volume from Serper
          const serpData = await serperService.getKeywordData(keyword);

          // Upsert keyword
          const kw = await prisma.keyword.upsert({
            where: { term: keyword },
            create: {
              term: keyword,
              slug: keyword.toLowerCase().replace(/\s+/g, '-'),
              category: trackedKeyword.category,
              searchVolume: serpData?.searchVolume || 0,
              difficulty: serpData?.difficulty || 0,
              cpc: serpData?.cpc || 0,
            },
            update: {
              searchVolume: serpData?.searchVolume || 0,
              difficulty: serpData?.difficulty || 0,
              cpc: serpData?.cpc || 0,
            },
          });

          // Store trend data points
          for (const point of timeline) {
            await prisma.trend.upsert({
              where: {
                keywordId_date_source: {
                  keywordId: kw.id,
                  date: point.date || new Date(),
                  source: 'google_trends',
                },
              },
              create: {
                keywordId: kw.id,
                date: point.date || new Date(),
                interest: point.interest,
                source: 'google_trends',
              },
              update: { interest: point.interest },
            });
          }

          // Calculate and update trend score
          const recent7 = timeline.slice(-7);
          const recent30 = timeline.slice(-30);
          const currentInterest = recent7[recent7.length - 1]?.interest || 0;
          const weekAgoInterest = recent7[0]?.interest || 0;
          const monthAgoInterest = recent30[0]?.interest || 0;

          const velocity7d = velocity(currentInterest, weekAgoInterest);
          const velocity30d = velocity(currentInterest, monthAgoInterest);
          const trendDir = direction(velocity7d, velocity30d);

          const trendScore = calculateTrendScore({
            currentInterest,
            searchVolume: serpData?.searchVolume,
            velocity7d,
            velocity30d,
            direction7d: trendDir,
          });

          await prisma.keyword.update({
            where: { id: kw.id },
            data: {
              trendScore,
              velocity: velocity7d,
              direction: trendDir,
            },
          });

          console.log(
            `✅ Updated: ${keyword} (score: ${trendScore}, direction: ${trendDir})`
          );

          // Rate limit: 2s between keywords
          await sleep(2000);
        } catch (error: any) {
          console.error(`❌ Error polling "${keyword}":`, error.message);
          Sentry.withScope((scope) => {
            scope.setTag('job', 'trend-poller');
            scope.setTag('phase', 'keyword-poll');
            scope.setExtra('keyword', keyword);
            scope.setExtra('category', trackedKeyword.category);
            Sentry.captureException(error);
          });
        }
      }

      console.log('✅ Trend poller complete');
    } catch (error) {
      console.error('❌ Trend poller cycle failed:', error);
      Sentry.withScope((scope) => {
        scope.setTag('job', 'trend-poller');
        scope.setTag('phase', 'cycle');
        Sentry.captureException(error);
      });
    } finally {
      await redis.del(POLLER_LOCK_KEY);
    }
  });

  // Daily at midnight: build snapshots
  cron.schedule('0 0 * * *', async () => {
    console.log('📸 Building daily snapshots...');
    try {
      const keywords = await prisma.keyword.findMany({ where: { isActive: true } });

      for (const kw of keywords) {
        const latestTrends = await prisma.trend.findMany({
          where: { keywordId: kw.id },
          orderBy: { date: 'desc' },
          take: 30,
        });

        if (latestTrends.length === 0) continue;

        const current = latestTrends[0];
        const weekAgo = latestTrends.find((trend: { date: Date }) => {
          const daysDiff =
            (current.date.getTime() - trend.date.getTime()) /
            (1000 * 60 * 60 * 24);
          return Math.abs(daysDiff - 7) < 1.5;
        });
        const monthAgo = latestTrends[latestTrends.length - 1];

        const vel7d = weekAgo ? velocity(current.interest, weekAgo.interest) : 0;
        const vel30d = monthAgo ? velocity(current.interest, monthAgo.interest) : 0;

        await prisma.dailySnapshot.upsert({
          where: { keywordId_date: { keywordId: kw.id, date: current.date } },
          create: {
            keywordId: kw.id,
            date: current.date,
            interest: current.interest,
            volume: current.volume,
            velocity7d: vel7d,
            velocity30d: vel30d,
            direction7d: direction(vel7d, vel30d),
            direction30d: direction(vel7d, vel30d),
          },
          update: {
            interest: current.interest,
            volume: current.volume,
            velocity7d: vel7d,
            velocity30d: vel30d,
            direction7d: direction(vel7d, vel30d),
            direction30d: direction(vel7d, vel30d),
          },
        });
      }

      const cutoffDate = new Date(
        Date.now() - TRENDING_TOPIC_RETENTION_DAYS * 24 * 60 * 60 * 1000
      );
      const cleanupResult = await prisma.trendingTopic.deleteMany({
        where: { capturedAt: { lt: cutoffDate } },
      });
      console.log(
        `🧹 Cleaned ${cleanupResult.count} stale trending topics older than ${TRENDING_TOPIC_RETENTION_DAYS} days`
      );

      console.log('✅ Daily snapshots built');
    } catch (error) {
      console.error('❌ Daily snapshot job failed:', error);
      Sentry.withScope((scope) => {
        scope.setTag('job', 'daily-snapshots');
        scope.setTag('phase', 'cycle');
        Sentry.captureException(error);
      });
    }
  });

  console.log('⏰ Trend poller cron jobs started');
}
