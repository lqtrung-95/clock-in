import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Effortful - Turn effort into momentum";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#060614",
          padding: "80px 96px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Ambient orb - top left blue */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -180,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(37, 99, 235, 0.22)",
            filter: "blur(80px)",
          }}
        />
        {/* Ambient orb - bottom right cyan */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(6, 182, 212, 0.15)",
            filter: "blur(80px)",
          }}
        />
        {/* Ambient orb - center purple */}
        <div
          style={{
            position: "absolute",
            top: 100,
            right: 200,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "rgba(109, 40, 217, 0.12)",
            filter: "blur(80px)",
          }}
        />

        {/* Logo badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                background: "white",
                borderRadius: 3,
                clipPath: "polygon(50% 0%, 35% 50%, 50% 40%, 65% 90%, 50% 50%, 35% 100%, 20% 50%, 50% 60%)",
              }}
            />
          </div>
          <span
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Effortful
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Turn effort into
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              background: "linear-gradient(90deg, #60a5fa, #67e8f9, #3b82f6)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            momentum
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.55)",
            maxWidth: 680,
            lineHeight: 1.5,
          }}
        >
          AI coaching, Pomodoro timers, focus rooms, streaks, and deep analytics.
        </div>

        {/* Bottom domain badge */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 96,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 18px",
            borderRadius: 99,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>
            effortful.app
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
