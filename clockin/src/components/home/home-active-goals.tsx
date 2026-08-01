"use client";

import { Card } from "@/components/ui/card";
import { Target, ChevronRight } from "lucide-react";

interface GoalItem {
  id: string;
  period: string;
  progress: { percentage: number } | null;
}

interface HomeActiveGoalsProps {
  goals: GoalItem[];
  onViewAll: () => void;
}

export function HomeActiveGoals({ goals, onViewAll }: HomeActiveGoalsProps) {
  const top = goals.slice(0, 2);

  return (
    <Card className="border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Active goals</h3>
        <button onClick={onViewAll} className="flex items-center gap-0.5 text-[13px] font-semibold text-cyan-600 dark:text-cyan-400">
          All <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {top.length > 0 ? (
        <div className="space-y-4">
          {top.map((goal) => {
            const pct = goal.progress?.percentage ?? 0;
            return (
              <div key={goal.id}>
                <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                  <span className="font-medium capitalize text-foreground">{goal.period} goal</span>
                  <span className="font-bold tabular-nums text-cyan-600 dark:text-cyan-400">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-[13px] text-muted-foreground">No goals yet</p>
          <button onClick={onViewAll} className="text-[13px] font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
            Set your first goal
          </button>
        </div>
      )}
    </Card>
  );
}
