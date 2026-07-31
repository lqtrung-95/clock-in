"use client";

import { useFocusTodayStats } from "@/hooks/use-focus-today-stats";
import { Flame, Clock } from "lucide-react";

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function FocusTodayStats() {
  const { data, ready } = useFocusTodayStats();

  // The Focus page gates the whole setup behind a skeleton, so by the time this
  // renders the data is ready. Render nothing while loading or when empty.
  if (!ready || !data || (data.sessions === 0 && data.streak === 0)) return null;

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
