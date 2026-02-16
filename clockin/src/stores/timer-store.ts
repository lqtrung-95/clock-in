"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimerStatus } from "@/types/timer";

interface TimerState {
  status: TimerStatus;
  categoryId: string | null;
  entryId: string | null;
  startedAt: number | null;
  pausedAt: number | null;
  accumulatedMs: number;
  lastCategoryId: string | null;

  start: (categoryId: string, entryId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setLastCategoryId: (id: string) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      status: "idle",
      categoryId: null,
      entryId: null,
      startedAt: null,
      pausedAt: null,
      accumulatedMs: 0,
      lastCategoryId: null,

      start: (categoryId, entryId) =>
        set({
          status: "running",
          categoryId,
          entryId,
          startedAt: Date.now(),
          pausedAt: null,
          accumulatedMs: 0,
          lastCategoryId: categoryId,
        }),

      pause: () =>
        set((state) => ({
          status: "paused",
          pausedAt: Date.now(),
        })),

      resume: () =>
        set((state) => ({
          status: "running",
          accumulatedMs: state.accumulatedMs + (state.pausedAt ? Date.now() - state.pausedAt : 0),
          pausedAt: null,
        })),

      stop: () =>
        set({
          status: "idle",
          categoryId: null,
          entryId: null,
          startedAt: null,
          pausedAt: null,
          accumulatedMs: 0,
        }),

      reset: () =>
        set({
          status: "idle",
          categoryId: null,
          entryId: null,
          startedAt: null,
          pausedAt: null,
          accumulatedMs: 0,
        }),

      setLastCategoryId: (id) => set({ lastCategoryId: id }),
    }),
    {
      name: "clockin-timer",
      onRehydrateStorage: () => (state) => {
        // Validate: if timer was running but started > 24h ago, reset
        if (state && state.startedAt) {
          const staleThreshold = 24 * 60 * 60 * 1000;
          if (Date.now() - state.startedAt > staleThreshold) {
            state.status = "idle";
            state.categoryId = null;
            state.entryId = null;
            state.startedAt = null;
            state.pausedAt = null;
            state.accumulatedMs = 0;
          }
        }
      },
    }
  )
);
