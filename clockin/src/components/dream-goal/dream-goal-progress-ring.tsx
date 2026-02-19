"use client";

import { useMemo } from "react";

interface DreamGoalProgressRingProps {
  progress: number;      // 0–100
  currentHours: number;
  targetHours: number;
  title: string;
}

const SIZE = 220;
const RADIUS = 88;
const STROKE = 14;
const CX = SIZE / 2;
const CY = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Color theme based on progress quartile
function getColors(p: number) {
  if (p < 25)  return { from: "#7c3aed", to: "#6366f1", text: "#7c3aed", bg: "#ede9fe" };
  if (p < 50)  return { from: "#2563eb", to: "#0891b2", text: "#2563eb", bg: "#dbeafe" };
  if (p < 75)  return { from: "#0891b2", to: "#059669", text: "#0891b2", bg: "#d1fae5" };
  if (p < 100) return { from: "#d97706", to: "#f59e0b", text: "#d97706", bg: "#fef3c7" };
  return       { from: "#f59e0b", to: "#fbbf24", text: "#d97706", bg: "#fef9c3" };
}

// Convert progress % to SVG arc point on the circle
function arcPoint(pct: number): { x: number; y: number } {
  const angle = (pct / 100) * Math.PI * 2 - Math.PI / 2;
  return { x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) };
}

// Inspirational label matching current quartile
function getLabel(p: number): string {
  if (p === 0)   return "Every hour counts";
  if (p < 10)    return "The journey begins";
  if (p < 25)    return "Building momentum";
  if (p < 50)    return "You're making progress";
  if (p < 75)    return "Past the halfway mark";
  if (p < 90)    return "The finish line is near";
  if (p < 100)   return "Almost there!";
  return "Dream achieved ✦";
}

export function DreamGoalProgressRing({ progress, currentHours, targetHours, title }: DreamGoalProgressRingProps) {
  const p = Math.max(0, Math.min(100, progress));
  const colors = useMemo(() => getColors(p), [p]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - p / 100);
  const gradientId = "ring-gradient";
  const trackId = "ring-track";

  // Milestone dots at 25 / 50 / 75 %
  const milestones = [25, 50, 75].map((pct) => ({ pct, ...arcPoint(pct), reached: p >= pct }));

  const hoursLeft = Math.max(0, targetHours - currentHours);

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6">
      {/* SVG Ring */}
      <div className="relative">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>

          {/* Track circle (unfilled portion) */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-muted/20"
            strokeLinecap="round"
          />

          {/* Progress arc */}
          {p > 0 && (
            <circle
              cx={CX} cy={CY} r={RADIUS}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
          )}

          {/* Milestone dots */}
          {milestones.map(({ pct, x, y, reached }) => (
            <circle
              key={pct} cx={x} cy={y} r={5}
              fill={reached ? colors.from : "var(--muted)"}
              stroke="white" strokeWidth={2}
              opacity={reached ? 1 : 0.4}
            />
          ))}

          {/* Center content */}
          <text x={CX} y={CY - 14} textAnchor="middle" className="fill-foreground" style={{ fontSize: 36, fontWeight: 700, fontFamily: "inherit" }}>
            {p < 1 ? "<1" : Math.floor(p)}
            <tspan style={{ fontSize: 16, fontWeight: 500, opacity: 0.6 }}>%</tspan>
          </text>
          <text x={CX} y={CY + 14} textAnchor="middle" style={{ fontSize: 13, fill: "var(--muted-foreground)", fontFamily: "inherit" }}>
            {currentHours.toFixed(1)}h / {targetHours}h
          </text>
        </svg>
      </div>

      {/* Inspirational label */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium" style={{ color: colors.text }}>
          {getLabel(p)}
        </p>
        {p < 100 ? (
          <p className="text-xs text-muted-foreground">{hoursLeft.toFixed(1)} hours remaining</p>
        ) : (
          <p className="text-xs font-medium" style={{ color: colors.from }}>🎉 Goal complete!</p>
        )}
      </div>

      {/* Slim progress bar */}
      <div className="w-full max-w-[220px]">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${p}%`,
              background: `linear-gradient(to right, ${colors.from}, ${colors.to})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
