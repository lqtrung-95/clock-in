"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Tag, Timer, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "focus-onboarding-dismissed";
export const SESSION_COMPLETED_KEY = "focus-session-completed";

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
}

const STEPS: Step[] = [
  { icon: Tag,   label: "Select a category",    hint: "Pick what you're working on" },
  { icon: Timer, label: "Choose your duration",  hint: "Pick a preset or customize" },
  { icon: Play,  label: "Hit Start",             hint: "Begin your focus session" },
];

interface FocusOnboardingBannerProps {
  selectedCategory: string;
  effectivePreset: string | null;
}

export function FocusOnboardingBanner({ selectedCategory, effectivePreset }: FocusOnboardingBannerProps) {
  // Use useEffect to avoid SSR/hydration mismatch with localStorage
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    const completed = localStorage.getItem(SESSION_COMPLETED_KEY) === "true";
    if (!dismissed && !completed) setVisible(true);
  }, []);

  // Compute current step (0-indexed)
  const currentStep = !selectedCategory ? 0 : !effectivePreset ? 1 : 2;

  if (!visible) return null;

  return (
    <div className="mb-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-foreground">👋 Welcome! Let&apos;s start your first session</p>
          <p className="text-xs text-muted-foreground mt-0.5">Complete the steps below to begin</p>
        </div>
        <button
          onClick={() => {
            localStorage.setItem(DISMISSED_KEY, "true");
            setVisible(false);
          }}
          className="shrink-0 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isDone = i < currentStep;
          const isActive = i === currentStep;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
                isDone && "opacity-50",
                isActive && "bg-blue-500/10 border border-blue-500/25 shadow-sm",
                !isDone && !isActive && "opacity-30"
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all",
                isDone && "bg-emerald-500/20",
                isActive && "bg-blue-500 shadow-lg shadow-blue-500/30",
                !isDone && !isActive && "bg-muted"
              )}>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isActive ? (
                  <Icon className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-semibold",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.hint}</p>
                )}
              </div>

              {/* Active pulse dot */}
              {isActive && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* No categories fallback */}
      <p className="mt-3 text-center text-[11px] text-muted-foreground/40">
        No categories yet?{" "}
        <Link
          href="/categories"
          className="text-blue-400 hover:underline"
        >
          Create one first
        </Link>
      </p>
    </div>
  );
}
