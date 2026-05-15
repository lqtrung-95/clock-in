# Planner Report: Monetization with Polar

## Summary
Created 5-phase implementation plan for adding Polar-based monetization to EffortCounter. Tiers: Free/$0, Pro Monthly/$2.99, Pro Annual/$19.99, Lifetime/$39.99. Total estimated effort: ~12h.

## Codebase Findings
- **Service pattern**: Supabase client calls in `src/services/*.ts`, exported as object/functions
- **Hook pattern**: TanStack Query for server data, Zustand for client state; `useAuthState` provides userId
- **API route pattern**: Server-side Supabase client via `createClient()` from `@/lib/supabase/server`, `NextResponse.json()` responses
- **Sidebar**: `src/components/layout/app-sidebar.tsx` (170 lines) with `navItems` array
- **Settings page**: Monolithic 670-line file at `src/app/(dashboard)/settings/page.tsx` — adding ~20 lines for billing section is acceptable
- **No existing payment/billing code** — greenfield implementation

## Files Created
- `plans/260303-0931-monetization-polar/plan.md` — Overview
- `plans/260303-0931-monetization-polar/phase-01-database-backend.md` — DB table, webhook, API routes
- `plans/260303-0931-monetization-polar/phase-02-pro-status-hook.md` — TanStack Query hook
- `plans/260303-0931-monetization-polar/phase-03-feature-gating.md` — Server+client gating
- `plans/260303-0931-monetization-polar/phase-04-pricing-ui.md` — Pricing cards, checkout flow
- `plans/260303-0931-monetization-polar/phase-05-settings-billing.md` — Settings integration

## New Files to Create (Implementation)
| File | Lines | Phase |
|------|-------|-------|
| `src/types/subscription.ts` | ~25 | 1 |
| `src/services/subscription-service.ts` | ~60 | 1 |
| `src/app/api/webhooks/polar/route.ts` | ~80 | 1 |
| `src/app/api/checkout/route.ts` | ~40 | 1 |
| `src/app/api/billing/route.ts` | ~30 | 1 |
| `src/app/api/billing/portal/route.ts` | ~30 | 5 |
| `src/hooks/use-pro-status.ts` | ~45 | 2 |
| `src/lib/check-pro-access.ts` | ~20 | 3 |
| `src/components/billing/upgrade-prompt.tsx` | ~60 | 3 |
| `src/components/billing/pricing-cards.tsx` | ~120 | 4 |
| `src/components/billing/checkout-success-handler.tsx` | ~35 | 4 |
| `src/components/billing/plan-badge.tsx` | ~25 | 4 |
| `src/app/(dashboard)/settings/billing/page.tsx` | ~80 | 4 |
| Supabase migration SQL | ~20 | 1 |

## Key Decisions
1. **Server-side gating for categories + AI** (prevents bypass); client-side for UI convenience
2. **Soft gates with upgrade prompts** (not hard blocks) — show what user is missing
3. **5-min staleTime** on subscription query — rarely changes mid-session
4. **Polar handles checkout page** — we only redirect, no custom payment form
5. **Default to free** — no subscription row = free tier (no migration needed for existing users)

## Dependencies
- Polar account + products created in dashboard
- 6 env vars: POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET, POLAR_ORGANIZATION_ID, + 3 product IDs
- `@polar-sh/sdk` npm package

## Unresolved Questions
1. Does Polar SDK support Next.js App Router server components natively, or do we need edge runtime config?
2. Should free users get a limited number of AI insight requests (e.g., 3/month) instead of full block?
3. Should we show pricing on a public marketing page (`/pricing`) in addition to `/settings/billing`?
4. Polar customer portal — need to verify SDK method name for creating portal sessions (may be `customers.getPortalUrl` or similar)
