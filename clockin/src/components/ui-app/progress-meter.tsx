import { cn } from "@/lib/utils";
import { METRIC_VAR, type DataMetric } from "@/lib/data-metrics";

/** A labeled linear progress bar toward a target — goal bars, XP progress, dream-goal linear variant. */
export function ProgressMeter({
  value,
  target,
  metric = "neutral",
  label,
  showValues = true,
  size = "md",
  className,
}: {
  value: number;
  target: number;
  metric?: DataMetric;
  label?: string;
  showValues?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const color = METRIC_VAR[metric];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || showValues) && (
        <div className="flex items-baseline justify-between text-xs">
          {label && <span className="font-medium text-ink">{label}</span>}
          {showValues && (
            <span className="tabular-nums text-ink-subtle">
              {value} / {target}
            </span>
          )}
        </div>
      )}
      <div className={cn("overflow-hidden rounded-full bg-surface-sunken", size === "md" ? "h-1.5" : "h-1")}>
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
