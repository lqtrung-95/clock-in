import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { METRIC_CLASS, type DataMetric } from "@/lib/data-metrics";

/**
 * The one dominant number on a page — today's hours, this month's total.
 * Pair with <DividedStatStrip> for the secondary numbers underneath, so a
 * page has exactly one visual "loudest" figure instead of N equal tiles.
 */
export function HeroStat({
  label,
  value,
  unit,
  metric,
  secondary,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  metric?: DataMetric;
  secondary?: ReactNode;
  className?: string;
}) {
  const color = metric ? METRIC_CLASS[metric].text : "text-accent-solid";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-label text-ink-subtle">{label}</span>
      <div className={cn("text-data flex items-baseline gap-1 text-5xl", color)}>
        {value}
        {unit && <span className="text-xl font-medium text-ink-subtle">{unit}</span>}
      </div>
      {secondary && <div className="mt-5 border-t border-line pt-5">{secondary}</div>}
    </div>
  );
}

/** Secondary numbers next to a <HeroStat> — divided by rules, not boxed into tiles. */
export function DividedStatStrip({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex divide-x divide-line", className)}>{children}</div>;
}

export function DividedStat({
  label,
  value,
  unit,
  metric,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  metric?: DataMetric;
  className?: string;
}) {
  const color = metric ? METRIC_CLASS[metric].text : "text-ink";

  return (
    <div className={cn("flex-1 pl-5 first:pl-0", className)}>
      <div className={cn("text-data flex items-baseline gap-0.5 text-xl", color)}>
        {value}
        {unit && <span className="text-sm font-medium text-ink-subtle">{unit}</span>}
      </div>
      <span className="text-label text-ink-subtle">{label}</span>
    </div>
  );
}

/** A list of rows separated by rules instead of individually bordered/carded — for goals, sessions, any short ranked list. */
export function DividedList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col divide-y divide-line", className)}>{children}</div>;
}

export function DividedRow({
  title,
  trailing,
  className,
}: {
  title: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0", className)}>
      <span className="font-medium text-ink">{title}</span>
      {trailing && <span className="text-data text-xs text-ink-subtle">{trailing}</span>}
    </div>
  );
}
