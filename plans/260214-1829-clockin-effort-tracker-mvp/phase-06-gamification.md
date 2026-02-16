# Phase 06: Gamification

## Context Links
- [Parent Plan](./plan.md)
- [PRD](../reports/brainstorm-260214-1829-clockin-effort-tracker-prd.md)
- Depends on: [Phase 05](./phase-05-dashboard-and-analytics.md)

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** 6h
- **Description:** Implement streaks (daily consistency tracking), goal setting (hours/day or hours/week per category), milestone badges, focus score gamification, and daily/weekly challenges. All computed from existing time_entries data.

## Key Insights
- **Streaks:** Computed from time_entries. A "day" counts if user logged any entry that day (in user's local timezone, from profiles.timezone). Update streak record after each timer stop. Compare `last_active_date` to today in user's timezone.
<!-- Updated: Validation Session 1 - Confirmed user's local timezone for streak calculation -->
- **Badges:** Static definitions in code (not DB). Check conditions after each timer stop. Insert into `user_badges` when earned. Badge list is finite and predictable.
- **Focus score:** Composite metric = f(streak, goals hit, consistency, total hours). Gamified number (0-100). Computed client-side from existing data.
- **Challenges:** Time-boxed goals ("Log 2h before noon today"). Auto-generated daily/weekly. Stored in `challenges` table with progress tracking.
- **Goals:** User sets target_minutes per period (daily/weekly/monthly) per category or overall. Progress computed from time_entries sum.

## Requirements

### Functional

**Streaks:**
- Current streak: consecutive days with at least 1 completed entry
- Longest streak: all-time maximum
- Streak updates on timer stop + manual entry save
- Streak display on dashboard (fire emoji + count)
- Streak milestone celebrations (7, 14, 30, 60, 100 days → confetti)

**Goals:**
- Create goal: select category (or "all"), target hours, period (daily/weekly/monthly)
- Goal progress: percentage ring showing current/target
- Multiple goals simultaneously (e.g., 2h/day study + 5h/week exercise)
- Goal completion → confetti + badge check
- Edit/delete goals

**Badges:**
- Predefined badge set (earned once, never lost):
  - "First Timer" — first completed entry
  - "Early Bird" — entry started before 7am
  - "Night Owl" — entry started after 10pm
  - "Marathon" — single session > 4 hours
  - "Century" — 100 total hours logged
  - "500 Club" — 500 total hours logged
  - "Week Warrior" — 7-day streak
  - "30-Day Warrior" — 30-day streak
  - "100-Day Legend" — 100-day streak
  - "Pomodoro Master" — 100 pomodoro cycles completed
  - "Diversified" — logged time in 5+ categories in one week
  - "Consistent" — met daily goal 7 days in a row
- Badge grid display on profile/dashboard
- Locked badges shown grayed out with requirements
- New badge earned → confetti + toast notification

**Focus Score (0-100):**
- Streak factor: current_streak / 30 * 25 (max 25 points)
- Goals factor: goals_met_this_week / total_goals * 25 (max 25 points)
- Consistency factor: days_tracked_this_month / days_in_month * 25 (max 25 points)
- Volume factor: hours_this_week / 20 * 25 (max 25 points, capped)
- Display as circular score with letter grade (A/B/C/D)

**Challenges:**
- Daily challenge: auto-generated each day (e.g., "Log 2 hours today", "Start a session before 9am")
- Weekly challenge: auto-generated each Monday (e.g., "Log 15 hours this week", "Try a new category")
- Progress tracked in challenges table
- Completed challenge → XP/badge credit
- Expired challenges auto-close

### Non-Functional
- Streak + badge checks execute < 100ms (simple queries)
- Focus score computed client-side (no extra DB query)
- Badge checks run asynchronously (don't block timer stop)

## Architecture

### Streak Update Flow
```
Timer stops (or manual entry saved)
  → Check: does user have entry today?
  → Fetch streaks record
  → If last_active_date = today → no change
  → If last_active_date = yesterday → current_streak++
  → If last_active_date < yesterday → current_streak = 1
  → Update longest_streak = max(current, longest)
  → Set last_active_date = today
  → Save to Supabase
```

### Badge Evaluation Flow
```
Timer stops
  → badgeService.evaluate(userId, newEntry)
  → Check each badge definition:
     - Query relevant data (total hours, streak, etc.)
     - If condition met AND badge not already earned
       → INSERT user_badges
       → Return newly earned badges
  → UI shows toast + confetti for each new badge
```

### Challenge Generation
```
Daily (midnight or first app open):
  → Check if active daily challenge exists for today
  → If not → pick random template → create challenge record
  → Templates: [{key: 'log-2h', target: 120, desc: 'Log 2 hours today'}, ...]

Weekly (Monday or first app open on Monday):
  → Same pattern, weekly templates
```

## Related Code Files

### Files to Create
- `src/services/streak-service.ts` — Streak calculation + update
- `src/services/goal-service.ts` — Goal CRUD + progress computation
- `src/services/badge-service.ts` — Badge evaluation engine
- `src/services/challenge-service.ts` — Challenge generation + progress
- `src/data/badge-definitions.ts` — Badge rules, icons, descriptions
- `src/data/challenge-definitions.ts` — Challenge templates
- `src/types/gamification.ts` — Badge, Goal, Challenge, FocusScore types
- `src/components/gamification/badge-grid.tsx` — Badge display grid
- `src/components/gamification/focus-score-card.tsx` — Score circle + grade
- `src/components/gamification/goal-progress-card.tsx` — Goal ring card
- `src/components/gamification/challenge-card.tsx` — Active challenge display
- `src/components/gamification/goal-form.tsx` — Create/edit goal dialog
- `src/app/(dashboard)/goals/page.tsx` — Goals + challenges page
- `src/lib/focus-score.ts` — Focus score calculation

### Files to Modify
- `src/services/time-entry-service.ts` — Trigger streak + badge check after save
- `src/components/dashboard/streak-display.tsx` — Connect to real streak data
- `src/app/(dashboard)/page.tsx` — Add badge, goal progress, challenge widgets

## Implementation Steps

### 1. Create gamification types
`src/types/gamification.ts`:
```typescript
export interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  condition: string; // Human-readable requirement
}

export interface UserBadge {
  id: string;
  badge_key: string;
  earned_at: string;
}

export interface Goal {
  id: string;
  category_id: string | null;
  target_minutes: number;
  period: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  progress_minutes?: number; // Computed
}

export interface Challenge {
  id: string;
  challenge_key: string;
  target_minutes: number;
  progress_minutes: number;
  period_start: string;
  period_end: string;
  status: 'active' | 'completed' | 'expired';
}

export interface FocusScore {
  total: number;        // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  streakPoints: number;
  goalPoints: number;
  consistencyPoints: number;
  volumePoints: number;
}
```

### 2. Create badge definitions
`src/data/badge-definitions.ts`:
```typescript
export const badges: Badge[] = [
  { key: 'first-timer', name: 'First Timer', description: 'Complete your first time entry', icon: 'rocket', condition: '1 entry completed' },
  { key: 'early-bird', name: 'Early Bird', description: 'Start a session before 7am', icon: 'sunrise', condition: 'Start before 7:00 AM' },
  { key: 'night-owl', name: 'Night Owl', description: 'Start a session after 10pm', icon: 'moon', condition: 'Start after 10:00 PM' },
  { key: 'marathon', name: 'Marathon', description: 'Single session over 4 hours', icon: 'timer', condition: '4+ hour session' },
  { key: 'century', name: '100 Hours Club', description: 'Log 100 total hours', icon: 'trophy', condition: '100 hours total' },
  { key: 'five-hundred', name: '500 Club', description: 'Log 500 total hours', icon: 'crown', condition: '500 hours total' },
  { key: 'week-warrior', name: 'Week Warrior', description: '7-day streak', icon: 'flame', condition: '7 consecutive days' },
  { key: 'thirty-day-warrior', name: '30-Day Warrior', description: '30-day streak', icon: 'fire', condition: '30 consecutive days' },
  { key: 'hundred-day-legend', name: '100-Day Legend', description: '100-day streak', icon: 'star', condition: '100 consecutive days' },
  { key: 'pomodoro-master', name: 'Pomodoro Master', description: '100 pomodoro cycles', icon: 'tomato', condition: '100 cycles completed' },
  { key: 'diversified', name: 'Diversified', description: 'Track 5+ categories in one week', icon: 'palette', condition: '5 categories in a week' },
  { key: 'consistent', name: 'Consistent', description: 'Meet daily goal 7 days straight', icon: 'target', condition: 'Daily goal met 7 days' },
];
```

### 3. Create challenge definitions
`src/data/challenge-definitions.ts`:
```typescript
export const dailyChallenges = [
  { key: 'log-2h', description: 'Log 2 hours today', targetMinutes: 120 },
  { key: 'log-before-noon', description: 'Log 1 hour before noon', targetMinutes: 60 },
  { key: 'pomodoro-4', description: 'Complete 4 Pomodoro cycles', targetMinutes: 100 },
  { key: 'log-3-categories', description: 'Track 3 different categories', targetMinutes: 0 },
  // ... 5-10 more
];

export const weeklyChallenges = [
  { key: 'weekly-15h', description: 'Log 15 hours this week', targetMinutes: 900 },
  { key: 'weekly-streak', description: 'Track every day this week', targetMinutes: 0 },
  { key: 'new-category', description: 'Try a category you haven\'t used', targetMinutes: 0 },
  // ... 5-10 more
];
```

### 4. Implement streak service
`src/services/streak-service.ts`:
```typescript
export const streakService = {
  async updateStreak(userId: string): Promise<{ current: number; longest: number; isNew: boolean }> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!streak) return { current: 1, longest: 1, isNew: true };
    if (streak.last_active_date === today) return { current: streak.current_streak, longest: streak.longest_streak, isNew: false };

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = streak.last_active_date === yesterday
      ? streak.current_streak + 1
      : 1;
    const newLongest = Math.max(newStreak, streak.longest_streak);

    await supabase
      .from('streaks')
      .update({ current_streak: newStreak, longest_streak: newLongest, last_active_date: today })
      .eq('user_id', userId);

    return { current: newStreak, longest: newLongest, isNew: newStreak > streak.current_streak };
  },
};
```

### 5. Implement badge service
`src/services/badge-service.ts`:
- `evaluate(userId, entry)` → checks all badge conditions → returns newly earned[]
- Each badge has an async check function:
  - `first-timer`: count time_entries > 0
  - `early-bird`: entry started_at hour < 7
  - `marathon`: entry duration_seconds > 14400
  - `century`: SUM(duration_seconds) > 360000
  - `week-warrior`: current_streak >= 7
  - etc.
- Batch: fetch existing user_badges first → skip already-earned → only check unearned

### 6. Implement goal service
`src/services/goal-service.ts`:
- `createGoal(input)` — insert
- `updateGoal(id, input)` — update target/period
- `deleteGoal(id)` — delete
- `getGoalsWithProgress(userId)` — fetch goals + compute progress from time_entries
  - Daily: SUM where started_at = today
  - Weekly: SUM where started_at >= start of week
  - Monthly: SUM where started_at >= start of month
  - Filter by category_id if set

### 7. Implement challenge service
`src/services/challenge-service.ts`:
- `getOrCreateDailyChallenge(userId)` — check for today's challenge; create if missing
- `getOrCreateWeeklyChallenge(userId)` — check for this week's challenge; create if missing
- `updateProgress(userId, additionalMinutes)` — increment progress; check completion
- `expireOldChallenges(userId)` — mark past-due active challenges as expired

### 8. Implement focus score
`src/lib/focus-score.ts`:
```typescript
export function calculateFocusScore(stats: {
  currentStreak: number;
  goalsMetThisWeek: number;
  totalGoals: number;
  daysTrackedThisMonth: number;
  daysInMonth: number;
  hoursThisWeek: number;
}): FocusScore {
  const streakPoints = Math.min(25, (stats.currentStreak / 30) * 25);
  const goalPoints = stats.totalGoals > 0
    ? Math.min(25, (stats.goalsMetThisWeek / stats.totalGoals) * 25) : 0;
  const consistencyPoints = Math.min(25, (stats.daysTrackedThisMonth / stats.daysInMonth) * 25);
  const volumePoints = Math.min(25, (stats.hoursThisWeek / 20) * 25);
  const total = Math.round(streakPoints + goalPoints + consistencyPoints + volumePoints);
  const grade = total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : total >= 40 ? 'D' : 'F';

  return { total, grade, streakPoints, goalPoints, consistencyPoints, volumePoints };
}
```

### 9. Build badge grid component
`src/components/gamification/badge-grid.tsx`:
- Grid of badge cards (3-4 columns)
- Earned: full color + earned date
- Locked: grayscale + lock icon + requirement text
- Click → tooltip with description
- New badge: sparkle animation

### 10. Build focus score card
`src/components/gamification/focus-score-card.tsx`:
- Circular progress ring showing score (0-100)
- Letter grade in center (A/B/C/D/F)
- Breakdown bars showing 4 factors
- Tooltip explaining each factor

### 11. Build goal progress card
`src/components/gamification/goal-progress-card.tsx`:
- Circular progress ring (current/target)
- Category color + name
- "2h 30m / 5h this week" text
- Green glow when completed

### 12. Build challenge card
`src/components/gamification/challenge-card.tsx`:
- Card with challenge description
- Progress bar (current/target)
- Time remaining ("Ends in 6h" or "Ends Sunday")
- Completed: checkmark + confetti

### 13. Build goals page
`src/app/(dashboard)/goals/page.tsx`:
- Goals section: list of active goals with progress
- "Add Goal" button → GoalForm dialog
- Challenges section: today's daily + this week's weekly
- Badges section: badge grid

### 14. Integrate into timer stop flow
After timer stop or manual entry save:
```typescript
// In time-entry-service or timer-store stop action:
const entry = await saveEntry(...);
// Fire-and-forget async:
streakService.updateStreak(userId);
badgeService.evaluate(userId, entry).then(newBadges => {
  if (newBadges.length) showBadgeToast(newBadges);
});
challengeService.updateProgress(userId, entry.duration_seconds / 60);
```

## Todo List
- [ ] Create gamification types
- [ ] Create badge definitions data
- [ ] Create challenge definitions data
- [ ] Implement streak service
- [ ] Implement badge service (evaluation engine)
- [ ] Implement goal service (CRUD + progress)
- [ ] Implement challenge service (generation + progress)
- [ ] Implement focus score calculation
- [ ] Build BadgeGrid component
- [ ] Build FocusScoreCard component
- [ ] Build GoalProgressCard component
- [ ] Build GoalForm dialog
- [ ] Build ChallengeCard component
- [ ] Build goals page
- [ ] Integrate streak + badge checks into timer stop flow
- [ ] Add gamification widgets to dashboard
- [ ] Test: streak increments correctly (consecutive days)
- [ ] Test: streak resets after missed day
- [ ] Test: badges earned correctly on condition met
- [ ] Test: goals progress computed correctly
- [ ] Test: challenges auto-generate and track progress
- [ ] Test: focus score reflects actual stats

## Success Criteria
- Streaks increment correctly on consecutive active days
- Streaks reset to 1 after a missed day
- Badges earned when conditions met; never duplicated
- Goals show accurate progress based on real entries
- Challenges auto-generate and track completion
- Focus score reflects user's actual engagement
- Confetti fires on milestone achievements
- All gamification data isolated per user (RLS)

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Streak timezone edge cases | High | CONFIRMED: Use user's timezone from profiles.timezone for "today" calculation (Validation Session 1) |
| Badge check performance (many queries) | Medium | Batch queries; cache total stats; run async |
| Challenge generation race condition | Low | Use upsert with unique constraint on (user_id, challenge_key, period_start) |

## Security Considerations
- Badge insertion uses server-side validation (never trust client claim)
- Streak updates validate against actual time_entries (prevent manipulation)
- Goal/challenge progress computed from DB, not client input
- RLS policies on all gamification tables

## Next Steps
- Phase 07: Email digest + PWA polish (consumes streak/goal data)
