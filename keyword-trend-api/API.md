# API Specification — LeanForge Keyword Trend Index

## Base URL
```
https://api.keywordtrendindex.com/api/v1
```

Development:
```
http://localhost:3001/api/v1
```

## Authentication

Currently uses rate limiting (IP-based). Future versions will support API keys.

## Response Format

### Success Response (2xx)
```json
{
  "data": {},
  "_meta": {
    "regent_cta": {
      "headline": "Ready to rank for this keyword?",
      "description": "...",
      "cta": "Start Free Trial",
      "url": "https://seo-ai-regent.com/?ref=keyword-trend-api"
    }
  }
}
```

### Error Response (4xx, 5xx)
```json
{
  "error": "Human-readable error message",
  "details": "Additional context (dev mode only)"
}
```

## Endpoints

### 1. List Keywords

```
GET /keywords?category=seo&direction=rising&limit=50&offset=0
```

**Query Parameters:**
- `category` (string, optional) - Filter by category slug: `seo`, `ai`, `saas`, `devtools`, `security`, `carbon`
- `direction` (string, optional) - Filter by trend direction: `rising`, `falling`, `flat`
- `limit` (number, optional, default: 50, max: 100) - Number of results
- `offset` (number, optional, default: 0) - Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "cuid123",
      "term": "content marketing",
      "slug": "content-marketing",
      "category": "seo",
      "searchVolume": 45000,
      "difficulty": 68.5,
      "cpc": 12.50,
      "trendScore": 87,
      "velocity": 23.5,
      "direction": "rising",
      "source": "google_trends",
      "isActive": true,
      "createdAt": "2024-05-10T00:00:00Z",
      "updatedAt": "2024-05-10T06:00:00Z"
    }
  ],
  "_meta": {
    "regent_cta": {...},
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

### 2. Get Trending Keywords

```
GET /keywords/trending?limit=20&category=ai
```

**Query Parameters:**
- `limit` (number, optional, default: 20, max: 100)
- `category` (string, optional) - Filter by category

**Response:**
Same as list endpoint, filtered to `direction: "rising"` only.

### 3. Get Keyword by Slug

```
GET /keywords/:slug
```

**Path Parameters:**
- `slug` - URL-safe keyword identifier (e.g., `content-marketing`)

**Response:**
```json
{
  "data": {
    "id": "cuid123",
    "term": "content marketing",
    "slug": "content-marketing",
    ...
    "trends": [
      {
        "id": "cuid456",
        "date": "2024-05-10",
        "interest": 82,
        "volume": 45000,
        "source": "google_trends"
      }
    ],
    "snapshots": [
      {
        "id": "cuid789",
        "date": "2024-05-10",
        "interest": 82,
        "velocity7d": 15.3,
        "velocity30d": 8.7,
        "direction7d": "rising",
        "direction30d": "rising"
      }
    ]
  },
  "_meta": {...}
}
```

### 4. Create Keyword

```
POST /keywords
Content-Type: application/json

{
  "term": "AI code review",
  "category": "ai",
  "searchVolume": 28000,
  "difficulty": 45.0,
  "cpc": 8.50
}
```

**Request Body:**
- `term` (string, required) - Keyword phrase
- `category` (string, optional) - Category slug
- `searchVolume` (number, optional) - Search volume
- `difficulty` (number, optional) - Competition difficulty (0-100)
- `cpc` (number, optional) - Cost per click

**Response:** 201 Created
Same as get single keyword response

### 5. Update Keyword

```
PUT /keywords/:slug
Content-Type: application/json

{
  "category": "devtools",
  "searchVolume": 32000
}
```

**Request Body:** Any fields to update

**Response:** 200 OK

### 6. Deactivate Keyword

```
DELETE /keywords/:slug
```

**Response:** 200 OK
```json
{
  "data": {...},
  "message": "Keyword deactivated"
}
```

### 7. List Trends

```
GET /trends?category=ai&direction=rising&limit=50
```

Same as list keywords endpoint

**Response:** Same format

### 8. Get Daily Trends

```
GET /trends/daily?geo=US
```

**Query Parameters:**
- `geo` (string, optional, default: "US") - Geographic region code

**Response:**
```json
{
  "data": [
    {
      "keyword": "AI agents",
      "interest": "Trending Up",
      "relatedQueries": ["autonomous agents", "agent framework"],
      "articles": [
        {
          "title": "Article Title",
          "url": "https://...",
          "source": "Source Name"
        }
      ]
    }
  ]
}
```

### 9. Get Realtime Trends

```
GET /trends/realtime?category=all&geo=US
```

**Query Parameters:**
- `category` (string, optional, default: "all")
- `geo` (string, optional, default: "US")

**Response:** Realtime trending topics from Google Trends

### 10. Compare Keywords

```
GET /trends/compare?keywords=ChatGPT,Claude,Gemini&geo=US
```

**Query Parameters:**
- `keywords` (string or array, required) - 2-5 keywords to compare
- `geo` (string, optional, default: "US")

**Response:**
```json
{
  "data": {
    "default": {
      "timelineData": [
        {
          "date": "2024-05-01",
          "values": [42, 38, 35],
          "isPartial": false
        }
      ]
    }
  }
}
```

### 11. Get Keyword Timeline

```
GET /trends/:keywordId/timeline?days=90
```

**Path Parameters:**
- `keywordId` - Keyword ID (from other endpoints)

**Query Parameters:**
- `days` (number, optional, default: 90, max: 365)

**Response:**
```json
{
  "data": [
    {
      "id": "cuid",
      "date": "2024-05-10",
      "interest": 82,
      "volume": 45000,
      "source": "google_trends"
    }
  ]
}
```

### 12. List Categories

```
GET /categories
```

**Response:**
```json
{
  "data": [
    {
      "id": "cuid",
      "name": "SEO & Content Marketing",
      "slug": "seo",
      "description": "...",
      "icon": "📊",
      "color": "#06B6D4",
      "sortOrder": 0,
      "isActive": true
    }
  ]
}
```

### 13. Get Category by Slug

```
GET /categories/:slug
```

**Response:**
```json
{
  "data": {
    "id": "cuid",
    "name": "SEO & Content Marketing",
    "slug": "seo",
    "keywords": [
      {"id": "...", "term": "content marketing", ...}
    ]
  }
}
```

### 14. Create Category

```
POST /categories
Content-Type: application/json

{
  "name": "Growth Hacking",
  "description": "Growth hacking and viral marketing",
  "icon": "📈",
  "color": "#10B981"
}
```

**Response:** 201 Created

### 15. Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-05-10T12:00:00Z"
}
```

## Rate Limiting

**Default Limits:**
- 100 requests per 900 seconds (15 minutes) per IP
- Free tier: 100 calls/day
- Starter: 1,000 calls/day
- Growth: 10,000 calls/day
- Enterprise: Unlimited

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
```

