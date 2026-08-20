"use client";

import { Button } from "@/components/ui/button";
import { Brain, Play, Tags, Target, Image } from "lucide-react";
import { DataCard } from "@/components/ui-app/data-card";
import { METRIC_VAR, type DataMetric } from "@/lib/data-metrics";

function Nudge({
  icon: Icon,
  metric,
  title,
  body,
  cta,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  metric: DataMetric;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <DataCard>
      <div className="flex items-start gap-3.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm"
          style={{ backgroundColor: `color-mix(in srgb, ${METRIC_VAR[metric]} 15%, transparent)`, color: METRIC_VAR[metric] }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-[15px] font-semibold text-ink">{title}</h4>
          <p className="mt-1 text-[13px] text-ink-muted">{body}</p>
          <Button variant="outline" size="sm" onClick={onClick} className="mt-3">
            {cta}
          </Button>
        </div>
      </div>
    </DataCard>
  );
}

interface HomeEmptyStateProps {
  onStartFocus: () => void;
  onAddCategories: () => void;
  onSetGoal: () => void;
  onBrowseScenes: () => void;
}

/**
 * First-run Today — no data yet, so guide the user into their first session.
 * Renders no title of its own — the page's PageShell owns it, personalized
 * with the user's name where available.
 */
export function HomeEmptyState({ onStartFocus, onAddCategories, onSetGoal, onBrowseScenes }: HomeEmptyStateProps) {
  return (
    <div className="space-y-4">
      <DataCard className="items-center p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent-solid">
          <Brain className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-ink">Start your first focus session</h3>
        <p className="mx-auto max-w-sm text-sm text-ink-muted">
          A 25-minute block is a great first step. Pick a vibe and go — you can tweak everything later.
        </p>
        <Button onClick={onStartFocus}>
          <Play className="h-4 w-4 fill-current" />
          Start a 25-minute session
        </Button>
      </DataCard>

      <div className="grid gap-4 md:grid-cols-3">
        <Nudge
          icon={Tags}
          metric="focus"
          title="Create categories"
          body="Tag sessions — Work, Study, Reading — to see where your time goes."
          cta="Add categories"
          onClick={onAddCategories}
        />
        <Nudge
          icon={Target}
          metric="goal"
          title="Set your first goal"
          body="A weekly target keeps momentum. Even 2 hours is a start."
          cta="Set a goal"
          onClick={onSetGoal}
        />
        <Nudge
          icon={Image}
          metric="streak"
          title="Pick an ambient scene"
          body="Rain, fireplace, lofi cafe — set the mood for deep work."
          cta="Browse scenes"
          onClick={onBrowseScenes}
        />
      </div>
    </div>
  );
}
