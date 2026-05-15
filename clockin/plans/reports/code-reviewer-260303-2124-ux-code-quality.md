# Code Review: Effortful — UX & Code Quality
**Date:** 2026-03-03 | **Reviewer:** code-reviewer

---

## Scope

- Files: layout, dashboard, focus, settings, social, stats, goals, landing page, focus components, nav
- LOC reviewed: ~2,800
- Focus: UX/IA, onboarding, code quality, performance, missing basics

---

## Overall Assessment

The app is well-structured and visually polished. Core focus flow works. Main problems are:
1. Navigation has **too many top-level items** (10 in sidebar) — overwhelms new users
2. **Two competing onboarding systems** that conflict and both suffer from UX issues
3. **Inconsistent data fetching** — some pages use React Query, others use raw `useState + useEffect + createClient()` with no caching
4. **Duplicate code** scattered across pages (StatCard, GoalWithProgress defined 2-3x each)
5. Social page is a **Pro-only ghost town** — authenticated free users see almost nothing
6. A few debug `console.log` calls left in production code

---

## Critical Issues

### 1. Two conflicting onboarding systems — users will see both simultaneously
- `FocusOnboardingBanner` (step-list in card, `focus-onboarding-dismissed` key) AND `FocusOnboardingCoachmark` (spotlight overlay, same `focus-onboarding-dismissed` key) **share the same localStorage key**
- The banner lives in `FocusOnboardingBanner` (not rendered in `FocusSetupView` — it's missing from the props/render tree), but the coachmark IS rendered in `FocusSetupView` at the bottom
- The onboarding banner props `selectedCategory` / `effectivePreset` exist in the interface but it is NOT rendered inside `FocusSetupView` — so new users never see the banner step-tracker. They only see the coachmark, which starts immediately on mount and covers UI elements, which is disorienting before the user has oriented themselves
- **Impact:** first-time experience is confusing or the banner never appears

**File:** `src/components/focus/focus-setup-view.tsx` (no `FocusOnboardingBanner` render call), `src/components/focus/focus-onboarding-banner.tsx`

### 2. `FocusPage` fires a Supabase query directly inside a `useEffect` (not React Query)
```tsx
// focus/page.tsx L107-118
useEffect(() => {
  if (!isAuthenticated) return;
  const supabase = createClient();
  supabase.auth.getUser().then(async ({ data }) => { ... });
}, [isAuthenticated]);
```
This runs every time auth state changes, bypasses the TanStack Query cache, and creates an ad-hoc Supabase client. If the user navigates away and back, it re-fetches unnecessarily. The preset preference should be loaded via React Query or at minimum persisted in the store.

### 3. Settings page: profile save uses try-insert-then-update instead of upsert
```tsx
// settings/page.tsx L354-374
const { error: insertError } = await supabase.from("profiles").insert(...)
if (insertError?.code === "23505") {
  const { error: updateError } = await supabase.from("profiles").update(...)
}
```
Race condition: two rapid saves could both insert, causing duplicate key errors. Supabase supports `.upsert()` — this pattern should use it consistently (same as how `focus/page.tsx` saves the preset preference correctly).

---

## High Priority

### 4. Navigation IA: 10 sidebar items is too many
The sidebar has: Focus, Summary, History, Stats, Goals, Achievements, Social, Categories, Settings, Billing — **10 items**. Plus mobile bottom nav has its own 4+More structure.

Recommended grouping:
- **Primary (always visible):** Focus, Dashboard, Stats, Goals
- **Secondary (collapsible or under profile):** History, Achievements, Social, Categories
- **Footer:** Settings, Billing, Sign out

The "Billing" item in sidebar as a standalone nav item is unusual — typically nested under Settings. Most SaaS apps don't surface billing as a primary nav item.

### 5. Goal progress fetched N+1 style in 3 separate places
`goalService.calculateProgress()` is called in a `Promise.all` loop in:
- `dashboard/page.tsx` (fetches goals then N progress calls)
- `goals/page.tsx` (same pattern)
- `focus/components/focus-active-goals.tsx` (same pattern)

None of these share cache entries — the keys are `["dashboard", userId]`, `["goals", userId]`, `["focus-today-stats", userId]`. Each page mount fires separate DB queries. Progress calculation should either be a server-side join or the query key should be shared and staleTime set so they deduplicate.

### 6. `stats/page.tsx` and `goals/page.tsx` use raw `useState + useEffect + loadData()` pattern instead of React Query
These pages re-fetch on every mount with no caching. Dashboard uses React Query (good). Stats and Goals do not. Stats fetches 365 days of daily stats on every page visit.

**Impact:** slow navigation, excessive DB calls, inconsistent loading state UX.

### 7. `social/page.tsx` re-fetches on `window focus` event (every alt-tab)
```tsx
window.addEventListener("focus", handleFocus);
```
This calls `loadUserData()` which hits 3 Supabase queries (profile, time_entries, streaks) whenever the browser window regains focus. This fires constantly during normal use (user opens another tab to check something, comes back = full refetch). React Query's `refetchOnWindowFocus` with a proper staleTime would handle this gracefully.

### 8. Social page — free users hit a paywall for almost everything
After login, free users see:
- 1 AI Insights upgrade prompt
- 1 Social Features upgrade prompt

That's essentially a blank page with two upsell cards. Nothing actionable for free users. At minimum, the leaderboard should be visible to free users (it's a social hook, not a premium feature).

