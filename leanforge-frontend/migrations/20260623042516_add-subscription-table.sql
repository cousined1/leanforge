-- Phase 1 billing-state mirror (auth identity lives in InsForge).
-- insforgeUserId is a logical FK to auth.users(id); ON DELETE CASCADE keeps the
-- InsForge side clean if the canonical user row is removed. Stripe remains the
-- source of truth for billing state, so the FK is not enforced as RESTRICT.
CREATE TABLE "Subscription" (
    "insforgeUserId"   UUID        NOT NULL,
    "stripeCustomerId" TEXT,
    "plan"             TEXT        NOT NULL DEFAULT 'free',
    "status"           TEXT,
    "currentPeriodEnd" TIMESTAMPTZ,
    "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("insforgeUserId"),
    CONSTRAINT "Subscription_stripeCustomerId_key" UNIQUE ("stripeCustomerId"),
    CONSTRAINT "Subscription_insforgeUserId_fkey"
        FOREIGN KEY ("insforgeUserId") REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription" ("stripeCustomerId");
CREATE INDEX "Subscription_plan_idx"             ON "Subscription" ("plan");

-- updatedAt trigger: keep the timestamp in sync without app-side logic.
CREATE OR REPLACE FUNCTION "Subscription_set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Subscription_updated_at"
    BEFORE UPDATE ON "Subscription"
    FOR EACH ROW
    EXECUTE FUNCTION "Subscription_set_updated_at"();

-- RLS: a user can only read and write their own subscription row.
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscription_select_own"
    ON "Subscription" FOR SELECT
    USING ("insforgeUserId" = auth.uid());

CREATE POLICY "Subscription_insert_own"
    ON "Subscription" FOR INSERT
    WITH CHECK ("insforgeUserId" = auth.uid());

CREATE POLICY "Subscription_update_own"
    ON "Subscription" FOR UPDATE
    USING ("insforgeUserId" = auth.uid())
    WITH CHECK ("insforgeUserId" = auth.uid());

-- Service role (project_admin via the API key) bypasses RLS for webhook-driven
-- updates from Stripe; no policy needed for that path.