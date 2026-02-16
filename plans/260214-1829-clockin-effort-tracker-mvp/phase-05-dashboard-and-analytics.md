# Phase 05: Dashboard & Analytics

## Context Links
- [Parent Plan](./plan.md)
- [Frontend Research](./research/researcher-01-frontend-stack.md) — Recharts
- Depends on: [Phase 03](./phase-03-timer-and-entries.md)

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** 8h
- **Description:** Main dashboard with today's total, weekly summary, quick-start widget, streak display, and motivational messages. Analytics page with daily/weekly/monthly bar charts (Recharts) and category breakdown. Server-side data fetching for initial load; client-side for interactivity.

## Key Insights
- **Recharts:** 12-15KB gzipped, React-native, responsive by default. Use `<ResponsiveContainer>` for auto-sizing. Composable: `<BarChart>`, `<Bar>`, `<XAxis>`, `<YAxis>`, `<Tooltip>`.
- **Server components** for initial data fetch (faster TTI). Pass data to client chart components via props.
- **Dashboard layout** should show most important info above the fold: active timer, today's total, streak counter.
- **Motivational messages** rotate based on user's stats (contextual, not random).

## Requirements

### Functional
- **Dashboard (/ or /dashboard):**
  - Active timer status (if running) at top
  - Quick-start widget (resume last activity)
  - Today's total hours (all categories)
  - Weekly summary (total hours this week)
  - Streak counter (current + longest)
  - Goal progress rings (if goals set)
  - Dynamic motivational message
  - Recent entries (last 5)
- **Analytics (/analytics):**
  - Date range selector: 7d, 30d, 90d, custom
  - Daily bar chart (hours per day)
  - Weekly bar chart (hours per week)
  - Category breakdown (stacked bar or pie chart)
  - Category filter (view one or all categories)
  - Total hours in period
  - Average hours/day in period

### Non-Functional
- Dashboard loads < 1.5s (server-rendered initial data)
- Charts render without layout shift (fixed container height)
- Responsive: charts stack vertically on mobile, side-by-side on desktop
- Chart data computed server-side (Supabase aggregate queries)

## Architecture

### Dashboard Layout
```
┌──────────────────────────────────────────────┐
│ [Active Timer Banner - if running]            │
├──────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│ │ Today    │ │ This Week│ │ 🔥 Streak    │  │
│ │ 3h 42m  │ │ 18h 30m │ │ 14 days      │  │
│ └──────────┘ └──────────┘ └──────────────┘  │
│                                              │
│ ┌──────────────────────┐ ┌───────────────┐  │
│ │ Quick Start          │ │ Motivational  │  │
│ │ ▶ Resume: Study      │ │ "You've hit   │  │
│ │ ▶ Resume: Coding     │ │  47h study!"  │  │
│ └──────────────────────┘ └───────────────┘  │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ This Week's Progress       [View All →]  │ │
│ │ ████████████████░░░░  18h / 25h goal    │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ Recent Entries                           │ │
│ │ • Study    1h 30m   Today 2:00-3:30pm  │ │
│ │ • Coding   2h 12m   Today 9:00-11:12am │ │
│ │ • Exercise 0h 45m   Yesterday          │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Analytics Page Layout
```
┌──────────────────────────────────────────────┐
│  [7d] [30d] [90d] [Custom]   Filter: [All ▼] │
├──────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│ │ Total    │ │ Avg/Day  │ │ Best Day     │  │
│ │ 47h 30m │ │ 6h 47m  │ │ 9h 12m      │  │
│ └──────────┘ └──────────┘ └──────────────┘  │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │        Daily Hours                       │ │
│ │  █                                       │ │
│ │  █ █         █                           │ │
│ │  █ █ █   █ █ █                           │ │
│ │  █ █ █ █ █ █ █                           │ │
│ │  M T W T F S S                           │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │        Category Breakdown                │ │
│ │  Study ████████████████  60%             │ │
│ │  Code  ██████████       30%             │ │
│ │  Other ████             10%             │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Data Queries

**Today's total:**
```sql
SELECT COALESCE(SUM(duration_seconds), 0) as total
FROM time_entries
WHERE user_id = $1
  AND started_at::date = CURRENT_DATE;
```

