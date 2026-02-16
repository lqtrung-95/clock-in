"use client";

import { useEffect, useState, useMemo } from "react";
import { useTimerStore } from "@/stores/timer-store";
import { formatDuration } from "@/lib/utils";
import { useVisibility } from "./use-visibility";

export function useTimer() {
  const { status, startedAt, pausedAt, accumulatedMs } = useTimerStore();
  const [elapsed, setElapsed] = useState(0);
  const [lastVisible, setLastVisible] = useState(Date.now());

  useVisibility(
    () => {
      // Tab became visible - force update
      const delta = Date.now() - lastVisible;
      setElapsed((prev) => prev + delta);
    },
    () => {
      // Tab hidden - record timestamp
      setLastVisible(Date.now());
    }
  );

  useEffect(() => {
    if (status !== "running" || !startedAt) {
      setElapsed(0);
      return;
    }

    let rafId: number;
    const tick = () => {
      const now = Date.now();
      const totalElapsed = now - startedAt - accumulatedMs;
      setElapsed(totalElapsed);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [status, startedAt, accumulatedMs]);

  // Calculate elapsed time for paused state
  const pausedElapsed = useMemo(() => {
    if (status !== "paused" || !startedAt || !pausedAt) return 0;
    return pausedAt - startedAt - accumulatedMs;
  }, [status, startedAt, pausedAt, accumulatedMs]);

  const currentElapsed = status === "paused" ? pausedElapsed : elapsed;

  return {
    elapsed: currentElapsed,
    formatted: formatDuration(currentElapsed),
    status,
    isRunning: status === "running",
    isPaused: status === "paused",
  };
}
