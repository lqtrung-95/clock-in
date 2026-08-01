"use client";

import { Card } from "@/components/ui/card";
import { Clock, Calendar, Flame, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Semantic color per metric — time=blue, streak=orange, week=emerald — so the
// numbers read at a glance instead of a decorative rainbow.
const TILES = {
  time: "bg-blue-500/15 text-blue-500 dark:text-blue-400",
  sessions: "bg-blue-500/15 text-blue-500 dark:text-blue-400",
  streak: "bg-orange-500/15 text-orange-500 dark:text-orange-400",
  week: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400",
} as const;

function StatTile({
  icon: Icon,
  value,
  unit,
  label,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  unit?: string;
  label: string;
  variant: keyof typeof TILES;
}) {
  return (
    <Card className="flex items-center gap-3 border border-border bg-card p-4">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TILES[variant])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none tabular-nums text-foreground">
          {value}
          {unit && <span className="ml-0.5 text-sm font-semibold text-muted-foreground">{unit}</span>}
        </p>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

interface HomeStatStripProps {
  hoursToday: number;
  sessionsToday: number;
  streak: number;
  weekHours: number;
}

export function HomeStatStrip({ hoursToday, sessionsToday, streak, weekHours }: HomeStatStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
      <StatTile icon={Clock} value={hoursToday} unit="h" label="Today" variant="time" />
      <StatTile icon={Calendar} value={sessionsToday} label="Sessions" variant="sessions" />
      <StatTile icon={Flame} value={streak} label="Streak" variant="streak" />
      <StatTile icon={TrendingUp} value={weekHours} unit="h" label="This week" variant="week" />
    </div>
  );
}
