"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type PomodoroPhase = "work" | "break" | "idle";

interface PomodoroState {
  phase: PomodoroPhase;
  cycle: number;
  totalCycles: number;
  workMinutes: number;
  breakMinutes: number;
  startedAt: number | null;
  pausedAt: number | null;
  accumulatedMs: number;
  lastActiveAt: number | null;
  completedSessions: number;

  start: (workMinutes: number, breakMinutes: number, totalCycles: number) => void;
  pause: () => void;
  resume: () => void;
  completePhase: () => void;
  reset: () => void;
  hasRecoverableSession: () => boolean;
  recoverSession: () => void;
  getSessionProgress: () => { elapsed: number; remaining: number; isExpired: boolean };
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      phase: "idle",
      cycle: 0,
      totalCycles: 4,
      workMinutes: 25,
      breakMinutes: 5,
      startedAt: null,
      pausedAt: null,
      accumulatedMs: 0,
      lastActiveAt: null,
      completedSessions: 0,

      start: (workMinutes, breakMinutes, totalCycles) =>
        set({
          phase: "work",
          cycle: 1,
          workMinutes,
          breakMinutes,
          totalCycles,
          startedAt: Date.now(),
          pausedAt: null,
          accumulatedMs: 0,
          lastActiveAt: Date.now(),
        }),

      pause: () =>
        set({
          phase: get().phase,
          pausedAt: Date.now(),
          lastActiveAt: Date.now(),
        }),

      resume: () =>
        set((state) => ({
          pausedAt: null,
          lastActiveAt: Date.now(),
          accumulatedMs:
            state.accumulatedMs +
            (state.pausedAt ? Date.now() - state.pausedAt : 0),
        })),

      completePhase: () =>
        set((state) => {
          if (state.phase === "work") {
            return {
              phase: "break",
              startedAt: Date.now(),
              accumulatedMs: 0,
              lastActiveAt: Date.now(),
            };
          } else {
            const nextCycle = state.cycle + 1;
            if (nextCycle > state.totalCycles) {
              return {
                phase: "idle",
                cycle: 0,
                startedAt: null,
                accumulatedMs: 0,
                lastActiveAt: Date.now(),
                completedSessions: state.completedSessions + 1,
              };
            }
            return {
              phase: "work",
              cycle: nextCycle,
              startedAt: Date.now(),
              accumulatedMs: 0,
              lastActiveAt: Date.now(),
            };
          }
        }),

      reset: () =>
        set({
          phase: "idle",
          cycle: 0,
          startedAt: null,
          pausedAt: null,
          accumulatedMs: 0,
          lastActiveAt: Date.now(),
        }),

      hasRecoverableSession: () => {
        const state = get();
        if (state.phase === "idle" || !state.startedAt) return false;

        // Check if session hasn't expired (24 hours)
        const now = Date.now();
        const inactiveTime = now - (state.lastActiveAt || state.startedAt);
        const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

        return inactiveTime < SESSION_TIMEOUT;
      },

      recoverSession: () => {
        const state = get();
        if (state.phase === "idle" || !state.startedAt) return;

        // Update lastActiveAt to now
        set({ lastActiveAt: Date.now() });
      },

      getSessionProgress: () => {
        const state = get();
        if (state.phase === "idle" || !state.startedAt) {
          return { elapsed: 0, remaining: 0, isExpired: true };
        }

        const targetMs =
          (state.phase === "work" ? state.workMinutes : state.breakMinutes) *
          60 *
          1000;

        // Calculate total inactive time since last active
        const now = Date.now();
        const inactiveTime = state.pausedAt
          ? now - state.pausedAt
          : now - (state.lastActiveAt || state.startedAt);

        // If paused, don't add inactive time
        const totalElapsed = state.pausedAt
          ? now - state.startedAt - state.accumulatedMs
          : now - state.startedAt - state.accumulatedMs + inactiveTime;

        const elapsed = Math.min(totalElapsed, targetMs);
        const remaining = Math.max(0, targetMs - elapsed);
        const isExpired = elapsed >= targetMs;

        return { elapsed, remaining, isExpired };
      },
    }),
    {
      name: "clockin-pomodoro",
    }
  )
);
