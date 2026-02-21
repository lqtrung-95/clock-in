"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card className="p-5 border border-border bg-gradient-to-br from-purple-500/5 via-card to-blue-500/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Insights</p>
            {generatedAt && (
              <p className="text-[10px] text-muted-foreground">
                {new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generate}
          disabled={loading}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          {insights ? "Refresh" : "Generate"}
        </Button>
      </div>

      {insights ? (
        <p className="text-sm text-foreground/80 leading-relaxed">{insights}</p>
      ) : (
        <div
          onClick={generate}
          className="flex flex-col items-center justify-center py-6 gap-2 rounded-xl border border-dashed border-border cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-colors"
        >
          <Sparkles className="h-5 w-5 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground text-center">
            {loading ? "Analyzing your focus patterns…" : "Click to generate your AI productivity insights"}
          </p>
        </div>
      )}
    </Card>
  );
}
