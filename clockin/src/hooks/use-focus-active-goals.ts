"use client";

import { useQuery } from "@tanstack/react-query";
import { goalService } from "@/services/goal-service";
import { useAuthState } from "@/hooks/use-auth-state";
import type { Goal } from "@/types/gamification";

export interface GoalWithProgress extends Goal {
  progress: { current: number; target: number; percentage: number };
}

/**
 * Up to 2 active goals with progress. Shared query so the Focus page
 * orchestrator can prefetch it for the one-shot loading gate while the widget
 * reads the same cache entry. Disabled (and thus not loading) for guests.
 */
export function useFocusActiveGoals() {
  const { isAuthenticated, userId } = useAuthState();

  const query = useQuery({
    queryKey: ["goals", userId],
    queryFn: async (): Promise<GoalWithProgress[]> => {
      if (!userId) return [];
      const activeGoals = await goalService.getGoals(userId);
      return Promise.all(
        activeGoals.slice(0, 2).map(async (goal) => {
          const progress = await goalService.calculateProgress(userId, goal);
          return { ...goal, progress };
        })
      );
    },
    enabled: !!isAuthenticated && !!userId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    goals: query.data ?? [],
    // Guests never have goals, so they're ready immediately. For authed users,
    // wait until the query actually resolves. isPending (not isLoading) stays
    // true through the enabled-transition, so the gate never releases early.
    ready: !isAuthenticated ? true : !!userId && !query.isPending,
    isAuthenticated,
  };
}
