# Phase 5: Settings & Billing Integration

## Context Links
- [Phase 4: Pricing UI](phase-04-pricing-ui.md)
- [Settings page](../../src/app/(dashboard)/settings/page.tsx)
- [App sidebar](../../src/components/layout/app-sidebar.tsx)
- [Mobile bottom nav](../../src/components/layout/mobile-bottom-nav.tsx)

## Overview
- **Priority:** P2
- **Status:** pending
- **Description:** Integrate billing into settings navigation, add billing link to settings page, and polish the overall billing UX.

## Key Insights
- Settings page is monolithic at 670 lines — already needs modularization
- Settings does not have sub-routes; billing page at `/settings/billing` is a new sub-route
- Mobile bottom nav may need a billing shortcut or settings page link
- Polar provides a customer portal for managing subscriptions (cancel, update payment)

## Requirements

### Functional
- Settings page links to billing sub-page
- Billing section in settings shows current plan + link to manage
- Pro users can access Polar customer portal to manage subscription
- Plan badge visible in sidebar

### Non-functional
- Consistent design with existing settings card layout
- No confusion between settings save and billing actions

## Architecture

### Settings -> Billing Navigation
Add a "Billing" card/section to the settings page with:
- Current plan indicator
- "Manage Billing" button -> navigates to `/settings/billing`
- If Pro: "Manage Subscription" -> Polar customer portal link

### Polar Customer Portal
Polar provides a customer portal URL for subscription management. Create API route:
- `GET /api/billing/portal` — Returns Polar customer portal URL for the user

## Related Code Files

### Files to Create
- `src/app/api/billing/portal/route.ts` (~30 lines)

### Files to Modify
- `src/app/(dashboard)/settings/page.tsx` — Add billing section with plan badge + manage link
- `src/components/layout/app-sidebar.tsx` — Add `PlanBadge` component

## Implementation Steps

### 1. Create portal route `src/app/api/billing/portal/route.ts`
```ts
// Authenticate user
// Look up polar_customer_id from user_subscriptions
// Use Polar SDK to create customer portal session
// Return { url: portalUrl }
```

### 2. Add billing section to settings page
Insert between Profile and Appearance sections:
```tsx
{/* Billing */}
<div className="space-y-4">
  <div className="flex items-center gap-2">
    <CreditCard className="h-4 w-4 text-cyan-400" />
    <h2 className="text-lg font-semibold text-foreground">Billing</h2>
  </div>
  <div className="flex items-center justify-between">
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <Label className="text-foreground">Current Plan</Label>
        <PlanBadge />
      </div>
      <p className="text-sm text-muted-foreground">
        {isPro ? "You have access to all features" : "Upgrade to unlock all features"}
      </p>
    </div>
    <Button variant="outline" asChild>
      <Link href="/settings/billing">
        {isPro ? "Manage" : "Upgrade"}
      </Link>
    </Button>
  </div>
</div>
<div className="h-px bg-border" />
```

### 3. Add PlanBadge to sidebar
In `app-sidebar.tsx`, add badge next to "Clockin" logo text:
```tsx
import { PlanBadge } from "@/components/billing/plan-badge";
// In logo section, after the subtitle span:
<PlanBadge />
```

### 4. Handle "Manage Subscription" for Pro users
On billing page, if user is Pro with active subscription:
```tsx
<Button onClick={async () => {
  const res = await fetch("/api/billing/portal");
  const { url } = await res.json();
  window.location.href = url;
}}>
  Manage Subscription
</Button>
```

## Todo List
- [ ] Create `src/app/api/billing/portal/route.ts`
- [ ] Add billing section to settings page
- [ ] Add PlanBadge to app sidebar
- [ ] Wire "Manage Subscription" to Polar portal
- [ ] Test full flow: free user sees upgrade, pro user sees manage
- [ ] Test mobile layout of billing section in settings
- [ ] Verify portal redirect works for subscribed users

## Success Criteria
- Settings page shows current plan and billing CTA
- Free users see "Upgrade" button linking to pricing
- Pro users see "Manage" button linking to Polar portal
- Plan badge appears in sidebar
- All transitions are smooth with no layout jumps

## Risk Assessment
- **Polar portal unavailable**: Show error toast, provide email support fallback
- **Settings page getting too large**: The billing section adds ~20 lines; manageable. Future modularization of settings page is recommended but out of scope.

## Security Considerations
- Portal route requires authentication
- Portal URL is scoped to the authenticated user's Polar customer
- No sensitive billing data stored client-side
