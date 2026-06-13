# LeanForge Deployment Checklist

## Pre-Deployment (Do This First)

### 1. Clean Up Duplicate Railway Projects
Before linking or deploying, delete the duplicate/empty LeanForge projects in the Railway dashboard:
- Go to https://railway.com/dashboard
- Delete these projects (verify they have **0 services** first):
  - `leanforge-frontend` — `dba26004-d0e3-4d4e-8209-69f442cf4b73`
  - `leanforge-frontend` — `453273cd-c5ad-4fdf-b6a5-0b152a8cbd71`
  - `leanforge-frontend` — `fa1dde38-c29f-4474-9556-70f68d2c67ff`
- Delete the old backend duplicate:
  - `leanforge-api` — `44ba6cd9-0136-424a-8f8c-1fdcc7561b7e`

**Keep these two live projects:**
- `leanforge-api` — `fdf4412f-67c8-4e24-bed6-7154c3fbf952`
- `leanforge-frontend` — `07c0b43e-1e86-4a8c-b36b-61c562c0d38d`

### 2. Railway Login
```bash
railway login
```

### 3. Link Each Service Directory
This repo is a monorepo. Each subdirectory has its own `railway.json` and links to its own Railway project. **Do not run `railway up` from the repo root.**

```bash
# Backend
cd keyword-trend-api
railway link fdf4412f-67c8-4e24-bed6-7154c3fbf952

# Frontend
cd ../leanforge-frontend
railway link 07c0b43e-1e86-4a8c-b36b-61c562c0d38d
```

### 4. Set Environment Variables

**Backend (`keyword-trend-api`):**
```bash
cd keyword-trend-api
railway variables set DATABASE_URL="postgresql://..."
railway variables set REDIS_URL="rediss://..."
railway variables set SERPER_API_KEY="..."
railway variables set API_SECRET_KEY="..."
railway variables set API_SECRET_KEY_NEXT="..." # optional, for key rotation windows
railway variables set INSFORGE_API_KEY="ik_YOUR_INSFORGE_API_KEY_HERE"
railway variables set INSFORGE_BASE_URL="https://YOUR_PROJECT.us-east.insforge.app"
railway variables set ENFORCE_HTTPS="true"
railway variables set ANONYMIZE_LOG_IPS="true"
```

**Frontend (`leanforge-frontend`):**
```bash
cd leanforge-frontend
railway variables set NEXT_PUBLIC_API_URL="https://[backend-url]/api/v1"
railway variables set NEXT_PUBLIC_SITE_URL="https://lean-forge.net"
railway variables set NEXT_PUBLIC_INSFORGE_URL="https://YOUR_PROJECT.us-east.insforge.app"
railway variables set NEXT_PUBLIC_INSFORGE_ANON_KEY="YOUR_PUBLIC_ANON_KEY_HERE"
```

## Deployment

### Manual Deploy
```bash
# Backend
cd keyword-trend-api
railway up

# Frontend
cd ../leanforge-frontend
railway up
```

### Script Deploy
```bash
bash deploy.sh
```

## Post-Deployment

### Add Custom Domain
```bash
cd leanforge-frontend
railway domain add lean-forge.net
```

### Configure DNS
- Add CNAME record: `lean-forge.net` → `[railway-domain]`
- Wait for SSL provisioning

### Verify
- Check health: `https://lean-forge.net/api/health`
- Check API: `https://[backend-url]/api/v1/keywords`

## InsForge Auth Setup

1. Go to: `https://YOUR_PROJECT.us-east.insforge.app/project/auth/settings`
2. Enable Google and Apple providers
3. Set redirect URL: `https://lean-forge.net/auth/callback`
4. Save settings

## Troubleshooting

- **Build fails**: Check `railway logs`
- **Database connection**: Verify `DATABASE_URL` format
- **Redis connection**: Ensure `rediss://` (with SSL)
- **CORS errors**: Update `CORS_ORIGIN` in backend env
- **New duplicate Railway projects appear**: You ran `railway up` from the repo root or without `railway link`. Re-link each subdirectory to the correct project IDs above.

## Services Summary

| Service | Railway Project ID | URL | Status |
|---------|-------------------|-----|--------|
| Frontend | `07c0b43e-1e86-4a8c-b36b-61c562c0d38d` | https://lean-forge.net | 🟡 Pending |
| Backend API | `fdf4412f-67c8-4e24-bed6-7154c3fbf952` | https://[railway-url] | 🟡 Pending |
| Database | Neon PostgreSQL | — | 🟡 Pending |
| Cache | Upstash Redis | — | 🟡 Pending |
| Auth | InsForge | — | ✅ Ready |
