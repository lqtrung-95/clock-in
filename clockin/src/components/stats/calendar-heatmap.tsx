"use client";

import { useMemo } from "react";
import { format, subDays, startOfWeek, addDays, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DailyStats } from "@/services/stats-service";
import { getContributionLevel } from "@/services/stats-service";

interface CalendarHeatmapProps {
  data: DailyStats[];
  year?: number;
}

const LEVEL_COLORS = [
  "bg-gray-200 dark:bg-gray-800", // 0 - no activity
  "bg-emerald-300 dark:bg-emerald-900/60", // 1 - < 1 hour
  "bg-emerald-400 dark:bg-emerald-700", // 2 - 1-3 hours
  "bg-emerald-500 dark:bg-emerald-500", // 3 - 3-5 hours
  "bg-emerald-600 dark:bg-emerald-400", // 4 - 5+ hours
];

export function CalendarHeatmap({ data, year }: CalendarHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const endDate = year ? new Date(year, 11, 31) : new Date();
    const startDate = subDays(endDate, 364);
    const firstSunday = startOfWeek(startDate);

    // Generate all days
    const days: { date: Date; stats?: DailyStats }[] = [];
    let currentDate = firstSunday;

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const stats = data.find((d) => d.date === dateStr);
      days.push({ date: currentDate, stats });
      currentDate = addDays(currentDate, 1);
    }

    // Group into weeks
    const weeksArray: { date: Date; stats?: DailyStats }[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArray.push(days.slice(i, i + 7));
    }

    // Generate month labels - position at first week of each month
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeksArray.forEach((week, weekIndex) => {
      const firstDay = week[0]?.date;
      if (!firstDay) return;

      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        labels.push({
          label: format(firstDay, "MMM"),
          weekIndex,
        });
        lastMonth = month;
      }
    });

    return { weeks: weeksArray, monthLabels: labels };
  }, [data, year]);

  const totalHours = useMemo(() => {
    return data.reduce((sum, d) => sum + d.total_seconds / 3600, 0);
  }, [data]);

  const activeDays = useMemo(() => {
    return data.filter((d) => d.total_seconds > 0).length;
  }, [data]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Stats summary */}
        <div className="flex gap-6 text-sm">
          <div>
            <span className="font-medium text-foreground">{totalHours.toFixed(1)}</span>{" "}
            <span className="text-muted-foreground">hours total</span>
          </div>
          <div>
            <span className="font-medium text-foreground">{activeDays}</span>{" "}
            <span className="text-muted-foreground">active days</span>
          </div>
        </div>

        {/* Heatmap */}
        <div className="w-full">
          {/* Header row with month labels aligned to weeks */}
          <div className="flex mb-2">
            {/* Spacer for day labels */}
            <div className="w-10 shrink-0" />
            {/* Month labels row */}
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
              {monthLabels.map((m, i) => (
                <div
                  key={i}
                  className="text-xs text-muted-foreground"
                  style={{
                    gridColumnStart: m.weekIndex + 1,
                    gridColumnEnd: (monthLabels[i + 1]?.weekIndex ?? weeks.length) + 1,
                  }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Grid with day labels */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="w-10 shrink-0 flex flex-col justify-between py-0.5">
              <span className="text-xs text-muted-foreground h-3 flex items-center">Mon</span>
              <span className="text-xs text-muted-foreground h-3 flex items-center">Wed</span>
              <span className="text-xs text-muted-foreground h-3 flex items-center">Fri</span>
            </div>

            {/* Grid - CSS Grid for equal columns */}
            <div
              className="flex-1 grid gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
            >
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                  {week.map((day, dayIndex) => {
                    const hours = (day.stats?.total_seconds || 0) / 3600;
                    const level = getContributionLevel(hours);

                    return (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-full aspect-square min-h-[8px] max-h-[14px] rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-offset-1 hover:ring-emerald-400",
                              LEVEL_COLORS[level]
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-popover text-popover-foreground border border-border shadow-lg">
                          <div className="text-xs">
                            <div className="font-medium text-foreground">
                              {format(day.date, "MMM d, yyyy")}
                            </div>
                            <div className="text-muted-foreground">
                              {hours > 0 ? `${hours.toFixed(1)} hours` : "No activity"}
                            </div>
                            {day.stats?.session_count ? (
                              <div className="text-muted-foreground">
                                {day.stats.session_count} sessions
                              </div>
                            ) : null}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground pl-10">
            <span>Less</span>
            <div className="flex gap-[2px]">
              {LEVEL_COLORS.map((color, i) => (
                <div
                  key={i}
                  className={cn("w-3 h-3 rounded-sm", color)}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
