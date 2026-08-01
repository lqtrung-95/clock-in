"use client";

import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

// Small conic-gradient ring with a value in the middle. `color` is any CSS color.
function MiniRing({ pct, color, big, small }: { pct: number; color: string; big: string; small: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        className="relative grid h-[104px] w-[104px] place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${clamped}%, rgba(148,163,184,0.18) 0)` }}
      >
        <div className="absolute inset-[13px] rounded-full bg-card" />
        <div className="relative text-center">
          <p className="text-lg font-bold tabular-nums text-foreground">{big}</p>
          <p className="text-[11px] text-muted-foreground">{small}</p>
        </div>
      </div>
    </div>
  );
}

interface HomeMomentumCardProps {
  level: number;
  totalXp: number;
  xpPct: number;
  hasDream: boolean;
  dreamPct: number;
  onOpenLevel: () => void;
  onOpenDream: () => void;
}

export function HomeMomentumCard({
  level, totalXp, xpPct, hasDream, dreamPct, onOpenLevel, onOpenDream,
}: HomeMomentumCardProps) {
  return (
    <Card className="border border-border bg-card p-6">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Momentum</p>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onOpenLevel} className="flex flex-col items-center gap-1.5">
          <MiniRing pct={xpPct} color="#a78bfa" big={`L${level}`} small={`${totalXp.toLocaleString()} XP`} />
          <span className="flex items-center gap-0.5 text-[13px] font-semibold text-cyan-600 dark:text-cyan-400">
            Level <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
        <button
          onClick={onOpenDream}
          className="flex flex-col items-center gap-1.5 border-l border-border pl-4"
        >
          {hasDream ? (
            <MiniRing pct={dreamPct} color="#22d3ee" big={`${Math.round(dreamPct)}%`} small="Dream" />
          ) : (
            <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full border border-dashed border-border text-center text-[11px] text-muted-foreground">
              Set a<br />dream goal
            </div>
          )}
          <span className="flex items-center gap-0.5 text-[13px] font-semibold text-cyan-600 dark:text-cyan-400">
            Dream <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>
    </Card>
  );
}
