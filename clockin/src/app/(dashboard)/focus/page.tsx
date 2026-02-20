"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { usePomodoroStore } from "@/stores/pomodoro-store";
import { useCategoryStore } from "@/stores/category-store";
import { timeEntryService } from "@/services/time-entry-service";
import { trackFocusTime } from "@/services/gamification-service";
import { useDreamGoal } from "@/hooks/use-dream-goal";
import { useAuthState } from "@/hooks/use-auth-state";
import { createClient } from "@/lib/supabase/client";
import { guestStorage } from "@/lib/guest-storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { POMODORO_PRESETS } from "@/lib/constants";
import { BACKGROUND_IMAGES } from "@/data/background-images";
import { VIDEO_BACKGROUNDS } from "@/data/video-backgrounds";
import { AnimatedBackground } from "@/components/focus/animated-background";
import { DreamCrystal } from "@/components/focus/dream-crystal";
import { Video, Plus, Trash2 } from "lucide-react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Clock,
  Sparkles,
  CheckCircle2,
  Tag,
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

  const [selectedPreset, setSelectedPreset] = useState<keyof typeof POMODORO_PRESETS | null>(null);
  const [background, setBackground] = useState<string>("https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80");
  const [videoEmbedUrl, setVideoEmbedUrl] = useState<string>("");
  const [overlay, setOverlay] = useState<OverlayType>("none");
  const [selectedSound, setSelectedSound] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showComplete, setShowComplete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoMuted, setVideoMuted] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(50); // 0-100, default 50%

  // Custom videos
  const [customVideos, setCustomVideos] = useState<{ id: string; name: string; embedUrl: string; thumbnail: string }[]>([]);
  const [showAddVideoDialog, setShowAddVideoDialog] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");

  // Category and auth
  const { categories, setCategories } = useCategoryStore();
  const { isAuthenticated } = useAuthState();
  const [userId, setUserId] = useState<string | null>(null);
  const { addProgress } = useDreamGoal(userId);

  // Audio refs for ambient sound
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset pomodoro state on mount to clear any stale persisted state
  useEffect(() => {
    reset();
  }, []);

  // Load saved pomodoro preset from user preferences
  useEffect(() => {
    if (!isAuthenticated) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("pomodoro_preset")
        .eq("user_id", data.user.id)
        .single();
      const preset = (prefs as { pomodoro_preset?: string } | null)?.pomodoro_preset as keyof typeof POMODORO_PRESETS | undefined;
      if (preset && preset in POMODORO_PRESETS) {
        setSelectedPreset(preset);
      }
    });
  }, [isAuthenticated]);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Load custom videos from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("customFocusVideos");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomVideos(parsed);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      if (isAuthenticated) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_archived", false)
            .order("name");
          if (data) setCategories(data);
        }
      } else {
        const cats = guestStorage.getCategories();
        setCategories(cats as unknown as typeof categories);
      }
    }
    loadCategories();
  }, [isAuthenticated]);

  // Set userId for dream goal tracking
  useEffect(() => {
    if (isAuthenticated) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUserId(data.user?.id || "guest");
      });
    } else {
      setUserId("guest");
    }
  }, [isAuthenticated]);

  const preset = POMODORO_PRESETS[selectedPreset ?? "25/5"];

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
    if (!selectedSound) return true;

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
  }, [selectedSound, initAudio]);

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

  // Save time entry helper
  const saveTimeEntry = useCallback(async () => {
    if (!selectedCategory) return;

    const workDuration = preset.work * 60; // convert minutes to seconds
    const startedAt = new Date(Date.now() - workDuration * 1000);

    if (isAuthenticated) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        await timeEntryService.createManualEntry({
          user_id: user.id,
          category_id: selectedCategory,
          started_at: startedAt.toISOString(),
          ended_at: new Date().toISOString(),
          duration_seconds: workDuration,
          notes: `Focus session (${selectedPreset})`,
        });

        // Track XP for the focus session
        await trackFocusTime(user.id, Math.floor(workDuration / 60));

        // Track dream goal progress
        const hoursCompleted = workDuration / 3600;
        const milestoneReached = await addProgress(hoursCompleted);
        if (milestoneReached) {
          toast.success("🎉 Milestone reached in your Dream Goal!");
        }

        toast.success("Time tracked successfully!");
      } catch (error) {
        console.error("Failed to save time entry:", error);
        toast.error("Failed to save time entry");
      }
    } else {
      // Guest mode - save to localStorage
      guestStorage.addEntry({
        category_id: selectedCategory,
        started_at: startedAt.toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: workDuration,
        notes: `Focus session (${selectedPreset})`,
        entry_type: "manual",
      });

      // Track dream goal progress for guests
      const hoursCompleted = workDuration / 3600;
      const milestoneReached = await addProgress(hoursCompleted);
      if (milestoneReached) {
        toast.success("🎉 Milestone reached in your Dream Goal!");
      }

      toast.success("Time saved locally!");
    }
  }, [selectedCategory, preset.work, selectedPreset, isAuthenticated]);

  // Auto-complete
  useEffect(() => {
    if (phase !== "idle" && remaining <= 0 && !showComplete) {
      setShowComplete(true);
      if (isWork) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success("Work session complete! Take a break.");
        // Save time entry for work session
        saveTimeEntry();
      } else {
        toast.info("Break over! Ready to focus?");
      }
      pauseAudio();
      completePhase();
      setShowComplete(false);
    }
  }, [remaining, phase, isWork, completePhase, showComplete, pauseAudio, saveTimeEntry]);

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
    if (!selectedCategory) {
      toast.error("Please select what you're working on first!");
      return;
    }
    start(preset.work, preset.break, 4);
    if (selectedSound) {
      setAudioEnabled(true);
      const success = await playAudio();
      if (!success) {
        toast.info("Click the volume icon to enable audio");
      }
    }
    toast.success("Focus session started!");
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
    if (selectedSound && audioEnabled) {
      await playAudio();
    }
  }

  // Helper to extract YouTube video ID from various URL formats
  function extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
      /youtube\.com\/watch\?.*v=([^&\s]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  function handleAddCustomVideo() {
    const videoId = extractYouTubeId(newVideoUrl);
    if (!videoId) {
      toast.error("Invalid YouTube URL");
      return;
    }
    if (!newVideoTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    const newVideo = {
      id: `custom-${Date.now()}`,
      name: newVideoTitle.trim(),
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    };
    const updated = [...customVideos, newVideo];
    setCustomVideos(updated);
    localStorage.setItem("customFocusVideos", JSON.stringify(updated));
    setNewVideoUrl("");
    setNewVideoTitle("");
    setShowAddVideoDialog(false);
    toast.success("Video added");
  }

  function handleDeleteCustomVideo(id: string) {
    const updated = customVideos.filter((v) => v.id !== id);
    setCustomVideos(updated);
    localStorage.setItem("customFocusVideos", JSON.stringify(updated));
    if (videoEmbedUrl && customVideos.find((v) => v.id === id)?.embedUrl === videoEmbedUrl) {
      setVideoEmbedUrl("");
    }
    toast.success("Video removed");
  }

  // Active session view
  if (phase !== "idle") {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground
          imageUrl={videoEmbedUrl ? undefined : background}
          embedUrl={videoEmbedUrl || undefined}
          overlay={overlay}
          videoMuted={videoMuted}
          isRunning={isRunning}
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black via-black to-black transition-opacity duration-300"
          style={{ opacity: bgOpacity / 100 }}
        />

        {/* Top Bar */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 transition-all duration-500",
            showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-md shadow-lg",
              isWork
                ? "bg-gradient-to-r from-blue-600/80 to-cyan-600/80 border border-blue-400/50 shadow-blue-500/20"
                : "bg-gradient-to-r from-orange-600/80 to-amber-600/80 border border-orange-400/50 shadow-orange-500/20"
            )}>
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

          <div className="flex items-center gap-2">
            {/* Video mute button - only for video backgrounds */}
            {videoEmbedUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setVideoMuted(!videoMuted)}
                className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                title={videoMuted ? "Unmute video" : "Mute video"}
              >
                {videoMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            )}
            {/* Ambient sound button - only for static images with sound */}
            {!videoEmbedUrl && selectedSound && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => isPlaying ? pauseAudio() : playAudio()}
                className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
              >
                {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Volume Slider - only for ambient sound */}
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
              onValueChange={([v]) => setVolume(v / 100)}
              max={100}
              step={10}
              className="w-24"
            />
          </div>
        )}

        {/* Background Brightness Control */}
        <div
          className={cn(
            "absolute top-20 left-6 z-20 flex flex-col gap-1 rounded-xl bg-black/60 backdrop-blur-md px-3 py-2 border border-white/20 transition-all",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Brightness</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Dark</span>
            <Slider
              value={[bgOpacity]}
              onValueChange={([v]) => setBgOpacity(v)}
              max={90}
              min={10}
              step={5}
              className="w-20"
            />
            <span className="text-xs text-white/40">Light</span>
          </div>
        </div>

        {/* Main Timer Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* 3D Dream Crystal Visualization */}
          <div className="relative w-[360px] h-[360px] sm:w-[420px] sm:h-[420px]">
            <DreamCrystal
              progress={progress}
              phase={phase}
              cycle={cycle}
              totalCycles={totalCycles}
              isComplete={showComplete}
              className="absolute inset-0"
            />

            {/* Timer overlay on crystal */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-6xl sm:text-7xl font-mono font-bold text-white tracking-tight tabular-nums drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {formatted}
              </div>
              <p className="mt-2 text-white/90 text-sm font-bold bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full inline-block border border-white/20 shadow-lg">
                Cycle {cycle} of {totalCycles}
              </p>
            </div>
          </div>

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
            "absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 transition-all duration-500",
            showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {isRunning ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              className="h-10 px-5 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/40 text-white font-medium text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/20 hover:border-white/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105 transition-all duration-300 gap-2"
            >
              <Pause className="h-4 w-4 fill-current" />
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleResume}
              className="h-10 px-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium text-sm shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] hover:scale-105 transition-all duration-300 border-0 gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              Resume
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-10 px-5 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-red-400/50 text-white font-medium text-sm shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:from-red-500/30 hover:to-orange-500/30 hover:border-red-400/70 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-105 transition-all duration-300 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Stop
          </Button>
        </div>

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

          {/* Category Selection */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <Tag className="h-4 w-4 text-emerald-400" />
              What are you working on?
            </label>
            {categories.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2",
                      selectedCategory === cat.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "border-border bg-card text-foreground/80 hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    {cat.color && (
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    {cat.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No categories yet. {" "}
                <button
                  onClick={() => router.push("/categories")}
                  className="text-blue-500 hover:underline"
                >
                  Create one
                </button>
              </div>
            )}
          </div>

          {/* Atmosphere */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Atmosphere
            </label>

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
                    onClick={() => {
                      setVideoEmbedUrl(video.embedUrl);
                      setBackground("");
                      setOverlay("none");
                      setSelectedSound("");
                      pauseAudio();
                    }}
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
                  /* Wrapper div — keeps select button and delete button as siblings (no nested buttons) */
                  <div
                    key={video.id}
                    className={cn(
                      "shrink-0 relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      videoEmbedUrl === video.embedUrl
                        ? "border-purple-500 ring-2 ring-purple-500/20"
                        : "border-border hover:border-foreground/30"
                    )}
                  >
                    {/* Select button covers the full card */}
                    <button
                      onClick={() => {
                        setVideoEmbedUrl(video.embedUrl);
                        setBackground("");
                        setOverlay("none");
                        setSelectedSound("");
                        pauseAudio();
                      }}
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
                    {/* Delete button — sibling, not child of select button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomVideo(video.id);
                      }}
                      className="absolute top-0.5 right-0.5 z-10 w-4 h-4 rounded-full bg-red-500/80 hover:bg-red-600 flex items-center justify-center"
                    >
                      <Trash2 className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
                {/* Add Video Button */}
                <button
                  onClick={() => setShowAddVideoDialog(true)}
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
                    onClick={() => {
                      setBackground(bg.src);
                      setVideoEmbedUrl("");
                    }}
                    className={cn(
                      "shrink-0 relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      background === bg.src && !videoEmbedUrl
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

              {/* Effects - Only for static */}
              {!videoEmbedUrl && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {[
                    { id: "none", name: "None" },
                    { id: "aurora", name: "Aurora" },
                    { id: "particles", name: "Stars" },
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
              )}

              {/* Ambient Sound - Only for static images */}
              {!videoEmbedUrl && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Sound</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedSound("");
                        pauseAudio();
                      }}
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
                        onClick={() => setSelectedSound(sound.src)}
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
                            pauseAudio();
                          } else {
                            const success = await playAudio();
                            if (!success) {
                              toast.error("Audio playback blocked. Try clicking again.");
                            }
                          }
                        }
                      }
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

          {/* Start Button */}
          <Button
            onClick={handleStart}
            disabled={!selectedCategory || !selectedPreset}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            {!selectedPreset ? "Select a session duration" : !selectedCategory ? "Select a category to start" : "Start Focus Session"}
          </Button>
        </Card>

        {/* Add Custom Video Dialog */}
        <Dialog open={showAddVideoDialog} onOpenChange={setShowAddVideoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Custom Video</DialogTitle>
              <DialogDescription>
                Paste a YouTube URL and give it a name.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube URL</label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="My Video"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddVideoDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomVideo}>Add Video</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
