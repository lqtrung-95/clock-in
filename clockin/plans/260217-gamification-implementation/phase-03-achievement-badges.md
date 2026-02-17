---
title: "Phase 3: Achievement Badges"
description: "Implement badge definitions, earning logic, and badge display components"
status: pending
priority: P1
effort: 6h
dependencies: [phase-01-database-schema, phase-02-xp-level-system]
---

# Phase 3: Achievement Badges

## Overview
Implement the achievement badge system including badge definitions, earning conditions, progress tracking, and badge display components with unlock notifications.

## Key Insights
- Badges are earned based on various conditions: total hours, streaks, session patterns
- Each badge awards bonus XP when earned
- Badge rarity affects visual styling (common, rare, epic, legendary)
- Need to check for badge eligibility after each significant action

## Requirements

### Functional Requirements
1. Define all badge types with conditions and rewards
2. Check badge eligibility when XP is awarded
3. Track badge progress for multi-step badges
4. Display earned and locked badges in grid view
5. Show notification when badge is earned
6. Award bonus XP on badge unlock

### Non-Functional Requirements
1. Badge checks should be efficient (don't block UI)
2. Badge progress should update in real-time
3. Notifications should be non-intrusive
4. Badge data should be cached locally

## Architecture

### Badge System Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Time Entry      │────▶│ Badge Service    │────▶│ Check Conditions│
│ Completed       │     │ checkBadges()    │     │ for all badges  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ New Badges       │
                        │ Earned?          │
                        └──────────────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
    ┌──────────────────┐              ┌──────────────────┐
    │ Award Badge      │              │ Update Progress  │
    │ Show Notification│              │ (if applicable)  │
    └──────────────────┘              └──────────────────┘
```

### Badge Condition Types

| Type | Description | Example |
|------|-------------|---------|
| total_hours | Total focused hours | first_10h, first_100h |
| streak_days | Consecutive days | streak_7, streak_30 |
| early_session | Session before time | early_bird |
| late_session | Session after time | night_owl |
| weekend_sessions | Sessions on weekend | weekend_warrior |
| daily_consistency | Days with sessions | daily_7, daily_30 |
| challenges_completed | Challenges finished | challenge_first |
| pomodoro_sessions | Pomodoro count | pomodoro_master |
| categories_used | Unique categories | category_explorer |

## Related Code Files

### Files to Create
1. `src/services/badge-service.ts`
2. `src/hooks/use-badge-checker.ts`
3. `src/components/gamification/achievement-badge.tsx`
4. `src/components/gamification/achievements-grid.tsx`
5. `src/components/gamification/badge-notification.tsx`

### Files to Modify
1. `src/stores/gamification-store.ts` - add badge state
2. `src/hooks/use-xp-calculator.ts` - integrate badge checking
3. `src/app/(dashboard)/achievements/page.tsx` - new page

## Implementation Steps

### Step 1: Create Badge Service

**File:** `src/services/badge-service.ts`

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import type { BadgeDefinition, UserBadge } from "@/types/gamification";
import type { UserStats } from "@/types/xp-system";
import { BADGE_DEFINITIONS } from "@/data/badge-definitions";
import { xpService } from "@/services/xp-service";

export interface BadgeCheckResult {
  badge: BadgeDefinition;
  newlyEarned: boolean;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

export const badgeService = {
  async getBadgeDefinitions(): Promise<BadgeDefinition[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("badge_definitions")
      .select("*")
      .order("xp_reward", { ascending: true });

    if (error) throw error;
    return data || BADGE_DEFINITIONS;
  },

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_badges")
      .select(`
        *,
        badge:badge_definitions(*)
      `)
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async checkAndAwardBadges(
    userId: string,
    userStats: UserStats,
    context: {
      sessionDuration?: number;
      sessionHour?: number;
      sessionDay?: number;
      isPomodoro?: boolean;
      categoriesUsed?: number;
      challengesCompleted?: number;
    }
  ): Promise<BadgeCheckResult[]> {
    const supabase = createClient();
    const results: BadgeCheckResult[] = [];

    // Get already earned badges
    const { data: earnedBadges } = await supabase
      .from("user_badges")
      .select("badge_key")
      .eq("user_id", userId);

    const earnedKeys = new Set(earnedBadges?.map((b) => b.badge_key) || []);

    // Get all badge definitions
    const badges = await this.getBadgeDefinitions();

    for (const badge of badges) {
      if (earnedKeys.has(badge.key)) {
        // Already earned, skip
        continue;
      }

      const isEligible = this.checkBadgeEligibility(badge, userStats, context);

      if (isEligible) {
        // Award the badge
        await this.awardBadge(userId, badge);
        results.push({ badge, newlyEarned: true });
      } else {
        // Calculate progress
        const progress = this.calculateBadgeProgress(badge, userStats, context);
        if (progress) {
          results.push({ badge, newlyEarned: false, progress });
        }
      }
    }

    return results;
  },

  checkBadgeEligibility(
    badge: BadgeDefinition,
    userStats: UserStats,
    context: {
      sessionDuration?: number;
      sessionHour?: number;
      sessionDay?: number;
      isPomodoro?: boolean;
      categoriesUsed?: number;
      challengesCompleted?: number;
    }
  ): boolean {
    const totalHours = Math.floor(userStats.total_focus_minutes / 60);

    switch (badge.condition_type) {
      case "total_hours":
        return totalHours >= badge.condition_value;

      case "streak_days":
        return userStats.current_streak >= badge.condition_value;

      case "early_session":
        return (context.sessionHour || 0) < 7;

      case "late_session":
        return (context.sessionHour || 0) >= 22;

      case "weekend_sessions":
        const day = context.sessionDay;
        return day === 0 || day === 6; // Sunday or Saturday

      case "daily_consistency":
        return userStats.current_streak >= badge.condition_value;

      case "challenges_completed":
        return (context.challengesCompleted || 0) >= badge.condition_value;

      case "pomodoro_sessions":
        // This would need to be tracked separately
        return false;

      case "categories_used":
        return (context.categoriesUsed || 0) >= badge.condition_value;

      default:
        return false;
    }
  },

  calculateBadgeProgress(
    badge: BadgeDefinition,
    userStats: UserStats,
    context: {
      categoriesUsed?: number;
      challengesCompleted?: number;
    }
  ): { current: number; target: number; percentage: number } | undefined {
    const totalHours = Math.floor(userStats.total_focus_minutes / 60);

    switch (badge.condition_type) {
      case "total_hours":
        return {
          current: Math.min(totalHours, badge.condition_value),
          target: badge.condition_value,
          percentage: Math.min((totalHours / badge.condition_value) * 100, 100),
        };

      case "streak_days":
      case "daily_consistency":
        return {
          current: Math.min(userStats.current_streak, badge.condition_value),
          target: badge.condition_value,
          percentage: Math.min(
            (userStats.current_streak / badge.condition_value) * 100,
            100
          ),
        };

      case "challenges_completed":
        const challenges = context.challengesCompleted || 0;
        return {
          current: Math.min(challenges, badge.condition_value),
          target: badge.condition_value,
          percentage: Math.min((challenges / badge.condition_value) * 100, 100),
        };

      case "categories_used":
        const categories = context.categoriesUsed || 0;
        return {
          current: Math.min(categories, badge.condition_value),
          target: badge.condition_value,
          percentage: Math.min((categories / badge.condition_value) * 100, 100),
        };

      default:
        return undefined;
    }
  },

  async awardBadge(
    userId: string,
    badge: BadgeDefinition
  ): Promise<void> {
    const supabase = createClient();

    // Insert user badge
    const { error: badgeError } = await supabase
      .from("user_badges")
      .insert({
        user_id: userId,
        badge_key: badge.key,
        earned_at: new Date().toISOString(),
      });

    if (badgeError) throw badgeError;

    // Award bonus XP
    if (badge.xp_reward > 0) {
      await xpService.awardXP(userId, badge.xp_reward, `badge_${badge.key}`);
    }
  },

  async getBadgeStats(userId: string): Promise<{
    total: number;
    earned: number;
    byRarity: Record<string, number>;
  }> {
    const [definitions, userBadges] = await Promise.all([
      this.getBadgeDefinitions(),
      this.getUserBadges(userId),
    ]);

    const byRarity: Record<string, number> = {};
    userBadges.forEach((ub) => {
      const rarity = ub.badge?.rarity || "common";
      byRarity[rarity] = (byRarity[rarity] || 0) + 1;
    });

    return {
      total: definitions.length,
      earned: userBadges.length,
      byRarity,
    };
  },
};
```

### Step 2: Create Badge Checker Hook

**File:** `src/hooks/use-badge-checker.ts`

```typescript
"use client";

import { useCallback } from "react";
import { badgeService, BadgeCheckResult } from "@/services/badge-service";
import { useGamificationStore } from "@/stores/gamification-store";
import { useToast } from "sonner";

interface BadgeCheckOptions {
  showNotifications?: boolean;
}

export function useBadgeChecker() {
  const { userStats, refreshStats } = useGamificationStore();
  const { toast } = useToast();

  const checkBadges = useCallback(
    async (
      userId: string,
      context: {
        sessionDuration?: number;
        sessionHour?: number;
        sessionDay?: number;
        isPomodoro?: boolean;
        categoriesUsed?: number;
        challengesCompleted?: number;
      },
      options: BadgeCheckOptions = { showNotifications: true }
    ): Promise<BadgeCheckResult[]> => {
      if (!userStats) return [];

      const results = await badgeService.checkAndAwardBadges(
        userId,
        userStats,
        context
      );

      // Show notifications for newly earned badges
      const newBadges = results.filter((r) => r.newlyEarned);

      if (newBadges.length > 0 && options.showNotifications) {
        newBadges.forEach((result, index) => {
          setTimeout(() => {
            toast.success(`Badge Unlocked: ${result.badge.name}`, {
              description: result.badge.description,
              duration: 5000,
            });
          }, index * 500); // Stagger notifications
        });

        // Refresh stats to include new XP from badges
        await refreshStats(userId);
      }

      return results;
    },
    [userStats, refreshStats, toast]
  );

  return { checkBadges };
}
```

### Step 3: Create Achievement Badge Component

**File:** `src/components/gamification/achievement-badge.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";
import type { BadgeDefinition } from "@/types/gamification";
import { RARITY_COLORS, RARITY_LABELS } from "@/data/badge-definitions";
import {
  Clock,
  Hourglass,
  Trophy,
  Crown,
  Flame,
  Calendar,
  Star,
  Sunrise,
  Moon,
  CalendarDays,
  Repeat,
  CheckCircle,
  Target,
  Award,
  Timer,
  Compass,
  Lock,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  Hourglass,
  Trophy,
  Crown,
  Flame,
  Calendar,
  Star,
  Sunrise,
  Moon,
  CalendarDays,
  Repeat,
  CheckCircle,
  Target,
  Award,
  Timer,
  Compass,
};

interface AchievementBadgeProps {
  badge: BadgeDefinition;
  isEarned: boolean;
  earnedAt?: string;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  className?: string;
}

export function AchievementBadge({
  badge,
  isEarned,
  earnedAt,
  progress,
  size = "md",
  showProgress = true,
  className,
}: AchievementBadgeProps) {
  const Icon = ICON_MAP[badge.icon] || Star;
  const rarityColor = RARITY_COLORS[badge.rarity];

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300",
        isEarned
          ? "bg-card border-2 hover:scale-105"
          : "bg-muted/50 border-2 border-dashed border-muted-foreground/20",
        className
      )}
      style={
        isEarned
          ? { borderColor: rarityColor }
          : undefined
      }
    >
      {/* Badge Icon */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full",
          sizeClasses[size],
          isEarned
            ? "bg-gradient-to-br from-background to-muted"
            : "bg-muted"
        )}
      >
        {isEarned ? (
          <>
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-30"
              style={{ backgroundColor: rarityColor }}
            />
            <Icon
              className={cn(
                "relative z-10",
                iconSizes[size]
              )}
              style={{ color: rarityColor }}
            />
          </>
        ) : (
          <Lock className={cn("text-muted-foreground/50", iconSizes[size])} />
        )}

        {/* Rarity indicator */}
        {isEarned && (
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background"
            style={{ backgroundColor: rarityColor }}
          />
        )}
      </div>

      {/* Badge Info */}
      <div className="text-center space-y-1">
        <h4
          className={cn(
            "font-semibold text-sm",
            isEarned ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {badge.name}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {badge.description}
        </p>

        {/* Rarity Label */}
        {isEarned && (
          <span
            className="inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${rarityColor}20`,
              color: rarityColor,
            }}
          >
            {RARITY_LABELS[badge.rarity]}
          </span>
        )}

        {/* Progress Bar */}
        {!isEarned && showProgress && progress && (
          <div className="w-full space-y-1">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {progress.current} / {progress.target}
            </p>
          </div>
        )}

        {/* Earned Date */}
        {isEarned && earnedAt && (
          <p className="text-[10px] text-muted-foreground">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}

        {/* XP Reward */}
        {isEarned && (
          <p className="text-xs font-medium text-emerald-500">
            +{badge.xp_reward} XP
          </p>
        )}
      </div>
    </div>
  );
}
```

### Step 4: Create Achievements Grid Component

**File:** `src/components/gamification/achievements-grid.tsx`

```typescript
"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { BadgeDefinition, UserBadge } from "@/types/gamification";
import { AchievementBadge } from "./achievement-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface AchievementsGridProps {
  badges: BadgeDefinition[];
  userBadges: UserBadge[];
  badgeProgress?: Record<
    string,
    { current: number; target: number; percentage: number }
  >;
  className?: string;
}

