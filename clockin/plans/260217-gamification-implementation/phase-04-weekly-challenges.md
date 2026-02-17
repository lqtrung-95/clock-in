---
title: "Phase 4: Weekly Challenges"
description: "Implement weekly challenge generation, progress tracking, and completion rewards"
status: pending
priority: P1
effort: 5h
dependencies: [phase-01-database-schema, phase-02-xp-level-system]
---

# Phase 4: Weekly Challenges

## Overview
Implement the weekly challenges system including automatic challenge generation, progress tracking, completion detection, and reward distribution.

## Key Insights
- Challenges are auto-generated every Monday at 00:00 UTC
- Three challenge types: total hours, session count, daily streak
- Progress updates in real-time as user completes sessions
- XP rewards are granted on challenge completion

## Requirements

### Functional Requirements
1. Auto-generate 3 new challenges each week
2. Track progress for each active challenge
3. Detect when challenges are completed
4. Award XP rewards on completion
5. Show active and past challenges
6. Display time remaining for current week

### Non-Functional Requirements
1. Challenge generation should be idempotent (no duplicates)
2. Progress updates should be efficient
3. Handle timezone correctly for week boundaries
4. Cache challenge data locally

## Architecture

### Challenge Lifecycle

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Monday 00:00    │────▶│ Generate Weekly  │────▶│ Create 3        │
│ UTC             │     │ Challenges       │     │ Challenge Rows  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Award XP        │◀────│ Challenge        │◀────│ User Completes  │
│ & Notify        │     │ Completed?       │     │ Session         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Challenge Types

| Type | Description | Target Examples |
|------|-------------|-----------------|
| total_minutes | Total focus time | 600 min (10h) |
| session_count | Number of sessions | 15 sessions |
| daily_streak | Days with sessions | 7 days |

## Related Code Files

### Files to Create
1. `src/services/challenge-service.ts`
2. `src/hooks/use-challenge-tracker.ts`
3. `src/components/gamification/challenge-card.tsx`
4. `src/components/gamification/challenges-list.tsx`

### Files to Modify
1. `src/stores/gamification-store.ts` - add challenge state
2. `src/hooks/use-xp-calculator.ts` - update challenge progress

## Implementation Steps

### Step 1: Create Challenge Service

**File:** `src/services/challenge-service.ts`

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import type { WeeklyChallenge, ChallengeProgress } from "@/types/gamification";
import { xpService } from "@/services/xp-service";

