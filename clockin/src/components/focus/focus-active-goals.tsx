"use client";

import { useFocusActiveGoals } from "@/hooks/use-focus-active-goals";
import { Target } from "lucide-react";

/** Renders up to 2 active goals with slim progress bars. */
export function FocusActiveGoals() {
  const { goals, isLoading, isAuthenticated } = useFocusActiveGoals();

  // The Focus page gates the whole setup behind a skeleton, so by the time this
  // renders the data is ready. Render nothing while loading or when empty.
  if (!isAuthenticated || isLoading || goals.length === 0) return null;

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
