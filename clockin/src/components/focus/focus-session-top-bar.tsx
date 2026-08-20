"use client";

import { Button } from "@/components/ui/button";
import { Brain, Coffee, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusSessionTopBarProps {
  isWork: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  videoEmbedUrl: string;
  selectedSound: string;
  isPlaying: boolean;
  videoMuted: boolean;
  onToggleFullscreen: () => void;
  onSetVideoMuted: (v: boolean) => void;
  onPlayAudio: () => void;
  onPauseAudio: () => void;
}

export function FocusSessionTopBar({
  isWork,
  isFullscreen,
  showControls,
  videoEmbedUrl,
  selectedSound,
  isPlaying,
  videoMuted,
  onToggleFullscreen,
  onSetVideoMuted,
  onPlayAudio,
  onPauseAudio,
}: FocusSessionTopBarProps) {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 transition-all duration-500",
        showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
    >
      {/* Phase badge */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md shadow-lg",
            isWork
              ? "bg-[#F0A868]/80 border border-[#F0A868]/50 shadow-[#F0A868]/20"
              : "bg-[#7FB98A]/80 border border-[#7FB98A]/50 shadow-[#7FB98A]/20"
          )}
        >
          {isWork ? (
            <Brain className="h-5 w-5 text-white drop-shadow-sm" />
          ) : (
            <Coffee className="h-5 w-5 text-white drop-shadow-sm" />
          )}
          <span className="font-bold text-sm text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] tracking-wide">
            {isWork ? "Focus Time" : "Break Time"}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {videoEmbedUrl && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSetVideoMuted(!videoMuted)}
            className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
            title={videoMuted ? "Unmute video" : "Mute video"}
          >
            {videoMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        )}
        {!videoEmbedUrl && selectedSound && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (isPlaying ? onPauseAudio() : onPlayAudio())}
            className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
          >
            {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