export const challengeService = {
  async getActiveChallenges(userId: string): Promise<ChallengeProgress[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("challenge_progress")
      .select(`
        *,
        challenge:weekly_challenges(*)
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("weekly_challenges")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async initializeUserProgress(
    userId: string,
    challenges: WeeklyChallenge[]
  ): Promise<void> {
    const supabase = createClient();

    for (const challenge of challenges) {
      // Check if progress already exists
      const { data: existing } = await supabase
        .from("challenge_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("challenge_id", challenge.id)
        .single();

      if (!existing) {
        await supabase.from("challenge_progress").insert({
          user_id: userId,
          challenge_id: challenge.id,
          progress_target: challenge.target_value,
          status: "active",
        });
      }
    }
  },

  async updateChallengeProgress(
    userId: string,
    challengeType: string,
    incrementValue: number
  ): Promise<ChallengeProgress[]> {
    const supabase = createClient();

    // Get active challenges of this type
    const { data: activeProgress } = await supabase
      .from("challenge_progress")
      .select(`
        *,
        challenge:weekly_challenges!inner(*)
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("challenge.challenge_type", challengeType);

    if (!activeProgress || activeProgress.length === 0) return [];

    const completedChallenges: ChallengeProgress[] = [];

    for (const progress of activeProgress) {
      const newProgress = Math.min(
        progress.progress_current + incrementValue,
        progress.progress_target
      );

      const isCompleted = newProgress >= progress.progress_target;

      const updates: Partial<ChallengeProgress> = {
        progress_current: newProgress,
        updated_at: new Date().toISOString(),
      };

      if (isCompleted && progress.status !== "completed") {
        updates.status = "completed";
        updates.completed_at = new Date().toISOString();

        // Award XP
        if (progress.challenge?.xp_reward) {
          await xpService.awardXP(
            userId,
            progress.challenge.xp_reward,
            `challenge_${progress.challenge.challenge_key}`
          );
        }

        completedChallenges.push({ ...progress, ...updates });
      }

      await supabase
        .from("challenge_progress")
        .update(updates)
        .eq("id", progress.id);
    }

    return completedChallenges;
  },

  async trackSessionCompletion(
    userId: string,
    durationMinutes: number
  ): Promise<{ completedChallenges: ChallengeProgress[]; xpAwarded: number }> {
    // Update total_minutes challenges
    const minutesCompleted = await this.updateChallengeProgress(
      userId,
      "total_minutes",
      durationMinutes
    );

    // Update session_count challenges
    const sessionsCompleted = await this.updateChallengeProgress(
      userId,
      "session_count",
      1
    );

    // Update daily_streak challenges (this is handled separately)
    const streakCompleted = await this.updateChallengeProgress(
      userId,
      "daily_streak",
      1
    );

    const allCompleted = [...minutesCompleted, ...sessionsCompleted, ...streakCompleted];
    const totalXP = allCompleted.reduce(
      (sum, c) => sum + (c.challenge?.xp_reward || 0),
      0
    );

    return {
      completedChallenges: allCompleted,
      xpAwarded: totalXP,
    };
  },

  async getChallengeHistory(
    userId: string,
    limit: number = 10
  ): Promise<ChallengeProgress[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("challenge_progress")
      .select(`
        *,
        challenge:weekly_challenges(*)
      `)
      .eq("user_id", userId)
      .in("status", ["completed", "expired"])
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  getTimeRemaining(): { days: number; hours: number; minutes: number } {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday
    const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;

    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);

    const diff = nextMonday.getTime() - now.getTime();

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    };
  },
};
```

### Step 2: Create Challenge Tracker Hook

**File:** `src/hooks/use-challenge-tracker.ts`

```typescript
"use client";

import { useCallback, useEffect, useState } from "react";
import { challengeService } from "@/services/challenge-service";
import { useGamificationStore } from "@/stores/gamification-store";
import type { ChallengeProgress } from "@/types/gamification";
import { toast } from "sonner";

export function useChallengeTracker(userId: string) {
  const { challenges, setChallenges } = useGamificationStore();
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(
    challengeService.getTimeRemaining()
  );

  // Load active challenges
  const loadChallenges = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Get weekly challenges
      const weeklyChallenges = await challengeService.getWeeklyChallenges();

      // Initialize progress if needed
      await challengeService.initializeUserProgress(userId, weeklyChallenges);

      // Get user's progress
      const progress = await challengeService.getActiveChallenges(userId);
      setChallenges(progress);
    } catch (error) {
      console.error("Failed to load challenges:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, setChallenges]);

  // Track session and update challenges
  const trackSession = useCallback(
    async (durationMinutes: number) => {
      if (!userId) return;

      const result = await challengeService.trackSessionCompletion(
        userId,
        durationMinutes
      );

      // Show notifications for completed challenges
      result.completedChallenges.forEach((challenge, index) => {
        setTimeout(() => {
          toast.success(`Challenge Completed!`, {
            description: `${challenge.challenge?.name} - +${challenge.challenge?.xp_reward} XP`,
            duration: 5000,
          });
        }, index * 500);
      });

      // Refresh challenges
      await loadChallenges();

      return result;
    },
    [userId, loadChallenges]
  );

  // Update time remaining
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(challengeService.getTimeRemaining());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Initial load
  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  return {
    challenges,
    loading,
    timeRemaining,
    trackSession,
    refreshChallenges: loadChallenges,
  };
}
```

### Step 3: Create Challenge Card Component

**File:** `src/components/gamification/challenge-card.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";
import type { ChallengeProgress } from "@/types/gamification";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Target,
  Flame,
  CheckCircle2,
  Timer,
  Calendar,
} from "lucide-react";

const CHALLENGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> =
  {
    total_minutes: Clock,
    session_count: Target,
    daily_streak: Flame,
  };

interface ChallengeCardProps {
  challenge: ChallengeProgress;
  className?: string;
}