---

## Medium Priority

### 9. Duplicate type definition `GoalWithProgress`
Defined identically in 3 files:
- `src/app/(dashboard)/dashboard/page.tsx` L39-45
- `src/app/(dashboard)/goals/page.tsx` L39-45
- `src/components/focus/focus-active-goals.tsx` L9-11

Should be in `src/types/gamification.ts` once.

### 10. Duplicate `StatCard` component
Defined independently in:
- `src/app/(dashboard)/dashboard/page.tsx` L48-87
- `src/app/(dashboard)/stats/page.tsx` L39-64

Slightly different prop shapes but same concept. Should be a shared `src/components/shared/stat-card.tsx`.

### 11. `FocusSetupView` prop interface has 30+ props — prop drilling smell
`focus-setup-view.tsx` takes 30+ props through its interface. The parent `focus/page.tsx` passes them all down. Many of these (video dialog state, custom video handlers) could be encapsulated in the `FocusSetupAtmosphere` component or via a context/hook. This makes the component hard to maintain and refactor.

### 12. `focus/page.tsx`: `useEffect(() => { reset(); }, [])` missing dep
```tsx
useEffect(() => { reset(); }, []); // L74
```
`reset` is missing from deps array. Works in practice because `reset` is stable from Zustand, but ESLint exhaustive-deps would flag this. At minimum add `// eslint-disable-line react-hooks/exhaustive-deps` with a comment explaining why.

### 13. Weekly chart on dashboard has a bug: entries from "this week" are matched by day-of-week name not date
```tsx
// dashboard/page.tsx L192-198
const entryDay = format(parseISO(entry.started_at), "EEE"); // "Mon", "Tue"...
const dayData = data.find((d) => d.day === entryDay);
```
If you worked last Monday AND this Monday, both entries match the same "Mon" slot. Entries from 8+ days ago that happen to be the same weekday will be double-counted. Should match by full date string.

### 14. `settings/page.tsx` has 4 leftover `console.log` calls
```tsx
console.log("Uploading avatar:", fileName);     // L174
console.log("Upload success:", uploadData);      // L188
console.log("Public URL:", publicUrl);           // L195
console.log("Files in bucket:", fileData, ...); // L202
```
These were debug logs from development. Remove before production.

### 15. `FocusTodayStats` filters by `notes?.includes("Focus session")` — fragile
```tsx
const todayEntries = (entries as TimeEntry[]).filter(
  (e) => e.notes?.includes("Focus session")
);
```
If the notes format changes (already it varies: `"Focus session (classic)"`, `"Focus session (25m)"`), this filter stays working, but entries without notes (manually added entries) are excluded. Better to filter by `entry_type === "pomodoro"` or a dedicated field.

### 16. Dashboard stat card "Hours This Week" is actually "All entries fetched (7 days)"
```tsx
// dashboard/page.tsx L274
value={Math.round(
  entries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) / 3600
)}
label="Hours This Week"
```
`entries` is fetched with `timeEntryService.getEntries(userId, 7)` — but this is the last 7 days, not "this week" (Mon-Sun). Could confuse users on e.g. Tuesday when "this week" means only 2 days.

---

## Low Priority / Nice-to-have

### 17. No empty state for Social → Leaderboard for new Pro users
When a Pro user has no friends and the leaderboard is empty, nothing is shown. A "Invite friends" CTA would convert this into an acquisition moment.

### 18. Focus setup page: tips at bottom are static and generic
The 3 tip cards ("Eliminate distractions", "Take breaks", "Track your progress") are always shown and add visual noise without value for returning users. Consider hiding after the first session.

### 19. Landing page has no pricing section
`src/app/page.tsx` renders: Nav → Hero → Features → FocusShowcase → CTA. No pricing. Users who want to understand Pro vs Free have to navigate to `/pricing` or look in the app. A pricing summary on the landing page is standard for SaaS.

### 20. `DreamGoal` sync on goals page fires on every mount if `current_hours === 0`
```tsx
// goals/page.tsx L139
if (!dreamGoalSynced && userId && userId !== 'guest' && !dreamGoalLoading && dreamGoal && dreamGoal.current_hours === 0) {
```
If a user genuinely has 0 hours tracked, this will attempt to sync on every visit (it sets `dreamGoalSynced` in local state, not persisted). Better to track sync in localStorage or only sync once server-side.

