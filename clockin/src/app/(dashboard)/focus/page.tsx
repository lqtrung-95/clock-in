"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { usePomodoroStore } from "@/stores/pomodoro-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { POMODORO_PRESETS } from "@/lib/constants";
import { BACKGROUND_IMAGES } from "@/data/background-images";
import { VIDEO_BACKGROUNDS } from "@/data/video-backgrounds";
import { AnimatedBackground } from "@/components/focus/animated-background";
import { Video } from "lucide-react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Volume2,
  VolumeX,
  ImageIcon,
  Maximize,
  Minimize,
  Music,
  Clock,
  Youtube,
  Headphones,
  X,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

const AMBIENT_SOUNDS = [
  { name: "Rain", src: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg", volume: 1 },
  { name: "Wind", src: "https://actions.google.com/sounds/v1/weather/wind.ogg", volume: 4 },
  { name: "Coffee", src: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg", volume: 1 },
  { name: "Thunder", src: "https://actions.google.com/sounds/v1/weather/thunder_crack.ogg", volume: 1 },
];

const YOUTUBE_SUGGESTIONS = [
  { title: "Lofi Girl - Study Beats", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", category: "Music" },
  { title: "Rain Sounds 10 Hours", url: "https://www.youtube.com/watch?v=8plwv25NYRo", category: "Nature" },
  { title: "Coffee Shop Ambience", url: "https://www.youtube.com/watch?v=7NOSDKb0HlU", category: "Ambience" },
  { title: "Deep Focus Music", url: "https://www.youtube.com/watch?v=WPni755-Krg", category: "Music" },
  { title: "Forest Sounds Birds", url: "https://www.youtube.com/watch?v=8myYyMg1fFE", category: "Nature" },
  { title: "Ocean Waves Sleep", url: "https://www.youtube.com/watch?v=1ZYbU82GVz4", category: "Nature" },
  { title: "Jazz Cafe Music", url: "https://www.youtube.com/watch?v=Dx5qFachd3A", category: "Music" },
  { title: "Fireplace Crackling", url: "https://www.youtube.com/watch?v=L_LUpnjgPso", category: "Ambience" },
  { title: "Classical Piano Focus", url: "https://www.youtube.com/watch?v=4oSfwxuvSRM", category: "Music" },
  { title: "Thunderstorm Sounds", url: "https://www.youtube.com/watch?v=nDq6TstdEi8", category: "Nature" },
  { title: "Ambient Study Music", url: "https://www.youtube.com/watch?v=5qap5aO4i9A", category: "Music" },
  { title: "Nature Sounds Forest", url: "https://www.youtube.com/watch?v=xNN7iTA57jM", category: "Nature" },
];

type AudioSource = "ambient" | "youtube";
type OverlayType = "none" | "aurora" | "particles" | "vignette" | "gradient" | "rain";

// Circular Progress Component
function CircularProgress({
  progress,
  size = 320,
  strokeWidth = 8,
  children
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 transition-all duration-500"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default function FocusPage() {
  const router = useRouter();
  const { phase, cycle, totalCycles, formatted, progress, isWork, remaining, isRunning } = usePomodoro();
  const { start, pause, resume, reset, completePhase } = usePomodoroStore();

  const [selectedPreset, setSelectedPreset] = useState<keyof typeof POMODORO_PRESETS>("25/5");
  const [background, setBackground] = useState<string>("https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [overlay, setOverlay] = useState<OverlayType>("none");
  const [selectedSound, setSelectedSound] = useState<string>("");
  const [showComplete, setShowComplete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [audioSource, setAudioSource] = useState<AudioSource>("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [youtubeSearch, setYoutubeSearch] = useState("");

  // Audio refs for ambient sound
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset pomodoro state on mount to clear any stale persisted state
  useEffect(() => {
    reset();
  }, []);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const preset = POMODORO_PRESETS[selectedPreset];

  // Parse YouTube URL to embed format
  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}` : "";
  };

  // Initialize embed when URL changes
  useEffect(() => {
    if (audioSource === "youtube" && youtubeUrl) {
      const embed = getYoutubeEmbedUrl(youtubeUrl);
      setEmbedUrl(embed);
    } else {
      setEmbedUrl("");
    }
  }, [audioSource, youtubeUrl]);

  // Initialize audio - create new Audio element each time to avoid issues
  const initAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (selectedSound) {
      const soundConfig = AMBIENT_SOUNDS.find(s => s.src === selectedSound);
      const volumeMultiplier = soundConfig?.volume || 1;
      const audio = new Audio(selectedSound);
      audio.loop = true;
      audio.volume = Math.min(volume * volumeMultiplier, 1);
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;
    }
  }, [selectedSound, volume]);

  const playAudio = useCallback(async () => {
    if (audioSource !== "ambient" || !selectedSound) return true;

    initAudio();
    if (!audioRef.current) return false;

    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setIsPlaying(true);
      return true;
    } catch (err) {
      console.error("Audio play failed:", err);
      return false;
    }
  }, [audioSource, selectedSound, initAudio]);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  // Update volume when slider changes
  useEffect(() => {
    if (audioRef.current && selectedSound) {
      const soundConfig = AMBIENT_SOUNDS.find(s => s.src === selectedSound);
      const volumeMultiplier = soundConfig?.volume || 1;
      audioRef.current.volume = Math.min(volume * volumeMultiplier, 1);
    }
  }, [volume, selectedSound]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-complete
  useEffect(() => {
    if (phase !== "idle" && remaining <= 0 && !showComplete) {
      setShowComplete(true);
      if (isWork) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success("Work session complete! Take a break.");
      } else {
        toast.info("Break over! Ready to focus?");
      }
      pauseAudio();
      completePhase();
      setShowComplete(false);
    }
  }, [remaining, phase, isWork, completePhase, showComplete, pauseAudio]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error("Fullscreen not supported");
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Track fullscreen state
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (phase === "idle") return;
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    timeout = setTimeout(() => setShowControls(false), 3000);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [phase]);



  async function handleStart() {
    start(preset.work, preset.break, 4);
    if (audioSource === "ambient" && selectedSound) {
      setAudioEnabled(true);
      const success = await playAudio();
      if (!success) {
        toast.info("Click the volume icon to enable audio");
      }
    }
    toast.success("Pomodoro started!");
  }

  function handleReset() {
    reset();
    pauseAudio();
  }

  function handlePause() {
    pause();
    pauseAudio();
  }

  async function handleResume() {
    resume();
    if (audioSource === "ambient" && selectedSound && audioEnabled) {
      await playAudio();
    }
  }

  // Active session view
  if (phase !== "idle") {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground
          imageUrl={videoUrl ? undefined : background}
          videoUrl={videoUrl || undefined}
          overlay={overlay}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Top Bar */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 transition-all duration-500",
            showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md",
              isWork ? "bg-blue-500/20 border border-blue-400/30" : "bg-orange-500/20 border border-orange-400/30"
            )}>
              {isWork ? (
                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Coffee className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              )}
              <span className={cn("font-semibold text-sm", isWork ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300")}>
                {isWork ? "Focus Time" : "Break Time"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {audioSource === "ambient" && selectedSound && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => isPlaying ? pauseAudio() : playAudio()}
                className="text-white/80 hover:text-white hover:bg-white/20"
              >
                {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Volume Slider */}
        {audioSource === "ambient" && selectedSound && isPlaying && (
          <div
            className={cn(
              "absolute top-20 right-6 z-20 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-4 py-2 border border-white/20 transition-all",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            <Volume2 className="h-4 w-4 text-white/80" />
            <Slider
              value={[volume * 100]}
              onValueChange={([v]) => setVolume(v / 100)}
              max={100}
              step={10}
              className="w-24"
            />
          </div>
        )}

        {/* Main Timer Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* Circular Timer */}
          <CircularProgress progress={progress} size={360} strokeWidth={6}>
            <div className="text-center">
              <div className="text-7xl sm:text-8xl font-mono font-bold text-white tracking-tight tabular-nums drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                {formatted}
              </div>
              <p className="mt-3 text-white text-sm font-bold bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full inline-block border border-white/20 shadow-lg">
                Cycle {cycle} of {totalCycles}
              </p>
            </div>
          </CircularProgress>

          {/* Cycle Indicators */}
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

        {/* Bottom Controls */}
        <div
          className={cn(
            "absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 transition-all duration-500",
            showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {isRunning ? (
            <Button
              variant="outline"
              size="lg"
              onClick={handlePause}
              className="rounded-full px-8 bg-card/80 backdrop-blur-md border-border text-foreground hover:bg-muted hover:text-foreground"
            >
              <Pause className="mr-2 h-5 w-5" />
              Pause
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleResume}
              className="rounded-full px-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25"
            >
              <Play className="mr-2 h-5 w-5" />
              Resume
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
            className="rounded-full px-8 bg-red-500/20 backdrop-blur-md border-red-500/30 text-red-600 dark:text-red-300 hover:bg-red-500/30 hover:text-red-700 dark:hover:text-red-200"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Stop
          </Button>
        </div>

        {/* YouTube Embed */}
        {embedUrl && (
          <div
            className={cn(
              "absolute bottom-24 left-1/2 -translate-x-1/2 z-20 transition-all",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border">
              <iframe
                src={embedUrl}
                width="320"
                height="180"
                allow="autoplay; encrypted-media"
                className="rounded-xl"
              />
              <button
                onClick={() => setEmbedUrl("")}
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Setup View
  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.05),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-6 shadow-sm">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300 font-semibold">Focus Mode</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Ready to <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">focus?</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Customize your session and dive into deep work
          </p>
        </div>

        {/* Main Card */}
        <Card className="border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
          {/* Presets */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <Clock className="h-4 w-4 text-blue-400" />
              Session Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(POMODORO_PRESETS) as Array<keyof typeof POMODORO_PRESETS>).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedPreset(key)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300 text-left group",
                    selectedPreset === key
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-border bg-muted hover:border-foreground/20 hover:bg-muted/80"
                  )}
                >
                  {selectedPreset === key && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    </div>
                  )}
                  <div className={cn(
                    "font-semibold transition-colors",
                    selectedPreset === key ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                  )}>
                    {key}
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    {POMODORO_PRESETS[key].work}m work · {POMODORO_PRESETS[key].break}m break
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Background Selection */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <ImageIcon className="h-4 w-4 text-purple-400" />
              Background
            </label>

            {/* Video Backgrounds */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Video className="h-3 w-3" />
                Videos (Live)
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {VIDEO_BACKGROUNDS.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => {
                      setVideoUrl(video.url);
                      setBackground("");
                    }}
                    className={cn(
                      "shrink-0 relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      videoUrl === video.url
                        ? "border-red-500 ring-2 ring-red-500/20"
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
              </div>
            </div>

            {/* Background Images */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Static Images</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {BACKGROUND_IMAGES.filter((b) => b.src).map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setBackground(bg.src);
                      setVideoUrl("");
                    }}
                    className={cn(
                      "shrink-0 relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      background === bg.src && !videoUrl
                        ? "border-purple-500 ring-2 ring-purple-500/20"
                        : "border-border hover:border-foreground/30"
                    )}
                  >
                    <img src={bg.src.replace('w=1920', 'w=200')} alt={bg.name} className="w-full h-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white bg-black/40">
                      {bg.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay Effects - Only for images */}
            {!videoUrl && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Effect (optional)</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: "none", name: "None" },
                    { id: "aurora", name: "Aurora" },
                    { id: "particles", name: "Stars" },
                    { id: "vignette", name: "Vignette" },
                    { id: "gradient", name: "Color" },
                    { id: "rain", name: "Rain" },
                  ].map((fx) => (
                    <button
                      key={fx.id}
                      onClick={() => setOverlay(fx.id as OverlayType)}
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
            )}
          </div>

          {/* Audio Source */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <Headphones className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              Background Sound
            </label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAudioSource("ambient")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                  audioSource === "ambient"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "border-border bg-card text-foreground/80 hover:border-foreground/30 hover:text-foreground"
                )}
              >
                <Music className="h-4 w-4" />
                Ambient
              </button>
              <button
                onClick={() => setAudioSource("youtube")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                  audioSource === "youtube"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : "border-border bg-card text-foreground/80 hover:border-foreground/30 hover:text-foreground"
                )}
              >
                <Youtube className="h-4 w-4" />
                YouTube
              </button>
            </div>

            {/* Ambient Sounds */}
            {audioSource === "ambient" && (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedSound("");
                      pauseAudio();
                    }}
                    className={cn(
                      "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
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
                      onClick={() => setSelectedSound(sound.src)}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
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
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (isPlaying) {
                          pauseAudio();
                        } else {
                          const success = await playAudio();
                          if (!success) {
                            toast.error("Audio playback blocked. Try clicking again.");
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

            {/* YouTube Input */}
            {audioSource === "youtube" && (
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Paste YouTube URL or search below..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  {youtubeUrl && (
                    <button
                      onClick={() => setYoutubeUrl("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Search suggestions..."
                    value={youtubeSearch}
                    onChange={(e) => setYoutubeSearch(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {YOUTUBE_SUGGESTIONS.filter(
                    (s) =>
                      !youtubeSearch ||
                      s.title.toLowerCase().includes(youtubeSearch.toLowerCase()) ||
                      s.category.toLowerCase().includes(youtubeSearch.toLowerCase())
                  ).slice(0, 6).map((suggestion) => (
                    <button
                      key={suggestion.url}
                      onClick={() => setYoutubeUrl(suggestion.url)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs border transition-all",
                        youtubeUrl === suggestion.url
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300"
                          : "border-border bg-muted text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      )}
                    >
                      <span className="font-medium">{suggestion.title}</span>
                      <span className="ml-2 text-foreground/30">{suggestion.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            Start Focus Session
          </Button>
        </Card>

        {/* Tips */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Brain, text: "Eliminate distractions" },
            { icon: Coffee, text: "Take breaks between sessions" },
            { icon: CheckCircle2, text: "Track your progress" },
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border">
              <tip.icon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm text-foreground/80">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