**Weekly summary:**
```sql
SELECT
  DATE(started_at) as day,
  SUM(duration_seconds) as total_seconds,
  category_id
FROM time_entries
WHERE user_id = $1
  AND started_at >= date_trunc('week', CURRENT_DATE)
GROUP BY DATE(started_at), category_id
ORDER BY day;
```

**Daily chart data (last N days):**
```sql
SELECT
  DATE(started_at) as day,
  c.name as category_name,
  c.color as category_color,
  SUM(duration_seconds) as total_seconds
FROM time_entries te
JOIN categories c ON c.id = te.category_id
WHERE te.user_id = $1
  AND te.started_at >= CURRENT_DATE - INTERVAL '30 days'
  AND te.ended_at IS NOT NULL
GROUP BY DATE(started_at), c.name, c.color
ORDER BY day;
```

## Related Code Files

### Files to Create
- `src/app/(dashboard)/page.tsx` — Main dashboard (server component)
- `src/app/(dashboard)/analytics/page.tsx` — Analytics page
- `src/components/dashboard/today-summary-card.tsx`
- `src/components/dashboard/weekly-summary-card.tsx`
- `src/components/dashboard/streak-display.tsx`
- `src/components/dashboard/motivational-message.tsx`
- `src/components/analytics/daily-bar-chart.tsx`
- `src/components/analytics/weekly-bar-chart.tsx`
- `src/components/analytics/category-breakdown-chart.tsx`
- `src/data/motivational-messages.ts`

### Files to Modify
- `src/app/(dashboard)/layout.tsx` — Add sidebar navigation links
- `src/components/timer/quick-start-widget.tsx` — Ensure works on dashboard
- `src/components/layout/app-sidebar.tsx` — Navigation items

## Implementation Steps

