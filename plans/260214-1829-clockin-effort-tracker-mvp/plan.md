---
title: "Clockin MVP - Effort Tracking PWA"
description: "Phase 1 MVP implementation of Clockin, a motivation-driven time tracker with Pomodoro, focus mode, streaks, and gamification"
status: pending
priority: P1
effort: 52h
branch: main
tags: [nextjs, supabase, pwa, typescript, time-tracker]
created: 2026-02-14
---

# Clockin MVP - Implementation Plan

## Tech Stack
Next.js 15 (App Router) | TypeScript | Tailwind CSS | shadcn/ui | Supabase | Recharts | Zustand | Serwist | canvas-confetti | Resend

## Phases

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 1 | Project Setup | 6h | pending | [phase-01](./phase-01-project-setup.md) |
| 2 | Database & Auth | 8h | pending | [phase-02](./phase-02-database-and-auth.md) |
| 3 | Timer & Entries | 10h | pending | [phase-03](./phase-03-timer-and-entries.md) |
| 4 | Pomodoro & Focus Mode | 8h | pending | [phase-04](./phase-04-pomodoro-and-focus-mode.md) |
| 5 | Dashboard & Analytics | 8h | pending | [phase-05](./phase-05-dashboard-and-analytics.md) |
| 6 | Gamification | 6h | pending | [phase-06](./phase-06-gamification.md) |
| 7 | Email Digest & PWA Polish | 6h | pending | [phase-07](./phase-07-email-digest-and-pwa.md) |

**Total Estimated Effort: 52h**

## Dependencies (Sequential)
```
Phase 1 → Phase 2 → Phase 3 → Phase 4
                  ↘ Phase 5 (after Phase 3)
                       ↘ Phase 6 (after Phase 5)
Phase 2 → Phase 7 (can start after Phase 2, finalize after Phase 6)
```

## Key Decisions
- Timestamp-based timer (not setInterval) for accuracy
- @supabase/ssr with middleware-based auth
- Serwist for PWA (modern, maintained)
- Zustand + persist for offline-capable state
- Web Audio API for ambient sounds (no library)
- canvas-confetti for celebrations (lightest option)
- Conflict dialog for cross-device timer (not last-write-wins)
- User's local timezone for streak "today" calculation
- Onboarding category picker (not auto-seed)
- Supabase Cloud from start (no local Docker)
- Media assets from free libraries (Unsplash, Freesound.org)

## Research References
- [Frontend Research](./research/researcher-01-frontend-stack.md)
- [Backend Research](./reports/researcher-02-backend-infra.md)
- [PRD](../reports/brainstorm-260214-1829-clockin-effort-tracker-prd.md)

## Success Criteria
- App loads < 2s on 3G
- Timer accuracy within 1 second
- PWA installable on iOS + Android
- Offline timer works (localStorage/IndexedDB)
- All RLS policies enforce data isolation
- 0 critical bugs at launch

## Validation Log

### Session 1 — 2026-02-14
**Trigger:** Initial plan creation validation
**Questions asked:** 6

#### Questions & Answers

1. **[Architecture]** The plan assumes 'last-write-wins' for offline sync conflicts. If you start a timer on your phone, then open the app on your laptop, what should happen?
   - Options: One active timer at a time (Recommended) | Last-write-wins (current plan) | Show conflict dialog
   - **Answer:** Show conflict dialog
   - **Rationale:** Prevents silent data loss; user explicitly decides which device's timer to keep

2. **[Assumptions]** Streak timezone handling: if you're in Vietnam (UTC+7) and log at 11pm, should that count as 'today' in your timezone or UTC?
   - Options: User's local timezone (Recommended) | UTC timezone | Configurable per user
   - **Answer:** User's local timezone
   - **Rationale:** Most intuitive UX; prevents midnight-boundary confusion for non-UTC users

3. **[Scope]** The MVP has a LOT of features. Would you prefer to trim scope for faster launch?
   - Options: Keep full scope (52h) | Trim gamification to basics | Defer email digest
   - **Answer:** Keep full scope (52h)
   - **Rationale:** User confirmed "no rush, quality first" — full feature set for MVP

4. **[Assumptions]** Where will background images and ambient sounds come from?
   - Options: Source from free libraries (Recommended) | AI-generate them | Placeholder first
   - **Answer:** Source from free libraries
   - **Rationale:** Unsplash (CC0 images) + Freesound.org (CC0 audio) = high quality, no licensing issues

5. **[Scope]** Should users be able to pick categories on signup or auto-seed all 6?
   - Options: Auto-seed presets (current plan) | Onboarding picker (Recommended) | Start blank
   - **Answer:** Onboarding picker
   - **Rationale:** More personalized first-time experience; user selects relevant categories

6. **[Architecture]** Should the Supabase project be created locally or use cloud from the start?
   - Options: Supabase Cloud from start (Recommended) | Local first | Both
   - **Answer:** Supabase Cloud from start
   - **Rationale:** Free tier handles MVP; no Docker setup overhead; faster to get going

#### Confirmed Decisions
- Conflict resolution: conflict dialog (show "Timer running on another device. Take over?")
- Timezone: user's local timezone for all streak/goal calculations
- Scope: full 52h MVP, no trimming
- Media: Unsplash + Freesound.org (CC0 licensed)
- Onboarding: category picker screen after signup
- Infra: Supabase Cloud (no local Docker)

#### Action Items
- [ ] Update Phase 02: Replace auto-seed trigger with onboarding page + category picker
- [ ] Update Phase 03: Add conflict dialog for cross-device timer (replace LWW)
- [ ] Update Phase 06: Confirm timezone-aware streak logic using user's profile timezone
- [ ] Update Phase 07: Replace LWW conflict resolution with conflict dialog pattern

#### Impact on Phases
- Phase 02: Remove category auto-seed from DB trigger; add onboarding page with category picker after first signup
- Phase 03: Add timer conflict detection via Realtime; show "Timer running on another device" dialog
- Phase 06: Streak service must use user's timezone (from profiles.timezone) not UTC for "today" boundary
- Phase 07: Offline sync conflict resolution changes from LWW to user-prompted resolution
