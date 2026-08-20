"use client";

import { ChevronRight } from "lucide-react";
import { DataCard } from "@/components/ui-app/data-card";

/** Small conic-gradient ring with a value in the middle. `color` is a CSS color, usually a --data-* token. */
function MiniRing({ pct, color, big, small }: { pct: number; color: string; big: string; small: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        className="relative grid h-[104px] w-[104px] place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${clamped}%, var(--surface-sunken) 0)` }}
      >
        <div className="absolute inset-[13px] rounded-full bg-surface-raised" />
        <div className="relative text-center">
          <p className="text-lg font-semibold tabular-nums text-ink">{big}</p>
          <p className="text-[11px] text-ink-muted">{small}</p>
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
    <DataCard title="Momentum">
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onOpenLevel} className="flex flex-col items-center gap-1.5">
          <MiniRing pct={xpPct} color="var(--data-xp)" big={`L${level}`} small={`${totalXp.toLocaleString()} XP`} />
          <span className="flex items-center gap-0.5 text-[13px] font-semibold text-accent-solid">
            Level <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
        <button onClick={onOpenDream} className="flex flex-col items-center gap-1.5 border-l border-line pl-4">
          {hasDream ? (
            <MiniRing pct={dreamPct} color="var(--data-dream)" big={`${Math.round(dreamPct)}%`} small="Dream" />
          ) : (
            <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full border border-dashed border-line-strong text-center text-[11px] text-ink-muted">
              Set a<br />dream goal
            </div>
          )}
          <span className="flex items-center gap-0.5 text-[13px] font-semibold text-accent-solid">
            Dream <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>
    </DataCard>
  );
}
