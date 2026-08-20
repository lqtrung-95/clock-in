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
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const color = metric ? METRIC_CLASS[metric].text : "text-ink";
  const valueSize = size === "lg" ? "text-5xl" : size === "md" ? "text-2xl" : "text-lg";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-1.5 text-label text-ink-subtle">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className={cn("text-data flex items-baseline gap-1", valueSize, color)}>
        {value}
        {unit && <span className="text-base font-medium text-ink-subtle">{unit}</span>}
      </div>
      {delta && <div className="text-xs text-ink-muted">{delta}</div>}
    </div>
  );
}