export function AchievementsGrid({
  badges,
  userBadges,
  badgeProgress = {},
  className,
}: AchievementsGridProps) {
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");

  const earnedKeys = useMemo(
    () => new Set(userBadges.map((ub) => ub.badge_key)),
    [userBadges]
  );

  const filteredBadges = useMemo(() => {
    let filtered = badges;

    // Filter by earned/locked status
    if (filter === "earned") {
      filtered = filtered.filter((b) => earnedKeys.has(b.key));
    } else if (filter === "locked") {
      filtered = filtered.filter((b) => !earnedKeys.has(b.key));
    }

    // Filter by rarity
    if (rarityFilter !== "all") {
      filtered = filtered.filter((b) => b.rarity === rarityFilter);
    }

    return filtered;
  }, [badges, earnedKeys, filter, rarityFilter]);

  const stats = useMemo(() => {
    const total = badges.length;
    const earned = userBadges.length;
    const percentage = total > 0 ? (earned / total) * 100 : 0;

    const byRarity = {
      common: badges.filter((b) => b.rarity === "common" && earnedKeys.has(b.key)).length,
      rare: badges.filter((b) => b.rarity === "rare" && earnedKeys.has(b.key)).length,
      epic: badges.filter((b) => b.rarity === "epic" && earnedKeys.has(b.key)).length,
      legendary: badges.filter((b) => b.rarity === "legendary" && earnedKeys.has(b.key)).length,
    };

    return { total, earned, percentage, byRarity };
  }, [badges, userBadges, earnedKeys]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Header */}
      <div className="bg-card rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Achievement Progress</h3>
            <p className="text-sm text-muted-foreground">
              {stats.earned} of {stats.total} badges earned
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-500">
              {Math.round(stats.percentage)}%
            </span>
          </div>
        </div>
        <Progress value={stats.percentage} className="h-2" />

        {/* Rarity Breakdown */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
          {[
            { key: "common", label: "Common", color: "text-slate-400" },
            { key: "rare", label: "Rare", color: "text-blue-500" },
            { key: "epic", label: "Epic", color: "text-purple-500" },
            { key: "legendary", label: "Legendary", color: "text-amber-500" },
          ].map((rarity) => (
            <div key={rarity.key} className="text-center">
              <p className={cn("text-lg font-bold", rarity.color)}>
                {stats.byRarity[rarity.key as keyof typeof stats.byRarity]}
              </p>
              <p className="text-xs text-muted-foreground">{rarity.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="earned">Earned</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>

          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="text-sm border rounded-md px-3 py-1.5 bg-background"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>

        <TabsContent value={filter} className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBadges.map((badge) => {
              const isEarned = earnedKeys.has(badge.key);
              const userBadge = userBadges.find((ub) => ub.badge_key === badge.key);

              return (
                <AchievementBadge
                  key={badge.key}
                  badge={badge}
                  isEarned={isEarned}
                  earnedAt={userBadge?.earned_at}
                  progress={badgeProgress[badge.key]}
                  size="md"
                  showProgress
                />
              );
            })}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No badges found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Step 5: Create Achievements Page

**File:** `src/app/(dashboard)/achievements/page.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthState } from "@/hooks/use-auth-state";
import { badgeService } from "@/services/badge-service";
import { AchievementsGrid } from "@/components/gamification/achievements-grid";
import { XPBar } from "@/components/gamification/xp-bar";
import { LevelBadge } from "@/components/gamification/level-badge";
import { Card } from "@/components/ui/card";
import { LoginPrompt } from "@/components/auth/login-prompt";
import type { BadgeDefinition, UserBadge } from "@/types/gamification";
import type { UserStats } from "@/types/xp-system";
import { Award, Target, Sparkles } from "lucide-react";

export default function AchievementsPage() {
  const { isAuthenticated } = useAuthState();
  const supabase = createClient();

  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [badgesData, userBadgesData, statsData] = await Promise.all([
        badgeService.getBadgeDefinitions(),
        badgeService.getUserBadges(user.id),
        supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
      ]);

      setBadges(badgesData);
      setUserBadges(userBadgesData);
      setUserStats(statsData.data);
      setLoading(false);
    }

    loadData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Achievements</h1>
        <LoginPrompt feature="achievements" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <p className="text-sm font-medium text-amber-600">
                Achievements
              </p>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Your Badges
            </h1>
            <p className="text-muted-foreground">
              Collect badges by reaching milestones
            </p>
          </div>

          {/* Level Card */}
          {userStats && (
            <Card className="flex items-center gap-4 p-4">
              <LevelBadge level={userStats.current_level} size="lg" />
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-2xl font-bold">{userStats.current_level}</p>
              </div>
            </Card>
          )}
        </div>

        {/* XP Progress */}
        {userStats && (
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold">Experience Progress</h2>
            </div>
            <XPBar
              levelInfo={{
                currentLevel: userStats.current_level,
                currentXP: userStats.total_xp,
                xpForNextLevel: userStats.current_level * 1000,
                xpProgress: userStats.total_xp % 1000,
                progressPercentage: ((userStats.total_xp % 1000) / 1000) * 100,
              }}
              size="lg"
            />
          </Card>
        )}

        {/* Achievements Grid */}
        <AchievementsGrid badges={badges} userBadges={userBadges} />
      </div>
    </div>
  );
}
```

## Todo List

- [ ] Create badge-service.ts with badge checking logic
- [ ] Create use-badge-checker.ts hook for checking badges
- [ ] Create AchievementBadge component with rarity styling
- [ ] Create AchievementsGrid component with filtering
- [ ] Create achievements page
- [ ] Integrate badge checking into XP calculator
- [ ] Add badge notifications with toast
- [ ] Test badge earning for all condition types
- [ ] Add loading states and error handling

## Success Criteria

1. All badge definitions are loaded from database
2. Badge conditions are correctly evaluated
3. New badges trigger notification toast
4. Badge grid shows earned vs locked status
5. Progress is shown for locked badges
6. Rarity colors display correctly
7. Bonus XP is awarded when badges are earned

## Next Steps

After completing this phase:
1. Proceed to Phase 4: Weekly Challenges
2. Implement challenge progress tracking
3. Create challenge completion badges integration

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Badge check performance | Medium | Batch checks, cache results |
| Notification spam | Low | Stagger notifications, limit frequency |
| Race conditions on earn | Low | Use unique constraints in DB |
