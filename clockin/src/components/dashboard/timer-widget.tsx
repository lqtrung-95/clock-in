"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTimerStore } from "@/stores/timer-store";
import { useCategoryStore } from "@/stores/category-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";

export function TimerWidget() {
  const router = useRouter();
  const { status, categoryId, startedAt, accumulatedMs, pause, resume } = useTimerStore();
  const { categories } = useCategoryStore();
  const [now, setNow] = useState(Date.now());

  // Update timer display every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const category = categories.find((c) => c.id === categoryId);
  const isRunning = status === "running";
  const isPaused = status === "paused";

  // Calculate elapsed time
  const elapsedMs = isRunning && startedAt
    ? accumulatedMs + (now - startedAt)
    : accumulatedMs;

  // Format elapsed time
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-cyan-500/5 p-5 shadow-lg shadow-primary/10">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-cyan-500/10 opacity-50" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{
              backgroundColor: category?.color || "#3B82F6",
              boxShadow: `0 10px 25px -5px ${category?.color || "#3B82F6"}40`,
            }}
          >
            {isRunning ? (
              <div className="h-3 w-3 animate-pulse rounded-full bg-white" />
            ) : (
              <Pause className="h-6 w-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {isRunning ? "Currently tracking" : isPaused ? "Timer paused" : "Timer"}
            </p>
            <p className="text-lg font-semibold">{category?.name || "Unknown"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-mono text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent sm:text-5xl">
            {formatted}
          </div>

          <div className="flex gap-2">
            {isRunning ? (
              <Button
                variant="outline"
                size="icon"
                onClick={pause}
                className="h-12 w-12 rounded-xl border-2"
              >
                <Pause className="h-5 w-5 fill-current" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={resume}
                className="h-12 w-12 rounded-xl border-2"
              >
                <Play className="h-5 w-5 fill-current" />
              </Button>
            )}

            <Button
              size="icon"
              onClick={() => router.push("/track")}
              className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/25"
            >
              <Square className="h-5 w-5 fill-current" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
