"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Sparkles, Clock, Tag, TrendingUp, Lightbulb, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
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
  iconClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", iconClass)}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-foreground leading-snug">{value}</p>
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="h-7 w-7 rounded-lg bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FocusInsightsCard({ userId, entries }: FocusInsightsCardProps) {
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
    enabled: hasEnoughData,
    retry: 1,
  });

  return (
    <Card className="border border-border bg-gradient-to-br from-purple-500/5 via-card to-blue-500/5 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-md">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Weekly Focus Insights</p>
          {data?.generatedAt && (
            <p className="text-[10px] text-muted-foreground">
              Updated{" "}
              {new Date(data.generatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Not enough data state */}
      {!hasEnoughData && (
        <div className="flex flex-col items-center justify-center py-6 gap-2 rounded-xl border border-dashed border-border text-center">
          <Sparkles className="h-5 w-5 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">
            Complete 3+ focus sessions this week to unlock AI insights
          </p>
        </div>
      )}

      {/* Loading state */}
      {hasEnoughData && isLoading && <InsightsSkeleton />}

      {/* Error state */}
      {hasEnoughData && isError && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Could not load insights right now. Try refreshing.
        </p>
      )}

      {/* Data state */}
      {data && (
        <div className="space-y-3">
          <InsightRow
            icon={Sun}
            label="Best Time of Day"
            value={data.bestTimeOfDay}
            iconClass="bg-gradient-to-br from-amber-400 to-orange-500"
          />
          <InsightRow
            icon={Tag}
            label="Top Category"
            value={data.topCategory}
            iconClass="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <InsightRow
            icon={Clock}
            label="Avg Session Length"
            value={data.avgSessionLength}
            iconClass="bg-gradient-to-br from-emerald-500 to-teal-500"
          />
          <InsightRow
            icon={TrendingUp}
            label="Weekly Trend"
            value={data.weeklyTrend}
            iconClass="bg-gradient-to-br from-purple-500 to-pink-500"
          />

          {/* Tip section */}
          <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex gap-2.5">
            <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-blue-400" />
            <p className="text-xs text-foreground/80 leading-relaxed">{data.tip}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
