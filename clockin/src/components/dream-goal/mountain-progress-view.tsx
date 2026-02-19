"use client";

import { memo } from "react";

// ---------- Helpers ----------
type RGB = [number, number, number];

function pickStop(stops: RGB[], t: number): RGB {
  const max = stops.length - 1;
  const raw = t * max;
  const idx = Math.min(max - 1, Math.floor(raw));
  const f = raw - idx;
  return [
    stops[idx][0] + (stops[idx + 1][0] - stops[idx][0]) * f,
    stops[idx][1] + (stops[idx + 1][1] - stops[idx][1]) * f,
    stops[idx][2] + (stops[idx + 1][2] - stops[idx][2]) * f,
  ];
}
const rgb  = ([r, g, b]: RGB) => `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
const rgba = ([r, g, b]: RGB, a: number) =>
  `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;

// ---------- Scene constants ----------
// 16:9 viewBox so the scene never clips on widescreen monitors
const VW = 1200, VH = 675;
const STAR_X = VW / 2,  STAR_Y  = 100;  // destination star (safe from top edge)
const EARTH_X = VW / 2, EARTH_Y = 575;  // launch point (safe from bottom edge)
const TRAVEL_H = EARTH_Y - STAR_Y;      // 475px total travel

// Milestone positions along the path (Y coordinates)
const MILESTONES: { pct: number; y: number }[] = [
  { pct: 25, y: EARTH_Y - TRAVEL_H * 0.25 },
  { pct: 50, y: EARTH_Y - TRAVEL_H * 0.50 },
  { pct: 75, y: EARTH_Y - TRAVEL_H * 0.75 },
];

// Destination star color: dim amber → brilliant white-gold
const STAR_RAMP: RGB[] = [
  [160, 120,  55],
  [210, 175,  90],
  [255, 220, 130],
  [255, 248, 195],
];

// Deterministic star field spread across full 16:9 canvas
const STARS = Array.from({ length: 140 }, (_, i) => ({
  x: (i * 137.508) % VW,
  y: ((i * 73.21)  % 1) * VH,
  r: 0.35 + (i % 5) * 0.28,
  o: 0.25 + (i % 7) * 0.11,
}));

function getLabel(p: number): string {
  if (p < 5)  return "Launch sequence initiated";
  if (p < 25) return "Leaving the atmosphere";
  if (p < 50) return "Deep space journey underway";
  if (p < 75) return "Your destination is in sight";
  if (p < 95) return "The star is within reach";
  return "Dream achieved ✦";
}

// ---------- Rocket SVG (points upward, centered at 0,0) ----------
function Rocket({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#glow5)">
      {/* Exhaust flame */}
      <ellipse cx={0} cy={19} rx={5} ry={11} fill="url(#flame)" />
      {/* Left fin */}
      <path d="M -7,7 L -15,18 L -7,12 Z" fill="#94a3b8" />
      {/* Right fin */}
      <path d="M  7,7 L  15,18 L  7,12 Z" fill="#94a3b8" />
      {/* Body */}
      <rect x={-7} y={-10} width={14} height={20} rx={4} fill="white" />
      {/* Nose cone */}
      <path d="M 0,-22 L -7,-10 L 7,-10 Z" fill="#e2e8f0" />
      {/* Porthole window */}
      <circle cx={0} cy={-2} r={4} fill="#bae6fd" stroke="#7dd3fc" strokeWidth={1} />
    </g>
  );
}

// ---------- Component ----------
interface MountainProgressViewProps {
  progress: number;
  currentHours: number;
  targetHours: number;
  title: string;
  onClose: () => void;
}

