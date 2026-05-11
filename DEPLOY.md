# LeanForge Deployment Checklist

## Pre-Deployment (Do This First)

### 1. Railway Login
```bash
cd "E:\LeanForge Keyword Trend Index"
railway login
```

### 2. Create Projects
```bash
# Backend
cd keyword-trend-api
railway init --name leanforge-api

# Frontend  
cd ../leanforge-frontend
railway init --name leanforge-frontend
```

### 3. Set Environment Variables

**Backend (`keyword-trend-api`):**
```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables set REDIS_URL="rediss://..."
railway variables set SERPER_API_KEY="..."
railway variables set API_SECRET_KEY="..."
railway variables set INSFORGE_API_KEY="ik_8dc6f90c17d1c8c89a9819cbe0191888"
railway variables set INSFORGE_BASE_URL="https://28he5ctp.us-east.insforge.app"
```

**Frontend (`leanforge-frontend`):**
```bash
railway variables set NEXT_PUBLIC_API_URL="https://[backend-url]/api/v1"
railway variables set NEXT_PUBLIC_SITE_URL="https://lean-forge.net"
railway variables set NEXT_PUBLIC_INSFORGE_URL="https://28he5ctp.us-east.insforge.app"
railway variables set NEXT_PUBLIC_INSFORGE_ANON_KEY="ik_8dc6f90c17d1c8c89a9819cbe0191888"
```

## Deployment

### Option A: Manual Deploy
```bash
cd keyword-trend-api
railway up

cd ../leanforge-frontend
railway up
```

### Option B: Script Deploy
```bash
cd "E:\LeanForge Keyword Trend Index"
bash deploy.sh
```

## Post-Deployment

### 4. Add Custom Domain
```bash
cd leanforge-frontend
railway domain add lean-forge.net
```

### 5. Configure DNS
- Add CNAME record: `lean-forge.net` → `[railway-domain]`
- Wait for SSL provisioning

### 6. Verify
- Check health: `https://lean-forge.net/api/health`
- Check API: `https://[backend-url]/api/v1/keywords`

## InsForge Auth Setup

1. Go to: https://28he5ctp.us-east.insforge.app/project/auth/settings
2. Enable Google and Apple providers
3. Set redirect URL: `https://lean-forge.net/auth/callback`
4. Save settings

## Troubleshooting

- **Build fails**: Check `railway logs`
- **Database connection**: Verify `DATABASE_URL` format
- **Redis connection**: Ensure `rediss://` (with SSL)
- **CORS errors**: Update `CORS_ORIGIN` in backend env

## Services Summary

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://lean-forge.net | 🟡 Pending |
| Backend API | https://[railway-url] | 🟡 Pending |
| Database | Neon PostgreSQL | 🟡 Pending |
| Cache | Upstash Redis | 🟡 Pending |
| Auth | InsForge | ✅ Ready |
