# Phase 3: Feature Gating

## Context Links
- [Phase 2: Pro Status Hook](phase-02-pro-status-hook.md)
- [Category service](../../src/services/category-service.ts)
- [Time entry service](../../src/services/time-entry-service.ts)
- [AI insights route](../../src/app/api/ai/insights/route.ts)
- [Social service](../../src/services/social-service.ts)

## Overview
- **Priority:** P1
- **Status:** pending
- **Description:** Enforce free-tier limits across services and UI. Show upgrade prompts (soft gates) rather than hard blocks where possible.

## Key Insights
- Category limit (5 max for free) should be enforced at service level in `createCategory`
- History limit (7 days for free) already uses `days` param in `timeEntryService.getEntries()`
- AI routes should check subscription server-side (they already check auth)
- Social/focus-rooms gating is UI-level (components check `isPro`)
- Gating should feel encouraging, not punishing — show what they're missing

## Requirements

### Functional
| Feature | Free | Pro |
|---------|------|-----|
| Categories | Max 5 | Unlimited |
| History | 7 days | Unlimited |
| AI Insights | Blocked | Full access |
| AI Chat | Blocked | Full access |
| Advanced Stats (heatmap) | Blocked | Full access |
| Social / Focus Rooms | Blocked | Full access |
| Data Export | Blocked | Full access |
| Custom Themes | Blocked | Full access |

### Non-functional
- Limit checks must not add latency to normal operations
- Upgrade prompts should be non-intrusive

## Architecture

### Two Gating Strategies

**1. Server-side gating (hard limit):**
- Category creation: check count before insert
- AI routes: check subscription before calling Groq
- History queries: enforce date range

**2. Client-side gating (soft limit / UI prompt):**
- Components check `isPro` from `useProStatus`
- Show `<UpgradePrompt />` component instead of gated feature
- Never hide features entirely — show preview + upgrade CTA

### Shared Component: `<UpgradePrompt />`
Reusable component shown when free user tries to access Pro feature.
Props: `feature` (string describing what's locked), `compact` (boolean for inline vs full-width).

## Related Code Files

### Files to Create
- `src/components/billing/upgrade-prompt.tsx` (~60 lines)

### Files to Modify
- `src/services/category-service.ts` — Add count check in `createCategory`
- `src/services/time-entry-service.ts` — Add plan-aware `getEntries` variant
- `src/app/api/ai/insights/route.ts` — Add subscription check
- `src/app/api/ai/chat/route.ts` — Add subscription check
- `src/app/api/ai/suggest-session/route.ts` — Add subscription check
- `src/app/api/ai/suggest-category/route.ts` — Add subscription check
- `src/app/api/ai/focus-insights/route.ts` — Add subscription check
- Stats page components — Wrap heatmap/advanced with `isPro` check
- Social page — Wrap with `isPro` check
- Focus room components — Wrap with `isPro` check

## Implementation Steps

### 1. Create `src/components/billing/upgrade-prompt.tsx`
```tsx
// Reusable upgrade CTA component
// Props: feature (string), compact (boolean), onUpgrade (callback)
// Shows: icon + "Unlock {feature} with Pro" + upgrade button
// compact mode: inline badge-style for embedding in existing UI
// full mode: card with feature description + pricing info
```

### 2. Server-side: Category limit in `category-service.ts`
Add to `createCategory`:
```ts
// Before insert, count existing categories
const { count } = await supabase
  .from("categories")
  .select("*", { count: "exact", head: true })
  .eq("user_id", userId)
  .eq("is_archived", false);

// Check subscription (fetch from user_subscriptions)
const { data: sub } = await supabase
  .from("user_subscriptions")
  .select("plan_type")
  .eq("user_id", userId)
  .single();

const isPro = sub?.plan_type === "pro" || sub?.plan_type === "lifetime";
if (!isPro && (count ?? 0) >= 5) {
  throw new Error("CATEGORY_LIMIT_REACHED");
}
```

### 3. Server-side: AI route gating
Add helper `src/lib/check-pro-access.ts` (~20 lines):
```ts
import { createClient } from "@/lib/supabase/server";

export async function checkProAccess(): Promise<{ userId: string; isPro: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("plan_type")
    .eq("user_id", user.id)
    .single();

  const isPro = sub?.plan_type === "pro" || sub?.plan_type === "lifetime";
  return { userId: user.id, isPro };
}
```

Add to each AI route at the top:
```ts
const { userId, isPro } = await checkProAccess();
if (!isPro) return NextResponse.json({ error: "Pro required" }, { status: 403 });
```

### 4. Client-side: History page date limit
In history page, pass `days` based on `isPro`:
```ts
const { isPro } = useProStatus(userId);
const entries = useQuery({
  queryKey: ["history", userId, isPro],
  queryFn: () => timeEntryService.getEntries(userId!, isPro ? 365 : 7),
});
```

### 5. Client-side: Stats page gating
Wrap advanced stats components (heatmap, period comparison) with:
```tsx
{isPro ? <HeatmapChart ... /> : <UpgradePrompt feature="Advanced Analytics" />}
```

### 6. Client-side: Social page gating
Wrap social page content:
```tsx
{isPro ? <SocialContent ... /> : <UpgradePrompt feature="Social Features & Focus Rooms" />}
```

### 7. Client-side: Category creation UI
In category creation dialog/form, check before submitting:
```tsx
if (!isPro && categories.length >= 5) {
  // Show upgrade prompt instead of create form
}
```

## Todo List
- [ ] Create `src/components/billing/upgrade-prompt.tsx`
- [ ] Create `src/lib/check-pro-access.ts` helper
- [ ] Add category limit to `category-service.ts`
- [ ] Gate all 5 AI routes with pro check
- [ ] Gate history page date range
- [ ] Gate advanced stats (heatmap, comparisons)
- [ ] Gate social page and focus rooms
- [ ] Gate category creation UI when at limit
- [ ] Test all gating points with free/pro accounts

## Success Criteria
- Free user cannot create >5 categories (server rejects with clear error)
- Free user sees 7-day history only
- Free user sees upgrade prompt on AI, social, advanced stats
- Pro user has full access to everything
- Upgrade prompts link to pricing/checkout

## Risk Assessment
- **Over-gating frustration**: Keep core focus timer 100% free; only gate power features
- **Stale subscription check**: Server-side checks read from DB (always fresh); client caches 5min
- **Breaking existing users**: Default plan_type is 'free'; existing users unaffected until they upgrade

## Security Considerations
- Server-side checks are authoritative; client-side is convenience only
- AI routes MUST check server-side (they consume Groq API credits)
- Category limit MUST be server-side (prevent bypass)
