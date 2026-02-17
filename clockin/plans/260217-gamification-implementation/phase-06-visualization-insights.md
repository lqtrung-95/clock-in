---
title: "Phase 6: Calendar Heatmap & AI Insights"
description: "Implement monthly calendar heatmap, milestone celebrations, and AI-powered weekly insights"
status: pending
priority: P1
effort: 5h
dependencies: [phase-02-xp-level-system, phase-03-achievement-badges, phase-04-weekly-challenges]
---

# Phase 6: Calendar Heatmap & AI Insights

## Overview
Implement visualization features including a GitHub-style contribution calendar heatmap, milestone celebration animations, and basic AI-powered weekly insights for focus patterns.

## Key Insights
- Calendar heatmap shows daily focus intensity over the past year
- Milestone celebrations trigger on level up and badge unlock
- AI insights analyze patterns from time entry data
- All visualizations should be performant and mobile-friendly

## Requirements

### Functional Requirements
1. Monthly calendar heatmap with color-coded intensity
2. Milestone celebration animations with confetti
3. Weekly summary stats card
4. Focus pattern detection (peak hours, consistency)
5. Insights based on historical data

### Non-Functional Requirements
1. Heatmap renders efficiently for 365 days of data
2. Celebrations don't block user interaction
3. Insights generate client-side (no external AI API)
4. Smooth animations at 60fps

## Architecture

### Heatmap Color Scale

| Hours | Color | Description |
|-------|-------|-------------|
| 0 | bg-muted | No activity |
| 0.1-1 | bg-emerald-200 | Light activity |
| 1-2 | bg-emerald-300 | Moderate activity |
| 2-4 | bg-emerald-400 | Good activity |
| 4-6 | bg-emerald-500 | High activity |
| 6+ | bg-emerald-600 | Excellent activity |

### Insights Detection

| Pattern | Detection Logic |
|---------|-----------------|
| Peak Hours | Most frequent session start times |
| Consistency | Standard deviation of daily hours |
| Weekend Warrior | Higher weekend vs weekday average |
| Early Bird | Sessions before 8 AM |
| Night Owl | Sessions after 9 PM |

## Related Code Files

### Files to Create
1. `src/services/insights-service.ts`
2. `src/components/gamification/calendar-heatmap.tsx`
3. `src/components/gamification/milestone-celebration.tsx`
4. `src/components/gamification/weekly-insights-card.tsx`

### Files to Modify
1. `src/app/(dashboard)/stats/page.tsx` - add heatmap
2. `src/app/(dashboard)/dashboard/page.tsx` - add insights card

## Implementation Steps

### Step 1: Create Insights Service

**File:** `src/services/insights-service.ts`

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import type { TimeEntry } from "@/types/timer";
import { format, parseISO, getDay, getHours } from "date-fns";

export interface DailyActivity {
  date: string;
  hours: number;
  sessions: number;
}

export interface FocusPattern {
  type: "peak_hours" | "consistency" | "weekend_warrior" | "early_bird" | "night_owl";
  title: string;
  description: string;
  confidence: number; // 0-100
}

export interface WeeklyInsight {
  totalHours: number;
  totalSessions: number;
  avgSessionLength: number;
  bestDay: { day: string; hours: number } | null;
  patterns: FocusPattern[];
  comparisonToLastWeek: number; // percentage change
}

