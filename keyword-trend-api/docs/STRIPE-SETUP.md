# Stripe Setup — Price IDs & Amounts

> Source of truth for what LeanForge charges. The **amount** lives in the Stripe
> Price object (Stripe Dashboard); the app only references it by **Price ID** via
> a Railway env var. Changing a number on the site does **not** change what Stripe
> charges — and vice versa. Keep this table, Stripe, and the display surfaces in sync.

## Plans

| Plan    | Stripe Price ID env var   | Amount   | Limit (req / 15 min) | History |
|---------|---------------------------|----------|----------------------|---------|
| Free    | — (default, no checkout)  | $0       | 100                  | 7-day   |
| Starter | `STRIPE_PRICE_ID_STARTER` | $29 / mo | 1,000                | 90-day  |
| Growth  | `STRIPE_PRICE_ID_GROWTH`  | $99 / mo | 10,000               | 365-day |

Limits are enforced by `PLAN_LIMITS` in `src/routes/billingRoutes.ts`
(`free: 100, starter: 1000, growth: 10000`). Checkout
(`POST /api/v1/billing/checkout`) accepts only `starter` and `growth`.

## Where the amounts live

- **Stripe Dashboard → Products → Price objects.** Each paid plan is a recurring Price.
- The Price **ID** (`price_...`) is set in Railway env: `STRIPE_PRICE_ID_STARTER`,
  `STRIPE_PRICE_ID_GROWTH` (alongside `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- The billing path never hardcodes a dollar amount — it passes the Price ID
  straight to Stripe Checkout (`src/routes/billingRoutes.ts`).

## How to change a price

1. In Stripe, create a **new** Price on the existing Product. Stripe Prices are
   immutable — you cannot edit the amount of an existing one.
2. Update the matching Railway env var to the new `price_...` ID, then redeploy.
3. Update every **display** surface to the new amount (see `PRICING-AMOUNTS-HANDOFF.md`):
   - `frontend/src/components/PricingTable.tsx` — homepage cards
   - `frontend/src/pages/Pricing.tsx` — `/pricing`
   - `frontend/src/pages/Faq.tsx` — "Is the API free to use?" answer
   - `frontend/src/pages/HelpCenter.tsx` — "Pricing & plans" card
4. Update the table above.
5. Existing subscribers keep their old price until they re-subscribe — Stripe does
   not retro-change active subscriptions when you swap the Price ID.

## Current values (2026-06-22)

Free $0 / Starter $29 / Growth $99 — matches the spec (`master-prompt.txt`),
Phase 2 (`PHASE1-2.md`), and `PLAN_LIMITS`.
