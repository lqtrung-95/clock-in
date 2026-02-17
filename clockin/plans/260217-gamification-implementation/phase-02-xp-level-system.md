---
title: "Phase 2: XP & Level System"
description: "Implement XP calculation, level progression, and user stats tracking"
status: pending
priority: P1
effort: 6h
dependencies: [phase-01-database-schema]
---

# Phase 2: XP & Level System

## Overview
Implement the core XP and level system including XP calculation from time entries, level progression logic, user stats tracking, and streak management.

## Key Insights
- XP is awarded at 1 XP per minute of focused time (base rate)
- Multipliers apply for streaks (1.1x at 7 days, 1.25x at 30 days)
- Level formula: `level = floor(xp / 1000) + 1`
- Streaks are calculated based on consecutive days with at least one session

## Requirements

### Functional Requirements
1. Calculate XP when time entries are completed
2. Track user level based on total XP
3. Calculate streaks (consecutive days with sessions)
4. Award bonus XP for streak milestones
5. Display XP progress bar and level badge

### Non-Functional Requirements
1. XP calculation must be transactional (atomic with time entry save)
2. Streak calculation should handle timezone correctly
3. Cache user stats in localStorage for offline support
4. Debounce rapid XP updates to prevent UI flicker

## Architecture

### XP Flow Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Time Entry      │────▶│ XP Service       │────▶│ User Stats DB   │
│ Completed       │     │ calculateXP()    │     │ Update          │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ Check for        │
                        │ Level Up         │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ Show Milestone   │
                        │ Celebration      │
                        └──────────────────┘
```

### XP Calculation Formula

```typescript
// Base XP: 1 XP per minute
const baseXP = Math.floor(durationMinutes);

// Streak multiplier
let multiplier = 1.0;
if (currentStreak >= 30) multiplier = 1.25;
else if (currentStreak >= 7) multiplier = 1.1;

// Final XP
const finalXP = Math.floor(baseXP * multiplier);
```

## Related Code Files

### Files to Create
1. `src/services/xp-service.ts`
2. `src/services/streak-service.ts` (extend existing)
3. `src/stores/gamification-store.ts`
4. `src/hooks/use-xp-calculator.ts`
5. `src/components/gamification/xp-bar.tsx`
6. `src/components/gamification/level-badge.tsx`

### Files to Modify
1. `src/services/time-entry-service.ts` - integrate XP award
2. `src/app/(dashboard)/dashboard/page.tsx` - add XP display

## Implementation Steps

### Step 1: Create XP Service

**File:** `src/services/xp-service.ts`

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import type { UserStats, LevelInfo } from "@/types/xp-system";

const XP_PER_MINUTE = 1;
const XP_PER_LEVEL = 1000;

export const xpService = {
  async getUserStats(userId: string): Promise<UserStats | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  async initializeUserStats(userId: string): Promise<UserStats> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_stats")
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  calculateLevelInfo(totalXP: number): LevelInfo {
    const currentLevel = Math.floor(totalXP / XP_PER_LEVEL) + 1;
    const xpForCurrentLevel = (currentLevel - 1) * XP_PER_LEVEL;
    const xpForNextLevel = currentLevel * XP_PER_LEVEL;
    const xpProgress = totalXP - xpForCurrentLevel;
    const progressPercentage = (xpProgress / XP_PER_LEVEL) * 100;

    return {
      currentLevel,
      currentXP: totalXP,
      xpForNextLevel,
      xpProgress,
      progressPercentage: Math.min(progressPercentage, 100),
    };
  },

  calculateXP(durationMinutes: number, currentStreak: number): number {
    const baseXP = Math.floor(durationMinutes * XP_PER_MINUTE);

    let multiplier = 1.0;
    if (currentStreak >= 100) multiplier = 1.5;
    else if (currentStreak >= 30) multiplier = 1.25;
    else if (currentStreak >= 7) multiplier = 1.1;

    return Math.floor(baseXP * multiplier);
  },

  async awardXP(
    userId: string,
    xpAmount: number,
    source: string
  ): Promise<{ newTotal: number; leveledUp: boolean; newLevel?: number }> {
    const supabase = createClient();

    // Get current stats
    const { data: currentStats } = await supabase
      .from("user_stats")
      .select("total_xp, current_level")
      .eq("user_id", userId)
      .single();

    const oldLevel = currentStats?.current_level || 1;
    const oldXP = currentStats?.total_xp || 0;
    const newXP = oldXP + xpAmount;
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;

    // Update stats
    const { error } = await supabase
      .from("user_stats")
      .update({
        total_xp: newXP,
        current_level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;

    return {
      newTotal: newXP,
      leveledUp: newLevel > oldLevel,
      newLevel: newLevel > oldLevel ? newLevel : undefined,
    };
  },

  async updateFocusTime(
    userId: string,
    durationMinutes: number
  ): Promise<void> {
    const supabase = createClient();

    const { data: currentStats } = await supabase
      .from("user_stats")
      .select("total_focus_minutes, weekly_focus_minutes, monthly_focus_minutes")
      .eq("user_id", userId)
      .single();

    const updates: Partial<UserStats> = {
      total_focus_minutes: (currentStats?.total_focus_minutes || 0) + durationMinutes,
    };

    // Check if we need to reset weekly/monthly counters
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();

    if (dayOfWeek === 1) {
      // Monday - could reset weekly, but let's accumulate for now
      updates.weekly_focus_minutes = (currentStats?.weekly_focus_minutes || 0) + durationMinutes;
    } else {
      updates.weekly_focus_minutes = (currentStats?.weekly_focus_minutes || 0) + durationMinutes;
    }

    if (dayOfMonth === 1) {
      updates.monthly_focus_minutes = durationMinutes;
    } else {
      updates.monthly_focus_minutes = (currentStats?.monthly_focus_minutes || 0) + durationMinutes;
    }

    await supabase.from("user_stats").update(updates).eq("user_id", userId);
  },
};
```