**Rate Limit Exceeded:**
```
HTTP 429 Too Many Requests

{
  "error": "Too many requests",
  "retryAfter": 900
}
```

## Error Codes

| Status | Code                  | Description                            |
| ------ | --------------------- | -------------------------------------- |
| 200    | OK                    | Successful request                     |
| 201    | Created               | Resource created successfully          |
| 400    | Bad Request           | Invalid request parameters             |
| 404    | Not Found             | Resource not found                     |
| 409    | Conflict              | Resource already exists (duplicate)    |
| 429    | Too Many Requests     | Rate limit exceeded                    |
| 500    | Internal Server Error | Server error                           |

## Pagination

For endpoints that return arrays, use `limit` and `offset`:

```
GET /keywords?limit=50&offset=100
```

Response includes:
```json
{
  "data": [...],
  "_meta": {
    "total": 500,
    "limit": 50,
    "offset": 100
  }
}
```

## Trend Scoring

Trend Score (0-100) is calculated from:
- **Interest velocity (7d):** 30% — Is it spiking?
- **Interest velocity (30d):** 15% — Sustained growth?
- **Current interest:** 25% — Absolute popularity
- **Search volume:** 15% — Real demand
- **Direction consistency:** 15% — Rising for 7+ days

## Direction Values

- `rising` — Velocity7d > 10% AND Velocity30d > 0%
- `falling` — Velocity7d < -10% OR Velocity30d < -10%
- `flat` — Everything else

## Timestamps

All timestamps are ISO 8601 format:
```
2024-05-10T12:30:45.123Z
```

## Versioning

Current API version: `v1`

Future versions will be available at:
```
/api/v2, /api/v3, etc.
```
