"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "@/hooks/use-auth-state";
import { timeEntryService } from "@/services/time-entry-service";
import { streakService } from "@/services/streak-service";
import { guestStorage } from "@/lib/guest-storage";
import type { TimeEntry } from "@/types/timer";

export interface FocusTodayStats {
  streak: number;
  todayMinutes: number;
  sessions: number;
}

/**
 * Today's focus streak + minutes. Shared query so the Focus page orchestrator
 * can prefetch it (for the one-shot loading gate) while the widget reads the
 * same cache entry. `isLoading` folds in auth so it stays true until resolved.
 */
export function useFocusTodayStats() {
  const { isAuthenticated, userId, isLoading: authLoading } = useAuthState();

  const query = useQuery({
    queryKey: ["focus-today-stats", userId],
    queryFn: async (): Promise<FocusTodayStats> => {
      if (isAuthenticated && userId) {
        const [entries, streak] = await Promise.all([
          timeEntryService.getEntries(userId, 1),
          streakService.getStreak(userId),
        ]);
        const todayEntries = (entries as TimeEntry[]).filter((e) =>
          e.notes?.includes("Focus session")
        );
        const todayMinutes = Math.round(
          todayEntries.reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0) / 60
        );
        return { streak: streak?.current_streak ?? 0, todayMinutes, sessions: todayEntries.length };
      }
      // Guest mode: read from localStorage
      const entries = (guestStorage.getEntries() as unknown as TimeEntry[]).filter((e) => {
        const today = new Date().toDateString();
        return new Date(e.started_at).toDateString() === today && e.notes?.includes("Focus session");
      });
      const todayMinutes = Math.round(
        entries.reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0) / 60
      );
      return { streak: 0, todayMinutes, sessions: entries.length };
    },
    enabled: !authLoading,
    staleTime: 1000 * 60 * 2,
  });

  return { data: query.data, isLoading: authLoading || query.isLoading };
}
