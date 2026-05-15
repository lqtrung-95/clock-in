# Phase 2: Pro Status Hook

## Context Links
- [Phase 1: Database & Backend](phase-01-database-backend.md)
- [useAuthState hook pattern](../../src/hooks/use-auth-state.ts)
- [useGamification hook pattern](../../src/hooks/use-gamification.ts)
- [Types](../../src/types/subscription.ts) (created in Phase 1)

## Overview
- **Priority:** P1 (required before feature gating)
- **Status:** pending
- **Description:** Create `useProStatus` hook that fetches subscription status via TanStack Query, providing `isPro`, `plan`, `isLoading` to the entire app.

## Key Insights
- App uses TanStack Query for server data (e.g., `["categories", userId]`, `["dashboard", userId]`)
- `useAuthState` provides `userId` and `isAuthenticated`
- Hook should be simple: fetch from `/api/billing`, cache result
- Guest users (no auth) are always "free" — no API call needed

## Requirements

### Functional
- Return `{ isPro, plan, isLoading, subscription }` from hook
- `isPro` = true when plan_type is 'pro' or 'lifetime' AND status is 'active'
- Auto-refetch when subscription changes (invalidate on checkout return)

### Non-functional
- Cache subscription for 5 min (staleTime) — rarely changes mid-session
- No unnecessary re-renders

## Architecture

```
useProStatus(userId)
  -> useQuery(["subscription", userId], fetchBilling)
  -> returns { isPro, plan, isLoading, subscription }
```

## Related Code Files

### Files to Create
- `src/hooks/use-pro-status.ts` (~45 lines)

### Files to Modify
- None

## Implementation Steps

### 1. Create `src/hooks/use-pro-status.ts`
```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import type { PlanType, SubscriptionStatus } from "@/types/subscription";

interface BillingResponse {
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_end: string | null;
  billing_interval: "month" | "year" | null;
}

async function fetchBilling(): Promise<BillingResponse> {
  const res = await fetch("/api/billing");
  if (!res.ok) throw new Error("Failed to fetch billing");
  return res.json();
}

export function useProStatus(userId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: fetchBilling,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 1,
  });

  const plan: PlanType = data?.plan_type ?? "free";
  const status: SubscriptionStatus = data?.status ?? "active";
  const isPro = (plan === "pro" || plan === "lifetime") && status === "active";

  return {
    isPro,
    plan,
    status,
    currentPeriodEnd: data?.current_period_end ?? null,
    billingInterval: data?.billing_interval ?? null,
    isLoading: !!userId && isLoading,
  };
}
```

### 2. Invalidation on checkout return
When user returns from Polar checkout, invalidate subscription query:
```ts
queryClient.invalidateQueries({ queryKey: ["subscription", userId] });
```
This will be wired in Phase 4 (checkout success page).

## Todo List
- [ ] Create `src/hooks/use-pro-status.ts`
- [ ] Verify hook returns correct defaults for unauthenticated users
- [ ] Test with mock billing API response

## Success Criteria
- `useProStatus(null)` returns `{ isPro: false, plan: "free", isLoading: false }`
- `useProStatus(userId)` fetches from `/api/billing` and caches result
- Re-renders minimally (staleTime prevents unnecessary refetches)

## Risk Assessment
- Minimal risk — simple read-only hook following established patterns

## Next Steps
- Phase 3 uses `useProStatus` to gate features
- Phase 4 uses query invalidation after checkout