### 1. Create motivational messages data
`src/data/motivational-messages.ts`:
```typescript
export interface MotivationalMessage {
  condition: (stats: UserStats) => boolean;
  template: (stats: UserStats) => string;
  priority: number; // Higher = shown first
}

export const messages: MotivationalMessage[] = [
  {
    condition: (s) => s.currentStreak >= 30,
    template: (s) => `Incredible! ${s.currentStreak}-day streak! You're unstoppable.`,
    priority: 10,
  },
  {
    condition: (s) => s.currentStreak >= 7,
    template: (s) => `${s.currentStreak} days strong! Keep the momentum going.`,
    priority: 8,
  },
  {
    condition: (s) => s.todayTotal >= 3600 * 4,
    template: () => `4+ hours today! Deep work machine.`,
    priority: 7,
  },
  {
    condition: (s) => s.weeklyTotal >= 3600 * 20,
    template: (s) => `${Math.floor(s.weeklyTotal / 3600)}h this week! You're crushing it.`,
    priority: 6,
  },
  {
    condition: (s) => s.todayTotal === 0,
    template: () => `Ready to start? Every minute counts.`,
    priority: 1,
  },
  // ... 10-15 more contextual messages
];
```

### 2. Build dashboard page (server component)
`src/app/(dashboard)/page.tsx`:
```typescript
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Parallel fetch: today's total, weekly data, streak, recent entries
  const [todayData, weekData, streak, recentEntries] = await Promise.all([
    getTodayTotal(supabase, user.id),
    getWeeklyData(supabase, user.id),
    getStreak(supabase, user.id),
    getRecentEntries(supabase, user.id, 5),
  ]);

  return (
    <div className="grid gap-4 ...">
      <ActiveTimerBanner />          {/* Client component */}
      <TodaySummaryCard data={todayData} />
      <WeeklySummaryCard data={weekData} />
      <StreakDisplay streak={streak} />
      <QuickStartWidget />           {/* Client component */}
      <MotivationalMessage stats={...} />
      <RecentEntriesList entries={recentEntries} />
    </div>
  );
}
```

### 3. Build summary cards
`src/components/dashboard/today-summary-card.tsx`:
- shadcn Card with large formatted duration
- Category mini-breakdown (colored dots)
- Comparison to yesterday ("▲ 1h 12m more than yesterday")

`src/components/dashboard/weekly-summary-card.tsx`:
- Total hours this week
- Mini sparkline or bar showing daily distribution
- Goal progress if weekly goal exists

### 4. Build streak display
`src/components/dashboard/streak-display.tsx`:
- Fire emoji + current streak count (large number)
- "Longest: XX days" subtitle
- Pulsing animation if streak is active today
- Gray state if today not yet tracked

### 5. Build motivational message
`src/components/dashboard/motivational-message.tsx`:
- Evaluate message conditions against user stats
- Pick highest priority matching message
- Fade-in animation on load
- Subtle gradient background card

### 6. Build daily bar chart
`src/components/analytics/daily-bar-chart.tsx`:
```typescript
'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function DailyBarChart({ data, categories }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="date" tickFormatter={formatDate} />
        <YAxis tickFormatter={(v) => `${(v / 3600).toFixed(1)}h`} />
        <Tooltip formatter={(v) => formatDuration(v)} />
        <Legend />
        {categories.map((cat) => (
          <Bar key={cat.id} dataKey={cat.name} stackId="a" fill={cat.color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### 7. Build category breakdown chart
`src/components/analytics/category-breakdown-chart.tsx`:
- Horizontal bar chart showing hours per category
- Color-coded by category color
- Percentage labels
- Sorted by total hours (descending)

### 8. Build analytics page
`src/app/(dashboard)/analytics/page.tsx`:
- Server component fetches data for default range (7d)
- Client-side range selector re-fetches via `useTransition` or SWR
- Layout: stat cards row → daily chart → category breakdown
- Category filter dropdown

### 9. Build dashboard shell layout
`src/app/(dashboard)/layout.tsx`:
- Sidebar (desktop) / bottom tab bar (mobile)
- Navigation: Dashboard, Timer, Focus, Entries, Categories, Analytics, Goals, Settings
- User avatar + name in sidebar header
- Active route highlighting
- Collapsible sidebar on desktop

### 10. Build navigation components
`src/components/layout/app-sidebar.tsx`:
- shadcn Sheet for mobile, fixed sidebar for desktop
- Lucide icons for each nav item
- Active timer badge (pulsing dot if timer running)

`src/components/layout/mobile-bottom-nav.tsx`:
- Fixed bottom bar with 5 primary tabs
- Timer, Dashboard, Focus, Entries, More (dropdown)

## Todo List
- [ ] Create motivational messages data file
- [ ] Build TodaySummaryCard
- [ ] Build WeeklySummaryCard
- [ ] Build StreakDisplay
- [ ] Build MotivationalMessage component
- [ ] Build DailyBarChart (Recharts)
- [ ] Build WeeklyBarChart (Recharts)
- [ ] Build CategoryBreakdownChart (Recharts)
- [ ] Build dashboard page (server component + client islands)
- [ ] Build analytics page with date range selector
- [ ] Build dashboard layout shell (sidebar + bottom nav)
- [ ] Build AppSidebar component
- [ ] Build MobileBottomNav component
- [ ] Add active timer indicator in navigation
- [ ] Create data fetching utilities (getTodayTotal, getWeeklyData, etc.)
- [ ] Test: dashboard renders with real data
- [ ] Test: charts display correctly with various data sets
- [ ] Test: responsive layout (mobile / tablet / desktop)
- [ ] Test: empty state (new user, no entries)
- [ ] Test: motivational message changes based on stats

## Success Criteria
- Dashboard loads < 1.5s with server-rendered data
- Charts render without layout shift
- All stats (today, weekly, streak) show correct values
- Quick-start widget launches timer from dashboard
- Responsive: usable on 375px mobile through 1440px desktop
- Empty states handled gracefully for new users
- Motivational messages contextually relevant

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Recharts bundle size | Medium | Use tree-shaking; import only needed components |
| Chart rendering jank on mobile | Medium | Use fixed height containers; limit data points |
| Server/client component boundary confusion | Low | Clearly separate data fetching (server) from interactivity (client) |
| Timezone display issues | Medium | Use date-fns with user's timezone from profile |

## Security Considerations
- All data queries filter by authenticated user_id
- Server components use server Supabase client (not exposed to browser)
- No sensitive data in chart tooltips or messages

## Next Steps
- Phase 06: Gamification (streaks, goals, badges, challenges)
