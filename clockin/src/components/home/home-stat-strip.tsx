"use client";

import { HeroStat, DividedStatStrip, DividedStat } from "@/components/ui-app/hero-stat";

interface HomeStatStripProps {
  hoursToday: number;
  sessionsToday: number;
  streak: number;
  weekHours: number;
}

/** Today's one dominant number, with sessions/streak/week as divided secondary figures underneath. */
export function HomeStatStrip({ hoursToday, sessionsToday, streak, weekHours }: HomeStatStripProps) {
  return (
    <HeroStat
      label="Focused today"
      value={hoursToday}
      unit="h"
      metric="focus"
      secondary={
        <DividedStatStrip>
          <DividedStat label="Sessions" value={sessionsToday} metric="focus" />
          <DividedStat label="Day streak" value={streak} metric="streak" />
          <DividedStat label="This week" value={weekHours} unit="h" metric="goal" />
        </DividedStatStrip>
      }
    />
  );
}
