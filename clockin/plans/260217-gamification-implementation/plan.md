---
title: "Gamification Features Implementation Plan"
description: "Comprehensive plan for adding gamification, rewards, visualization, and AI insights to Clockin app"
status: pending
priority: P1
effort: 32h
branch: main
tags: [gamification, badges, xp, levels, achievements, crystals]
created: 2026-02-17
---

# Gamification Features Implementation Plan

## Overview

This plan implements a comprehensive gamification system for Clockin including achievement badges, XP/level progression, weekly challenges, crystal evolution, calendar heatmap, and AI insights.

**Total Estimated Effort:** 32 hours
**Phases:** 6 sequential phases

## Phase Summary

| Phase | Name | Effort | Status | Dependencies |
|-------|------|--------|--------|--------------|
| 1 | Database Schema & Types | 4h | pending | - |
| 2 | XP & Level System | 6h | pending | Phase 1 |
| 3 | Achievement Badges | 6h | pending | Phase 1, 2 |
| 4 | Weekly Challenges | 5h | pending | Phase 1, 2 |
| 5 | Crystal Evolution & Customization | 6h | pending | Phase 2 |
| 6 | Calendar Heatmap & AI Insights | 5h | pending | Phase 2, 3, 4 |

## Key Architecture Decisions

1. **XP Calculation:** 1 XP per minute of focused time, with multipliers for streaks and challenges
2. **Level Formula:** `level = floor(xp / 1000) + 1`, requiring 1000 XP per level
3. **Crystal Evolution:** 5 stages unlocked at levels 1, 5, 10, 25, 50
4. **Badge System:** Static badge definitions in code, user_earned_badges in database
5. **Challenge Rotation:** Weekly challenges auto-generated every Monday at 00:00 UTC

## Files to be Created/Modified

### Database Migrations (5 files)
- `supabase/migrations/00012_create_user_xp_and_levels.sql`
- `supabase/migrations/00013_create_crystal_customizations.sql`
- `supabase/migrations/00014_create_badge_definitions.sql`
- `supabase/migrations/00015_create_weekly_challenges.sql`
- `supabase/migrations/00016_create_user_stats_summary.sql`

### Types (2 files)
- `src/types/gamification.ts` (extend existing)
- `src/types/xp-system.ts` (new)

### Services (4 files)
- `src/services/xp-service.ts` (new)
- `src/services/badge-service.ts` (new)
- `src/services/challenge-service.ts` (new)
- `src/services/insights-service.ts` (new)

### Stores (2 files)
- `src/stores/gamification-store.ts` (new)
- `src/stores/crystal-store.ts` (new)

### Components (12 files)
- `src/components/gamification/xp-bar.tsx`
- `src/components/gamification/level-badge.tsx`
- `src/components/gamification/achievement-badge.tsx`
- `src/components/gamification/achievements-grid.tsx`
- `src/components/gamification/challenge-card.tsx`
- `src/components/gamification/challenges-list.tsx`
- `src/components/gamification/crystal-evolution-viewer.tsx`
- `src/components/gamification/crystal-customization-panel.tsx`
- `src/components/gamification/calendar-heatmap.tsx`
- `src/components/gamification/milestone-celebration.tsx`
- `src/components/gamification/weekly-insights-card.tsx`
- `src/components/focus/dream-crystal-evolved.tsx` (extend existing)

### Hooks (3 files)
- `src/hooks/use-gamification.ts`
- `src/hooks/use-xp-calculator.ts`
- `src/hooks/use-milestone-checker.ts`

### Data/Constants (2 files)
- `src/data/badge-definitions.ts`
- `src/data/crystal-configs.ts`

### Pages (1 file modified)
- `src/app/(dashboard)/achievements/page.tsx` (new)

## Detailed Phase Documentation

- [Phase 1: Database Schema & Types](./phase-01-database-schema.md)
- [Phase 2: XP & Level System](./phase-02-xp-level-system.md)
- [Phase 3: Achievement Badges](./phase-03-achievement-badges.md)
- [Phase 4: Weekly Challenges](./phase-04-weekly-challenges.md)
- [Phase 5: Crystal Evolution & Customization](./phase-05-crystal-evolution.md)
- [Phase 6: Calendar Heatmap & AI Insights](./phase-06-visualization-insights.md)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| XP calculation performance | Medium | Use database triggers, cache in localStorage |
| 3D crystal performance | Medium | Implement LOD, reduce particles on mobile |
| Badge notification spam | Low | Batch notifications, debounce checks |
| Migration data loss | High | Backup before migrations, test on staging |

## Unresolved Questions

1. Should XP be retroactively calculated from existing time entries?
2. What happens to weekly challenges when user misses a week?
3. Should crystal customizations be unlockable via XP or one-time purchase?
4. Do we need admin panel for creating custom badges?
5. Should insights be generated client-side or via edge function?
