"use client";

import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface HomeStreakCardProps {
  streak: number;
  /** 7 booleans, Monday→Sunday, true when that day had a focus session. */
  weekActiveDays: boolean[];
}

export function HomeStreakCard({ streak, weekActiveDays }: HomeStreakCardProps) {
  return (
    <Card className="flex h-full flex-col gap-4 border border-border bg-card p-6">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
        <Flame className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
        Streak
      </p>

      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500 dark:text-orange-400">
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <p className="text-4xl font-bold leading-none tabular-nums text-foreground">{streak}</p>
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {streak === 1 ? "day in a row" : "days in a row"}
          </p>
        </div>
      </div>

      <div className="mt-auto flex gap-1.5">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                "h-6 w-full rounded-lg",
                weekActiveDays[i] ? "bg-orange-500/70" : "bg-muted"
              )}
            />
            <span className="text-[10px] text-muted-foreground/60">{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
