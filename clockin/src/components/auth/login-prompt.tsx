"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataCard } from "@/components/ui-app/data-card";
import { Cloud, TrendingUp, Target, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginPromptProps {
  feature: "sync" | "stats" | "goals" | "achievements" | "general";
  className?: string;
}

export function LoginPrompt({ feature, className }: LoginPromptProps) {
  const router = useRouter();

  const configs = {
    sync: {
      icon: Cloud,
      title: "Sync Across Devices",
      description: "Sign in to sync your progress across all your devices and never lose your data.",
    },
    stats: {
      icon: TrendingUp,
      title: "Detailed Analytics",
      description: "Sign in to view detailed statistics, trends, and insights about your productivity.",
    },
    goals: {
      icon: Target,
      title: "Set Goals & Track Streaks",
      description: "Sign in to set productivity goals, track your streaks, and stay motivated.",
    },
    general: {
      icon: Sparkles,
      title: "Unlock Full Features",
      description: "Sign in to access all features including cloud sync, detailed stats, and goal tracking.",
    },
    achievements: {
      icon: Trophy,
      title: "Earn Achievements",
      description: "Sign in to track your achievements, earn badges, and level up your focus game.",
    },
  };

  const config = configs[feature];
  const Icon = config.icon;

  return (
    <DataCard className={cn("items-center text-center", className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-solid">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-ink">{config.title}</h3>
      <p className="text-sm text-ink-muted">{config.description}</p>
      <div className="flex justify-center gap-2">
        <Button onClick={() => router.push("/login")}>Sign in</Button>
        <Button variant="outline" onClick={() => router.push("/signup")}>
          Create account
        </Button>
      </div>
    </DataCard>
  );
}
