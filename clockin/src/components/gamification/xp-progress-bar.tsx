"use client";

import { cn } from "@/lib/utils";
import type { LevelInfo } from "@/types/xp-system";

interface XPProgressBarProps {
  levelInfo: LevelInfo | null;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function XPProgressBar({
  levelInfo,
  size = "md",
  showText = true,
  className,
}: XPProgressBarProps) {
  if (!levelInfo) return null;

  const { currentLevel, xpProgress, xpForNextLevel, progressPercentage } = levelInfo;

  const sizeClasses = {
    sm: "h-1.5 text-xs",
    md: "h-2 text-sm",
    lg: "h-3 text-base",
  };

  return (
    <div className={cn("w-full", className)}>
      {showText && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-medium text-foreground">Level {currentLevel}</span>
          <span className="text-muted-foreground">
            {xpProgress} / {xpForNextLevel - (currentLevel - 1) * 1000} XP
          </span>
        </div>
      )}
      <div className={cn("relative overflow-hidden rounded-full bg-muted", sizeClasses[size])}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full bg-cyan-400/30 blur-sm transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
