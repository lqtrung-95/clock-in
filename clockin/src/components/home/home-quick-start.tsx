"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/ui-app/data-card";
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
 * One-tap "resume focus" launcher for Today — pick a category + duration and go.
 * Full customization (scenes, sounds, custom timers) still lives in Focus.
 */
export function HomeQuickStart({ categories, onBegin, onFullSetup }: HomeQuickStartProps) {
  const presetKeys = Object.keys(POMODORO_PRESETS) as PresetKey[];
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [preset, setPreset] = useState<PresetKey>(presetKeys[0]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const canStart = Boolean(categoryId);

  return (
    <DataCard
      title="Resume focus"
      description="One tap picks up where you left off"
      action={
        <button
          onClick={onFullSetup}
          className="flex items-center gap-0.5 text-[13px] font-semibold text-accent-solid"
        >
          Full setup <ChevronRight className="h-3.5 w-3.5" />
        </button>
      }
    >
      <div>
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Working on</p>
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  "flex items-center gap-2 rounded-sm border px-3 py-1.5 text-[13px] font-semibold transition-colors",
                  categoryId === cat.id
                    ? "border-accent-solid bg-accent-soft text-ink"
                    : "border-line text-ink-muted hover:border-line-strong"
                )}
              >
                {cat.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                {cat.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-ink-muted">
            No categories yet —{" "}
            <button onClick={onFullSetup} className="font-semibold text-accent-solid hover:underline">
              set one up in Focus
            </button>
          </p>
        )}
      </div>

      <div>
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">Duration</p>
        <div className="flex flex-wrap gap-2.5">
          {presetKeys.map((key) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={cn(
                "rounded-sm border px-4 py-2 text-[13px] font-semibold transition-colors",
                preset === key
                  ? "border-accent-solid bg-accent-soft text-ink"
                  : "border-line text-ink-muted hover:border-line-strong"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => canStart && onBegin(categoryId, preset)}
        disabled={!canStart}
        className="h-auto w-full justify-center py-3.5 text-base"
      >
        <Play className="h-4 w-4 fill-current" />
        {canStart
          ? `Begin — ${selectedCategory?.name ?? ""} · ${POMODORO_PRESETS[preset].work} min`
          : "Pick a category to start"}
      </Button>
    </DataCard>
  );
}
