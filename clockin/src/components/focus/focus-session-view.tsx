"use client";

import { AnimatedBackground } from "@/components/focus/animated-background";
import { DreamCrystal } from "@/components/focus/dream-crystal";
import { FocusSessionTopBar } from "@/components/focus/focus-session-top-bar";
import { FocusSessionOverlayControls, type OverlayType } from "@/components/focus/focus-session-overlay-controls";
import { FocusTimerSettingsModal } from "@/components/focus/focus-timer-settings-modal";
import { Button } from "@/components/ui/button";
import { type FocusTimerSettings } from "@/hooks/use-focus-timer-settings";
import { Play, Pause, RotateCcw, Coffee, Brain, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusSessionViewProps {
  // Pomodoro state
  phase: "idle" | "work" | "break";
  cycle: number;
  totalCycles: number;
  formatted: string;
  progress: number;
  isWork: boolean;
  isRunning: boolean;
  showComplete: boolean;
  waitingForNext: "break" | "work" | null;
  // Background / atmosphere
  background: string;
  videoEmbedUrl: string;
  overlay: OverlayType;
  videoMuted: boolean;
  bgOpacity: number;
  // Audio
  selectedSound: string;
  isPlaying: boolean;
  volume: number;
  // UI state
  isFullscreen: boolean;
  showControls: boolean;
  timerSettingsOpen: boolean;
  timerSettings: FocusTimerSettings;
  // Handlers
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStartNextPhase: () => void;
  onToggleFullscreen: () => void;
  onSetVideoMuted: (v: boolean) => void;
  onVolumeChange: (v: number) => void;
  onPlayAudio: () => void;
  onPauseAudio: () => void;
  onSetOverlay: (v: OverlayType) => void;
  onSetBgOpacity: (v: number) => void;
  onOpenTimerSettings: () => void;
  onCloseTimerSettings: () => void;
  onSaveTimerSettings: (updates: Partial<FocusTimerSettings>) => void;
}

export function FocusSessionView({
  phase, cycle, totalCycles, formatted, progress, isWork, isRunning,
  showComplete, waitingForNext,
  background, videoEmbedUrl, overlay, videoMuted, bgOpacity,
  selectedSound, isPlaying, volume,
  isFullscreen, showControls, timerSettingsOpen, timerSettings,
  onPause, onResume, onReset, onStartNextPhase, onToggleFullscreen,
  onSetVideoMuted, onVolumeChange, onPlayAudio, onPauseAudio,
  onSetOverlay, onSetBgOpacity, onOpenTimerSettings, onCloseTimerSettings, onSaveTimerSettings,
}: FocusSessionViewProps) {
  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <AnimatedBackground
          imageUrl={videoEmbedUrl ? undefined : background}
          embedUrl={videoEmbedUrl || undefined}
          overlay={overlay}
          videoMuted={videoMuted}
          isRunning={isRunning}
        />
        {/* Dim overlay for brightness control */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black via-black to-black transition-opacity duration-300"
          style={{ opacity: bgOpacity / 100 }}
        />

        <FocusSessionTopBar
          isWork={isWork}
          isFullscreen={isFullscreen}
          showControls={showControls}
          videoEmbedUrl={videoEmbedUrl}
          selectedSound={selectedSound}
          isPlaying={isPlaying}
          videoMuted={videoMuted}
          onToggleFullscreen={onToggleFullscreen}
          onSetVideoMuted={onSetVideoMuted}
          onPlayAudio={onPlayAudio}
          onPauseAudio={onPauseAudio}
        />

        <FocusSessionOverlayControls
          showControls={showControls}
          videoEmbedUrl={videoEmbedUrl}
          selectedSound={selectedSound}
          isPlaying={isPlaying}
          volume={volume}
          bgOpacity={bgOpacity}
          overlay={overlay}
          onVolumeChange={onVolumeChange}
          onBgOpacityChange={onSetBgOpacity}
          onOverlayChange={onSetOverlay}
        />

        {/* Main timer content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="relative w-[360px] h-[360px] sm:w-[420px] sm:h-[420px]">
            <DreamCrystal
              progress={progress}
              phase={phase}
              cycle={cycle}
              totalCycles={totalCycles}
              isComplete={showComplete}
              className="absolute inset-0"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-6xl sm:text-7xl font-mono font-bold text-white tracking-tight tabular-nums drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {formatted}
              </div>
              <p className="mt-2 text-white/90 text-sm font-bold bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full inline-block border border-white/20 shadow-lg">
                Cycle {cycle} of {totalCycles}
              </p>
            </div>
          </div>

          {/* Cycle progress indicators */}
          <div className="mt-8 flex items-center gap-2">
            {Array.from({ length: totalCycles }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300 shadow-sm",
                  i < cycle
                    ? "w-8 bg-gradient-to-r from-blue-500 to-cyan-400 shadow-blue-500/30"
                    : i === cycle - 1
                    ? "w-8 bg-white/50 animate-pulse shadow-white/20"
                    : "w-2.5 bg-white/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Manual phase transition overlay */}
        {waitingForNext && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center space-y-6 px-6">
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
                  waitingForNext === "break"
                    ? "bg-orange-500/20 border border-orange-400/50 text-orange-300"
                    : "bg-blue-500/20 border border-blue-400/50 text-blue-300"
                )}
              >
                {waitingForNext === "break" ? <Coffee className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                {waitingForNext === "break" ? "Work session complete!" : "Break over!"}
              </div>
              <p className="text-white/70 text-sm">
                {waitingForNext === "break" ? "Ready for a break?" : "Ready to get back to it?"}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <Button
                  onClick={onStartNextPhase}
                  className={cn(
                    "h-12 px-8 rounded-full font-semibold text-white border-0 cursor-pointer",
                    waitingForNext === "break"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_24px_rgba(249,115,22,0.5)]"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_0_24px_rgba(59,130,246,0.5)]"
                  )}
                >
                  {waitingForNext === "break" ? "Start Break" : "Start Next Session"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={onReset}
                  className="h-12 px-6 rounded-full text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  End Session
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom playback controls */}
        <div
          className={cn(
            "absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 transition-all duration-500",
            showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {isRunning ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              className="h-10 px-5 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/40 text-white font-medium text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/20 hover:border-white/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105 transition-all duration-300 gap-2"
            >
              <Pause className="h-4 w-4 fill-current" />
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onResume}
              className="h-10 px-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium text-sm shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] hover:scale-105 transition-all duration-300 border-0 gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              Resume
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-10 px-5 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-red-400/50 text-white font-medium text-sm shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:from-red-500/30 hover:to-orange-500/30 hover:border-red-400/70 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-105 transition-all duration-300 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Stop
          </Button>
          <button
            onClick={onOpenTimerSettings}
            className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white flex items-center justify-center hover:bg-white/20 hover:border-white/50 transition-all duration-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <FocusTimerSettingsModal
        open={timerSettingsOpen}
        onClose={onCloseTimerSettings}
        settings={timerSettings}
        onSave={onSaveTimerSettings}
      />
    </>
  );
}
