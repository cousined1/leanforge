# LeanForge Operations Runbook

## Launch-Day Incident Owner

**Primary:** Edward Brooks — edward@developer312.com
**Backup:** hello@developer312.com

## Escalation Path

| Severity | Definition | Response | Contact |
|----------|------------|----------|---------|
| **SEV1** | Revenue down or core functionality broken for all users | < 15 min | Primary + Backup |
| **SEV2** | Feature degraded or partial outage | < 1 hr | Primary |
| **SEV3** | Cosmetic issue, non-critical bug | Next business day | Issue tracker |

**2am pager:** If checkout/auth/password-reset breaks, call Primary. If unreachable after 15 min, page Backup.

## Database Rollback

```bash
# 1. SSH into Railway or use Railway CLI
railway run

# 2. Check migration history
npx prisma migrate status

# 3. Roll back last migration
npx prisma migrate resolve --rolled-back "migration_name"

# 4. Verify
npx prisma migrate status
```

To fully restore from backup (Neon):
1. Go to Neon Console → Branches → Restore
2. Select the Point-in-Time or snapshot restore point
3. Update `DATABASE_URL` in Railway env vars if branch changes
4. Run `npx prisma migrate deploy` on restored branch

## Backup Verification

- Neon automated backups run daily
- **Restore test cadence:** Every 90 days (or before any major schema change)
- To test: create a Neon branch from the latest snapshot, run the API against it, verify queries return expected data

## Deployment Rollback

**Railway (one-click):**
1. Go to Railway dashboard → project → Deployments
2. Find the last known-good deployment
3. Click "Redeploy" — Railway rebuilds and re-deploys that image
4. Verify health endpoint returns 200

If Railway deploy is broken and you need to revert a code change:
1. `git revert HEAD` (or the offending commit)
2. Push to main — Railway auto-deploys
3. Verify health check

## Cost Alerts

**Configure before launch (one-time, ~15 min):**

| Provider | Alert Type | Threshold | Setup Location |
|----------|-----------|-----------|----------------|
| Railway | Usage notification | 50%, 75%, 100% of budget | Railway dashboard → Billing |
| Neon | Spend limit | Free tier cap ($0) | Neon Console → Billing |
| Upstash | Usage alert | Free tier cap | Upstash Console → Alerts |
| Serper.dev | Usage monitor | API call count | Serper dashboard |

**Current expected monthly spend:** $0 (all services on free tier during MVP)

## Common Operations

### Rotate an API secret

```bash
# 1. Generate new secret
openssl rand -hex 32

# 2. Set as NEXT key in Railway
railway variables set API_SECRET_KEY_NEXT="<new-secret>"

# 3. After confirming old key is unused, promote:
railway variables set API_SECRET_KEY="<new-secret>"
railway variables set API_SECRET_KEY_NEXT=""
```

### Ban a user

Currently no user management UI exists (MVP). To ban:
1. Identify the user's InsForge user ID
2. Contact InsForge support or use InsForge admin dashboard to disable the user
3. If the user has no gated features, banning is informational only

### Refund a charge

No billing integration exists during free MVP. Skip this operation until monetization is added.

### Check system health

```bash
# Frontend
curl https://lean-forge.net/api/health

# Backend
curl https://[railway-api-url]/api/v1/health

# Expected: {"status":"ok","timestamp":"..."}
```
