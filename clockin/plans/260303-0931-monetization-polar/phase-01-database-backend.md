# Phase 1: Database & Backend

## Context Links
- [Polar SDK docs](https://docs.polar.sh)
- [Supabase server client](../../src/lib/supabase/server.ts)
- [Existing API route pattern](../../src/app/api/ai/insights/route.ts)

## Overview
- **Priority:** P1 (foundation for all other phases)
- **Status:** pending
- **Description:** Create Supabase table for subscription state, webhook endpoint for Polar events, checkout API, and billing status API.

## Key Insights
- Polar is MoR; we only store subscription status, not payment details
- Webhook verifies signature using `@polar-sh/sdk` `validateEvent()` or raw HMAC
- Existing API routes use `createClient()` from `@/lib/supabase/server` with `NextResponse.json()`
- All services use Supabase client directly; API routes are server-side only

## Requirements

### Functional
- Store subscription status per user (plan type, status, expiry)
- Handle Polar webhook events: `subscription.created`, `subscription.updated`, `subscription.canceled`, `order.created` (lifetime)
- Create checkout sessions that redirect to Polar
- Return current subscription status for authenticated user

### Non-functional
- Webhook must verify Polar signature (security)
- Idempotent webhook handling (upsert by polar_subscription_id)
- Response times <200ms for billing status

## Architecture

### Supabase Table: `user_subscriptions`
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  polar_customer_id TEXT,
  polar_subscription_id TEXT UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'lifetime')),
  billing_interval TEXT CHECK (billing_interval IN ('month', 'year', NULL)),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One active subscription per user
CREATE UNIQUE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- RLS: users can read own subscription
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### API Routes

1. **POST `/api/webhooks/polar`** - No auth (Polar calls this)
2. **POST `/api/checkout`** - Authenticated, body: `{ priceId: string }`
3. **GET `/api/billing`** - Authenticated, returns subscription status

## Related Code Files

### Files to Create
- `src/app/api/webhooks/polar/route.ts` (~80 lines)
- `src/app/api/checkout/route.ts` (~40 lines)
- `src/app/api/billing/route.ts` (~30 lines)
- `src/services/subscription-service.ts` (~60 lines)
- `src/types/subscription.ts` (~25 lines)
- `supabase/migrations/YYYYMMDD_add_user_subscriptions.sql`

### Files to Modify
- `.env.local` - Add POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET, POLAR_ORGANIZATION_ID
- `package.json` - Add `@polar-sh/sdk`

## Implementation Steps

### 1. Install Polar SDK
```bash
npm install @polar-sh/sdk
```

### 2. Create types file `src/types/subscription.ts`
```ts
export type PlanType = "free" | "pro" | "lifetime";
export type BillingInterval = "month" | "year" | null;
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "incomplete";

export interface UserSubscription {
  id: string;
  user_id: string;
  polar_customer_id: string | null;
  polar_subscription_id: string | null;
  plan_type: PlanType;
  billing_interval: BillingInterval;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProStatus {
  isPro: boolean;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  isLoading: boolean;
}
```

### 3. Create Supabase migration
Run the SQL from Architecture section above.

### 4. Create `src/services/subscription-service.ts`
Service layer for subscription CRUD:
- `getSubscription(userId)` - read from `user_subscriptions`, default to free
- `upsertSubscription(data)` - upsert by user_id or polar_subscription_id

### 5. Create webhook route `src/app/api/webhooks/polar/route.ts`
- Read raw body, verify Polar webhook signature
- Parse event type, extract subscription/order data
- Map Polar product IDs to plan_type using env vars (POLAR_PRO_MONTHLY_PRODUCT_ID, POLAR_PRO_ANNUAL_PRODUCT_ID, POLAR_LIFETIME_PRODUCT_ID)
- Upsert into `user_subscriptions`
- Return 200

### 6. Create checkout route `src/app/api/checkout/route.ts`
- Authenticate user via Supabase server client
- Accept `{ priceId: string }` body
- Use Polar SDK to create checkout session with `successUrl` and `customerEmail`
- Return `{ url: checkoutUrl }`

### 7. Create billing route `src/app/api/billing/route.ts`
- Authenticate user
- Query `user_subscriptions` for user
- Return subscription or default free status

### 8. Add env vars
```
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_ORGANIZATION_ID=
POLAR_PRO_MONTHLY_PRODUCT_ID=
POLAR_PRO_ANNUAL_PRODUCT_ID=
POLAR_LIFETIME_PRODUCT_ID=
```

## Todo List
- [ ] Install `@polar-sh/sdk`
- [ ] Create `src/types/subscription.ts`
- [ ] Run Supabase migration for `user_subscriptions` table + RLS
- [ ] Create `src/services/subscription-service.ts`
- [ ] Create `src/app/api/webhooks/polar/route.ts`
- [ ] Create `src/app/api/checkout/route.ts`
- [ ] Create `src/app/api/billing/route.ts`
- [ ] Add env vars to `.env.local` and Vercel
- [ ] Test webhook with Polar test events
- [ ] Test checkout flow end-to-end

## Success Criteria
- Webhook correctly processes all Polar event types and upserts subscription
- Checkout creates valid Polar session and redirects user
- Billing endpoint returns correct plan status
- Free users have no subscription row (or row with plan_type='free')
- Webhook signature verification rejects invalid payloads

## Risk Assessment
- **Polar SDK breaking changes**: Pin SDK version in package.json
- **Webhook delivery failures**: Polar retries; idempotent upsert handles duplicates
- **Race conditions**: Unique constraint on user_id prevents duplicate rows

## Security Considerations
- Webhook signature verification is mandatory (reject unverified requests)
- Never expose POLAR_ACCESS_TOKEN to client
- RLS ensures users can only read their own subscription
- Webhook route must not require auth (Polar server-to-server)