### Step 2: Extend Streak Service

**File:** `src/services/streak-service.ts` (update existing)

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import type { UserStats } from "@/types/xp-system";

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export const streakService = {
  async getStreak(userId: string): Promise<StreakData | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_stats")
      .select("current_streak, longest_streak, last_active_date")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  async updateStreak(userId: string): Promise<StreakData> {
    const supabase = createClient();

    const { data: currentStats } = await supabase
      .from("user_stats")
      .select("current_streak, longest_streak, last_active_date")
      .eq("user_id", userId)
      .single();

    const today = new Date().toISOString().split("T")[0];
    const lastActive = currentStats?.last_active_date;

    // Already active today
    if (lastActive === today) {
      return currentStats as StreakData;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = 1;
    if (!lastActive || lastActive === yesterdayStr) {
      newStreak = (currentStats?.current_streak || 0) + 1;
    }

    const longestStreak = Math.max(
      newStreak,
      currentStats?.longest_streak || 0
    );

    const { data, error } = await supabase
      .from("user_stats")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_active_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select("current_streak, longest_streak, last_active_date")
      .single();

    if (error) throw error;
    return data;
  },

  async checkStreakBonus(userId: string): Promise<number> {
    const streak = await this.getStreak(userId);
    if (!streak) return 0;

    // Bonus XP for streak milestones
    if (streak.current_streak === 7) return 100;
    if (streak.current_streak === 30) return 500;
    if (streak.current_streak === 100) return 2000;

    return 0;
  },
};
```

### Step 3: Create Gamification Store

**File:** `src/stores/gamification-store.ts`

```typescript
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserStats, LevelInfo, UserBadge, ChallengeProgress } from "@/types/gamification";
import { xpService } from "@/services/xp-service";

interface GamificationState {
  userStats: UserStats | null;
  levelInfo: LevelInfo | null;
  badges: UserBadge[];
  challenges: ChallengeProgress[];
  isLoading: boolean;
  lastSync: string | null;

