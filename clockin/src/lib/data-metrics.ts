/**
 * Metric-semantic data colors. A chart series, a stat tile, and a progress
 * meter for the same metric always resolve the same color — and both
 * themes resolve for free because these point at CSS custom properties
 * defined in globals.css, not literal hex.
 */
export type DataMetric = "focus" | "streak" | "goal" | "xp" | "dream" | "neutral";

export const METRIC_VAR: Record<DataMetric, string> = {
  focus: "var(--data-focus)",
  streak: "var(--data-streak)",
  goal: "var(--data-goal)",
  xp: "var(--data-xp)",
  dream: "var(--data-dream)",
  neutral: "var(--data-neutral)",
};

/** Tailwind utility classes for the same metric, for components that need a class rather than an inline style. */
export const METRIC_CLASS: Record<DataMetric, { text: string; bg: string; border: string }> = {
  focus: { text: "text-data-focus", bg: "bg-data-focus", border: "border-data-focus" },
  streak: { text: "text-data-streak", bg: "bg-data-streak", border: "border-data-streak" },
  goal: { text: "text-data-goal", bg: "bg-data-goal", border: "border-data-goal" },
  xp: { text: "text-data-xp", bg: "bg-data-xp", border: "border-data-xp" },
  dream: { text: "text-data-dream", bg: "bg-data-dream", border: "border-data-dream" },
  neutral: { text: "text-data-neutral", bg: "bg-data-neutral", border: "border-data-neutral" },
};
