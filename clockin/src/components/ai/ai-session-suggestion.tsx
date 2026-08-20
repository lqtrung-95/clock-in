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

    // Cache suggestion in sessionStorage for 30 minutes to avoid repeated API calls
    const CACHE_KEY = "ai-session-suggestion";
    const TTL_MS = 30 * 60 * 1000;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached) as { data: Suggestion | null; ts: number };
        if (Date.now() - ts < TTL_MS) {
          setSuggestion(data);
          return;
        }
      }
    } catch { /* ignore */ }

    setLoading(true);
    fetch("/api/ai/suggest-session", { method: "POST" })
      .then(r => r.json())
      .then((d: { suggestion: Suggestion | null }) => {
        const result = d.suggestion ?? null;
        setSuggestion(result);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: result, ts: Date.now() })); } catch { /* ignore */ }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [isAuthenticated, dismissed]);

  if (!isAuthenticated || dismissed || (!loading && !suggestion)) return null;

  return (
    <div className={cn(
      "mb-6 rounded-md border border-data-xp/20 bg-data-xp/5 p-4 transition-colors",
      loading && "animate-pulse"
    )}>
      {loading ? (
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 animate-spin text-data-xp" />
          <span className="text-xs text-ink-muted">AI is suggesting your next session…</span>
        </div>
      ) : suggestion && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-data-xp">
              <Zap className="h-3.5 w-3.5 text-accent-fg" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">
                AI suggests: {suggestion.duration}min of <span className="text-data-xp">{suggestion.category}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-ink-muted">{suggestion.reason}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => onApply(suggestion.category, suggestion.duration)}
              className="rounded-sm bg-data-xp px-3 py-1.5 text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              Apply
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-sm px-2 py-1.5 text-xs text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
