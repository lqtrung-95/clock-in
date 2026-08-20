"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataCard } from "@/components/ui-app/data-card";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface HomeStreakCardProps {
  streak: number;
  /** 7 booleans, Monday→Sunday, true when that day had a focus session. */
  weekActiveDays: boolean[];
}

export function HomeStreakCard({ streak, weekActiveDays }: HomeStreakCardProps) {
  return (
    <DataCard className="h-full">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
        <Flame className="h-3.5 w-3.5 text-data-streak" />
        Streak
      </p>

      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-data-streak/15 text-data-streak">
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <p className="text-4xl font-semibold leading-none tabular-nums text-ink">{streak}</p>
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
            {streak === 1 ? "day in a row" : "days in a row"}
          </p>
        </div>
      </div>

      <div className="mt-auto flex gap-1.5">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className={cn("h-6 w-full rounded-xs", weekActiveDays[i] ? "bg-data-streak/70" : "bg-surface-sunken")} />
            <span className="text-[10px] text-ink-subtle">{label}</span>
          </div>
        ))}
      </div>
    </DataCard>
  );
}
