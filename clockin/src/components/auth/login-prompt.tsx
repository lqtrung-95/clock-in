"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cloud, TrendingUp, Target, Sparkles, Trophy } from "lucide-react";

interface LoginPromptProps {
  feature: "sync" | "stats" | "goals" | "achievements" | "general";
  className?: string;
}

export function LoginPrompt({ feature, className = "" }: LoginPromptProps) {
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
    <Card className={`p-6 text-center border border-border bg-card ${className}`}>
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
        <Icon className="h-6 w-6 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{config.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{config.description}</p>
      <div className="flex gap-2 justify-center">
        <Button onClick={() => router.push("/login")} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25">
          Sign In
        </Button>
        <Button variant="outline" onClick={() => router.push("/signup")} className="border-border bg-card text-foreground hover:bg-secondary">
          Create Account
        </Button>
      </div>
    </Card>
  );
}

export function LoginBanner({ feature }: { feature: "sync" | "stats" | "goals" }) {
  const router = useRouter();

  const messages = {
    sync: "Your data is stored locally. Sign in to sync across devices.",
    stats: "Sign in to view detailed statistics and trends.",
    goals: "Sign in to set goals and track your streaks.",
  };

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground/90">{messages[feature]}</p>
      <Button size="sm" onClick={() => router.push("/login")} className="shrink-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25">
        Sign In
      </Button>
    </div>
  );
}
