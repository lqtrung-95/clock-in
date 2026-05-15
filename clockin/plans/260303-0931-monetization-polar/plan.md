---
title: "Polar Payment Integration for EffortCounter"
description: "Add monetization with Free/Pro/Lifetime tiers using Polar as MoR"
status: pending
priority: P1
effort: 12h
branch: feat/monetization-polar
tags: [monetization, polar, subscriptions, feature-gating]
created: 2026-03-03
---

# Monetization with Polar Payment Integration

## Overview
Add subscription-based monetization to EffortCounter using Polar (MoR). Three tiers: Free, Pro ($2.99/mo or $19.99/yr), Lifetime ($39.99 one-time). Polar handles global tax compliance.

## Pricing Tiers
| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 5 categories, 7-day history, basic stats/achievements, 3 AI insights/month |
| Pro Monthly | $2.99/mo | Unlimited everything, unlimited AI insights, social, themes, export |
| Pro Annual | $19.99/yr | Same as Pro Monthly |
| Lifetime | $39.99 | Everything forever |

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 1 | Database & Backend (Supabase table, webhook, API routes) | pending | 3h | [phase-01](phase-01-database-backend.md) |
| 2 | Pro Status Hook (TanStack Query hook) | pending | 1h | [phase-02](phase-02-pro-status-hook.md) |
| 3 | Feature Gating (enforce limits across services) | pending | 3h | [phase-03](phase-03-feature-gating.md) |
| 4 | Pricing & Upgrade UI (pricing cards, upgrade prompts, public /pricing page) | pending | 3h | [phase-04](phase-04-pricing-ui.md) |
| 5 | Settings & Billing Integration | pending | 2h | [phase-05](phase-05-settings-billing.md) |

## Key Dependencies
- Polar account + API keys (POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET)
- Polar product/price IDs for each tier created in Polar dashboard
- `@polar-sh/sdk` npm package
- Supabase migration for `user_subscriptions` table

## Architecture Summary
```
User clicks "Upgrade" -> POST /api/checkout -> Polar Checkout URL -> Polar hosted page
Polar processes payment -> POST /api/webhooks/polar -> upsert user_subscriptions
Client reads subscription via GET /api/billing -> useProStatus hook caches with TanStack Query
Feature gating: services + components check isPro before allowing access
```
