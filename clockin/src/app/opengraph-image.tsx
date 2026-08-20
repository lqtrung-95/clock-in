import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Effortful - Turn effort into momentum";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static hex, not CSS vars — Satori (next/og's edge renderer) has no
// stylesheet to resolve custom properties against, so this mirrors the
// ember dark-mode palette's literal values by hand.
const features = [
  { color: "#F0A868", label: "Pomodoro Timer", desc: "25, 50 & 90 min sessions" },
  { color: "#A896B8", label: "AI Coach", desc: "Personalized insights" },
  { color: "#E89B72", label: "Streaks", desc: "Build daily consistency" },
  { color: "#7FB98A", label: "Leaderboard", desc: "Compete with friends" },
  { color: "#7FB3C0", label: "Focus Rooms", desc: "Study together, silently" },
];

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          background: "#12100F",
          padding: "44px 48px 36px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Ambient orbs */}
        <div style={{ position: "absolute", top: -140, left: -140, width: 420, height: 420, borderRadius: "50%", background: "rgba(240, 168, 104, 0.16)", filter: "blur(90px)" }} />
        <div style={{ position: "absolute", bottom: -100, right: -100, width: 380, height: 380, borderRadius: "50%", background: "rgba(127, 179, 192, 0.12)", filter: "blur(90px)" }} />

        {/* Header: Logo left, tagline right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#F0A868",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 24, height: 24, background: "white", borderRadius: 3, clipPath: "polygon(50% 0%, 35% 50%, 50% 40%, 65% 90%, 50% 50%, 35% 100%, 20% 50%, 50% 60%)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "white", fontSize: 30, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.1 }}>Effortful</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>Focus & Flow</span>
            </div>
          </div>

          {/* Tagline */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 20, fontWeight: 400 }}>Turn effort into</span>
            <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", color: "#F0A868" }}>
              momentum
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />

        {/* Bento Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
          {/* Row 1: 3 cards */}
          <div style={{ display: "flex", gap: 12, flex: 1 }}>
            {features.slice(0, 3).map((f) => (
              <div
                key={f.label}
                style={{
                  flex: 1,
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* Color dot */}
                <div style={{ width: 36, height: 36, borderRadius: 10, background: f.color + "22", border: `1px solid ${f.color}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: f.color }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ color: "white", fontSize: 17, fontWeight: 700 }}>{f.label}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: 2 wider cards */}
          <div style={{ display: "flex", gap: 12, flex: 1 }}>
            {features.slice(3).map((f, i) => (
              <div
                key={f.label}
                style={{
                  flex: i === 0 ? 1.1 : 1,
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color + "22", border: `1px solid ${f.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: f.color }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ color: "white", fontSize: 17, fontWeight: 700 }}>{f.label}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>Free to start - no credit card required</span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 15 }}>effortful.app</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
