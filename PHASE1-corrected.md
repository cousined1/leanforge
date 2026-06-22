# LeanForge — Phase 1 Corrected Spec
## Auth (Backend Validation) + Subscription Model
**Date:** 2026-06-20
**Status:** READY TO BUILD
**Target:** Live Next.js 14 frontend (`leanforge-frontend/`) + Express backend (`keyword-trend-api/`)
**Architecture:** Option A — backend validates InsForge JWTs, no User table, lean Subscription model

---

## CONTEXT

The original `PHASE1-2.md` spec was written against the legacy Vite SPA at `keyword-trend-api/frontend/`. The live production frontend is **Next.js 14 at `leanforge-frontend/`** and most of Phase 1's frontend work is already shipped. This corrected spec scopes Phase 1 down to what is actually missing: backend JWT validation + a Subscription model for Phase 2 prep.

### What's already built (do NOT touch)

| File | State |
|---|---|
| `leanforge-frontend/src/lib/insforge.ts` | ✅ Wraps `@insforge/sdk` with Google + Apple OAuth |
| `leanforge-frontend/src/components/AuthProvider.tsx` | ✅ React context with `useAuth()` hook |
| `leanforge-frontend/src/components/SignInPanel.tsx` | ✅ Real OAuth button UI with error states |
| `leanforge-frontend/src/components/AuthCallbackClient.tsx` | ✅ Real callback handler with 10s timeout fallback |
| `leanforge-frontend/src/app/sign-in/page.tsx` | ✅ Server component wrapper |
| `leanforge-frontend/src/app/auth/callback/page.tsx` | ✅ Server component wrapper (noindex) |
| `leanforge-frontend/src/components/Header.tsx` | ✅ Already gates on `useAuth()` — shows email + sign-out |
| `leanforge-frontend/src/app/layout.tsx` | ✅ `<AuthProvider>` mounted at root |
| `leanforge-frontend/.env.local` + `insforge.toml` | ✅ InsForge URL + anon key + redirect URLs configured |
| `@insforge/sdk` in `leanforge-frontend/package.json` | ✅ Installed |

---

## ARCHITECTURE

```
┌─────────────────────────────┐         ┌──────────────────────────┐
│  leanforge-frontend (Next)  │         │  keyword-trend-api (Exp) │
│  ────────────────────────   │         │  ──────────────────────  │
│  useAuth() → insforge SDK   │         │  requireInsForgeUser     │
│       │                     │         │       │                  │
│       └─ Bearer token ────► │ ──HTTP─►│       ├─► insforge.auth │
│                             │         │       │   .getCurrentUser│
│                             │         │       │                  │
│                             │         │       └─► prisma.subscription.upsert │
└─────────────────────────────┘         └──────────────────────────┘
```

- **Auth identity** = InsForge (single source of truth, owns JWTs + sessions)
- **Billing state** = Prisma `Subscription` table (mirrors InsForge user → Stripe data)
- **No User model** in Prisma — `insforgeUserId` is a string we trust InsForge to validate

---

## Step 1.1 — Add `Subscription` model to Prisma

**File:** `keyword-trend-api/prisma/schema.prisma` — APPEND after `TrendingTopic`:

```prisma
// Phase 1 — Billing-state mirror (auth state lives in InsForge).
// insforgeUserId is a logical FK — InsForge owns the canonical user identity.
model Subscription {
  insforgeUserId   String    @id   // logical FK to InsForge user.id
  stripeCustomerId String?   @unique
  plan             String    @default("free")  // free | starter | growth
  status           String?                     // active | past_due | canceled | null
  currentPeriodEnd DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([stripeCustomerId])
  @@index([plan])
}
```

Then run:
```bash
cd keyword-trend-api
npx prisma migrate dev --name add_subscription_model
```

**Note:** No User model. The `insforgeUserId` is just a string we trust InsForge to validate. If the InsForge user disappears, we have an orphan row — acceptable for Phase 1 (Stripe will be the source of truth on plan status anyway).

---

## Step 1.2 — Add InsForge env vars to backend

**File:** `keyword-trend-api/.env.example` — ADD:

```env
# InsForge (server-side, validates JWTs from frontend)
INSFORGE_URL=https://28he5ctp.us-east.insforge.app
INSFORGE_ANON_KEY=ik_8dc6f90c17d1c8c89a9819cbe0191888
```

**Also add to Railway `leanforge-api` service env vars** (same values as the frontend).

---

## Step 1.3 — Add `requireInsForgeUser` middleware

**File:** `keyword-trend-api/src/middleware/insforgeAuth.ts` — CREATE:

```typescript
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@insforge/sdk';
import { config } from '../config/env';

const insforge = createClient({
  baseUrl: config.INSFORGE_URL,
  anonKey: config.INSFORGE_ANON_KEY,
});

declare global {
  namespace Express {
    interface Request {
      insforgeUser?: {
        id: string;
        email: string;
        role: string;
      };
      insforgeToken?: string;
    }
  }
}

export async function requireInsForgeUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'unauthorized', reason: 'missing_bearer' });
    return;
  }

  const token = authHeader.slice(7);
  const { data, error } = await insforge.auth.getCurrentUser({ token });

  if (error || !data?.user) {
    res.status(401).json({ error: 'unauthorized', reason: 'invalid_token' });
    return;
  }

  req.insforgeUser = {
    id: data.user.id,
    email: data.user.email,
    role: data.user.role,
  };
  req.insforgeToken = token;
  next();
}
```

