"use client";

import { useTimer } from "@/hooks/use-timer";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  className?: string;
}

export function TimerDisplay({ className }: TimerDisplayProps) {
  const { formatted, isRunning } = useTimer();

  return (
    <div className={cn("text-center", className)}>
      <div
        className={cn(
          "font-mono text-7xl font-bold tracking-tight md:text-9xl",
          "bg-gradient-to-br from-primary via-blue-500 to-cyan-500",
          "bg-clip-text text-transparent",
          "transition-all duration-500 ease-out",
          isRunning && "drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        )}
      >
        {formatted}
      </div>
      <div
        className={cn(
          "mt-2 h-1 w-32 mx-auto rounded-full transition-all duration-500",
          isRunning
            ? "bg-gradient-to-r from-primary to-cyan-400 opacity-100"
            : "bg-muted opacity-0"
        )}
      />
    </div>
  );
}
