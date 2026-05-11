# LeanForge Frontend

Modern Next.js 14 frontend for the LeanForge Keyword Trend Index API.

## Features

- **Real-time Keyword Trends** - Browse and filter 80+ tracked keywords across 6 categories
- **Trend Visualization** - Interactive charts showing 90-day historical trend data
- **Responsive Design** - Mobile-first UI built with Tailwind CSS
- **TypeScript** - Full type safety with strict mode
- **SEO Integration** - Cross-sell CTAs for SEO AI Regent throughout the app
- **API Integration** - Fully typed client library for backend API

## Tech Stack

- **Framework**: Next.js 14 (App Router, React 18)
- **Styling**: Tailwind CSS 3.4 + CSS Variables (design tokens)
- **Data Fetching**: @tanstack/react-query 5.28
- **Visualization**: Recharts 2.10
- **HTTP Client**: Axios 1.6
- **Icons**: Lucide React 0.292
- **Language**: TypeScript 5.3 (strict mode)

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with Header/Footer
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles, design tokens, component layer
│   ├── keywords/
│   │   ├── page.tsx             # Keywords list with filters
│   │   └── [slug]/
│   │       └── page.tsx         # Keyword detail page
│   ├── categories/
│   │   ├── page.tsx             # Categories grid
│   │   └── [slug]/
│   │       └── page.tsx         # Category with keywords
│   └── api-docs/
│       └── page.tsx             # API documentation
├── components/
│   ├── Header.tsx               # Navigation header
│   ├── Footer.tsx               # Footer with links
│   ├── TrendingCard.tsx         # Individual keyword card
│   ├── KeywordGrid.tsx          # Grid container for cards
│   ├── TrendChart.tsx           # Recharts line chart component
│   └── RegentCTA.tsx            # SEO AI Regent call-to-action
└── lib/
    ├── api.ts                   # Backend API client (9 functions, fully typed)
    └── utils.ts                 # Utility functions (formatNumber, colors, etc)

tailwind.config.ts               # Design token configuration
tsconfig.json                    # TypeScript configuration (strict mode)
next.config.js                   # Next.js framework config
postcss.config.js                # CSS processing pipeline
```

## Setup & Development

### Prerequisites

- Node.js 18+ (tested with 20.x)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

Required for frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

The `NEXT_PUBLIC_` prefix makes this variable available in the browser.

### Google Tag Manager

GTM is implemented in the root App Router layout through
`src/components/GoogleTagManager.tsx` and the reusable analytics helpers in
`src/lib/analytics.ts`.

Configuration:

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

Tracking is disabled in local/development by default. To test GTM locally, set:

```env
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

Consent behavior:

- GTM does not load until the visitor accepts the cookie banner.
- The consent decision is stored under `cookie-consent`.
- Rejecting consent prevents GTM script loading and prevents `dataLayer` pushes
  from the analytics helper.

Pageview ownership:

- The app owns SPA route-change pageviews.
- `GoogleTagManager` watches App Router pathname/search param changes and calls
  `trackPageView(url, title, referrer)`.
- In GA4/GTM, do not also enable enhanced-measurement browser history pageviews,
  or route changes may be counted twice.

Event helpers:

```ts
import { analyticsEvents, trackEvent } from '@/lib/analytics';

analyticsEvents.signupStarted({ source: 'header' });
analyticsEvents.signupCompleted({ method: 'google' });
analyticsEvents.trialStarted({ plan: 'starter' });
analyticsEvents.subscriptionPurchased({ plan: 'growth', value: 49 });

trackEvent('custom_event_name', { property: 'value' });
```

GA4 DebugView verification:

1. Set `NEXT_PUBLIC_GTM_ID` and, for local testing, `NEXT_PUBLIC_ANALYTICS_ENABLED=true`.
2. Start the app and accept the cookie banner.
3. In Google Tag Assistant, connect to the local or deployed URL.
4. Navigate between `/`, `/keywords`, `/categories`, `/api-docs`, and `/sign-in`.
5. Confirm `page_view` events appear once per route change in Tag Assistant and
   GA4 DebugView.

Route-change test:

1. Clear local storage for the site.
2. Reload and verify no GTM network request occurs before consent.
3. Accept cookies and verify `gtm.js?id=GTM-...` loads.
4. Navigate client-side using header/footer links.
5. Confirm one `page_view` dataLayer event per route transition.

### Available Scripts

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Features Overview

### 1. Landing Page (`/`)
- Hero section with trending keywords widget
- Statistics (80+ keywords, 6 categories, 6h updates, free API)
- Featured trending keywords (first 6)
- Category showcase grid
- SEO AI Regent CTA banner
- Mobile-responsive design

### 2. Keywords Page (`/keywords`)
- Paginated keyword list (50 per page)
- Filters: direction (rising/falling/flat), category
- Search functionality
- Displays: term, trendScore, velocity, searchVolume, difficulty
- Pagination controls
- Regent CTA section

### 3. Keyword Detail Page (`/keywords/[slug]`)
- Full keyword metrics (score, velocity, searchVolume, difficulty, CPC)
- 90-day trend chart using Recharts
- Interest over time visualization
- Related keywords section (placeholder for future enhancement)
- Regent CTA with keyword-specific messaging

### 4. Categories Page (`/categories`)
- Grid of 6 categories with icons
- Each category links to detail page
- Loading states

### 5. Category Detail Page (`/categories/[slug]`)
- Category name, description, icon
- All keywords in category
- Regent CTA

