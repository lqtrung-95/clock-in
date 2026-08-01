"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Play, Tags, Target, Image, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function Nudge({
  icon: Icon,
  tint,
  title,
  body,
  cta,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <Card className="border border-border bg-card p-5">
      <div className="flex items-start gap-3.5">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tint)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-foreground">{title}</h4>
          <p className="mt-1 text-[13px] text-muted-foreground">{body}</p>
          <Button variant="outline" size="sm" onClick={onClick} className="mt-3">
            {cta}
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface HomeEmptyStateProps {
  userName: string;
  onStartFocus: () => void;
  onAddCategories: () => void;
  onSetGoal: () => void;
  onBrowseScenes: () => void;
}

/** First-run Home — no data yet, so guide the user into their first session. */
export function HomeEmptyState({
  userName, onStartFocus, onAddCategories, onSetGoal, onBrowseScenes,
}: HomeEmptyStateProps) {
  return (
    <div className="space-y-4">
      <div>
        <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
          <Sparkles className="h-3.5 w-3.5" /> Welcome
        </span>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-foreground">
          Let&apos;s set up your focus{userName ? `, ${userName}` : ""}
        </h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          A few quick steps and your dashboard fills itself in. Your stats, streak and goals appear here
          after your first session.
        </p>
      </div>

      <Card className="border border-border bg-gradient-to-br from-blue-500/10 via-card to-card p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
          <Brain className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Start your first focus session</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          A 25-minute block is a great first step. Pick a vibe and go — you can tweak everything later.
        </p>
        <Button
          onClick={onStartFocus}
          className="mt-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-600"
        >
          <Play className="mr-2 h-4 w-4 fill-current" />
          Start a 25-minute session
        </Button>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Nudge
          icon={Tags}
          tint="bg-cyan-500/15 text-cyan-500 dark:text-cyan-400"
          title="Create categories"
          body="Tag sessions — Work, Study, Reading — to see where your time goes."
          cta="Add categories"
          onClick={onAddCategories}
        />
        <Nudge
          icon={Target}
          tint="bg-violet-500/15 text-violet-500 dark:text-violet-400"
          title="Set your first goal"
          body="A weekly target keeps momentum. Even 2 hours is a start."
          cta="Set a goal"
          onClick={onSetGoal}
        />
        <Nudge
          icon={Image}
          tint="bg-orange-500/15 text-orange-500 dark:text-orange-400"
          title="Pick an ambient scene"
          body="Rain, fireplace, lofi cafe — set the mood for deep work."
          cta="Browse scenes"
          onClick={onBrowseScenes}
        />
      </div>
    </div>
  );
}