export const insightsService = {
  async getDailyActivity(
    userId: string,
    days: number = 365
  ): Promise<DailyActivity[]> {
    const supabase = createClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("time_entries")
      .select("started_at, duration_seconds")
      .eq("user_id", userId)
      .gte("started_at", startDate.toISOString())
      .order("started_at", { ascending: true });

    if (error) throw error;

    // Aggregate by date
    const activityMap = new Map<string, DailyActivity>();

    data?.forEach((entry) => {
      const date = format(parseISO(entry.started_at), "yyyy-MM-dd");
      const hours = (entry.duration_seconds || 0) / 3600;

      const existing = activityMap.get(date);
      if (existing) {
        existing.hours += hours;
        existing.sessions += 1;
      } else {
        activityMap.set(date, { date, hours, sessions: 1 });
      }
    });

    // Fill in missing dates with zero activity
    const result: DailyActivity[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, "yyyy-MM-dd");
      result.push(activityMap.get(dateStr) || { date: dateStr, hours: 0, sessions: 0 });
    }

    return result.reverse();
  },

  async getWeeklyInsights(userId: string): Promise<WeeklyInsight> {
    const supabase = createClient();

    // Get last 14 days of data
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data, error } = await supabase
      .from("time_entries")
      .select("started_at, duration_seconds")
      .eq("user_id", userId)
      .gte("started_at", fourteenDaysAgo.toISOString())
      .order("started_at", { ascending: true });

    if (error) throw error;

    const entries = data || [];

    // Split into this week and last week
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thisWeekEntries = entries.filter(
      (e) => parseISO(e.started_at) >= sevenDaysAgo
    );
    const lastWeekEntries = entries.filter(
      (e) => parseISO(e.started_at) < sevenDaysAgo
    );

    // Calculate this week stats
    const thisWeekHours =
      thisWeekEntries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) /
      3600;
    const lastWeekHours =
      lastWeekEntries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) /
      3600;

    // Find best day
    const dailyHours = new Map<string, number>();
    thisWeekEntries.forEach((entry) => {
      const day = format(parseISO(entry.started_at), "EEE");
      const hours = (entry.duration_seconds || 0) / 3600;
      dailyHours.set(day, (dailyHours.get(day) || 0) + hours);
    });

    let bestDay: { day: string; hours: number } | null = null;
    dailyHours.forEach((hours, day) => {
      if (!bestDay || hours > bestDay.hours) {
        bestDay = { day, hours };
      }
    });

    // Detect patterns
    const patterns = this.detectPatterns(entries);

    return {
      totalHours: Math.round(thisWeekHours * 10) / 10,
      totalSessions: thisWeekEntries.length,
      avgSessionLength: thisWeekEntries.length
        ? Math.round((thisWeekHours / thisWeekEntries.length) * 60)
        : 0,
      bestDay,
      patterns,
      comparisonToLastWeek:
        lastWeekHours > 0
          ? Math.round(((thisWeekHours - lastWeekHours) / lastWeekHours) * 100)
          : 0,
    };
  },

  detectPatterns(entries: TimeEntry[]): FocusPattern[] {
    const patterns: FocusPattern[] = [];

    if (entries.length < 5) return patterns;

    // Peak hours detection
    const hourCounts = new Map<number, number>();
    entries.forEach((entry) => {
      const hour = getHours(parseISO(entry.started_at));
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    let peakHour = 0;
    let peakCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > peakCount) {
        peakHour = hour;
        peakCount = count;
      }
    });

    if (peakCount >= 3) {
      const hourLabel = peakHour < 12 ? `${peakHour} AM` : `${peakHour - 12 || 12} PM`;
      patterns.push({
        type: "peak_hours",
        title: "Peak Focus Time",
        description: `You tend to be most productive around ${hourLabel}`,
        confidence: Math.min(peakCount * 10, 100),
      });
    }

    // Early bird detection
    const earlySessions = entries.filter(
      (e) => getHours(parseISO(e.started_at)) < 8
    );
    if (earlySessions.length >= 3) {
      patterns.push({
        type: "early_bird",
        title: "Early Bird",
        description: "You're consistently productive in the morning",
        confidence: Math.min(earlySessions.length * 15, 100),
      });
    }

    // Night owl detection
    const lateSessions = entries.filter(
      (e) => getHours(parseISO(e.started_at)) >= 21
    );
    if (lateSessions.length >= 3) {
      patterns.push({
        type: "night_owl",
        title: "Night Owl",
        description: "You do your best work in the evening",
        confidence: Math.min(lateSessions.length * 15, 100),
      });
    }

    // Weekend warrior detection
    const weekendSessions = entries.filter(
      (e) => {
        const day = getDay(parseISO(e.started_at));
        return day === 0 || day === 6;
      }
    );
    const weekdaySessions = entries.filter(
      (e) => {
        const day = getDay(parseISO(e.started_at));
        return day >= 1 && day <= 5;
      }
    );

    const weekendAvg =
      weekendSessions.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) /
      (weekendSessions.length * 3600);
    const weekdayAvg =
      weekdaySessions.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) /
      (weekdaySessions.length * 3600);

    if (weekendAvg > weekdayAvg * 1.5 && weekendSessions.length >= 2) {
      patterns.push({
        type: "weekend_warrior",
        title: "Weekend Warrior",
        description: "You focus more on weekends than weekdays",
        confidence: 70,
      });
    }

    return patterns;
  },

  getHeatmapColor(hours: number): string {
    if (hours === 0) return "bg-muted";
    if (hours < 1) return "bg-emerald-200 dark:bg-emerald-900/30";
    if (hours < 2) return "bg-emerald-300 dark:bg-emerald-800/50";
    if (hours < 4) return "bg-emerald-400 dark:bg-emerald-700";
    if (hours < 6) return "bg-emerald-500 dark:bg-emerald-600";
    return "bg-emerald-600 dark:bg-emerald-500";
  },
};
```

### Step 2: Create Calendar Heatmap Component

**File:** `src/components/gamification/calendar-heatmap.tsx`

```typescript
"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { DailyActivity } from "@/services/insights-service";
import { format, parseISO, getMonth, getDay } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarHeatmapProps {
  data: DailyActivity[];
  className?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarHeatmap({ data, className }: CalendarHeatmapProps) {
  const { grid, months } = useMemo(() => {
    // Group data by week
    const weeks: DailyActivity[][] = [];
    let currentWeek: DailyActivity[] = [];

    data.forEach((day, index) => {
      const dayOfWeek = getDay(parseISO(day.date));

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(day);
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Calculate month positions
    const monthPositions: { month: number; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      const month = getMonth(parseISO(firstDay.date));

      if (month !== lastMonth) {
        monthPositions.push({ month, weekIndex });
        lastMonth = month;
      }
    });

    return { grid: weeks, months: monthPositions };
  }, [data]);

  const getColorClass = (hours: number): string => {
    if (hours === 0) return "bg-muted";
    if (hours < 1) return "bg-emerald-200 dark:bg-emerald-900/40";
    if (hours < 2) return "bg-emerald-300 dark:bg-emerald-800/60";
    if (hours < 4) return "bg-emerald-400 dark:bg-emerald-700";
    if (hours < 6) return "bg-emerald-500 dark:bg-emerald-600";
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  return (
    <TooltipProvider>
      <div className={cn("space-y-3", className)}>
        {/* Month labels */}
        <div className="flex text-xs text-muted-foreground ml-8">
          {months.map((m, i) => (
            <div
              key={i}
              className="flex-shrink-0"
              style={{
                marginLeft: i === 0 ? 0 : `${(m.weekIndex - months[i - 1].weekIndex) * 14 - 20}px`,
              }}
            >
              {MONTHS[m.month]}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
            {DAYS.map((day, i) => (
              <div key={day} className="h-3 leading-3">
                {i % 2 === 0 ? day[0] : ""}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {grid.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {DAYS.map((_, dayIndex) => {
                  const day = week.find(
                    (d) => getDay(parseISO(d.date)) === dayIndex
                  );

                  if (!day) {
                    return <div key={dayIndex} className="w-3 h-3" />;
                  }

                  return (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-foreground/20",
                            getColorClass(day.hours)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-medium">
                            {format(parseISO(day.date), "MMM d, yyyy")}
                          </p>
                          <p className="text-muted-foreground">
                            {day.hours.toFixed(1)} hours · {day.sessions} sessions
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/40" />
            <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800/60" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
            <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
```

### Step 3: Create Milestone Celebration Component

**File:** `src/components/gamification/milestone-celebration.tsx`

```typescript
"use client";

import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface MilestoneCelebrationProps {
  type: "level_up" | "badge_unlock" | "challenge_complete" | "crystal_evolve";
  data: {
    level?: number;
    badgeName?: string;
    challengeName?: string;
    crystalShape?: string;
  };
  onComplete?: () => void;
}

export function MilestoneCelebration({
  type,
  data,
  onComplete,
}: MilestoneCelebrationProps) {
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        onComplete?.();
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#3B82F6", "#06B6D4", "#10B981", "#F59E0B"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#3B82F6", "#06B6D4", "#10B981", "#F59E0B"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    triggerConfetti();

    // Show toast notification
    switch (type) {
      case "level_up":
        toast.success(`Level ${data.level} Reached!`, {
          description: "Your crystal grows stronger with your focus.",
          duration: 5000,
        });
        break;
      case "badge_unlock":
        toast.success(`Badge Unlocked: ${data.badgeName}`, {
          description: "Keep up the great work!",
          duration: 4000,
        });
        break;
      case "challenge_complete":
        toast.success(`Challenge Completed!`, {
          description: data.challengeName,
          duration: 4000,
        });
        break;
      case "crystal_evolve":
        toast.success("Crystal Evolved!", {
          description: `Your crystal has transformed into ${data.crystalShape}!`,
          duration: 5000,
        });
        break;
    }
  }, [type, data, triggerConfetti]);

  return null;
}
```

### Step 4: Create Weekly Insights Card

**File:** `src/components/gamification/weekly-insights-card.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";
import type { WeeklyInsight, FocusPattern } from "@/services/insights-service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Clock,
  Target,
  Calendar,
  Sunrise,
  Moon,
  Flame,
  Zap,
} from "lucide-react";

const PATTERN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  peak_hours: Zap,
  early_bird: Sunrise,
  night_owl: Moon,
  weekend_warrior: Flame,
  consistency: Target,
};

interface WeeklyInsightsCardProps {
  insights: WeeklyInsight | null;
  loading?: boolean;
  className?: string;
}

export function WeeklyInsightsCard({
  insights,
  loading,
  className,
}: WeeklyInsightsCardProps) {
  if (loading) {
    return (
      <Card className={cn("p-6 animate-pulse", className)}>
        <div className="h-6 w-1/3 bg-muted rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">Weekly Insights</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete a few focus sessions to see your insights.
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Weekly Insights</h3>
            <p className="text-xs text-muted-foreground">AI-powered analysis</p>
          </div>
        </div>

        {insights.comparisonToLastWeek !== 0 && (
          <Badge
            variant={insights.comparisonToLastWeek > 0 ? "default" : "secondary"}
            className={
              insights.comparisonToLastWeek > 0
                ? "bg-emerald-500 text-white"
                : ""
            }
          >
            {insights.comparisonToLastWeek > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(insights.comparisonToLastWeek)}% vs last week
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Clock className="h-4 w-4 mx-auto mb-1 text-blue-500" />
          <p className="text-xl font-bold">{insights.totalHours}h</p>
          <p className="text-xs text-muted-foreground">Total Focus</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Target className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
          <p className="text-xl font-bold">{insights.totalSessions}</p>
          <p className="text-xs text-muted-foreground">Sessions</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Calendar className="h-4 w-4 mx-auto mb-1 text-amber-500" />
          <p className="text-xl font-bold">{insights.avgSessionLength}m</p>
          <p className="text-xs text-muted-foreground">Avg Length</p>
        </div>
      </div>

      {/* Best Day */}
      {insights.bestDay && (
        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg mb-4">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <div>
            <p className="text-sm font-medium">Best Day: {insights.bestDay.day}</p>
            <p className="text-xs text-muted-foreground">
              {insights.bestDay.hours.toFixed(1)} hours focused
            </p>
          </div>
        </div>
      )}

      {/* Patterns */}
      {insights.patterns.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Detected Patterns</p>
          <div className="space-y-2">
            {insights.patterns.map((pattern, index) => {
              const Icon = PATTERN_ICONS[pattern.type] || Zap;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <Icon className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{pattern.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {pattern.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pattern.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
```

## Todo List

- [ ] Create insights-service.ts with pattern detection
- [ ] Create CalendarHeatmap component
- [ ] Create MilestoneCelebration component with confetti
- [ ] Create WeeklyInsightsCard component
- [ ] Integrate heatmap into stats page
- [ ] Add insights card to dashboard
- [ ] Test pattern detection with sample data
- [ ] Verify confetti animations work smoothly
- [ ] Add loading states and error handling

## Success Criteria

1. Calendar heatmap displays 365 days of activity correctly
2. Color intensity reflects hours focused accurately
3. Tooltips show date and session details on hover
4. Weekly insights generate with valid patterns
5. Milestone celebrations trigger with confetti
6. Pattern detection identifies real user behaviors
7. Performance remains smooth with large datasets

## Next Steps

After completing this phase:
1. Integration testing across all gamification features
2. Performance optimization for production
3. User acceptance testing

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Heatmap performance with 365 days | Medium | Virtualize rendering, lazy load |
| Pattern detection accuracy | Low | Use confidence scores, allow feedback |
| Confetti performance | Low | Limit duration, check reduced motion |
| Data aggregation speed | Medium | Add database indexes, cache results |

## Unresolved Questions

1. Should we store pre-calculated insights or generate on-demand?
2. How far back should the heatmap display (1 year or all-time)?
3. Should we add more pattern types (e.g., "consistent_schedule")?
4. Do we need to handle timezone shifts for travelers?
