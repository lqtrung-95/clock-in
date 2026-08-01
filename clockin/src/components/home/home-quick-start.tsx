"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { POMODORO_PRESETS } from "@/lib/constants";
import { Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/timer";

type PresetKey = keyof typeof POMODORO_PRESETS;

interface HomeQuickStartProps {
  categories: Category[];
  onBegin: (categoryId: string, preset: PresetKey) => void;
  onFullSetup: () => void;
}

/**
 * One-tap "resume focus" launcher for Home — pick a category + duration and go.
 * Full customization (scenes, sounds, custom timers) still lives in Focus.
 */
export function HomeQuickStart({ categories, onBegin, onFullSetup }: HomeQuickStartProps) {
  const presetKeys = Object.keys(POMODORO_PRESETS) as PresetKey[];
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [preset, setPreset] = useState<PresetKey>(presetKeys[0]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const canStart = Boolean(categoryId);

  return (
    <Card className="border border-border bg-gradient-to-br from-blue-500/10 via-card to-card p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Resume focus</h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">One tap picks up where you left off</p>
        </div>
        <button
          onClick={onFullSetup}
          className="flex items-center gap-0.5 text-[13px] font-semibold text-cyan-600 dark:text-cyan-400"
        >
          Full setup <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Working on</p>
      {categories.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-[13px] font-semibold transition-all",
                categoryId === cat.id
                  ? "border-cyan-500/60 bg-cyan-500/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/30"
              )}
            >
              {cat.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />}
              {cat.name}
            </button>
          ))}
        </div>
      ) : (
        <p className="mb-5 text-[13px] text-muted-foreground">
          No categories yet —{" "}
          <button onClick={onFullSetup} className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
            set one up in Focus
          </button>
        </p>
      )}

      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Duration</p>
      <div className="mb-6 flex flex-wrap gap-2.5">
        {presetKeys.map((key) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            className={cn(
              "rounded-xl border-2 px-4 py-2 text-[13px] font-semibold transition-all",
              preset === key
                ? "border-blue-500 bg-blue-500/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/30"
            )}
          >
            {key}
          </button>
        ))}
      </div>

      <Button
        onClick={() => canStart && onBegin(categoryId, preset)}
        disabled={!canStart}
        className="h-auto w-full justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
      >
        <Play className="mr-2 h-4 w-4 fill-current" />
        {canStart
          ? `Begin — ${selectedCategory?.name ?? ""} · ${POMODORO_PRESETS[preset].work} min`
          : "Pick a category to start"}
      </Button>
    </Card>
  );
}
