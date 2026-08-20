"use client";

import { Clock, Calendar, Flame, TrendingUp } from "lucide-react";
import { Stat } from "@/components/ui-app/stat";
import { StatRow } from "@/components/ui-app/stat-row";
import type { DataMetric } from "@/lib/data-metrics";

interface HomeStatStripProps {
  hoursToday: number;
  sessionsToday: number;
  streak: number;
  weekHours: number;
}

const METRIC: Record<"time" | "sessions" | "streak" | "week", DataMetric> = {
  time: "focus",
  sessions: "focus",
  streak: "streak",
  week: "goal",
};

export function HomeStatStrip({ hoursToday, sessionsToday, streak, weekHours }: HomeStatStripProps) {
  return (
    <StatRow>
      <Stat label="Today" value={hoursToday} unit="h" icon={Clock} metric={METRIC.time} />
      <Stat label="Sessions" value={sessionsToday} icon={Calendar} metric={METRIC.sessions} />
      <Stat label="Streak" value={streak} icon={Flame} metric={METRIC.streak} />
      <Stat label="This week" value={weekHours} unit="h" icon={TrendingUp} metric={METRIC.week} />
    </StatRow>
  );
}