  // Actions
  loadUserStats: (userId: string) => Promise<void>;
  awardXP: (userId: string, durationMinutes: number, currentStreak: number) => Promise<{ leveledUp: boolean; newLevel?: number }>;
  refreshStats: (userId: string) => Promise<void>;
  clearStats: () => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      userStats: null,
      levelInfo: null,
      badges: [],
      challenges: [],
      isLoading: false,
      lastSync: null,

      loadUserStats: async (userId: string) => {
        set({ isLoading: true });
        try {
          let stats = await xpService.getUserStats(userId);

          if (!stats) {
            stats = await xpService.initializeUserStats(userId);
          }

          const levelInfo = xpService.calculateLevelInfo(stats.total_xp);

          set({
            userStats: stats,
            levelInfo,
            isLoading: false,
            lastSync: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Failed to load user stats:", error);
          set({ isLoading: false });
        }
      },

      awardXP: async (userId: string, durationMinutes: number, currentStreak: number) => {
        const xpAmount = xpService.calculateXP(durationMinutes, currentStreak);
        const result = await xpService.awardXP(userId, xpAmount, "time_entry");

        // Update local state
        const { userStats } = get();
        if (userStats) {
          const newStats = {
            ...userStats,
            total_xp: result.newTotal,
            current_level: result.newLevel || userStats.current_level,
          };
          const levelInfo = xpService.calculateLevelInfo(result.newTotal);

          set({
            userStats: newStats,
            levelInfo,
          });
        }

        return { leveledUp: result.leveledUp, newLevel: result.newLevel };
      },

      refreshStats: async (userId: string) => {
        await get().loadUserStats(userId);
      },

      clearStats: () => {
        set({
          userStats: null,
          levelInfo: null,
          badges: [],
          challenges: [],
          lastSync: null,
        });
      },
    }),
    {
      name: "clockin-gamification",
      partialize: (state) => ({
        userStats: state.userStats,
        levelInfo: state.levelInfo,
        lastSync: state.lastSync,
      }),
    }
  )
);
```

### Step 4: Create XP Calculator Hook

**File:** `src/hooks/use-xp-calculator.ts`

```typescript
"use client";

import { useCallback } from "react";
import { xpService } from "@/services/xp-service";
import { streakService } from "@/services/streak-service";
import { useGamificationStore } from "@/stores/gamification-store";

interface XPAwardResult {
  xpAwarded: number;
  leveledUp: boolean;
  newLevel?: number;
  streakBonus?: number;
}

export function useXPCalculator() {
  const { awardXP } = useGamificationStore();

  const calculateAndAwardXP = useCallback(
    async (userId: string, durationMinutes: number): Promise<XPAwardResult> => {
      // Get current streak for multiplier
      const streak = await streakService.getStreak(userId);
      const currentStreak = streak?.current_streak || 0;

      // Calculate base XP
      const xpAmount = xpService.calculateXP(durationMinutes, currentStreak);

      // Award XP
      const result = await awardXP(userId, durationMinutes, currentStreak);

      // Update focus time stats
      await xpService.updateFocusTime(userId, durationMinutes);

      // Check for streak bonus
      const streakBonus = await streakService.checkStreakBonus(userId);
      if (streakBonus > 0) {
        await xpService.awardXP(userId, streakBonus, "streak_bonus");
      }

      return {
        xpAwarded: xpAmount,
        leveledUp: result.leveledUp,
        newLevel: result.newLevel,
        streakBonus: streakBonus > 0 ? streakBonus : undefined,
      };
    },
    [awardXP]
  );

  return { calculateAndAwardXP };
}
```

### Step 5: Create XP Bar Component

**File:** `src/components/gamification/xp-bar.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";
import type { LevelInfo } from "@/types/xp-system";

