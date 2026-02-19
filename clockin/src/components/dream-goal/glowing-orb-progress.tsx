"use client";

import { useMemo } from "react";

interface GlowingOrbProgressProps {
  progress: number;       // 0–100
  currentHours?: number;
  targetHours?: number;
  title?: string;
}

// Color stages: cold blue → deep purple → amber → brilliant gold/white
const CORE_STOPS: [number, number, number][] = [
  [10, 15, 40],   // 0%   — near-black blue
  [30, 10, 80],   // 25%  — deep purple
  [90, 25, 10],   // 50%  — dark ember
  [130, 60, 5],   // 75%  — warm amber
  [255, 240, 100], // 100% — brilliant gold
];
const GLOW_STOPS: [number, number, number][] = [
  [30, 100, 220],  // 0%   — electric blue
  [140, 60, 240],  // 25%  — violet
  [240, 100, 20],  // 50%  — orange
  [250, 180, 20],  // 75%  — gold
  [255, 255, 220], // 100% — white-gold
];

function lerpRGB(a: [number,number,number], b: [number,number,number], t: number): [number,number,number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
function toRgb(c: [number,number,number]) { return `rgb(${c.join(",")})`; }
function toRgba(c: [number,number,number], a: number) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

function getOrbColors(p: number) {
  const stageCount = CORE_STOPS.length - 1; // 4 segments
  const raw = (p / 100) * stageCount;
  const idx = Math.min(stageCount - 1, Math.floor(raw));
  const t = raw - idx;
  return {
    core: lerpRGB(CORE_STOPS[idx], CORE_STOPS[idx + 1], t),
    glow: lerpRGB(GLOW_STOPS[idx], GLOW_STOPS[idx + 1], t),
  };
}

export function GlowingOrbProgress({ progress, currentHours, targetHours, title }: GlowingOrbProgressProps) {
  const p = Math.max(0, Math.min(100, progress));
  const { core, glow } = useMemo(() => getOrbColors(p), [p]);

  // Glow radius and pulse speed scale with progress
  const glowR = 24 + p * 1.6;
  const pulseSpeed = (Math.max(0.9, 2.8 - p * 0.019)).toFixed(2);
  const isSun = p >= 90;
  const orbSize = 148;

  const boxShadow = [
    `0 0 ${glowR}px ${glowR * 0.5}px ${toRgba(glow, 0.55)}`,
    `0 0 ${glowR * 2}px ${glowR}px ${toRgba(glow, 0.35)}`,
    `0 0 ${glowR * 4}px ${glowR * 2}px ${toRgba(glow, 0.18)}`,
    isSun ? `0 0 ${glowR * 9}px ${glowR * 4}px ${toRgba(glow, 0.1)}` : "",
  ].filter(Boolean).join(", ");

  // Orbiting particles appear at 50%+
  const showParticles = p >= 50;
  const particles = [
    { r: 95,  duration: "4s",   delay: "0s",    size: 5 },
    { r: 112, duration: "6.5s", delay: "-2.1s", size: 3.5 },
    { r: 80,  duration: "9s",   delay: "-4.3s", size: 4 },
  ];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#030712]">
      {/* Dynamic CSS keyframes — pulse speed is progress-driven */}
      <style>{`
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1);    opacity: 0.88; }
          50%       { transform: scale(1.07); opacity: 1; }
        }
        @keyframes orb-orbit {
          from { transform: rotate(0deg)   translateX(var(--r)) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); }
        }
      `}</style>

      {/* Wide ambient background glow */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: `radial-gradient(ellipse 55% 55% at 50% 58%, ${toRgba(glow, 0.14)} 0%, transparent 70%)`,
      }} />

      {title && (
        <p className="relative z-10 mb-6 max-w-[200px] truncate text-center text-xs font-medium uppercase tracking-widest"
          style={{ color: toRgba(glow, 0.55) }}>
          {title}
        </p>
      )}

      {/* Orb + particles container */}
      <div className="relative flex items-center justify-center" style={{ width: orbSize + 80, height: orbSize + 80 }}>
        {/* Orbiting particles */}
        {showParticles && particles.map((p, i) => (
          <div key={i} className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
            <div style={{
              width: p.size, height: p.size, borderRadius: "50%",
              background: toRgba(glow, 0.9),
              boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${toRgba(glow, 0.6)}`,
              // @ts-ignore
              "--r": `${p.r}px`,
              animation: `orb-orbit ${p.duration} linear ${p.delay} infinite`,
            }} />
          </div>
        ))}

        {/* Outer pulse halo */}
        <div className="absolute rounded-full" style={{
          width: orbSize + 60, height: orbSize + 60,
          background: `radial-gradient(circle, transparent 42%, ${toRgba(glow, 0.12)} 65%, transparent 100%)`,
          animation: `orb-pulse ${pulseSpeed}s ease-in-out infinite`,
        }} />

        {/* Main orb */}
        <div className="relative flex items-center justify-center rounded-full" style={{
          width: orbSize, height: orbSize,
          background: `radial-gradient(circle at 38% 32%, ${toRgba(glow, 0.95)} 0%, ${toRgb(core)} 52%, #000 100%)`,
          boxShadow,
          animation: `orb-pulse ${pulseSpeed}s ease-in-out infinite`,
        }}>
          {/* Specular highlight — makes it look like a sphere */}
          <div className="absolute rounded-full" style={{
            width: 52, height: 52, top: 20, left: 26,
            background: `radial-gradient(circle, ${toRgba(glow, 0.7)} 0%, transparent 70%)`,
            filter: "blur(10px)",
          }} />

          {/* Progress label */}
          <div className="relative z-10 text-center">
            <p className="text-3xl font-bold text-white" style={{ textShadow: `0 0 24px ${toRgb(glow)}` }}>
              {p.toFixed(0)}<span className="text-lg">%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Hours stats */}
      {currentHours !== undefined && targetHours !== undefined && (
        <div className="relative z-10 mt-5 text-center">
          <p className="text-sm" style={{ color: toRgba(glow, 0.8) }}>
            <span className="font-semibold text-white">{currentHours.toFixed(1)}h</span>
            <span className="mx-1 text-white/30">/</span>
            <span className="text-white/50">{targetHours}h</span>
          </p>
          {p < 100 && (
            <p className="mt-1 text-xs text-white/30">{(targetHours - currentHours).toFixed(1)}h to go</p>
          )}
          {p >= 100 && (
            <p className="mt-1 text-xs font-medium" style={{ color: toRgb(glow) }}>Dream achieved ✦</p>
          )}
        </div>
      )}
    </div>
  );
}
