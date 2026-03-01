"use client";

import { Button } from "@/components/ui/button";
import { BACKGROUND_IMAGES } from "@/data/background-images";
import { VIDEO_BACKGROUNDS } from "@/data/video-backgrounds";
import { AMBIENT_SOUNDS } from "@/hooks/use-focus-audio";
import type { CustomVideo } from "@/hooks/use-focus-custom-videos";
import { type OverlayType } from "@/components/focus/focus-session-overlay-controls";
import { Plus, Trash2, Video, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusSetupAtmosphereProps {
  background: string;
  videoEmbedUrl: string;
  overlay: OverlayType;
  selectedSound: string;
  isPlaying: boolean;
  customVideos: CustomVideo[];
  onSetBackground: (src: string) => void;
  onSetVideoEmbedUrl: (url: string) => void;
  onSetOverlay: (v: OverlayType) => void;
  onSetSelectedSound: (src: string) => void;
  onPlayAudio: () => Promise<boolean>;
  onPauseAudio: () => void;
  onAddVideoClick: () => void;
  onDeleteCustomVideo: (id: string) => void;
}

const OVERLAY_OPTIONS = [
  { id: "none", name: "None" },
  { id: "aurora", name: "Aurora" },
  { id: "particles", name: "Particles" },
  { id: "vignette", name: "Vignette" },
  { id: "rain", name: "Rain" },
  { id: "fireflies", name: "Fireflies" },
  { id: "snow", name: "Snow" },
  { id: "bokeh", name: "Bokeh" },
] as const;

export function FocusSetupAtmosphere({
  background, videoEmbedUrl, overlay, selectedSound, isPlaying, customVideos,
  onSetBackground, onSetVideoEmbedUrl, onSetOverlay, onSetSelectedSound,
  onPlayAudio, onPauseAudio, onAddVideoClick, onDeleteCustomVideo,
}: FocusSetupAtmosphereProps) {
  return (
    <div className="mb-8">
      {/* Video Scenes */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Video className="h-3 w-3" />
          Ambient Scenes
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {VIDEO_BACKGROUNDS.map((video) => (
            <button
              key={video.id}
              onClick={() => { onSetVideoEmbedUrl(video.embedUrl); onSetBackground(""); onSetOverlay("none"); onSetSelectedSound(""); onPauseAudio(); }}
              className={cn(
                "shrink-0 relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all",
                videoEmbedUrl === video.embedUrl
                  ? "border-purple-500 ring-2 ring-purple-500/20"
                  : "border-border hover:border-foreground/30"
              )}
            >
              <img src={video.thumbnail} alt={video.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-white bg-black/60 px-1 rounded truncate">
                {video.name}
              </span>
            </button>
          ))}

          {/* Custom Videos */}
          {customVideos.map((video) => (
            <div
              key={video.id}
              className={cn(
                "shrink-0 relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all",
                videoEmbedUrl === video.embedUrl
                  ? "border-purple-500 ring-2 ring-purple-500/20"
                  : "border-border hover:border-foreground/30"
              )}
            >
              <button
                onClick={() => { onSetVideoEmbedUrl(video.embedUrl); onSetBackground(""); onSetOverlay("none"); onSetSelectedSound(""); onPauseAudio(); }}
                className="absolute inset-0 w-full h-full"
              >
                <img src={video.thumbnail} alt={video.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-white bg-black/60 px-1 rounded truncate">
                  {video.name}
                </span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteCustomVideo(video.id); }}
                className="absolute top-0.5 right-0.5 z-10 w-4 h-4 rounded-full bg-red-500/80 hover:bg-red-600 flex items-center justify-center"
              >
                <Trash2 className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}

          {/* Add Video Button */}
          <button
            onClick={onAddVideoClick}
            className="shrink-0 relative w-24 h-16 rounded-lg overflow-hidden border-2 border-dashed border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center gap-1"
          >
            <Plus className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Add Video</span>
          </button>
        </div>
      </div>

      {/* Static Scenes */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Static Scenes</p>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-3">
          {BACKGROUND_IMAGES.filter((b) => b.src).map((bg) => (
            <button
              key={bg.id}
              onClick={() => { onSetBackground(bg.src); onSetVideoEmbedUrl(""); }}
              className={cn(
                "shrink-0 relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all",
                background === bg.src && !videoEmbedUrl
                  ? "border-purple-500 ring-2 ring-purple-500/20"
                  : "border-border hover:border-foreground/30"
              )}
            >
              <img src={bg.src.replace("w=1920", "w=200")} alt={bg.name} className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white bg-black/40">
                {bg.name}
              </span>
            </button>
          ))}
        </div>

        {/* Overlay Effects */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">Overlay</p>
          <div className="flex gap-2 flex-wrap">
            {OVERLAY_OPTIONS.map((fx) => (
              <button
                key={fx.id}
                onClick={() => onSetOverlay(fx.id as OverlayType)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all",
                  overlay === fx.id
                    ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-300"
                    : "border-border bg-card text-foreground/80 hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {fx.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ambient Sound — only for static images */}
        {!videoEmbedUrl && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Sound</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { onSetSelectedSound(""); onPauseAudio(); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all",
                  !selectedSound
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "border-border bg-card text-foreground/80 hover:border-foreground/30"
                )}
              >
                None
              </button>
              {AMBIENT_SOUNDS.map((sound) => (
                <button
                  key={sound.name}
                  onClick={() => onSetSelectedSound(sound.src)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all",
                    selectedSound === sound.src
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      : "border-border bg-card text-foreground/80 hover:border-foreground/30"
                  )}
                >
                  {sound.name}
                </button>
              ))}
            </div>
            {selectedSound && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (isPlaying) {
                      onPauseAudio();
                    } else {
                      const success = await onPlayAudio();
                      if (!success) {
                        // toast handled inside hook
                      }
                    }
                  }}
                  className="gap-2 border-border bg-card text-foreground/80 hover:bg-muted hover:text-foreground"
                >
                  {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {isPlaying ? "Stop Test" : "Test Sound"}
                </Button>
                <span className="text-xs text-foreground/60">
                  {isPlaying ? "Playing..." : "Click to preview"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