export function ChallengeCard({ challenge, className }: ChallengeCardProps) {
  const Icon =
    CHALLENGE_ICONS[challenge.challenge?.challenge_type || ""] || Target;
  const isCompleted = challenge.status === "completed";

  const progressPercentage = Math.min(
    (challenge.progress_current / challenge.progress_target) * 100,
    100
  );

  const formatValue = (value: number, type: string): string => {
    if (type === "total_minutes") {
      return `${Math.floor(value / 60)}h ${value % 60}m`;
    }
    return value.toString();
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-5 transition-all duration-300",
        isCompleted
          ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
          : "bg-card hover:border-border/80",
        className
      )}
    >
      {/* Completed Badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <Badge
            variant="default"
            className="bg-emerald-500 text-white border-0"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isCompleted
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {challenge.challenge?.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {challenge.challenge?.description}
          </p>

          {/* Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {formatValue(
                  challenge.progress_current,
                  challenge.challenge?.challenge_type || ""
                )}{" "}
                /{" "}
                {formatValue(
                  challenge.progress_target,
                  challenge.challenge?.challenge_type || ""
                )}
              </span>
            </div>

            <Progress
              value={progressPercentage}
              className={cn(
                "h-2",
                isCompleted && "bg-emerald-100"
              )}
            />

            {/* XP Reward */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {Math.round(progressPercentage)}% complete
              </span>
              {!isCompleted && (
                <span className="text-xs font-medium text-emerald-600">
                  +{challenge.challenge?.xp_reward} XP reward
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

### Step 4: Create Challenges List Component

**File:** `src/components/gamification/challenges-list.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";
import type { ChallengeProgress } from "@/types/gamification";
import { ChallengeCard } from "./challenge-card";
import { Card } from "@/components/ui/card";
import { Timer, Trophy } from "lucide-react";

interface ChallengesListProps {
  challenges: ChallengeProgress[];
  timeRemaining: { days: number; hours: number; minutes: number };
  loading?: boolean;
  className?: string;
}

export function ChallengesList({
  challenges,
  timeRemaining,
  loading,
  className,
}: ChallengesListProps) {
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const completedCount = challenges.filter(
    (c) => c.status === "completed"
  ).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Weekly Challenges</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {challenges.length} completed
            </p>
          </div>
        </div>

        {/* Time Remaining */}
        <Card className="flex items-center gap-3 px-4 py-2 bg-muted/50">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Resets in:</span>
          <span className="text-sm font-mono font-medium">
            {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
          </span>
        </Card>
      </div>

      {/* Challenges Grid */}
      <div className="grid gap-4">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>

      {challenges.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No active challenges</p>
          <p className="text-sm text-muted-foreground mt-1">
            Check back on Monday for new challenges!
          </p>
        </Card>
      )}
    </div>
  );
}
```

### Step 5: Update Gamification Store

**File:** `src/stores/gamification-store.ts` (add challenge state)

```typescript
// Add to existing store:
interface GamificationState {
  // ... existing state
  challenges: ChallengeProgress[];

  // Add actions:
  setChallenges: (challenges: ChallengeProgress[]) => void;
}

// In store implementation:
setChallenges: (challenges) => set({ challenges }),
```

### Step 6: Integrate with Dashboard

Add challenges list to the dashboard page or create a dedicated challenges section.

## Todo List

- [ ] Create challenge-service.ts with progress tracking
- [ ] Create use-challenge-tracker.ts hook
- [ ] Create ChallengeCard component
- [ ] Create ChallengesList component
- [ ] Update gamification store with challenge state
- [ ] Integrate challenge tracking into session completion
- [ ] Add challenge completion notifications
- [ ] Test challenge generation and progress updates
- [ ] Add loading states and error handling

## Success Criteria

1. Weekly challenges are auto-generated correctly
2. Progress updates in real-time as sessions complete
3. XP is awarded when challenges are completed
4. Time remaining displays correctly
5. Completed challenges show checkmark badge
6. Progress bars update smoothly
7. Notifications appear for completed challenges

## Next Steps

After completing this phase:
1. Proceed to Phase 5: Crystal Evolution & Customization
2. Integrate challenge rewards with crystal unlocks
3. Add challenge-related badges

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Challenge generation timing | Medium | Use UTC, idempotent generation |
| Progress update conflicts | Low | Atomic updates, unique constraints |
| Timezone display issues | Low | Use client timezone for display |