### 6. API Documentation Page (`/api-docs`)
- API overview and key statistics
- All 15 endpoints with method, path, description
- Example requests
- Link to full GitHub documentation

### 7. Header Component
- Logo + brand name
- Navigation links (Keywords, Categories, API)
- Search icon (placeholder)
- "Start Free Trial" CTA button (links to Regent)

### 8. Footer Component
- Company info
- Product links
- Legal links
- Social media links

## Design System

### Colors (CSS Variables)
- **Primary**: `#0066FF` (blue) - main actions, accents
- **Secondary**: `#2D3748` (gray-900) - secondary actions
- **Destructive**: `#EF4444` (red) - warnings, errors
- **Muted**: `#F1F5F9` (light gray) - backgrounds, borders
- **Accent**: `#00D9FF` (cyan) - highlights, special elements

### Component Classes (in `globals.css`)
- `.btn` - Base button styles
- `.btn-primary` - Primary action (blue background)
- `.btn-secondary` - Secondary action
- `.btn-outline` - Outline button
- `.card` - Card container with border and shadow

### Utilities
- `cn()` - Merge classnames (clsx + tailwind-merge)
- `formatNumber()` - Format numbers to 1M, 45K, etc.
- `getDirectionColor()` - Get color class for rising/falling/flat
- `getDirectionIcon()` - Get Unicode arrow for direction

## API Client

The `src/lib/api.ts` file exports 9 functions:

```typescript
// Keywords
getKeywords(params?)          // List with pagination
getTrendingKeywords(params?)  // Only rising trends
getKeywordBySlug(slug)        // Single keyword detail

// Trends
getTrends(params?)            // Trend list by filter
getDailyTrends(geo?)          // Daily trends
compareKeywords(keywords[])   // Compare 2-5 keywords
getKeywordTimeline(id, days?) // Historical timeline

// Categories
getCategories()               // List all
getCategoryBySlug(slug)       // Single category detail
```

All functions have full TypeScript types:
- `Keyword` - Full keyword data model
- `Trend` - Individual trend data point
- `DailySnapshot` - Daily aggregated data
- `Category` - Category model

## Building Components

### Example: Using the API Client

```typescript
'use client';
import { getKeywords } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function KeywordList() {
  const { data, isLoading } = useQuery({
    queryKey: ['keywords'],
    queryFn: () => getKeywords({ limit: 20 })
  });

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {data?.data.map(kw => (
        <div key={kw.id}>{kw.term}</div>
      ))}
    </div>
  );
}
```

### Example: Creating a Chart Component

```typescript
import { TrendChart } from '@/components/TrendChart';
import { getKeywordTimeline } from '@/lib/api';

export function MyChart({ keywordId }) {
  const { data } = useQuery({
    queryKey: ['timeline', keywordId],
    queryFn: () => getKeywordTimeline(keywordId, 90)
  });

  return <TrendChart data={data?.data || []} />;
}
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Environment Setup

Set `NEXT_PUBLIC_API_URL` in Vercel project settings:
```
https://your-backend-api.railway.app/api/v1
```

### Manual Build

```bash
npm run build
npm start
```

Runs on port 3000 by default.

## Backend Integration

This frontend expects the backend API running at `NEXT_PUBLIC_API_URL`.

Backend repo structure:
```
keyword-trend-api/
├── src/
│   ├── index.ts               # Express app
│   ├── config/                # Database, Redis, env
│   ├── controllers/           # HTTP handlers
│   ├── services/              # Google Trends, Serper
│   ├── routes/                # Route definitions
│   ├── middleware/            # Auth, rate limiting
│   └── jobs/                  # Cron jobs
├── prisma/
│   ├── schema.prisma          # Database models
│   └── seed.ts                # Initial data
├── Dockerfile                 # Container build
└── railway.toml               # Deployment config
```

### Running Backend & Frontend Together

**Terminal 1** (Backend):
```bash
cd ../keyword-trend-api
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

**Terminal 2** (Frontend):
```bash
npm install
npm run dev
```

Frontend will connect to backend at `http://localhost:3001/api/v1`

## TypeScript

Full strict mode enabled (`strict: true` in tsconfig.json):
- No implicit `any` types
- Strict null checks
- Full type safety for components and API calls

All components use `'use client'` directive (client components) or are rendered on server.

## Performance

- **Image Optimization**: Next.js Image component for all dynamic images
- **Code Splitting**: Automatic per-page chunks
- **React Query Caching**: Automatic request deduplication and caching
- **CSS**: Tailwind JIT compilation only includes used classes

## SEO AI Regent Integration

Regent CTAs appear on:
1. **Header** - "Start Free Trial" button
2. **Landing Page** - Large banner CTA
3. **Keywords Detail** - Contextual CTA: "Optimize for this keyword"
4. **All Category Pages** - Bottom CTA banner
5. **Keywords Listing** - Bottom CTA banner

All CTAs link to: `https://seo-ai-regent.com/?ref=keyword-trend-api`

## Troubleshooting

### Backend connection failed
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running: `curl http://localhost:3001/api/v1/health`

### Missing keywords on landing page
- Backend needs seed data: `npm run db:seed` (in backend)
- Check database connection and Redis

### Type errors in components
- Run `npm run type-check` to see all type issues
- Ensure all API calls are imported from `@/lib/api`

## License

Private project. Built with LeanForge framework.

---

**Backend API**: Runs on port 3001, handles keyword trends, caching, scoring
**Frontend**: Runs on port 3000, connects to backend via HTTP client

Last Updated: 2026
