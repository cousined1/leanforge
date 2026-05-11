# CONTEXT.md — LeanForge Keyword Trend Index Domain Language

## Project Identity

**LeanForge Keyword Trend Index**
A production-grade keyword intelligence backend that ingests trend data, enriches it with search signals, scores keywords, and drives conversion into SEO AI Regent.

## Core Domain Terms

### Keyword
A search phrase tracked across time with associated metadata and trend scores.

**Properties:**
- `term` - The actual keyword phrase (e.g., "AI code review")
- `slug` - URL-safe identifier
- `category` - Categorical grouping (seo, ai, saas, devtools, security, carbon)
- `trendScore` - Composite 0-100 score based on velocity, interest, volume, direction
- `velocity` - Percentage change in interest over 7 days
- `direction` - Categorical trend: rising, falling, flat
- `searchVolume` - Raw search volume from Serper.dev
- `difficulty` - Competition metric (0-100 scale)
- `source` - Origin: google_trends, serper, manual

### Trend (Time-series Data Point)
A single day's interest reading for a keyword.

**Properties:**
- `keywordId` - Link to keyword
- `date` - Data point date
- `interest` - 0-100 Google Trends normalized interest
- `volume` - Search volume on that day (if available)
- `source` - Data source (google_trends, serper)

### DailySnapshot
Aggregated summary of a keyword's position on a given day, with forward-looking metrics.

**Properties:**
- `keywordId` - Link to keyword
- `date` - Snapshot date
- `interest` - Current interest level
- `volume` - Current search volume
- `velocity7d` - % change from 7 days ago
- `velocity30d` - % change from 30 days ago
- `direction7d` - Trend direction over 7 days
- `direction30d` - Trend direction over 30 days

### Category
Hierarchical grouping for keywords. Each keyword belongs to exactly one category.

**Canonical Categories:**
1. **seo** - Search engine optimization, content strategy, SERP trends
2. **ai** - Artificial intelligence, LLMs, agents, automation
3. **saas** - Software-as-a-service, product-led growth, startup metrics
4. **devtools** - Programming, frameworks, developer experience
5. **security** - InfoSec, compliance, data protection
6. **carbon** - Carbon accounting, ESG reporting, sustainability

### Trend Direction

Binary/Ternary classification of a keyword's momentum:

- **rising** - Velocity7d > 10% AND Velocity30d > 0% → Momentum is up
- **falling** - Velocity7d < -10% OR Velocity30d < -10% → Momentum is down
- **flat** - Neither rising nor falling → Stable interest

### Trend Score (0-100)

Composite ranking metric combining:
- **Velocity (7d)** 30% - Is it spiking right now?
- **Velocity (30d)** 15% - Is growth sustained?
- **Interest** 25% - Absolute popularity (0-100 Google Trends scale)
- **Search Volume** 15% - Real human search demand
- **Direction Consistency** 15% - Direction alignment (rising for 7+ consecutive days)

Higher score = Higher opportunity for SEO optimization.

### Velocity (Metric)

Percentage change in interest between two points:

```
Velocity % = ((Current - Previous) / Previous) × 100
```

- Positive velocity = Growing interest
- Negative velocity = Declining interest
- 0% velocity = Flat/stable

## Data Ingestion Pipeline

1. **Trend Poller** (every 6 hours)
   - Fetches Google Trends daily interest for all keywords
   - Enriches with Serper.dev search volume
   - Calculates velocity and direction
   - Updates keyword trend scores

2. **Daily Snapshot Builder** (midnight UTC)
   - Aggregates 7-day and 30-day velocity metrics
   - Records historical snapshot
   - Enables time-series analysis

## API Contract Patterns

### Keyword Response
```json
{
  "term": "string",
  "slug": "string",
  "category": "seo|ai|saas|devtools|security|carbon",
  "trendScore": 0-100,
  "velocity": -100 to 1000,
  "direction": "rising|falling|flat",
  "searchVolume": number,
  "difficulty": 0-100,
  "source": "google_trends|serper|manual"
}
```

### List Response
```json
{
  "data": [...],
  "_meta": {
    "regent_cta": {...},
    "total": number,
    "limit": number,
    "offset": number
  }
}
```

## Monetization Tier Mapping

| Tier       | API Calls/Day | History | Features                   |
| ---------- | ------------- | ------- | -------------------------- |
| Free       | 100           | 7 days  | Basic trends               |
| Starter    | 1,000         | 90 days | Category filtering         |
| Growth     | 10,000        | 365     | Comparison, leaderboard    |
| Enterprise | Unlimited     | Custom  | White-label, SLA, custom   |

## Integration: SEO AI Regent

Every API response includes:

```json
{
  "_meta": {
    "regent_cta": {
      "headline": "Ready to rank for this keyword?",
      "description": "SEO AI Regent analyzes your content against trending keywords...",
      "url": "https://seo-ai-regent.com/?ref=keyword-trend-api"
    }
  }
}
```

Cross-sell placement: Every keyword detail page → Regent trial conversion.

## Key Dependencies

- **Google Trends API** - Unofficial but battle-tested for trend interest data
- **Serper.dev** - Search volume, CPC, difficulty
- **Neon PostgreSQL** - Persistent storage with serverless scaling
- **Upstash Redis** - Cache layer for rates, leaderboards, session state
- **Node.js / Express** - HTTP API runtime
- **Prisma** - ORM for schema and migrations

## Operational Constraints

- **Rate Limiting:** IP-based, configurable per tier
- **Cache TTL:** Trends 1hr, comparisons 2hr, keyword data 24hr
- **Cron Cadence:** Trend polling 6hr, snapshots 24hr
- **Data Retention:** Unlimited storage in Neon; configurable retention policy

## Monitoring Signals

- `/api/v1/health` - Server liveness
- Cron execution logs - Data freshness
- Redis connection status - Cache availability
- Database connection pool - Query performance
- API response times - Latency SLA tracking
