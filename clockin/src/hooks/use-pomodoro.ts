"use client";

import { useEffect, useState } from "react";
import { usePomodoroStore } from "@/stores/pomodoro-store";
import { formatDuration } from "@/lib/utils";
import { useVisibility } from "./use-visibility";

export function usePomodoro() {
  const { phase, workMinutes, breakMinutes, startedAt, pausedAt, accumulatedMs, cycle, totalCycles } =
    usePomodoroStore();
  const [elapsed, setElapsed] = useState(0);
  const [lastVisible, setLastVisible] = useState(Date.now());

  useVisibility(
    () => {
      const delta = Date.now() - lastVisible;
      setElapsed((prev) => prev + delta);
    },
    () => setLastVisible(Date.now())
  );

  const targetMs =
    (phase === "work" ? workMinutes : breakMinutes) * 60 * 1000;

  useEffect(() => {
    if (phase === "idle" || !startedAt) {
      setElapsed(0);
      return;
    }

    // Don't tick if paused
    if (pausedAt) {
      const elapsedWhenPaused = pausedAt - startedAt - accumulatedMs;
      setElapsed(Math.min(elapsedWhenPaused, targetMs));
      return;
    }

    let rafId: number;
    const tick = () => {
      const now = Date.now();
      const totalElapsed = now - startedAt - accumulatedMs;
      setElapsed(Math.min(totalElapsed, targetMs));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [phase, startedAt, accumulatedMs, targetMs, pausedAt]);

  const remaining = Math.max(0, targetMs - elapsed);
  const progress = targetMs > 0 ? (elapsed / targetMs) * 100 : 0;
  const isWork = phase === "work";
  const isBreak = phase === "break";
  const isRunning = phase !== "idle" && !pausedAt;
  const isPaused = !!pausedAt;

  return {
    phase,
    cycle,
    totalCycles,
    elapsed,
    remaining,
    progress,
    formatted: formatDuration(remaining),
    isWork,
    isBreak,
    isRunning,
    isPaused,
    workMinutes,
    breakMinutes,
  };
}
