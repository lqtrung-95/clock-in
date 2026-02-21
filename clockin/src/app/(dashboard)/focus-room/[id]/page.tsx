"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useAuthState } from "@/hooks/use-auth-state";
import {
  useFocusRoomParticipants,
  useFocusRoomMessages,
  useFocusRoomSession,
} from "@/hooks/use-social";
import type { FocusRoomParticipant } from "@/types/social";
import * as socialService from "@/services/social-service";
import {
  Users,
  Send,
  Play,
  Square,
  Pause,
  RotateCcw,
  Clock,
  ArrowLeft,
  Crown,
  Share2,
  PanelLeft,
  PanelRight,
  LogIn,
  MessageSquare,
  Settings2,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  X,
  Timer,
  Maximize,
  Minimize,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import { AnimatedBackground } from "@/components/focus/animated-background";
import { FocusTimerSettingsModal } from "@/components/focus/focus-timer-settings-modal";
import { useFocusTimerSettings } from "@/hooks/use-focus-timer-settings";
import { SlidersHorizontal } from "lucide-react";
import { VIDEO_BACKGROUNDS } from "@/data/video-backgrounds";
import { Card } from "@/components/ui/card";

const POMODORO_PRESETS = [
  { name: "25m", minutes: 25, label: "25 min" },
  { name: "50m", minutes: 50, label: "50 min" },
  { name: "90m", minutes: 90, label: "90 min" },
];

const OVERLAYS = [
  { value: "none", label: "None" },
  { value: "aurora", label: "Aurora" },
  { value: "particles", label: "Particles" },
  { value: "vignette", label: "Vignette" },
  { value: "gradient", label: "Gradient" },
  { value: "rain", label: "Rain" },
  { value: "fireflies", label: "Fireflies" },
  { value: "snow", label: "Snow" },
  { value: "bokeh", label: "Bokeh" },
] as const;

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function ParticipantCard({
  participant,
  isHost,
}: {
  participant: {
    user_id: string;
    user?: {
      display_name: string;
      avatar_url?: string;
    };
    is_focused: boolean;
    total_focus_seconds: number;
  };
  isHost: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
        participant.is_focused
          ? "bg-green-500/20 border border-green-500/30"
          : "bg-white/5 border border-white/10 hover:bg-white/10"
      )}
    >
      <div className="relative">
        <Avatar className="h-10 w-10 ring-2 ring-white/20">
          {participant.user?.avatar_url ? (
            <img
              src={participant.user.avatar_url}
              alt={participant.user.display_name}
              className="h-full w-full object-cover rounded-full"
              onError={(e) => {
                console.error("Avatar load error:", participant.user?.avatar_url);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-sm">
            {participant.user?.display_name?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        {isHost && (
          <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 ring-2 ring-black">
            <Crown className="h-2.5 w-2.5 text-white" />
          </div>
        )}
        {participant.is_focused && (
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full ring-2 ring-black" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white/90 truncate">
          {participant.user?.display_name || "Unknown"}
        </p>
        <p className="text-xs text-white/50">
          {participant.is_focused ? (
            <span className="text-green-400 flex items-center gap-1">
              <Play className="h-3 w-3" /> Focusing
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(participant.total_focus_seconds)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function GuestPrompt({ roomId }: { roomId: string }) {
  const router = useRouter();

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-md w-full p-8 text-center space-y-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Join Focus Room</h2>
          <p className="text-white/60">
            Sign in to join this focus room and focus together with others
          </p>
        </div>
        <div className="space-y-3">
          <Button
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0"
            onClick={() => router.push(`/login?redirect=/focus-room/${roomId}`)}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In to Join
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => router.push("/social")}
          >
            Back to Social
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FocusRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const { userId: currentUserId, isAuthenticated, isLoading: authLoading } = useAuthState();

  const { participants, activeParticipants, loading: participantsLoading } =
    useFocusRoomParticipants(roomId);
  const { messages, sendMessage } = useFocusRoomMessages(roomId);
  const {
    sessionState,
    sessionDuration,
    remainingTime,
    progress,
  } = useFocusRoomSession(roomId);

  const [messageInput, setMessageInput] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [roomHostId, setRoomHostId] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [timerSettingsOpen, setTimerSettingsOpen] = useState(false);
  const { settings: timerSettings, updateSettings: updateTimerSettings } = useFocusTimerSettings();
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);

  const [selectedDuration, setSelectedDuration] = useState(25);
  const [showSettings, setShowSettings] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState(VIDEO_BACKGROUNDS[0]);
  const [selectedOverlay, setSelectedOverlay] = useState<typeof OVERLAYS[number]["value"]>("aurora");
  const [videoMuted, setVideoMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    const init = async () => {
      try {
        const room = await socialService.getFocusRoom(roomId);
        if (room) {
          setIsHost(room.host_id === currentUserId);
          setRoomHostId(room.host_id);
          await socialService.joinFocusRoom(roomId, currentUserId);
        }
      } catch (error) {
        console.error("Error joining room:", error);
      }
    };

    init();

    return () => {
      if (currentUserId) {
        // Use leaveFocusRoomAndRemove so host leaving via navigation also deletes the room
        socialService.leaveFocusRoomAndRemove(roomId, currentUserId).catch(() => {});
      }
    };
  }, [roomId, currentUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentUserId) return;

    await sendMessage(currentUserId, messageInput.trim());
    setMessageInput("");
  };

  // Warn host before closing tab/browser — browser will show a generic confirm dialog
  useEffect(() => {
    if (!isHost) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Required for Chrome to show the dialog
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isHost]);

  const handleLeave = () => {
    if (isHost) {
      // Show confirmation dialog before deleting room
      setShowLeaveConfirm(true);
    } else {
      confirmLeave();
    }
  };

  const confirmLeave = async () => {
    setShowLeaveConfirm(false);
    if (currentUserId) {
      await socialService.leaveFocusRoomAndRemove(roomId, currentUserId);
    }
    router.push("/social");
  };

  const handleStartSession = async () => {
    if (!isHost || !currentUserId) return;
    try {
      await socialService.startFocusRoomSession(roomId, currentUserId, selectedDuration);
      toast.success(`Session started: ${selectedDuration} minutes`);
    } catch (error) {
      toast.error("Failed to start session");
      console.error(error);
    }
  };

  const handlePauseSession = async () => {
    if (!isHost || !currentUserId) return;
    try {
      await socialService.pauseFocusRoomSession(roomId, currentUserId);
      toast.success("Session paused");
    } catch (error) {
      toast.error("Failed to pause session");
      console.error(error);
    }
  };

  const handleResetSession = async () => {
    if (!isHost || !currentUserId) return;
    try {
      await socialService.resetFocusRoomSession(roomId, currentUserId);
      toast.success("Session reset");
    } catch (error) {
      toast.error("Failed to reset session");
      console.error(error);
    }
  };

  const handleCompleteSession = async () => {
    if (!isHost || !currentUserId) return;
    try {
      await socialService.completeFocusRoomSession(roomId, currentUserId);
      toast.success("Session completed!");
    } catch (error) {
      toast.error("Failed to complete session");
      console.error(error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Room link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Use synchronized session time for display
  const displayProgress = sessionState === 'idle' ? 0 : progress;
  const displayRemaining = remainingTime;

  // Wait for auth check to complete before showing the guest prompt
  // to avoid a flash of the sign-in screen for already-authenticated users
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <GuestPrompt roomId={roomId} />;
  }

  if (!currentUserId) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col relative overflow-hidden bg-slate-950 h-screen",
      isFullscreen ? "h-screen fixed inset-0 z-50" : ""
    )}>
      {/* Background Atmosphere */}
      <AnimatedBackground
        embedUrl={selectedVideo?.embedUrl}
        overlay={selectedOverlay}
        videoMuted={videoMuted}
        className="z-0"
      />

      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeave}
            className="bg-black/40 border-white/20 text-white hover:text-white hover:bg-white/20 hover:border-white/40"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Room
          </Button>
          <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10">
            <h1 className="font-bold text-white text-lg tracking-tight">Focus Room</h1>
            <p className="text-sm text-white/70 flex items-center gap-1.5 font-medium">
              <Users className="h-4 w-4 text-violet-400" />
              {activeParticipants.length} active
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
          >
            {isFullscreen ? <Minimize className="h-4 w-4 mr-2" /> : <Maximize className="h-4 w-4 mr-2" />}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all",
              showSettings && "bg-white/20 text-white"
            )}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Settings
          </Button>

          {isHost ? (
            <>
              {sessionState === 'idle' && (
                <Button
                  size="sm"
                  onClick={handleStartSession}
                  className="gap-2 px-6 bg-emerald-500/90 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                >
                  <Play className="h-4 w-4" />
                  Start Session
                </Button>
              )}
              {sessionState === 'active' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePauseSession}
                    className="bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetSession}
                    className="bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
              {sessionState === 'paused' && (
                <>
                  <Button
                    size="sm"
                    onClick={handleStartSession}
                    className="gap-2 px-6 bg-emerald-500/90 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetSession}
                    className="bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
              {(sessionState === 'active' || sessionState === 'paused') && remainingTime <= 0 && (
                <Button
                  size="sm"
                  onClick={handleCompleteSession}
                  className="gap-2 px-6 bg-violet-500/90 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                >
                  <Square className="h-4 w-4" />
                  Complete
                </Button>
              )}
            </>
          ) : (
            <div className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              sessionState === 'active' ? "bg-emerald-500/20 text-emerald-400" :
              sessionState === 'paused' ? "bg-amber-500/20 text-amber-400" :
              "bg-white/5 text-white/60"
            )}>
              {sessionState === 'active' ? 'Session Active' :
               sessionState === 'paused' ? 'Session Paused' :
               sessionState === 'completed' ? 'Session Completed' :
               'Waiting for host...'}
            </div>
          )}
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mx-6 mb-4 p-5 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Session Duration */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Next Session Duration
              </label>
              <div className="flex gap-2 flex-wrap">
                {POMODORO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      if (sessionState !== 'idle') return;
                      setSelectedDuration(preset.minutes);
                      updateTimerSettings({ workMinutes: preset.minutes });
                    }}
                    disabled={sessionState !== 'idle'}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      selectedDuration === preset.minutes
                        ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
                      sessionState !== 'idle' && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => setTimerSettingsOpen(true)}
                  disabled={sessionState !== 'idle'}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                    "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
                    sessionState !== 'idle' && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Custom
                </button>
              </div>
              {/* Show active custom duration if not a standard preset */}
              {![25, 50, 90].includes(timerSettings.workMinutes) && (
                <p className="text-xs text-cyan-400">
                  Custom: {timerSettings.workMinutes}m work · {timerSettings.shortBreakMinutes}m break
                </p>
              )}
              {sessionState !== 'idle' && (
                <p className="text-xs text-amber-400">
                  Cannot change duration while session is {sessionState}
                </p>
              )}
            </div>

            {/* Atmosphere */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Atmosphere
              </label>
              <div className="flex gap-2 flex-wrap">
                {VIDEO_BACKGROUNDS.slice(0, 4).map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm transition-all duration-200",
                      selectedVideo?.id === video.id
                        ? "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {video.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Effects */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                  Overlay
                </label>
                <button
                  onClick={() => setVideoMuted(!videoMuted)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {videoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {OVERLAYS.slice(0, 4).map((overlay) => (
                  <button
                    key={overlay.value}
                    onClick={() => setSelectedOverlay(overlay.value)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm transition-all duration-200",
                      selectedOverlay === overlay.value
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {overlay.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden z-10 px-6 pb-0 gap-6">
        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-72 flex flex-col">
            <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">
                  Participants
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-white/80">
                  {activeParticipants.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/20 hover:border-white/30"
                onClick={() => setShowParticipants(false)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-2">
                {activeParticipants.map((participant) => (
                  <ParticipantCard
                    key={participant.user_id}
                    participant={participant}
                    isHost={participant.user_id === roomHostId}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Center - Focus Timer */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Toggle buttons */}
          {!showParticipants && (
            <button
              onClick={() => setShowParticipants(true)}
              className="absolute left-0 top-1/2 -translate-y-1/2 pl-3 pr-4 py-4 rounded-r-xl bg-black/60 backdrop-blur-xl border border-l-0 border-white/20 text-white/70 hover:text-white hover:bg-black/80 hover:border-white/40 transition-all shadow-lg shadow-black/30 flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">{activeParticipants.length}</span>
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
          {!showChat && (
            <button
              onClick={() => setShowChat(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 pl-4 pr-3 py-4 rounded-l-xl bg-black/60 backdrop-blur-xl border border-r-0 border-white/20 text-white/70 hover:text-white hover:bg-black/80 hover:border-white/40 transition-all shadow-lg shadow-black/30 flex items-center gap-2"
            >
              <PanelRight className="h-4 w-4" />
              <span className="text-xs font-medium">Chat</span>
              <MessageSquare className="h-4 w-4" />
            </button>
          )}

          {/* Timer Card */}
          <div className="relative">
            {/* Glow effect */}
            <div className={cn(
              "absolute inset-0 rounded-full blur-3xl transition-all duration-1000",
              sessionState === 'active' ? "bg-emerald-500/20" : "bg-violet-500/20"
            )} />

            <div className="relative w-80 h-80 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex flex-col items-center justify-center">
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-white/5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${displayProgress * 2.89} 289`}
                  className={cn(
                    "transition-all duration-1000",
                    sessionState === 'active' ? "text-emerald-400" : "text-violet-400"
                  )}
                />
              </svg>

              {/* Inner content */}
              <div className="text-center z-10">
                <div className={cn(
                  "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-500",
                  sessionState === 'active'
                    ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20"
                    : sessionState === 'paused'
                    ? "bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/20"
                    : "bg-white/5 text-white/40"
                )}>
                  {sessionState === 'active' ? <Play className="h-8 w-8 fill-current" /> :
                   sessionState === 'paused' ? <Pause className="h-8 w-8" /> :
                   <Timer className="h-8 w-8" />}
                </div>

                <div className="text-6xl font-mono font-light tracking-wider text-white mb-2">
                  {formatTime(displayRemaining)}
                </div>

                <p className="text-white/40 text-sm">
                  {sessionState === 'active' ? "Stay focused" :
                   sessionState === 'paused' ? "Session paused" :
                   sessionState === 'completed' ? "Session completed" :
                   `${selectedDuration} minute session`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-8 flex items-center gap-6 text-white/40 text-sm">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {sessionDuration} min
            </span>
            <span className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {selectedVideo?.name}
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {activeParticipants.length} active
            </span>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 flex flex-col">
            <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-fuchsia-400" />
                <h3 className="text-sm font-semibold text-white">
                  Room Chat
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/20 hover:border-white/30"
                onClick={() => setShowChat(false)}
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        "text-sm",
                        msg.message_type === "system"
                          ? "text-center text-xs text-white/30 py-2"
                          : "text-white/80"
                      )}
                    >
                      {msg.message_type !== "system" && (
                        <span className="text-violet-400 font-medium">
                          {msg.user?.display_name}:
                        </span>
                      )}{" "}
                      {msg.message}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2">
                <Input
                  placeholder="Send a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!messageInput.trim()}
                  className="bg-violet-500 hover:bg-violet-600 text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Timer settings modal */}
      <FocusTimerSettingsModal
        open={timerSettingsOpen}
        onClose={() => setTimerSettingsOpen(false)}
        settings={timerSettings}
        onSave={(updates) => {
          updateTimerSettings(updates);
          if (updates.workMinutes) setSelectedDuration(updates.workMinutes);
        }}
      />

      {/* Host leave confirmation dialog */}
      <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <DialogContent className="border border-border bg-card max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Delete this room?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-1">
              As the host, leaving will permanently delete this room and end the current focus session for all participants.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowLeaveConfirm(false)}
              className="flex-1 border-border text-foreground hover:bg-muted"
            >
              Stay
            </Button>
            <Button
              onClick={confirmLeave}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
            >
              Delete &amp; Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
