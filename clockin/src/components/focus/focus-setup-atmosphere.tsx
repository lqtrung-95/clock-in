"use client";

import { Button } from "@/components/ui/button";
import { BACKGROUND_IMAGES } from "@/data/background-images";
import { VIDEO_BACKGROUNDS } from "@/data/video-backgrounds";
import { AMBIENT_SOUNDS } from "@/hooks/use-focus-audio";
import type { CustomVideo } from "@/hooks/use-focus-custom-videos";
import { type OverlayType } from "@/components/focus/focus-session-overlay-controls";
import { Plus, Sparkles, Trash2, Video, Volume2, VolumeX } from "lucide-react";
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

// Deliberately dark regardless of page theme — this panel is previewing the
// user's actual (also-dark) session background, the same rationale as the
// landing page's focus-session device preview.
const chip = (active: boolean) =>
  cn(
    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
    active ? "border-[#F0A868] bg-[#F0A868]/15 text-[#F0A868]" : "border-white/10 text-[#F5EDE3]/60 hover:border-white/25 hover:text-[#F5EDE3]"
  );

export function FocusSetupAtmosphere({
  background, videoEmbedUrl, overlay, selectedSound, isPlaying, customVideos,
  onSetBackground, onSetVideoEmbedUrl, onSetOverlay, onSetSelectedSound,
  onPlayAudio, onPauseAudio, onAddVideoClick, onDeleteCustomVideo,
}: FocusSetupAtmosphereProps) {
  return (
    <div className="relative flex h-full flex-col gap-5 overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#2b1a0f,#120b06)]" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 30% 15%, rgba(240,168,104,0.16), transparent 55%)" }}
      />

      <div className="relative">
        <span className="text-label flex items-center gap-1.5 text-[#F5EDE3]/55">
          <Sparkles className="h-3.5 w-3.5" />
          Atmosphere
        </span>
      </div>

      {/* Video scenes */}
      <div className="relative">
        <p className="mb-2 flex items-center gap-1 text-xs text-[#F5EDE3]/55">
          <Video className="h-3 w-3" />
          Ambient scenes
        </p>
        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-1">
          {VIDEO_BACKGROUNDS.map((video) => (
            <button
              key={video.id}
              onClick={() => { onSetVideoEmbedUrl(video.embedUrl); onSetBackground(""); onSetOverlay("none"); onSetSelectedSound(""); onPauseAudio(); }}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border-2 transition-colors",
                videoEmbedUrl === video.embedUrl ? "border-[#F0A868]" : "border-white/10 hover:border-white/25"
              )}
            >
              <img src={video.thumbnail} alt={video.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <svg className="ml-0.5 h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <span className="absolute right-1 bottom-1 left-1 truncate rounded bg-black/60 px-1 text-[10px] font-medium text-white">
                {video.name}
              </span>
            </button>
          ))}

          {customVideos.map((video) => (
            <div
              key={video.id}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border-2 transition-colors",
                videoEmbedUrl === video.embedUrl ? "border-[#F0A868]" : "border-white/10 hover:border-white/25"
              )}
            >
              <button
                onClick={() => { onSetVideoEmbedUrl(video.embedUrl); onSetBackground(""); onSetOverlay("none"); onSetSelectedSound(""); onPauseAudio(); }}
                className="absolute inset-0 h-full w-full"
              >
                <img src={video.thumbnail} alt={video.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <svg className="ml-0.5 h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <span className="absolute right-1 bottom-1 left-1 truncate rounded bg-black/60 px-1 text-[10px] font-medium text-white">
                  {video.name}
                </span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteCustomVideo(video.id); }}
                className="absolute top-0.5 right-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-danger/80 hover:bg-danger"
              >
                <Trash2 className="h-2.5 w-2.5 text-white" />
              </button>
            </div>
          ))}

          <button
            onClick={onAddVideoClick}
            className="flex h-16 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed border-white/15 transition-colors hover:border-[#F0A868]/50 hover:bg-[#F0A868]/5"
          >
            <Plus className="h-4 w-4 text-[#F5EDE3]/50" />
            <span className="text-[10px] font-medium text-[#F5EDE3]/50">Add video</span>
          </button>
        </div>
      </div>

      {/* Static scenes */}
      <div className="relative">
        <p className="mb-2 text-xs text-[#F5EDE3]/55">Static scenes</p>
        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-1">
          {BACKGROUND_IMAGES.filter((b) => b.src).map((bg) => (
            <button
              key={bg.id}
              onClick={() => { onSetBackground(bg.src); onSetVideoEmbedUrl(""); }}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border-2 transition-colors",
                background === bg.src && !videoEmbedUrl ? "border-[#F0A868]" : "border-white/10 hover:border-white/25"
              )}
            >
              <img src={bg.src.replace("w=1920", "w=200")} alt={bg.name} className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
                {bg.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay effects */}
      <div className="relative">
        <p className="mb-2 text-xs text-[#F5EDE3]/55">Overlay</p>
        <div className="flex flex-wrap gap-2">
          {OVERLAY_OPTIONS.map((fx) => (
            <button key={fx.id} onClick={() => onSetOverlay(fx.id as OverlayType)} className={chip(overlay === fx.id)}>
              {fx.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ambient sound — only for static images */}
      {!videoEmbedUrl && (
        <div className="relative flex flex-col gap-2">
          <p className="text-xs text-[#F5EDE3]/55">Sound</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { onSetSelectedSound(""); onPauseAudio(); }} className={chip(!selectedSound)}>
              None
            </button>
            {AMBIENT_SOUNDS.map((sound) => (
              <button key={sound.name} onClick={() => onSetSelectedSound(sound.src)} className={chip(selectedSound === sound.src)}>
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
                  if (isPlaying) onPauseAudio();
                  else await onPlayAudio();
                }}
                className="gap-2 border-white/15 bg-transparent text-[#F5EDE3]/70 hover:bg-white/5 hover:text-[#F5EDE3]"
              >
                {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isPlaying ? "Stop test" : "Test sound"}
              </Button>
              <span className="text-xs text-[#F5EDE3]/45">{isPlaying ? "Playing…" : "Click to preview"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
