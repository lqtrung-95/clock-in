"use client";

import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type OverlayType = "none" | "aurora" | "particles" | "vignette" | "gradient" | "rain" | "fireflies" | "snow" | "bokeh";

const OVERLAY_OPTIONS: OverlayType[] = ["none", "aurora", "particles", "vignette", "rain", "fireflies", "snow", "bokeh"];

interface FocusSessionOverlayControlsProps {
  showControls: boolean;
  videoEmbedUrl: string;
  selectedSound: string;
  isPlaying: boolean;
  volume: number;
  bgOpacity: number;
  overlay: OverlayType;
  onVolumeChange: (v: number) => void;
  onBgOpacityChange: (v: number) => void;
  onOverlayChange: (v: OverlayType) => void;
}

export function FocusSessionOverlayControls({
  showControls,
  videoEmbedUrl,
  selectedSound,
  isPlaying,
  volume,
  bgOpacity,
  overlay,
  onVolumeChange,
  onBgOpacityChange,
  onOverlayChange,
}: FocusSessionOverlayControlsProps) {
  return (
    <>
      {/* Ambient sound volume slider — right side, only for static images with sound */}
      {!videoEmbedUrl && selectedSound && isPlaying && (
        <div
          className={cn(
            "absolute top-20 right-6 z-20 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-4 py-2 border border-white/20 transition-all",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <Volume2 className="h-4 w-4 text-white/80" />
          <Slider
            value={[volume * 100]}
            onValueChange={([v]) => onVolumeChange(v / 100)}
            max={100}
            step={10}
            className="w-24"
          />
        </div>
      )}

      {/* Brightness + overlay FX panel — left side */}
      <div
        className={cn(
          "absolute top-20 left-6 z-20 flex flex-col gap-2 rounded-xl bg-black/60 backdrop-blur-md px-3 py-2 border border-white/20 transition-all",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Brightness</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Dark</span>
            <Slider
              value={[bgOpacity]}
              onValueChange={([v]) => onBgOpacityChange(v)}
              max={90}
              min={10}
              step={5}
              className="w-20"
            />
            <span className="text-xs text-white/40">Light</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Overlay</span>
          <div className="flex gap-1.5 flex-wrap">
            {OVERLAY_OPTIONS.map((fx) => (
              <button
                key={fx}
                onClick={() => onOverlayChange(fx)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs transition-all duration-200 capitalize",
                  overlay === fx
                    ? "bg-[#F0A868] text-[#12100F] shadow-lg shadow-[#F0A868]/30"
                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                )}
              >
                {fx === "none" ? "None" : fx.charAt(0).toUpperCase() + fx.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export type { OverlayType };
