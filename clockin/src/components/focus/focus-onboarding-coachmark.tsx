"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const DISMISSED_KEY = "focus-onboarding-dismissed";
export const SESSION_COMPLETED_KEY = "focus-session-completed";

const STEPS = [
  {
    target: "coachmark-preset",
    title: "Set your session length",
    description: "Choose a Pomodoro preset or customize your own timer duration.",
  },
  {
    target: "coachmark-category",
    title: "What are you working on?",
    description: "Select a category to tag your focus session. This helps you track time by area.",
  },
  {
    target: "coachmark-atmosphere",
    title: "Set the mood",
    description: "Pick a background, ambient sound, and visual overlay to create your ideal focus environment.",
  },
  {
    target: "coachmark-start",
    title: "Ready? Hit Start!",
    description: "Begin your focus session and track your productivity in real time.",
  },
];

interface TargetRect { top: number; left: number; right: number; bottom: number }

const PAD = 10;
// Mobile bottom nav height safe area (nav is bottom-4 + h-16 = ~80px)
const MOBILE_NAV_SAFE = 88;
// Tooltip card estimated height
const CARD_H = 200;

export function FocusOnboardingCoachmark() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [tRect, setTRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    const completed = localStorage.getItem(SESSION_COMPLETED_KEY) === "true";
    if (!dismissed && !completed) setVisible(true);
  }, []);

  const refreshRect = useCallback(() => {
    if (!visible) return;
    const el = document.getElementById(STEPS[step].target);
    if (!el) return;
    // Use instant scroll so rect is accurate on next tick (smooth + 350ms was too slow on mobile)
    el.scrollIntoView({ behavior: "instant", block: "center" });
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setTRect({
        top:    Math.max(4, r.top - PAD),
        left:   Math.max(4, r.left - PAD),
        right:  Math.min(vw - 4, r.right + PAD),
        bottom: Math.min(vh - 4, r.bottom + PAD),
      });
    }, 50);
  }, [step, visible]);

  useEffect(() => {
    refreshRect();
    window.addEventListener("resize", refreshRect);
    return () => window.removeEventListener("resize", refreshRect);
  }, [refreshRect]);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  }
  function next() { step < STEPS.length - 1 ? setStep(s => s + 1) : dismiss(); }
  function prev() { if (step > 0) setStep(s => s - 1); }

  if (!visible || !tRect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { top, left, right, bottom } = tRect;
  const isLast = step === STEPS.length - 1;

  // Decide if tooltip goes below or above spotlight
  const spaceBelow = vh - bottom - MOBILE_NAV_SAFE;
  const spaceAbove = top;
  // Prefer above when element is in lower half of screen (avoids overlap with content below)
  const elementInLowerHalf = bottom > vh * 0.5;
  const showAbove = (elementInLowerHalf && spaceAbove > CARD_H)
    || (spaceBelow < CARD_H && spaceAbove > spaceBelow);
  // Clamp so card is always within CARD_H+20 of the spotlight edge
  const cardTop = showAbove
    ? Math.max(8, top - CARD_H - 12)
    : Math.min(bottom + 12, vh - CARD_H - MOBILE_NAV_SAFE);

  // 4-strip dark overlay (works on all browsers incl iOS Safari)
  const overlayStyle = (t: number, l: number, w: number, h: number) => ({
    position: "fixed" as const,
    top: t, left: l, width: w, height: h,
    background: "rgba(0,0,0,0.78)",
    zIndex: 60,
    pointerEvents: "none" as const,
  });

  return (
    <>
      {/* 4 dark strips surrounding spotlight */}
      <div style={overlayStyle(0, 0, vw, top)} />
      <div style={overlayStyle(top, 0, left, bottom - top)} />
      <div style={overlayStyle(top, right, vw - right, bottom - top)} />
      <div style={overlayStyle(bottom, 0, vw, vh - bottom)} />

      {/* Spotlight ring */}
      <div
        style={{
          position: "fixed", zIndex: 61, pointerEvents: "none",
          top, left, width: right - left, height: bottom - top,
          borderRadius: 12,
          boxShadow: "0 0 0 3px var(--accent-solid), 0 0 0 7px var(--accent-ring)",
        }}
      />

      {/* Tooltip card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed", zIndex: 62,
          top: cardTop,
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100vw - 2rem)",
          maxWidth: 360,
        }}
      >
        <div style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          padding: "18px 18px 14px",
          boxShadow: "0 0 0 2px var(--accent-ring), 0 8px 40px rgba(0,0,0,0.35)",
        }}>
          {/* Pointer triangle */}
          <div style={{
            position: "absolute",
            left: "50%",
            ...(showAbove ? { bottom: -6 } : { top: -6 }),
            width: 12, height: 12,
            background: "var(--surface-raised)",
            border: "1px solid var(--line)",
            borderRight: "none", borderBottom: "none",
            transform: showAbove
              ? "translateX(-50%) rotate(225deg)"
              : "translateX(-50%) rotate(45deg)",
          }} />

          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 4 }}>
            {STEPS[step].title}
          </p>
          <p style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.6 }}>
            {STEPS[step].description}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            {/* Dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  borderRadius: 99,
                  width: i === step ? 16 : 8, height: 8,
                  background: i === step ? "var(--accent-solid)" : "var(--line-strong)",
                  transition: "all 0.3s",
                }} />
              ))}
            </div>
            {/* Nav buttons */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {step > 0 && (
                <button onClick={prev} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--surface-sunken)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--ink-muted)",
                }}>
                  <ChevronLeft size={16} />
                </button>
              )}
              <button onClick={next} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "6px 16px", borderRadius: 99, border: "none", cursor: "pointer",
                background: "var(--accent-solid)",
                color: "var(--accent-fg)", fontSize: 12, fontWeight: 600,
              }}>
                {isLast ? <><Check size={14} /> Got it</> : <>Next <ChevronRight size={14} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to dismiss */}
      <div onClick={dismiss} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
    </>
  );
}