### 21. Mobile bottom nav primary items don't include Stats
Mobile primary: Focus, Summary, Social, Goals + More. Stats is in "More". For a productivity app, Stats is a high-value return destination — consider swapping Social (Pro-gated) for Stats in the primary nav on mobile.

### 22. `AppSidebar` fetches auth via its own `createClient()` call instead of using `useAuthState()`
```tsx
// app-sidebar.tsx L44-52
useEffect(() => {
  async function checkAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  }
  checkAuth();
}, []);
```
`useAuthState` hook exists and is used everywhere else. The sidebar and mobile nav both duplicate this auth check independently, causing extra Supabase calls on every page load.

### 23. Goals form uses "Target Minutes" input — UX friction
Users have to type minutes (e.g., `120`). Most focus apps use hours or a slider. Displaying "2 hours per week" as the goal label but requiring 120 in the input is confusing. Consider hours input with decimal support, or preset options (1h, 2h, 4h, 8h).

---

## Missing Basics

### B1. No keyboard shortcut for starting a focus session from dashboard
The dashboard has a "Focus Mode" button, but power users would expect `F` or `Ctrl+K` to jump to focus. The focus page does have Space/R shortcuts during a session (good), but nothing for navigation.

### B2. No way to manually add a time entry from the UI
History page shows entries, but there's no visible "Add manual entry" button outside the focus flow. If a user forgot to track something, there's no recovery path shown in the UI.

### B3. No "end session early" confirmation — hitting Reset loses data silently
`handleReset()` calls `reset()` + `pauseAudio()` immediately with no confirmation dialog. A focus session in progress gets discarded without saving. This is data loss. Should ask "End session? (your time will be saved up to now)" or at least save partial progress.

### B4. Stats page "Sessions" stat counts all 30-day entries but other stats may reference different time windows
Header stats show totals from last 30 days (the `getEntries(user.id, 30)` call), but the weekly bar chart filters to 7/14/30 days. The top-level "Sessions" number doesn't match the chart range, creating confusion.

---

## Positive Observations

- Focus session view is well-decomposed — hooks for audio, fullscreen, notifications, custom videos are all properly extracted
- React Query used correctly in dashboard with shared cache invalidation on session completion
- Guest mode with localStorage fallback is a great UX decision for trial users
- Keyboard shortcuts (Space/R) during session are a thoughtful power-user feature
- `FocusOnboardingCoachmark` is technically well-built (4-strip overlay, spotlight ring, position clamping for mobile nav safe area)
- TypeScript compiles clean (0 errors from `tsc --noEmit`)
- `compressImage()` in settings does proper center-crop and size validation before upload
- `beforeunload` warning during active session prevents accidental data loss on page refresh

---

## Recommended Actions (Prioritized)

1. **Fix onboarding conflict** — decide between banner OR coachmark, remove the unused one; ensure the chosen system actually renders and fires correctly
2. **Fix weekly chart day-matching bug** — match by full date, not weekday name
3. **Remove 4 `console.log` calls from settings/page.tsx**
4. **Add "end session early" save prompt** — prevents silent data loss on Reset
5. **Migrate stats/goals pages to React Query** — consistent caching and loading UX
6. **Replace try-insert/catch-update pattern with upsert in settings profile save**
7. **Consolidate `GoalWithProgress` type** into `src/types/gamification.ts`
8. **Extract shared `StatCard`** to `src/components/shared/stat-card.tsx`
9. **Sidebar: reduce to 7 items max**, move Billing under Settings
10. **Replace sidebar auth check** with `useAuthState()` hook
11. **Social page for free users** — show leaderboard (upsell only for Friends/Rooms)
12. **Mobile bottom nav** — consider swapping Social for Stats in primary slots

---

## Metrics

- Type Coverage: Clean (tsc 0 errors)
- Linting Issues: ~4 console.log warnings, 1 missing useEffect dep
- Pages using React Query: 2/6 (dashboard, focus categories)
- Pages using raw useState/loadData: 4/6 (stats, goals, social, settings)
- Duplicate type definitions: 2 types defined in 3 places each
- Nav items (desktop sidebar): 10 (recommended max: 7)

---

## Unresolved Questions

1. Is `FocusOnboardingBanner` intentionally not rendered? (It's defined in `focus-onboarding-banner.tsx` but not imported in `focus-setup-view.tsx` or `focus/page.tsx`)
2. Should "dream goal" and regular "goals" be the same concept or kept separate? Currently they're different DB tables and different UI sections — could confuse users
3. Is `/dream/page.tsx` a separate route? It's in the dashboard folder but not in sidebar nav
4. What is the intended free-tier social experience? Currently free users get 0 social value
