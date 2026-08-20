"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/ui-app/data-card";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiInsightsCard() {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const data = await res.json() as { insights: string; generatedAt?: string };
      setInsights(data.insights);
      setGeneratedAt(data.generatedAt ?? null);
    } catch {
      setInsights("Failed to generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DataCard
      title="AI insights"
      description={
        generatedAt
          ? new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
          : undefined
      }
      action={
        <Button variant="ghost" size="sm" onClick={generate} disabled={loading} className="gap-1.5 text-xs text-ink-muted hover:text-ink">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          {insights ? "Refresh" : "Generate"}
        </Button>
      }
    >
      {insights ? (
        <p className="text-sm leading-relaxed text-ink">{insights}</p>
      ) : (
        <div
          onClick={generate}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-line-strong py-6 transition-colors hover:border-accent-solid/40 hover:bg-accent-soft"
        >
          <Sparkles className="h-5 w-5 text-ink-subtle" />
          <p className="text-center text-xs text-ink-muted">
            {loading ? "Analyzing your focus patterns…" : "Click to generate your AI productivity insights"}
          </p>
        </div>
      )}
    </DataCard>
  );
}
