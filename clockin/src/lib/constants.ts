export const APP_NAME = "Clockin";
export const APP_DESCRIPTION = "Motivation-driven time tracker";

export const TIMER_MAX_DURATION_SECONDS = 86400; // 24h max single entry
export const TIMER_STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24h

export const POMODORO_PRESETS = {
  "25/5": { work: 25, break: 5 },
  "50/10": { work: 50, break: 10 },
  "90/20": { work: 90, break: 20 },
} as const;

export const DEFAULT_POMODORO_CYCLES = 4;

export const CATEGORY_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4",
] as const;
