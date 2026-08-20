"use client";

import { Bar, BarChart, Line, LineChart, Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { METRIC_VAR, type DataMetric } from "@/lib/data-metrics";
import { EmptyState } from "./empty-state";
import { BarChart3 } from "lucide-react";

export interface MetricSeries {
  key: string;
  metric: DataMetric;
  label: string;
}

/**
 * Bar/line/area wrapper over shadcn's <ChartContainer>. Existing chart code
 * (src/components/stats/*) themed recharts tooltips with
 * `hsl(var(--card))`, which is invalid CSS since the vars hold hex, not an
 * HSL triple — tooltips silently fell back to browser defaults. This routes
 * color through ChartContainer's CSS-var plumbing instead, which resolves
 * correctly in both themes.
 */
export function MetricChart({
  type,
  data,
  xKey,
  series,
  height = 200,
  formatValue,
  empty,
}: {
  type: "bar" | "line" | "area";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  xKey: string;
  series: MetricSeries[];
  height?: number;
  formatValue?: (value: number) => string;
  empty?: boolean;
}) {
  if (empty || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <EmptyState icon={BarChart3} title="Not enough data yet" description="Log a few sessions to see this chart." />
      </div>
    );
  }

  const config: ChartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: METRIC_VAR[s.metric] }])
  );

  const commonProps = { data, margin: { left: 4, right: 4, top: 4, bottom: 0 } };
  const grid = <CartesianGrid vertical={false} stroke="var(--line)" />;
  const axis = <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} fontSize={11} stroke="var(--ink-subtle)" />;
  const tooltip = <ChartTooltip content={<ChartTooltipContent formatter={formatValue ? (v) => formatValue(v as number) : undefined} />} />;

  return (
    <ChartContainer config={config} style={{ height }}>
      {type === "bar" ? (
        <BarChart {...commonProps}>
          {grid}
          {axis}
          {tooltip}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      ) : type === "line" ? (
        <LineChart {...commonProps}>
          {grid}
          {axis}
          {tooltip}
          {series.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} stroke={`var(--color-${s.key})`} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      ) : (
        <AreaChart {...commonProps}>
          {grid}
          {axis}
          {tooltip}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={`var(--color-${s.key})`}
              fill={`var(--color-${s.key})`}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      )}
    </ChartContainer>
  );
}
