# LeanForge Keyword Trend Index API

Production-grade keyword intelligence backend built with InsForge, PostgreSQL (Neon), and Redis (Upstash).

## Quick Start

### 1. Clone and Install

```bash
cd keyword-trend-api
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Neon PostgreSQL connection
- `REDIS_URL` - Upstash Redis connection
- `SERPER_API_KEY` - Serper.dev API key for search volume
- `INSFORGE_API_KEY` - InsForge API key
- `NODE_ENV` - Set to `production` or `development`

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Seed with initial categories and keywords
npx prisma db seed
```

### 4. Development

```bash
# Watch mode with hot reload
npm run dev

# Runs on http://localhost:3001
```

### 5. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Keywords
- `GET /api/v1/keywords` - List all keywords with pagination
- `GET /api/v1/keywords/trending` - Get trending keywords (rising direction)
- `GET /api/v1/keywords/:slug` - Get single keyword with trends
- `POST /api/v1/keywords` - Create new keyword
- `PUT /api/v1/keywords/:slug` - Update keyword
- `DELETE /api/v1/keywords/:slug` - Deactivate keyword

### Trends
- `GET /api/v1/trends` - List trends by category/direction
- `GET /api/v1/trends/daily` - Google Trends daily trends
- `GET /api/v1/trends/realtime` - Real-time trending topics
- `GET /api/v1/trends/compare?keywords=term1,term2` - Compare multiple keywords
- `GET /api/v1/trends/:keywordId/timeline` - Keyword timeline (90 days)

### Categories
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/categories/:slug` - Get category with keywords
- `POST /api/v1/categories` - Create new category

### Health
- `GET /api/v1/health` - Health check endpoint

## Data Model

### Keywords
Track individual keywords with scoring and trend data.

- `term` - Keyword phrase (unique)
- `slug` - URL-safe identifier
- `category` - Categorization (seo, ai, saas, etc.)
- `trendScore` - 0-100 composite score
- `velocity` - % change over 7 days
- `direction` - rising, falling, or flat
- `searchVolume` - From Serper.dev
- `difficulty` - Competition level

### Trends
Time-series data for keyword interest.

- `keywordId` - Reference to keyword
- `date` - Data point date
- `interest` - 0-100 Google Trends interest
- `volume` - Search volume from Serper
- `source` - google_trends, serper, or manual

### DailySnapshot
Aggregated daily snapshot with velocity calculations.

- `keywordId` - Reference to keyword
- `date` - Snapshot date
- `velocity7d` - % change over 7 days
- `velocity30d` - % change over 30 days
- `direction7d` - Trend direction
- `direction30d` - Longer trend direction

## Cron Jobs

### Trend Poller (Every 6 hours)
- Fetches Google Trends data for all seed keywords
- Enriches with Serper.dev search volume
- Calculates trend scores and direction
- Updates keyword metadata

### Daily Snapshot Builder (Midnight UTC)
- Aggregates trends over 7 and 30-day windows
- Calculates velocity metrics
- Records daily snapshots for historical analysis

## Deployment to Railway

### Prerequisites
- Neon PostgreSQL database (free tier available)
- Upstash Redis database (free tier available)
- Serper.dev API key
- Railway account

### Steps

1. **Create databases:**
   - Neon: https://console.neon.tech
   - Upstash: https://console.upstash.com

2. **Deploy to Railway:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set environment variables:**
   ```bash
   railway variables set DATABASE_URL="..."
   railway variables set REDIS_URL="..."
   railway variables set SERPER_API_KEY="..."
   railway variables set INSFORGE_API_KEY="..."
   railway variables set NODE_ENV="production"
   ```

4. **Run migrations:**
   ```bash
   railway run npx prisma migrate deploy
   railway run npx tsx prisma/seed.ts
   ```

5. **Monitor:**
   ```bash
   railway logs
   ```

## SEO AI Regent Integration

Every API response includes cross-sell CTAs for SEO AI Regent:

```json
{
  "data": [...],
  "_meta": {
    "regent_cta": {
      "headline": "Ready to rank for this keyword?",
      "description": "SEO AI Regent analyzes your content...",
      "cta": "Start Free Trial",
      "url": "https://seo-ai-regent.com/?ref=keyword-trend-api"
    }
  }
}
```

## Rate Limiting

- **Free tier:** 100 requests per 15 minutes per IP
- Configurable via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`
- Redis-backed rate limiting with distributed tracking

## Monitoring & Logs

Monitor via:
- `/api/v1/health` - Real-time health check
- Railway dashboard for production logs
- Redis commands for cache status

## Monetization

| Tier       | Price  | Included                                             |
| ---------- | ------ | ---------------------------------------------------- |
| Free       | $0     | 100 API calls/day, 7-day history, basic trends      |
| Starter    | $29/mo | 1,000 calls/day, 90-day history, category filtering |
| Growth     | $99/mo | 10,000 calls/day, 365-day history, webhooks         |
| Enterprise | Custom | Unlimited, custom categories, white-label, SLA      |

## Support

- Documentation: `/api/v1/docs` (future)
- Issues: GitHub Issues
- Email: support@leanforge.io (future)
