"use client";

import { useState, useCallback } from "react";

export type AlarmSound = "bell" | "digital" | "chime" | "none";

export interface FocusTimerSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  alarmSound: AlarmSound;
  alarmVolume: number; // 0–100
}

const STORAGE_KEY = "clockin-focus-timer-settings";

const DEFAULT_SETTINGS: FocusTimerSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 20,
  alarmSound: "bell",
  alarmVolume: 70,
};

function loadSettings(): FocusTimerSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Generate alarm tones via Web Audio API — no sound files needed */
export function playAlarmWithWebAudio(type: AlarmSound, volume: number) {
  if (type === "none" || volume === 0) return;
  try {
    const ctx = new AudioContext();
    const vol = volume / 100;

    if (type === "bell") {
      // Warm decaying sine — classic bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 2);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      osc.start();
      osc.stop(ctx.currentTime + 2);

    } else if (type === "digital") {
      // Three short square-wave beeps
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.value = 880;
        const t = ctx.currentTime + i * 0.35;
        gain.gain.setValueAtTime(vol * 0.3, t);
        gain.gain.setValueAtTime(0.001, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);
      }

    } else if (type === "chime") {
      // Four ascending sine tones — C E G C
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.28;
        gain.gain.setValueAtTime(vol * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.start(t);
        osc.stop(t + 0.8);
      });
    }
  } catch (e) {
    console.warn("Alarm audio failed:", e);
  }
}

export function useFocusTimerSettings() {
  const [settings, setSettings] = useState<FocusTimerSettings>(loadSettings);

  const updateSettings = useCallback((updates: Partial<FocusTimerSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const playAlarm = useCallback(() => {
    playAlarmWithWebAudio(settings.alarmSound, settings.alarmVolume);
  }, [settings.alarmSound, settings.alarmVolume]);

  return { settings, updateSettings, playAlarm };
}
