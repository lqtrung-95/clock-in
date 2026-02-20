"use client";

import { useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  imageUrl?: string;
  embedUrl?: string;
  overlay?: "none" | "aurora" | "particles" | "vignette" | "gradient" | "rain";
  className?: string;
  videoMuted?: boolean;
  isRunning?: boolean;
}

// Aurora Overlay - flowing lights on top of image/video
function AuroraOverlay() {
  return (
    <>
      <div className="aurora-overlay-1 absolute -inset-[100%] opacity-40 mix-blend-screen" />
      <div className="aurora-overlay-2 absolute -inset-[100%] opacity-30 mix-blend-screen" />
      <div className="aurora-overlay-3 absolute -inset-[100%] opacity-35 mix-blend-screen" />

      <style jsx>{`
        .aurora-overlay-1 {
          background: radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.4) 0%, transparent 50%);
          animation: aurora1 12s ease-in-out infinite;
        }
        .aurora-overlay-2 {
          background: radial-gradient(ellipse at 30% 70%, rgba(139, 92, 246, 0.4) 0%, transparent 50%);
          animation: aurora2 15s ease-in-out infinite;
        }
        .aurora-overlay-3 {
          background: radial-gradient(ellipse at 70% 30%, rgba(6, 182, 212, 0.4) 0%, transparent 50%);
          animation: aurora3 18s ease-in-out infinite;
        }
        @keyframes aurora1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10%, -10%) rotate(120deg); }
          66% { transform: translate(-10%, 5%) rotate(240deg); }
        }
        @keyframes aurora2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-15%, 10%) rotate(-120deg); }
          66% { transform: translate(5%, -15%) rotate(-240deg); }
        }
        @keyframes aurora3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10%, 15%) rotate(120deg); }
          66% { transform: translate(-15%, -5%) rotate(240deg); }
        }
      `}</style>
    </>
  );
}

// Floating Particles Overlay
function ParticlesOverlay() {
  return (
    <>
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="particle-overlay absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.4})`,
            boxShadow: `0 0 ${Math.random() * 6 + 4}px rgba(255, 255, 255, 0.5)`,
            animationDuration: `${Math.random() * 15 + 10}s`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}

      <style jsx>{`
        .particle-overlay {
          animation: float-particle linear infinite;
        }
        @keyframes float-particle {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

// Animated Vignette - darkens edges with pulsing
function VignetteOverlay() {
  return (
    <>
      <div className="vignette-overlay absolute inset-0" />
      <style jsx>{`
        .vignette-overlay {
          background: radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.6) 100%);
          animation: vignette-pulse 8s ease-in-out infinite;
        }
        @keyframes vignette-pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </>
  );
}

// Animated Color Gradient Overlay
function GradientOverlay() {
  return (
    <>
      <div className="gradient-overlay absolute inset-0" />
      <style jsx>{`
        .gradient-overlay {
          background: linear-gradient(
            135deg,
            rgba(56, 189, 248, 0.15) 0%,
            transparent 25%,
            rgba(139, 92, 246, 0.15) 50%,
            transparent 75%,
            rgba(6, 182, 212, 0.15) 100%
          );
          animation: gradient-shift 15s ease-in-out infinite;
          mix-blend-mode: overlay;
        }
        @keyframes gradient-shift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translate(5%, 5%) scale(1.05);
            opacity: 0.8;
          }
          50% {
            transform: translate(0, 10%) scale(1);
            opacity: 0.6;
          }
          75% {
            transform: translate(-5%, 5%) scale(1.05);
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
}

// Rain Effect Overlay
function RainOverlay() {
  return (
    <>
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="rain-drop absolute w-px bg-gradient-to-b from-transparent via-white/40 to-transparent"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            height: `${Math.random() * 20 + 10}px`,
            animationDuration: `${Math.random() * 0.5 + 0.3}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <style jsx>{`
        .rain-drop {
          animation: rain-fall linear infinite;
        }
        @keyframes rain-fall {
          0% {
            transform: translateY(-100px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

// Base Image with Ken Burns Effect
function BaseImage({ url }: { url: string }) {
  return (
    <>
      <div
        className="base-image absolute inset-[-10%] bg-cover bg-center"
        style={{
          backgroundImage: `url(${url})`,
          animation: "ken-burns 25s ease-in-out infinite alternate",
        }}
      />
      <style jsx>{`
        @keyframes ken-burns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.08) translate(-1%, -1%);
          }
        }
      `}</style>
    </>
  );
}

// YouTube Background Component - uses postMessage to control playback/mute without re-mounting
function VideoBackground({ embedUrl, muted = true, isRunning = true }: { embedUrl: string; muted?: boolean; isRunning?: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ensure enablejsapi=1 is in the URL so postMessage commands work
  const url = useMemo(() => {
    if (embedUrl.includes('enablejsapi')) return embedUrl;
    return embedUrl.includes('?') ? `${embedUrl}&enablejsapi=1` : `${embedUrl}?enablejsapi=1`;
  }, [embedUrl]);

  const postCommand = (func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: '' }),
      '*'
    );
  };

  // Control mute without re-mounting the iframe
  useEffect(() => {
    postCommand(muted ? 'mute' : 'unMute');
  }, [muted]);

  // Pause/resume video when timer state changes
  useEffect(() => {
    postCommand(isRunning ? 'playVideo' : 'pauseVideo');
  }, [isRunning]);

  return (
    <div className="absolute inset-0">
      <iframe
        ref={iframeRef}
        src={url}
        className="absolute inset-0 h-full w-full"
        style={{
          position: 'absolute',
          top: '-60px',
          left: 0,
          width: '100vw',
          height: 'calc(100vh + 120px)',
          pointerEvents: 'none',
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function AnimatedBackground({ imageUrl, embedUrl, overlay = "none", className, videoMuted = true, isRunning = true }: AnimatedBackgroundProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Base Layer - Image or YouTube Embed */}
      {embedUrl ? (
        <VideoBackground embedUrl={embedUrl} muted={videoMuted} isRunning={isRunning} />
      ) : imageUrl ? (
        <BaseImage url={imageUrl} />
      ) : null}

      {/* Animation Overlay Layer */}
      {overlay === "aurora" && <AuroraOverlay />}
      {overlay === "particles" && <ParticlesOverlay />}
      {overlay === "vignette" && <VignetteOverlay />}
      {overlay === "gradient" && <GradientOverlay />}
      {overlay === "rain" && <RainOverlay />}
    </div>
  );
}
