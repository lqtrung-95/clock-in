"use client";

import { Target, ChevronRight } from "lucide-react";
import { DataCard } from "@/components/ui-app/data-card";
import { EmptyState } from "@/components/ui-app/empty-state";

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
    <DataCard
      title="Active goals"
      action={
        <button onClick={onViewAll} className="flex items-center gap-0.5 text-[13px] font-semibold text-accent-solid">
          All <ChevronRight className="h-3.5 w-3.5" />
        </button>
      }
    >
      {top.length > 0 ? (
        <div className="space-y-4">
          {top.map((goal) => {
            const pct = goal.progress?.percentage ?? 0;
            return (
              <div key={goal.id}>
                <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                  <span className="font-medium capitalize text-ink">{goal.period} goal</span>
                  <span className="font-semibold tabular-nums text-accent-solid">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className="h-full rounded-full bg-data-goal transition-[width] duration-500"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No goals yet"
          action={
            <button onClick={onViewAll} className="text-[13px] font-semibold text-accent-solid hover:underline">
              Set your first goal
            </button>
          }
        />
      )}
    </DataCard>
  );
}