---

## Step 1.4 — Add `/api/v1/auth/me` route

**File:** `keyword-trend-api/src/routes/authRoutes.ts` — CREATE:

```typescript
import { Router } from 'express';
import { prisma } from '../config/database';
import { requireInsForgeUser } from '../middleware/insforgeAuth';

export const authRoutes = Router();

authRoutes.get('/me', requireInsForgeUser, async (req, res) => {
  const user = req.insforgeUser!;

  // Lazy-create subscription record so Phase 2 can join without an extra hop.
  const subscription = await prisma.subscription.upsert({
    where: { insforgeUserId: user.id },
    create: { insforgeUserId: user.id, plan: 'free' },
    update: {}, // never overwrite billing fields on read
  });

  res.json({
    data: {
      user: { id: user.id, email: user.email, role: user.role },
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    },
  });
});
```

---

## Step 1.5 — Mount `authRoutes` in Express

**File:** `keyword-trend-api/src/index.ts` — ADD after the rate limiter:

```typescript
import { authRoutes } from './routes/authRoutes';

// ... existing middleware ...
app.use('/api/v1/auth', authRoutes);
```

**Order matters:** mount *after* `app.use(express.json())` and rate limiter, *before* the static-frontend block.

---

## Step 1.6 — Add `getMe()` helper to frontend API client

**File:** `leanforge-frontend/src/lib/api.ts` — APPEND:

```typescript
export interface MeResponse {
  user: { id: string; email: string; role: string };
  subscription: {
    plan: 'free' | 'starter' | 'growth';
    status: string | null;
    currentPeriodEnd: string | null;
  };
}

export async function getMe(token: string): Promise<MeResponse | null> {
  const { data } = await api.get<MeResponse>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
```

**Note:** Caller must pass the InsForge access token (read from `insforge.auth.getSession()` in the browser, or from the SDK's session store). Wiring `getMe()` to live UI is optional for Phase 1 — the frontend already has user state via `useAuth()`. `getMe()` exists for Phase 2 (plan-aware rate limits, plan badge in header) and for confirming server-side token validation works.

---

## Step 1.7 — Verify end-to-end (manual smoke test)

```bash
# 1. Local backend up
cd keyword-trend-api && npm run dev

# 2. Local frontend up
cd leanforge-frontend && npm run dev

# 3. In browser:
#    - Visit http://localhost:3000/sign-in
#    - Click "Continue with Google" → real OAuth → lands on /auth/callback
#    - AuthCallbackClient redirects to /keywords
#    - Header shows your email + Sign out button

# 4. From a logged-in browser session, grab the InsForge access token:
#    Open DevTools → Console → run: await window.insforge?.auth?.getSession()
#    (or read from the SDK's storage; the key is implementation-specific)

# 5. With that token, hit the backend:
TOKEN="<paste-token>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/auth/me

# Expected: { "data": { "user": {...}, "subscription": { "plan": "free", ... } } }
# Also: prisma.subscription row now exists for that insforgeUserId.
```

---

## Step 1.8 — Deploy to Railway

1. Push branch
2. `leanforge-api` Railway service: set `INSFORGE_URL` and `INSFORGE_ANON_KEY` env vars (same values as frontend)
3. Trigger deploy — Prisma migration runs automatically via `npx prisma migrate deploy` in `railway.toml`
4. Verify with curl against `https://api.leans-forge.net/api/v1/auth/me` using a real InsForge token

---

## FILE MANIFEST (Phase 1 corrected)

| File | Action |
|---|---|
| `keyword-trend-api/prisma/schema.prisma` | EDIT — add `Subscription` model |
| `keyword-trend-api/prisma/migrations/...` | GENERATED — `add_subscription_model` |
| `keyword-trend-api/.env.example` | EDIT — add `INSFORGE_URL`, `INSFORGE_ANON_KEY` |
| `keyword-trend-api/.env` | EDIT — same |
| `keyword-trend-api/package.json` | EDIT — add `@insforge/sdk` dependency (if not present) |
| `keyword-trend-api/src/config/env.ts` | EDIT — expose `INSFORGE_URL`, `INSFORGE_ANON_KEY` |
| `keyword-trend-api/src/middleware/insforgeAuth.ts` | **CREATE** |
| `keyword-trend-api/src/routes/authRoutes.ts` | **CREATE** |
| `keyword-trend-api/src/index.ts` | EDIT — mount `authRoutes` |
| `leanforge-frontend/src/lib/api.ts` | EDIT — add `getMe()` helper + `MeResponse` type |
| `PHASE1-corrected.md` | **CREATE** — this file |

**No changes to:** sign-in page, callback page, AuthProvider, SignInPanel, AuthCallbackClient, Header, layout. All already production-grade.

---

## WHAT THIS UNLOCKS (Phase 2 prep)

- `Subscription` table exists and lazy-creates on first `/auth/me` call
- `requireInsForgeUser` middleware is reusable for any user-scoped route
- `getMe()` is ready to power plan-aware UI (e.g., plan badge, paywall gates)
- Stripe webhooks (Phase 2) can `prisma.subscription.upsert({ where: { insforgeUserId }, ... })` to set `plan` + `stripeCustomerId` + `currentPeriodEnd`

---

*Spec by Sisyphus · June 20, 2026 · Phase 1 (corrected for live Next.js frontend)*
