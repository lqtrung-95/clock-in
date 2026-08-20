"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataCard } from "@/components/ui-app/data-card";

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
    <DataCard
      title="This week"
      description="Focus time per day"
      action={
        <button
          onClick={onViewInsights}
          className="flex items-center gap-0.5 text-[13px] font-semibold text-accent-solid"
        >
          Insights <ChevronRight className="h-3.5 w-3.5" />
        </button>
      }
    >
      <div className="flex h-40 items-end justify-between gap-2.5">
        {data.map((d, i) => {
          const hasData = d.hours > 0;
          const heightPct = hasData ? Math.max((d.hours / maxHours) * 100, 6) : 6;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn("w-full rounded-t-xs transition-[height]", !hasData ? "bg-surface-sunken" : "bg-data-focus")}
                style={{ height: `${heightPct}%`, opacity: hasData && i !== peak ? 0.55 : 1 }}
              />
              <span className="text-[11px] text-ink-muted">{d.day}</span>
            </div>
          );
        })}
      </div>
    </DataCard>
  );
}
