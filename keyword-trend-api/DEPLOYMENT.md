# Deployment Guide — LeanForge Keyword Trend Index

## Production Deployment on Railway

This guide walks through deploying the LeanForge Keyword Trend Index to production on Railway.

## Prerequisites

1. **Accounts**
   - Railway: https://railway.app
   - Neon: https://neon.tech (PostgreSQL)
   - Upstash: https://upstash.com (Redis)
   - Serper.dev: https://serper.dev (Search volume API)

2. **API Keys**
   - `INSFORGE_API_KEY` = `ik_sehrni5g1w9ptlg52cx3sx32nlrvsgmz`
   - `SERPER_API_KEY` - Get from Serper.dev dashboard
   - Neon connection string
   - Upstash Redis connection string

## Step 1: Create PostgreSQL Database (Neon)

1. Go to https://console.neon.tech
2. Click **"New Project"**
3. Name: `leanforge-keyword-trends`
4. Region: US East (closest to your Railway deployment)
5. Click **"Create project"**
6. Copy the connection string (looks like): 
   ```
   postgresql://neondb_owner:PASSWORD@ep-XXXXX.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Create Redis Database (Upstash)

1. Go to https://console.upstash.com
2. Click **"Create Database"**
3. Name: `leanforge-keyword-cache`
4. Region: closest to Railway (us-east-1)
5. Type: Redis (default)
6. Click **"Create"**
7. Copy the `REDIS_URL` (looks like):
   ```
   rediss://default:PASSWORD@us1-xxxxx.upstash.io:6379
   ```

## Step 3: Get Serper.dev API Key

1. Go to https://serper.dev
2. Sign up or log in
3. Go to "API" section
4. Copy your API key (free tier includes 100 searches/month)

## Step 4: Deploy to Railway

### Option A: GitHub Integration (Recommended)

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial LeanForge build"
   git remote add origin https://github.com/YOUR_USERNAME/keyword-trend-api
   git push -u origin main
   ```

2. Go to https://railway.app
3. Click **"New Project"** → **"Deploy from GitHub"**
4. Select the repository
5. Railway will auto-detect the Node.js project
6. Click **"Deploy"**

### Option B: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set REDIS_URL="rediss://..."
railway variables set SERPER_API_KEY="your-key"
railway variables set INSFORGE_API_KEY="ik_sehrni5g1w9ptlg52cx3sx32nlrvsgmz"
railway variables set NODE_ENV="production"
railway variables set PORT="3001"

# Deploy
railway up
```

## Step 5: Run Migrations and Seed

Once deployed, run migrations:

```bash
railway run npx prisma migrate deploy
```

Seed initial data:

```bash
railway run npx tsx prisma/seed.ts
```

## Step 6: Verify Deployment

Test the health endpoint:

```bash
curl https://your-railway-app.up.railway.app/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-05-10T12:00:00.000Z"
}
```

List keywords:
```bash
curl https://your-railway-app.up.railway.app/api/v1/keywords?limit=5
```

## Environment Variables Summary

| Variable           | Value                                           | Source        |
| ------------------ | ----------------------------------------------- | ------------- |
| `DATABASE_URL`     | Neon PostgreSQL connection string               | Neon console  |
| `REDIS_URL`        | Upstash Redis connection string                 | Upstash console |
| `SERPER_API_KEY`   | Your Serper.dev API key                         | Serper dashboard |
| `INSFORGE_API_KEY` | `ik_sehrni5g1w9ptlg52cx3sx32nlrvsgmz`          | Fixed         |
| `NODE_ENV`         | `production`                                    | Set to prod   |
| `PORT`             | `3001`                                          | Recommended   |

## Monitoring & Logs

### View Logs
```bash
railway logs
```

### Real-time Monitoring
```bash
# Watch cron job execution
railway logs --follow
```

### Database Health
```bash
# Connect to Neon console
https://console.neon.tech
# Run queries to verify data
```

## Scaling Considerations

### Database
- Neon auto-scales read replicas
- Connection pooling via Prisma: 10 default connections
- Recommended indices already created in schema

### Cache
- Upstash Redis handles up to 10k requests/sec on free tier
- Automatic failover and backups included

### API Server
- Railway auto-scales based on CPU/memory
- Current deployment runs on single container
- Can upgrade to more resources as needed

## Troubleshooting

### Database Connection Error
```
Error: getaddrinfo ENOTFOUND ep-xxxxx.us-east-2.aws.neon.tech
```
✅ Solution: Verify DATABASE_URL format and Neon project is active

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
✅ Solution: Check REDIS_URL format matches Upstash console exactly

### Migrations Fail
```bash
# Check migration status
railway run npx prisma migrate status

# Reset if needed (CAREFUL - deletes data)
railway run npx prisma migrate reset --force
```

### Cron Jobs Not Running
- Check `NODE_ENV` is set to `production`
- Verify logs: `railway logs --follow`
- Cron jobs start 60 seconds after deployment

## Costs

| Service | Tier    | Cost      |
| ------- | ------- | --------- |
| Railway | Free    | $5/mo     |
| Neon    | Free    | $0 + overage |
| Upstash | Free    | $0 + overage |
| Serper  | Free    | $0 + $25 per 50k searches |

**Total minimum:** ~$5/mo. Scales with usage.

## Next Steps

1. ✅ API is live and collecting trends
2. 🔗 Integrate with SEO AI Regent frontend
3. 📊 Set up monitoring dashboard
4. 💰 Launch pricing page and API docs
5. 🚀 Submit to product aggregators
