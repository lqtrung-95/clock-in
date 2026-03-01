"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "@/hooks/use-auth-state";
import { timeEntryService } from "@/services/time-entry-service";
import { streakService } from "@/services/streak-service";
import { guestStorage } from "@/lib/guest-storage";
import { Flame, Clock } from "lucide-react";
import type { TimeEntry } from "@/types/timer";

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function FocusTodayStats() {
  const { isAuthenticated, userId, isLoading: authLoading } = useAuthState();

  const { data } = useQuery({
    queryKey: ["focus-today-stats", userId],
    queryFn: async () => {
      if (isAuthenticated && userId) {
        const [entries, streak] = await Promise.all([
          timeEntryService.getEntries(userId, 1),
          streakService.getStreak(userId),
        ]);
        const todayEntries = (entries as TimeEntry[]).filter(
          (e) => e.notes?.includes("Focus session")
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

  if (!data || (data.sessions === 0 && data.streak === 0)) return null;

  return (
    <div className="flex items-center justify-center gap-6 mb-8">
      {data.streak > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            {data.streak} day streak
          </span>
        </div>
      )}
      {data.todayMinutes > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {formatMinutes(data.todayMinutes)} today
            {data.sessions > 1 && <span className="text-xs font-normal ml-1 opacity-70">({data.sessions} sessions)</span>}
          </span>
        </div>
      )}
    </div>
  );
}
