"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TimeEntry, Category } from "@/types/timer";

const DISMISSED_KEY = "clockin-onboarding-dismissed";

interface FirstTimeSetupBannerProps {
  entries: TimeEntry[];
  categories: Category[];
  isAuthenticated: boolean;
}

const STEPS = [
  { label: "Create a category", href: "/categories", description: "Organize your focus sessions" },
  { label: "Customize your timer", href: "/focus", description: "Set your preferred work duration" },
  { label: "Start your first session", href: "/focus", description: "Begin your focus journey" },
] as const;

export function FirstTimeSetupBanner({ entries, categories, isAuthenticated }: FirstTimeSetupBannerProps) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid SSR flash

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
  }, []);

  const hasCategory = categories.filter((c) => !c.is_archived).length > 0;
  const hasEntry = entries.length > 0;

  // Only show for authenticated users with 0 categories AND 0 entries
  const shouldShow = isAuthenticated && !hasCategory && !hasEntry && !dismissed;

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  }

  if (!shouldShow) return null;

  const completedSteps = [hasCategory, hasCategory, hasEntry]; // step completion flags

  return (
    <Card className="relative border border-blue-500/30 bg-blue-500/5 p-5">
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Get started with clockin</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Complete these steps to set up your workspace</p>
      </div>

      <ol className="space-y-2.5">
        {STEPS.map((step, i) => {
          const done = completedSteps[i];
          return (
            <li key={step.label} className="flex items-start gap-3">
              {done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
              )}
              <div className="flex-1 min-w-0">
                <Link
                  href={step.href}
                  className={`text-sm font-medium transition-colors ${done ? "line-through text-muted-foreground" : "text-foreground hover:text-blue-500"}`}
                >
                  {step.label}
                </Link>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {completedSteps.filter(Boolean).length} / {STEPS.length} completed
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Dismiss
        </Button>
      </div>
    </Card>
  );
}
