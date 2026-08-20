import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { METRIC_CLASS, type DataMetric } from "@/lib/data-metrics";

/** One number, labeled and optionally colored by metric. Replaces four duplicate StatCard implementations. */
export function Stat({
  label,
  value,
  unit,
  delta,
  metric,
  icon: Icon,
  size = "md",
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  metric?: DataMetric;
  icon?: LucideIcon;
  size?: "sm" | "md";
  className?: string;
}) {
  const color = metric ? METRIC_CLASS[metric].text : "text-ink";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-subtle">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className={cn("flex items-baseline gap-1 tabular-nums", size === "md" ? "text-2xl" : "text-lg", "font-semibold", color)}>
        {value}
        {unit && <span className="text-xs font-medium text-ink-subtle">{unit}</span>}
      </div>
      {delta && <div className="text-xs text-ink-muted">{delta}</div>}
    </div>
  );
}
