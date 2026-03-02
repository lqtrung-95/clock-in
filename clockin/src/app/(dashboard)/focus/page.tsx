"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { usePomodoroStore } from "@/stores/pomodoro-store";
import { useFocusAudio } from "@/hooks/use-focus-audio";
import { useFocusFullscreen } from "@/hooks/use-focus-fullscreen";
import { useFocusCustomVideos } from "@/hooks/use-focus-custom-videos";
import { useFocusTimerSettings, type FocusTimerSettings } from "@/hooks/use-focus-timer-settings";
import { useFocusNotifications } from "@/hooks/use-focus-notifications";
import { useDreamGoal } from "@/hooks/use-dream-goal";
import { useAuthState } from "@/hooks/use-auth-state";
import { timeEntryService } from "@/services/time-entry-service";
import { trackFocusTime } from "@/services/gamification-service";
import { createClient } from "@/lib/supabase/client";
import { guestStorage } from "@/lib/guest-storage";
import { POMODORO_PRESETS } from "@/lib/constants";
import { FocusSessionView } from "@/components/focus/focus-session-view";
import { FocusSetupView } from "@/components/focus/focus-setup-view";
import { type OverlayType } from "@/components/focus/focus-session-overlay-controls";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import type { Category } from "@/types/timer";

export default function FocusPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { phase, cycle, totalCycles, formatted, progress, isWork, remaining, isComplete, isRunning } = usePomodoro();
  const { start, pause, resume, reset, completePhase } = usePomodoroStore();
  const { settings: timerSettings, updateSettings: updateTimerSettings, playAlarm } = useFocusTimerSettings();

  // Atmosphere state
  const [background, setBackground] = useState("https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80");
  const [videoEmbedUrl, setVideoEmbedUrl] = useState("");
  const [overlay, setOverlay] = useState<OverlayType>("none");
  const [bgOpacity, setBgOpacity] = useState(50);
  const [videoMuted, setVideoMuted] = useState(false);

  // Session state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof POMODORO_PRESETS | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState<"break" | "work" | null>(null);
  const [timerSettingsOpen, setTimerSettingsOpen] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [aiCatSuggesting, setAiCatSuggesting] = useState(false);
  const aiCatDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auth & categories
  const { isAuthenticated, userId, isLoading: authLoading } = useAuthState();
  const { addProgress } = useDreamGoal(userId);

  // Extracted hooks
  const [selectedSound, setSelectedSound] = useState("");
  const { volume, setVolume, isPlaying, audioEnabled, setAudioEnabled, playAudio, pauseAudio } = useFocusAudio(selectedSound);
  const { isFullscreen, showControls, toggleFullscreen } = useFocusFullscreen(phase, waitingForNext);
  const customVideoHook = useFocusCustomVideos(videoEmbedUrl, setVideoEmbedUrl);
  const { notify } = useFocusNotifications();

  // Derived preset
  const effectivePreset = selectedPreset ?? (
    (Object.keys(POMODORO_PRESETS) as Array<keyof typeof POMODORO_PRESETS>).find(
      (k) => POMODORO_PRESETS[k].work === timerSettings.workMinutes && POMODORO_PRESETS[k].break === timerSettings.shortBreakMinutes
    ) ?? null
  );

  // Reset on mount
  useEffect(() => { reset(); }, []);

  // Keyboard shortcuts during active session: Space = pause/resume, R = stop
  useEffect(() => {
    if (phase === "idle") return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        isRunning ? pause() : resume();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        reset(); pauseAudio(); setWaitingForNext(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, isRunning, pause, resume, reset, pauseAudio]);

  // Warn before closing/refreshing tab mid-session
  useEffect(() => {
    if (phase === "idle") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  // Load saved preset preference
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
      if (preset && preset in POMODORO_PRESETS) setSelectedPreset(preset);
    });
  }, [isAuthenticated]);

  // Load categories (shared TanStack Query cache)
  const { data: queriedCategories = [] } = useQuery({
    queryKey: ["categories", userId],
    queryFn: async () => {
      if (isAuthenticated && userId) {
        const supabase = createClient();
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", userId)
          .eq("is_archived", false)
          .order("name");
        return data ?? [];
      }
      return guestStorage.getCategories();
    },
    enabled: !authLoading,
    staleTime: 1000 * 60 * 5,
  });


  // Save completed work session to database / localStorage
  const saveTimeEntry = useCallback(async () => {
    if (!selectedCategory) return;
    const workDuration = timerSettings.workMinutes * 60;
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
          notes: `Focus session (${selectedPreset ?? `${timerSettings.workMinutes}m`})`,
        });
        await trackFocusTime(user.id, Math.floor(workDuration / 60));
        const hoursCompleted = workDuration / 3600;
        const milestoneReached = await addProgress(hoursCompleted);
        if (milestoneReached) toast.success("🎉 Milestone reached in your Dream Goal!");
        // Refresh dashboard stats so streak & totals update immediately
        queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
        toast.success("Time tracked successfully!");
      } catch (error) {
        console.error("Failed to save time entry:", error);
        toast.error("Failed to save time entry");
      }
    } else {
      guestStorage.addEntry({
        category_id: selectedCategory,
        started_at: startedAt.toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: workDuration,
        notes: `Focus session (${selectedPreset ?? `${timerSettings.workMinutes}m`})`,
        entry_type: "manual",
      });
      const hoursCompleted = workDuration / 3600;
      const milestoneReached = await addProgress(hoursCompleted);
      if (milestoneReached) toast.success("🎉 Milestone reached in your Dream Goal!");
      toast.success("Time saved locally!");
    }
  }, [selectedCategory, timerSettings.workMinutes, selectedPreset, isAuthenticated, userId, addProgress, queryClient]);

  // Auto-complete: advance phase or wait for user confirmation
  useEffect(() => {
    if (!isComplete || showComplete) return;
    setShowComplete(true);
    playAlarm();
    pauseAudio();
    if (isWork) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success("Work session complete! Take a break.");
      notify("Focus session complete! 🎉", "Time for a well-deserved break.");
      saveTimeEntry();
      timerSettings.autoStartBreak ? completePhase() : setWaitingForNext("break");
    } else {
      toast.info("Break over! Ready to focus?");
      notify("Break over! ☕", "Ready to get back to it?");
      timerSettings.autoStartWork ? completePhase() : setWaitingForNext("work");
    }
    setShowComplete(false);
  }, [isComplete, isWork, completePhase, showComplete, pauseAudio, saveTimeEntry, playAlarm, timerSettings.autoStartBreak, timerSettings.autoStartWork]);

  // Repeat alarm every 5s while waiting for user to start next phase
  useEffect(() => {
    if (!waitingForNext || !timerSettings.alarmRepeat) {
      if (alarmIntervalRef.current) { clearInterval(alarmIntervalRef.current); alarmIntervalRef.current = null; }
      return;
    }
    alarmIntervalRef.current = setInterval(() => playAlarm(), 5000);
    return () => { if (alarmIntervalRef.current) { clearInterval(alarmIntervalRef.current); alarmIntervalRef.current = null; } };
  }, [waitingForNext, timerSettings.alarmRepeat, playAlarm]);

  // Handlers
  function handleTimerSettingsSave(updates: Partial<FocusTimerSettings>) {
    updateTimerSettings(updates);
    const newWork = updates.workMinutes ?? timerSettings.workMinutes;
    const newBreak = updates.shortBreakMinutes ?? timerSettings.shortBreakMinutes;
    const matched = (Object.keys(POMODORO_PRESETS) as Array<keyof typeof POMODORO_PRESETS>).find(
      (k) => POMODORO_PRESETS[k].work === newWork && POMODORO_PRESETS[k].break === newBreak
    );
    setSelectedPreset(matched ?? null);
  }

  async function handlePresetSelect(key: keyof typeof POMODORO_PRESETS) {
    setSelectedPreset(key);
    updateTimerSettings({ workMinutes: POMODORO_PRESETS[key].work, shortBreakMinutes: POMODORO_PRESETS[key].break });
    if (isAuthenticated) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_preferences").upsert(
          { user_id: user.id, pomodoro_preset: key } as never,
          { onConflict: "user_id" }
        );
      }
    }
  }

  async function handleStart() {
    if (!selectedCategory) { toast.error("Please select what you're working on first!"); return; }
    start(timerSettings.workMinutes, timerSettings.shortBreakMinutes, timerSettings.longBreakInterval);
    if (selectedSound) {
      setAudioEnabled(true);
      const success = await playAudio();
      if (!success) toast.info("Click the volume icon to enable audio");
    }
    toast.success("Focus session started!");
  }

  async function handleStartNextPhase() {
    setWaitingForNext(null);
    completePhase();
    if (selectedSound && audioEnabled) await playAudio();
  }

  function handleReset() { reset(); pauseAudio(); setWaitingForNext(null); }
  function handlePause() { pause(); pauseAudio(); }
  async function handleResume() { resume(); if (selectedSound && audioEnabled) await playAudio(); }

  function handleTaskDescriptionChange(text: string) {
    setTaskDescription(text);
    if (aiCatDebounceRef.current) clearTimeout(aiCatDebounceRef.current);
    if (!text.trim() || !isAuthenticated) return;
    aiCatDebounceRef.current = setTimeout(async () => {
      setAiCatSuggesting(true);
      try {
        const res = await fetch("/api/ai/suggest-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        const data = await res.json() as { categoryId: string | null };
        if (data.categoryId) setSelectedCategory(data.categoryId);
      } catch { /* ignore */ }
      finally { setAiCatSuggesting(false); }
    }, 800);
  }

  // Active session view
  if (phase !== "idle") {
    return (
      <FocusSessionView
        phase={phase} cycle={cycle} totalCycles={totalCycles} formatted={formatted}
        progress={progress} isWork={isWork} isRunning={isRunning}
        showComplete={showComplete} waitingForNext={waitingForNext}
        background={background} videoEmbedUrl={videoEmbedUrl} overlay={overlay}
        videoMuted={videoMuted} bgOpacity={bgOpacity}
        selectedSound={selectedSound} isPlaying={isPlaying} volume={volume}
        isFullscreen={isFullscreen} showControls={showControls}
        timerSettingsOpen={timerSettingsOpen} timerSettings={timerSettings}
        onPause={handlePause} onResume={handleResume} onReset={handleReset}
        onStartNextPhase={handleStartNextPhase} onToggleFullscreen={toggleFullscreen}
        onSetVideoMuted={setVideoMuted} onVolumeChange={setVolume}
        onPlayAudio={playAudio} onPauseAudio={pauseAudio}
        onSetOverlay={setOverlay} onSetBgOpacity={setBgOpacity}
        onOpenTimerSettings={() => setTimerSettingsOpen(true)}
        onCloseTimerSettings={() => setTimerSettingsOpen(false)}
        onSaveTimerSettings={handleTimerSettingsSave}
      />
    );
  }

  // Setup view
  return (
    <FocusSetupView
      timerSettings={timerSettings} effectivePreset={effectivePreset}
      timerSettingsOpen={timerSettingsOpen}
      background={background} videoEmbedUrl={videoEmbedUrl} overlay={overlay}
      selectedSound={selectedSound} isPlaying={isPlaying}
      customVideos={customVideoHook.customVideos}
      showAddVideoDialog={customVideoHook.showAddVideoDialog}
      newVideoUrl={customVideoHook.newVideoUrl}
      newVideoTitle={customVideoHook.newVideoTitle}
      selectedCategory={selectedCategory} categories={queriedCategories as unknown as Category[]}
      isAuthenticated={!!isAuthenticated} taskDescription={taskDescription}
      aiCatSuggesting={aiCatSuggesting}
      onPresetSelect={handlePresetSelect}
      onOpenTimerSettings={() => setTimerSettingsOpen(true)}
      onCloseTimerSettings={() => setTimerSettingsOpen(false)}
      onSaveTimerSettings={handleTimerSettingsSave}
      onSetBackground={setBackground} onSetVideoEmbedUrl={setVideoEmbedUrl}
      onSetOverlay={setOverlay} onSetSelectedSound={setSelectedSound}
      onPlayAudio={playAudio} onPauseAudio={pauseAudio}
      onAddVideoClick={() => customVideoHook.setShowAddVideoDialog(true)}
      onDeleteCustomVideo={customVideoHook.handleDeleteCustomVideo}
      onSetShowAddVideoDialog={customVideoHook.setShowAddVideoDialog}
      onNewVideoUrlChange={customVideoHook.setNewVideoUrl}
      onNewVideoTitleChange={customVideoHook.setNewVideoTitle}
      onAddCustomVideo={customVideoHook.handleAddCustomVideo}
      onSetSelectedCategory={setSelectedCategory}
      onTaskDescriptionChange={handleTaskDescriptionChange}
      onApplyAiSuggestion={(categoryName, duration) => {
        const cat = (queriedCategories as unknown as Category[]).find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
        if (cat) setSelectedCategory(cat.id);
        const preset = (Object.keys(POMODORO_PRESETS) as Array<keyof typeof POMODORO_PRESETS>).find(
          (k) => POMODORO_PRESETS[k].work === duration
        );
        if (preset) {
          setSelectedPreset(preset);
          updateTimerSettings({ workMinutes: POMODORO_PRESETS[preset].work, shortBreakMinutes: POMODORO_PRESETS[preset].break });
        } else {
          updateTimerSettings({ workMinutes: duration });
          setSelectedPreset(null);
        }
      }}
      onStart={handleStart}
      onNavigateToCategories={() => router.push("/categories")}
    />
  );
}
