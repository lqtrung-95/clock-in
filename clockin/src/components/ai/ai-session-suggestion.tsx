"use client";

import { useState, useEffect } from "react";
import { Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  category: string;
  duration: number;
  reason: string;
}

interface AiSessionSuggestionProps {
  onApply: (categoryName: string, duration: number) => void;
  isAuthenticated: boolean;
}

export function AiSessionSuggestion({ onApply, isAuthenticated }: AiSessionSuggestionProps) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || dismissed) return;
    setLoading(true);
    fetch("/api/ai/suggest-session", { method: "POST" })
      .then(r => r.json())
      .then((d: { suggestion: Suggestion | null }) => setSuggestion(d.suggestion ?? null))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [isAuthenticated, dismissed]);

  if (!isAuthenticated || dismissed || (!loading && !suggestion)) return null;

  return (
    <div className={cn(
      "mb-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/8 to-blue-500/8 p-4 transition-all",
      loading && "animate-pulse"
    )}>
      {loading ? (
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400 animate-spin" />
          <span className="text-xs text-muted-foreground">AI is suggesting your next session…</span>
        </div>
      ) : suggestion && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                AI suggests: {suggestion.duration}min of <span className="text-purple-400">{suggestion.category}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{suggestion.reason}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onApply(suggestion.category, suggestion.duration)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