interface XPBarProps {
  levelInfo: LevelInfo;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function XPBar({
  levelInfo,
  showDetails = true,
  size = "md",
  className,
}: XPBarProps) {
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Level {levelInfo.currentLevel}
          </span>
          <span className="text-muted-foreground">
            {levelInfo.xpProgress.toLocaleString()} /{" "}
            {levelInfo.xpForNextLevel.toLocaleString()} XP
          </span>
        </div>
      )}

      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted",
          sizeClasses[size]
        )}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
          style={{ width: `${levelInfo.progressPercentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>

      {showDetails && (
        <p className="text-xs text-muted-foreground">
          {Math.round(levelInfo.xpForNextLevel - levelInfo.xpProgress).toLocaleString()} XP to next level
        </p>
      )}
    </div>
  );
}
```

### Step 6: Create Level Badge Component

**File:** `src/components/gamification/level-badge.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  showGlow?: boolean;
  className?: string;
}

export function LevelBadge({
  level,
  size = "md",
  showGlow = true,
  className,
}: LevelBadgeProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-12 w-12 text-lg",
    lg: "h-16 w-16 text-2xl",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  // Color based on level tier
  const getTierColor = (level: number): string => {
    if (level >= 50) return "from-amber-500 to-yellow-400"; // Legendary
    if (level >= 25) return "from-purple-500 to-pink-500"; // Epic
    if (level >= 10) return "from-blue-500 to-cyan-500"; // Rare
    return "from-emerald-500 to-teal-400"; // Common
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full font-bold text-white",
        "bg-gradient-to-br",
        getTierColor(level),
        sizeClasses[size],
        showGlow && "shadow-lg",
        className
      )}
      style={
        showGlow
          ? {
              boxShadow: `0 0 20px rgba(59, 130, 246, 0.4)`,
            }
          : undefined
      }
    >
      <Sparkles
        className={cn(
          "absolute -top-1 -right-1 text-yellow-300",
          iconSizes[size]
        )}
      />
      {level}
    </div>
  );
}
```

### Step 7: Integrate with Time Entry Service

**File:** `src/services/time-entry-service.ts` (add to existing)

```typescript
import { useXPCalculator } from "@/hooks/use-xp-calculator";
import { streakService } from "@/services/streak-service";

// Add to the createEntry or completeEntry method:
async completeEntry(entryId: string, userId: string): Promise<void> {
  const supabase = createClient();

  // Get entry details
  const { data: entry } = await supabase
    .from("time_entries")
    .select("duration_seconds")
    .eq("id", entryId)
    .single();

  if (!entry?.duration_seconds) return;

  const durationMinutes = Math.floor(entry.duration_seconds / 60);

  // Update streak
  await streakService.updateStreak(userId);

  // Award XP (this should be called from the component using the hook)
  // const { calculateAndAwardXP } = useXPCalculator();
  // await calculateAndAwardXP(userId, durationMinutes);
}
```

### Step 8: Update Dashboard to Show XP

**File:** Update `src/app/(dashboard)/dashboard/page.tsx`

Add imports and integrate XP bar display in the stats section.

## Todo List

- [ ] Create xp-service.ts with XP calculation and awarding
- [ ] Extend streak-service.ts with streak bonus logic
- [ ] Create gamification-store.ts for state management
- [ ] Create use-xp-calculator.ts hook
- [ ] Create XPBar component with progress visualization
- [ ] Create LevelBadge component with tier colors
- [ ] Integrate XP awarding into time entry completion flow
- [ ] Update dashboard to display XP and level
- [ ] Test XP calculation with various durations and streaks
- [ ] Add loading states and error handling

## Success Criteria

1. XP is correctly calculated based on duration and streak multiplier
2. Level progression works automatically when XP thresholds are reached
3. Streaks are tracked accurately across days
4. XP bar shows real-time progress toward next level
5. Level badge displays current level with appropriate tier styling
6. All data persists correctly to database

## Next Steps

After completing this phase:
1. Proceed to Phase 3: Achievement Badges
2. Implement badge checking logic when XP is awarded
3. Create badge notification system

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| XP calculation race conditions | Medium | Use database transactions, optimistic UI |
| Streak timezone issues | Medium | Store dates in UTC, convert for display |
| Performance on frequent updates | Low | Debounce updates, use local state |