export const MountainProgressView = memo(function MountainProgressView({
  progress, currentHours, targetHours, title, onClose,
}: MountainProgressViewProps) {
  const p = Math.max(0, Math.min(100, progress));
  const t = p / 100;

  const starCol   = pickStop(STAR_RAMP, t);
  const hoursLeft = Math.max(0, targetHours - currentHours);

  // Rocket travels from near-Earth to near-Star
  const rocketY = EARTH_Y - TRAVEL_H * t;

  // Star grows brighter and larger with progress
  const starR     = 14 + t * 20;
  const starGlowA = 0.18 + t * 0.42;
  const starGlowR = 45 + t * 100;

  return (
    <div className="fixed inset-0 z-[9999]" style={{ background: "#020a1a", margin: '0 !important' }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="absolute inset-0 h-full w-full" style={{ maxHeight: "calc(100% - 80px)" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Destination star glow */}
          <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={rgb(starCol)} stopOpacity={starGlowA} />
            <stop offset="50%"  stopColor={rgb(starCol)} stopOpacity={starGlowA * 0.25} />
            <stop offset="100%" stopColor={rgb(starCol)} stopOpacity={0} />
          </radialGradient>
          {/* Earth sphere */}
          <radialGradient id="earth" cx="38%" cy="32%" r="65%">
            <stop offset="0%"   stopColor="#60a5fa" />
            <stop offset="55%"  stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#172554" />
          </radialGradient>
          {/* Rocket exhaust flame */}
          <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#fbbf24" stopOpacity={0.95} />
            <stop offset="55%"  stopColor="#f97316" stopOpacity={0.65} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          {/* Gold trail fading toward Earth */}
          <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#fbbf24" stopOpacity={0} />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.55 + t * 0.25} />
          </linearGradient>
          <filter id="glow5">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="blur22"><feGaussianBlur stdDeviation="22" /></filter>
          <filter id="blur7"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>

        {/* Background stars */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
        ))}

        {/* Destination star — outermost wide ambient glow */}
        <circle cx={STAR_X} cy={STAR_Y} r={starGlowR}
          fill="url(#star-glow)" filter="url(#blur22)" />
        {/* Mid glow ring */}
        <circle cx={STAR_X} cy={STAR_Y} r={starGlowR * 0.45}
          fill="url(#star-glow)" filter="url(#blur22)" opacity={0.7} />

        {/* 4-pointed sparkle: long cardinal rays (N/S/E/W) tapering to points */}
        <g transform={`translate(${STAR_X}, ${STAR_Y})`} opacity={0.72 + t * 0.28}>
          {/* Long cross ray — a thin lozenge pointing N/S */}
          <path
            d={`M 0,${-(starR * 3.2)} L ${starR * 0.28},0 L 0,${starR * 3.2} L ${-(starR * 0.28)},0 Z`}
            fill={rgb(starCol)}
            filter="url(#glow5)"
          />
          {/* Long cross ray — E/W */}
          <path
            d={`M ${-(starR * 3.2)},0 L 0,${starR * 0.28} L ${starR * 3.2},0 L 0,${-(starR * 0.28)} Z`}
            fill={rgb(starCol)}
            filter="url(#glow5)"
          />
          {/* Short diagonal rays (45°) — smaller lozenge, rotated 45° */}
          <path
            d={`M 0,${-(starR * 1.7)} L ${starR * 0.18},0 L 0,${starR * 1.7} L ${-(starR * 0.18)},0 Z`}
            fill={rgba(starCol, 0.55)}
            transform="rotate(45)"
            filter="url(#glow5)"
          />
          {/* Inner glowing core circle */}
          <circle r={starR * 0.85} fill={rgb(starCol)} />
          {/* Bright centre specular */}
          <circle r={starR * 0.42} fill="white" opacity={0.5 + t * 0.4} />
        </g>

        {/* GOAL label — slightly larger, sits below the sparkle */}
        <text x={STAR_X} y={STAR_Y + starR * 3.5} textAnchor="middle"
          fill={rgba(starCol, 0.85)} fontSize="12" fontFamily="system-ui"
          fontWeight="700" letterSpacing="0.16em">
          GOAL
        </text>

        {/* Dotted travel path */}
        <line x1={STAR_X} y1={STAR_Y + starR * 3.6} x2={EARTH_X} y2={EARTH_Y - 26}
          stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="4 9" />

        {/* Gold trail from rocket back toward Earth */}
        {t > 0.01 && (
          <line x1={EARTH_X} y1={EARTH_Y - 26}
            x2={EARTH_X} y2={rocketY + 22}
            stroke="url(#trail)" strokeWidth={2.5} />
        )}

        {/* Milestone markers */}
        {MILESTONES.map(({ pct, y }) => {
          const reached = p >= pct;
          return (
            <g key={pct}>
              <line x1={STAR_X - 44} y1={y} x2={STAR_X + 44} y2={y}
                stroke={reached ? rgba(starCol, 0.65) : "rgba(255,255,255,0.18)"}
                strokeWidth={1} strokeDasharray="3 6"
              />
              <text x={STAR_X + 52} y={y + 4}
                fill={reached ? rgba(starCol, 0.85) : "rgba(255,255,255,0.3)"}
                fontSize="11" fontFamily="system-ui" fontWeight={reached ? "600" : "400"}>
                {pct}%
              </text>
              {reached && (
                <circle cx={STAR_X - 52} cy={y} r={3.5}
                  fill={rgba(starCol, 0.95)} filter="url(#glow5)" />
              )}
            </g>
          );
        })}

        {/* Rocket */}
        <Rocket x={EARTH_X} y={rocketY} />

        {/* Earth — soft outer atmosphere + solid sphere */}
        <circle cx={EARTH_X} cy={EARTH_Y} r={30}
          fill="url(#earth)" filter="url(#blur7)" opacity={0.55} />
        <circle cx={EARTH_X} cy={EARTH_Y} r={22} fill="url(#earth)" />
        <circle cx={EARTH_X} cy={EARTH_Y} r={26}
          fill="none" stroke="rgba(96,165,250,0.28)" strokeWidth={5} />

        {/* START label */}
        <text x={EARTH_X} y={EARTH_Y + 40} textAnchor="middle"
          fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="system-ui"
          fontWeight="700" letterSpacing="0.12em">
          START
        </text>
      </svg>

      {/* Bottom info panel */}
      <div className="absolute inset-x-0 bottom-0 px-8 py-5 backdrop-blur-md"
        style={{ background: "rgba(2,8,22,0.72)" }}>
        <div className="mx-auto flex max-w-xl items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Dream Goal</p>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="mt-0.5 text-sm text-white/55">{getLabel(p)}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {p.toFixed(1)}<span className="text-base font-normal text-white/50">%</span>
            </p>
            <p className="text-sm text-white/50">{currentHours.toFixed(1)}h / {targetHours}h</p>
            {p < 100 && <p className="text-xs text-white/35">{hoursLeft.toFixed(1)}h to go</p>}
          </div>
        </div>
      </div>

      <button onClick={onClose}
        className="absolute right-5 top-5 rounded-full bg-black/35 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition hover:bg-black/55">
        Close
      </button>
    </div>
  );
});
