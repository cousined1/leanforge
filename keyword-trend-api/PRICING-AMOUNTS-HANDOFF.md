# LeanForge Pricing Amounts — IDE Handoff

> **Purpose:** When changing subscription prices, update ALL surfaces below so the app stays consistent.

---

## 1. Homepage Pricing Cards
**File:** `frontend/src/components/PricingTable.tsx`
- **What:** The main pricing display on the marketing homepage
- **Key prop:** `plans` array with `price` fields (e.g., `$9.99`, `$29.99`, `$49.99`)
- **Check:** After edit, verify the cards render with the new amounts

## 2. Dedicated /pricing Page
**File:** `frontend/src/pages/Pricing.tsx`
- **What:** Separate `/pricing` route that can drift stale if only the homepage is updated
- **Check:** Navigate to `/pricing` and confirm amounts match homepage

## 3. Stripe Setup Documentation
**File:** `docs/STRIPE-SETUP.md`
- **What:** Internal docs tracking Stripe price IDs and their mapped amounts
- **Check:** Update the amount column if price IDs change, or add new rows for new tiers

---

## Verification Steps
1. Edit all 3 files above with the same new amounts
2. Run `npm run build` in `keyword-trend-api/` (or let the IDE typecheck)
3. Confirm no TypeScript errors in the pricing components
4. (Optional) Search the repo for the old price string to catch any missed occurrences

---

## Contact
If you find a 4th surface with pricing amounts, add it to this file so the next editor knows.
