"use client";

import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayDatum {
  day: string;
  hours: number;
}

interface HomeWeeklyGlanceProps {
  data: DayDatum[];
  onViewInsights: () => void;
}

export function HomeWeeklyGlance({ data, onViewInsights }: HomeWeeklyGlanceProps) {
  const maxHours = Math.max(...data.map((d) => d.hours), 1);
  const peak = data.reduce((best, d, i) => (d.hours > data[best].hours ? i : best), 0);

  return (
    <Card className="border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">This week</h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Focus time per day</p>
        </div>
        <button
          onClick={onViewInsights}
          className="flex items-center gap-0.5 text-[13px] font-semibold text-cyan-600 dark:text-cyan-400"
        >
          Insights <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex h-40 items-end justify-between gap-2.5">
        {data.map((d, i) => {
          const hasData = d.hours > 0;
          const heightPct = hasData ? Math.max((d.hours / maxHours) * 100, 6) : 6;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "w-full rounded-t-md transition-all",
                  !hasData ? "bg-muted" : i === peak ? "bg-cyan-400" : "bg-blue-500/55"
                )}
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[11px] text-muted-foreground">{d.day}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
