"use client";

import { useQuery } from "@tanstack/react-query";
import { goalService } from "@/services/goal-service";
import { useAuthState } from "@/hooks/use-auth-state";
import { Target } from "lucide-react";
import type { Goal } from "@/types/gamification";

interface GoalWithProgress extends Goal {
  progress: { current: number; target: number; percentage: number };
}

/** Fetches up to 2 active goals with progress and renders slim progress bars */
export function FocusActiveGoals() {
  const { isAuthenticated, userId } = useAuthState();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals", userId],
    queryFn: async (): Promise<GoalWithProgress[]> => {
      if (!userId) return [];
      const activeGoals = await goalService.getGoals(userId);
      const withProgress = await Promise.all(
        activeGoals.slice(0, 2).map(async (goal) => {
          const progress = await goalService.calculateProgress(userId, goal);
          return { ...goal, progress };
        })
      );
      return withProgress;
    },
    enabled: !!isAuthenticated && !!userId,
    staleTime: 1000 * 60 * 5,
  });

  if (!isAuthenticated) return null;

  // Reserve space while loading to prevent layout shift
  if (isLoading) {
    return (
      <div className="mb-6 rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2.5 animate-pulse">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="h-3.5 w-3.5 rounded-full bg-muted-foreground/20" />
          <div className="h-4 w-24 rounded bg-muted-foreground/20" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <div className="h-4 w-40 rounded bg-muted-foreground/20" />
            <div className="h-4 w-8 rounded bg-muted-foreground/20" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  if (goals.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Target className="h-3.5 w-3.5 text-cyan-500" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Active Goals
        </span>
      </div>
      {goals.map((goal) => (
        <div key={goal.id} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground capitalize">
              {goal.period} goal
              {goal.progress.target > 0 && (
                <span className="text-muted-foreground font-normal ml-1">
                  ({goal.progress.current}m / {goal.progress.target}m)
                </span>
              )}
            </span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
              {goal.progress.percentage}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${goal.progress.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
