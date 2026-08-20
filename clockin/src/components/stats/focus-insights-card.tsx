"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, Clock, Tag, TrendingUp, Lightbulb, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataCard } from "@/components/ui-app/data-card";
import { METRIC_VAR, type DataMetric } from "@/lib/data-metrics";
import type { TimeEntry } from "@/types/timer";
import { subDays } from "date-fns";

interface FocusInsights {
  bestTimeOfDay: string;
  topCategory: string;
  avgSessionLength: string;
  weeklyTrend: string;
  tip: string;
  generatedAt: string;
}

interface FocusInsightsCardProps {
  userId: string;
  entries: TimeEntry[];
  isPro?: boolean;
  aiInsightsUsedThisMonth?: number;
}

async function fetchFocusInsights(userId: string, entries: TimeEntry[]): Promise<FocusInsights> {
  const res = await fetch("/api/ai/focus-insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, entries }),
  });
  if (!res.ok) throw new Error("Failed to fetch insights");
  return res.json() as Promise<FocusInsights>;
}

function InsightRow({
  icon: Icon,
  label,
  value,
  metric,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  metric: DataMetric;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm"
        style={{ backgroundColor: `color-mix(in srgb, ${METRIC_VAR[metric]} 18%, transparent)`, color: METRIC_VAR[metric] }}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">{label}</p>
        <p className="text-sm font-medium leading-snug text-ink">{value}</p>
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="h-7 w-7 rounded-sm bg-surface-sunken" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-20 rounded-xs bg-surface-sunken" />
            <div className="h-4 w-40 rounded-xs bg-surface-sunken" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FocusInsightsCard({ userId, entries, isPro = true, aiInsightsUsedThisMonth = 0 }: FocusInsightsCardProps) {
  const queryClient = useQueryClient();
  // Free users must click to generate; Pro users auto-fetch
  const [triggered, setTriggered] = useState(isPro);

  // Only consider sessions from the last 7 days
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentEntries = entries.filter(
    (e) => new Date(e.started_at) >= sevenDaysAgo && (e.duration_seconds ?? 0) > 0,
  );
  const hasEnoughData = recentEntries.length >= 3;

  const { data, isLoading, isError } = useQuery<FocusInsights>({
    queryKey: ["focus-insights", userId],
    queryFn: () => fetchFocusInsights(userId, recentEntries),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: hasEnoughData && triggered,
    retry: 1,
  });

  function handleGenerate() {
    // Force a fresh fetch (bypasses 24h cache) so counter increments
    queryClient.removeQueries({ queryKey: ["focus-insights", userId] });
    setTriggered(true);
  }

  return (
    <DataCard
      title="Weekly focus insights"
      description={
        data?.generatedAt
          ? `Updated ${new Date(data.generatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : undefined
      }
      action={
        !isPro && (
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              aiInsightsUsedThisMonth >= 3
                ? "border-danger/20 bg-danger-soft text-danger"
                : aiInsightsUsedThisMonth >= 2
                ? "border-warn/20 bg-warn-soft text-warn"
                : "border-accent-solid/20 bg-accent-soft text-accent-solid"
            )}
          >
            {aiInsightsUsedThisMonth} / 3 free
          </span>
        )
      }
    >
      {/* Not enough data state */}
      {!hasEnoughData && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-line-strong py-6 text-center">
          <Sparkles className="h-5 w-5 text-ink-subtle" />
          <p className="text-xs text-ink-muted">Complete 3+ focus sessions this week to unlock AI insights</p>
        </div>
      )}

      {/* Free user idle state — show generate button */}
      {!isPro && hasEnoughData && !triggered && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-accent-solid/30 py-6 text-center">
          <Sparkles className="h-5 w-5 text-accent-solid" />
          <div>
            <p className="text-sm font-medium text-ink">Ready to generate insights</p>
            <p className="mt-1 text-xs text-ink-muted">
              Uses 1 of your {3 - aiInsightsUsedThisMonth} remaining free insight{3 - aiInsightsUsedThisMonth !== 1 ? "s" : ""} this month
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 rounded-sm bg-accent-solid px-4 py-2 text-xs font-semibold text-accent-fg transition-opacity hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate insights
          </button>
        </div>
      )}

      {/* Loading state */}
      {hasEnoughData && isLoading && <InsightsSkeleton />}

      {/* Error state */}
      {hasEnoughData && isError && (
        <p className="py-4 text-center text-sm text-ink-muted">Could not load insights right now. Try refreshing.</p>
      )}

      {/* Data state */}
      {data && (
        <div className="space-y-3">
          <InsightRow icon={Sun} label="Best time of day" value={data.bestTimeOfDay} metric="streak" />
          <InsightRow icon={Tag} label="Top category" value={data.topCategory} metric="focus" />
          <InsightRow icon={Clock} label="Avg session length" value={data.avgSessionLength} metric="goal" />
          <InsightRow icon={TrendingUp} label="Weekly trend" value={data.weeklyTrend} metric="xp" />

          <div className="mt-4 flex gap-2.5 rounded-sm border border-accent-solid/20 bg-accent-soft p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-solid" />
            <p className="text-xs leading-relaxed text-ink">{data.tip}</p>
          </div>
        </div>
      )}
    </DataCard>
  );
}
