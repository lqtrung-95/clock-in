"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";
import type { TimeEntry } from "@/types/timer";

interface FocusTimeBarChartProps {
  /** Array of time entries to aggregate */
  entries: TimeEntry[];
  /** Number of days to show (default 7) */
  days?: number;
}

/** Groups entries by day and sums duration_seconds/60 for the last N days */
function buildDailyData(entries: TimeEntry[], days: number) {
  const data: { date: string; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    data.push({ date: format(subDays(new Date(), i), "MMM d"), minutes: 0 });
  }
  entries.forEach((entry) => {
    if (!entry.duration_seconds) return;
    const label = format(parseISO(entry.started_at), "MMM d");
    const slot = data.find((d) => d.date === label);
    if (slot) slot.minutes += Math.round(entry.duration_seconds / 60);
  });
  return data;
}

export function FocusTimeBarChart({ entries, days = 7 }: FocusTimeBarChartProps) {
  const data = useMemo(() => buildDailyData(entries, days), [entries, days]);
  const hasData = data.some((d) => d.minutes > 0);

  if (!hasData) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No focus sessions in this period</p>
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="30%">
          <defs>
            <linearGradient id="focusBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary, 217 91% 60%))" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(var(--primary, 217 91% 60%))" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
            strokeOpacity={0.4}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}m`}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", radius: 6 }}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              color: "hsl(var(--foreground))",
              fontSize: "13px",
            }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value) => [`${value} min`, "Focus time"]}
          />
          <Bar
            dataKey="minutes"
            fill="url(#focusBarGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
