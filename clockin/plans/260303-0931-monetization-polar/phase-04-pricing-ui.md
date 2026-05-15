# Phase 4: Pricing & Upgrade UI

## Context Links
- [Phase 1: Checkout API](phase-01-database-backend.md)
- [Phase 2: useProStatus](phase-02-pro-status-hook.md)
- [Phase 3: UpgradePrompt](phase-03-feature-gating.md)
- [Settings page](../../src/app/(dashboard)/settings/page.tsx)
- [App sidebar](../../src/components/layout/app-sidebar.tsx)

## Overview
- **Priority:** P2
- **Status:** completed
- **Description:** Build pricing page, upgrade modal, and checkout success handling.

## Key Insights
- Settings page is already 670 lines (needs modularization per project rules)
- Sidebar nav items array makes it easy to add billing link
- Use shadcn/ui Card, Button, Badge components (already available)
- Polar handles the actual checkout page; we just redirect to it

## Requirements

### Functional
- Pricing cards showing Free/Pro Monthly/Pro Annual/Lifetime tiers
- Checkout flow: click upgrade -> POST /api/checkout -> redirect to Polar -> return to success page
- Success page: show confirmation, invalidate subscription cache
- Upgrade modal triggered from `<UpgradePrompt />` CTA buttons

### Non-functional
- Pricing UI follows existing design system (gradients, rounded cards, shadcn)
- Mobile-responsive pricing cards
- No layout shift during checkout redirect

## Architecture

### New Pages/Components
```
src/app/(dashboard)/settings/billing/page.tsx    -- Billing page (plan + pricing)
src/components/billing/pricing-cards.tsx          -- Pricing tier cards
src/components/billing/checkout-success-handler.tsx -- Post-checkout logic
src/components/billing/upgrade-prompt.tsx         -- Already created in Phase 3
src/components/billing/plan-badge.tsx             -- Small badge showing current plan
```

### Checkout Flow
```
1. User clicks "Upgrade to Pro" on pricing card
2. POST /api/checkout { priceId: "polar_price_xxx" }
3. API returns { url: "https://checkout.polar.sh/..." }
4. window.location.href = url (redirect to Polar)
5. Polar processes payment
6. Polar redirects to /settings/billing?success=true
7. CheckoutSuccessHandler detects ?success, invalidates ["subscription", userId]
8. UI refreshes showing Pro status
```

## Related Code Files

### Files to Create
- `src/app/(dashboard)/settings/billing/page.tsx` (~80 lines)
- `src/components/billing/pricing-cards.tsx` (~120 lines)
- `src/components/billing/checkout-success-handler.tsx` (~35 lines)
- `src/components/billing/plan-badge.tsx` (~25 lines)

### Files to Modify
- `src/components/layout/app-sidebar.tsx` — Add plan badge near logo or bottom
- `src/components/billing/upgrade-prompt.tsx` — Wire onUpgrade to navigate to billing page

## Implementation Steps

### 1. Create `src/components/billing/plan-badge.tsx`
Small visual badge: "FREE", "PRO", or "LIFETIME" with appropriate colors.
```tsx
// Use useProStatus to determine plan
// Free: muted gray badge
// Pro: blue/cyan gradient badge
// Lifetime: gold/amber gradient badge
```

### 2. Create `src/components/billing/pricing-cards.tsx`
Three-column responsive layout with tier cards:
```tsx
// Props: currentPlan, onSelectPlan(priceId)
// Each card: name, price, feature list, CTA button
// Highlight "Most Popular" on annual plan
// Current plan card shows "Current Plan" badge instead of CTA
// Use shadcn Card, Button, Badge
```

Feature lists per tier:
- **Free**: Focus timer, 5 categories, 7-day history, basic stats, basic achievements
- **Pro**: Everything in Free + unlimited categories, full history, AI insights, AI chat, social features, focus rooms, advanced stats, data export, custom themes
- **Lifetime**: Same as Pro, one-time payment, lifetime access

### 3. Create checkout handler `src/components/billing/checkout-success-handler.tsx`
```tsx
"use client";
// On mount, check URL for ?success=true
// If found, invalidate ["subscription", userId] query
// Show success toast
// Remove query param from URL (router.replace)
```

### 4. Create billing page `src/app/(dashboard)/settings/billing/page.tsx`
```tsx
// Layout: header + current plan card + pricing cards
// If already Pro: show manage subscription info, current period end
// Include CheckoutSuccessHandler
// Checkout handler: POST /api/checkout, redirect to returned URL
```

### 5. Add plan badge to sidebar
In `app-sidebar.tsx`, below the logo or near the bottom:
```tsx
<PlanBadge /> // Shows current plan tier
```

### 6. Wire UpgradePrompt to billing page
Update `upgrade-prompt.tsx` to navigate to `/settings/billing` on CTA click.

## Todo List
- [x] Create `src/components/billing/plan-badge.tsx`
- [x] Create `src/components/billing/pricing-cards.tsx`
- [x] Create `src/components/billing/checkout-success-handler.tsx`
- [x] Create `src/app/(dashboard)/settings/billing/page.tsx`
- [x] Create `src/app/pricing/page.tsx` (public pricing page)
- [x] Create `src/hooks/use-checkout.ts`
- [x] Add plan badge to sidebar
- [x] Wire upgrade prompt CTA to billing page
- [ ] Test checkout flow end-to-end (Polar sandbox)
- [ ] Test mobile responsive layout of pricing cards
- [ ] Verify subscription cache invalidation on success return

## Success Criteria
- Pricing page shows all tiers with clear feature comparison
- Clicking upgrade initiates Polar checkout and redirects user
- Returning from checkout refreshes subscription status
- Plan badge in sidebar shows current tier
- Mobile layout stacks pricing cards vertically

## Risk Assessment
- **Polar checkout page downtime**: Show error toast if `/api/checkout` fails
- **User closes Polar page without completing**: No state change needed, user stays on free
- **Redirect URL mismatch**: Configure exact success URL in Polar dashboard + env

## Security Considerations
- Checkout API requires authentication
- Price IDs validated against known env var values (prevent arbitrary price injection)
- Success page only triggers cache invalidation (actual status from webhook)
