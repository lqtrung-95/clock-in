"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FocusSetupAtmosphere } from "@/components/focus/focus-setup-atmosphere";
import { FocusAddVideoDialog } from "@/components/focus/focus-add-video-dialog";
import { FocusTimerSettingsModal } from "@/components/focus/focus-timer-settings-modal";
import { AiSessionSuggestion } from "@/components/ai/ai-session-suggestion";
import { FocusOnboardingCoachmark } from "@/components/focus/focus-onboarding-coachmark";
import { POMODORO_PRESETS } from "@/lib/constants";
import { type FocusTimerSettings } from "@/hooks/use-focus-timer-settings";
import { type CustomVideo } from "@/hooks/use-focus-custom-videos";
import { type OverlayType } from "@/components/focus/focus-session-overlay-controls";
import type { Category } from "@/types/timer";
import {
  Brain, CheckCircle2, Clock, Coffee, Play, SlidersHorizontal, Sparkles, Tag, Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusSetupViewProps {
  // Timer
  timerSettings: FocusTimerSettings;
  effectivePreset: keyof typeof POMODORO_PRESETS | null;
  timerSettingsOpen: boolean;
  // Atmosphere
  background: string;
  videoEmbedUrl: string;
  overlay: OverlayType;
  selectedSound: string;
  isPlaying: boolean;
  customVideos: CustomVideo[];
  // Add video dialog
  showAddVideoDialog: boolean;
  newVideoUrl: string;
  newVideoTitle: string;
  // Category
  selectedCategory: string;
  categories: Category[];
  isAuthenticated: boolean;
  isPro: boolean;
  taskDescription: string;
  aiCatSuggesting: boolean;
  // Handlers
  onPresetSelect: (key: keyof typeof POMODORO_PRESETS) => Promise<void>;
  onOpenTimerSettings: () => void;
  onCloseTimerSettings: () => void;
  onSaveTimerSettings: (updates: Partial<FocusTimerSettings>) => void;
  onSetBackground: (src: string) => void;
  onSetVideoEmbedUrl: (url: string) => void;
  onSetOverlay: (v: OverlayType) => void;
  onSetSelectedSound: (src: string) => void;
  onPlayAudio: () => Promise<boolean>;
  onPauseAudio: () => void;
  onAddVideoClick: () => void;
  onDeleteCustomVideo: (id: string) => void;
  onSetShowAddVideoDialog: (open: boolean) => void;
  onNewVideoUrlChange: (url: string) => void;
  onNewVideoTitleChange: (title: string) => void;
  onAddCustomVideo: () => void;
  onSetSelectedCategory: (id: string) => void;
  onTaskDescriptionChange: (text: string) => void;
  onApplyAiSuggestion: (categoryName: string, duration: number) => void;
  onStart: () => void;
  onNavigateToCategories: () => void;
}

export function FocusSetupView({
  timerSettings, effectivePreset, timerSettingsOpen,
  background, videoEmbedUrl, overlay, selectedSound, isPlaying, customVideos,
  showAddVideoDialog, newVideoUrl, newVideoTitle,
  selectedCategory, categories, isAuthenticated, isPro, taskDescription, aiCatSuggesting,
  onPresetSelect, onOpenTimerSettings, onCloseTimerSettings, onSaveTimerSettings,
  onSetBackground, onSetVideoEmbedUrl, onSetOverlay, onSetSelectedSound,
  onPlayAudio, onPauseAudio, onAddVideoClick, onDeleteCustomVideo,
  onSetShowAddVideoDialog, onNewVideoUrlChange, onNewVideoTitleChange, onAddCustomVideo,
  onSetSelectedCategory, onTaskDescriptionChange, onApplyAiSuggestion,
  onStart, onNavigateToCategories,
}: FocusSetupViewProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Background pattern */}
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
            Ready to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">focus?</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Customize your session and dive into deep work
          </p>
        </div>

        <Card className="border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
          {isPro && (
            <AiSessionSuggestion
              isAuthenticated={!!isAuthenticated}
              onApply={onApplyAiSuggestion}
            />
          )}

          {/* Preset picker */}
          <div id="coachmark-preset" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="h-4 w-4 text-blue-400" />
                Session Duration
              </label>
              <button
                onClick={onOpenTimerSettings}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Customize
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(POMODORO_PRESETS) as Array<keyof typeof POMODORO_PRESETS>).map((key) => (
                <button
                  key={key}
                  onClick={() => onPresetSelect(key)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300 text-left group",
                    effectivePreset === key
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-border bg-muted hover:border-foreground/20 hover:bg-muted/80"
                  )}
                >
                  {effectivePreset === key && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    </div>
                  )}
                  <div className={cn("font-semibold transition-colors", effectivePreset === key ? "text-foreground" : "text-foreground/80 group-hover:text-foreground")}>
                    {key}
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    {POMODORO_PRESETS[key].work}m work · {POMODORO_PRESETS[key].break}m break
                  </div>
                </button>
              ))}
            </div>
            {!effectivePreset && (
              <button
                onClick={onOpenTimerSettings}
                className="mt-3 relative w-full p-4 rounded-xl border-2 border-blue-500 bg-blue-500/10 text-left transition-all duration-300 hover:bg-blue-500/15 group"
              >
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                </div>
                <div className="font-semibold text-foreground">Custom</div>
                <div className="text-sm text-blue-400 mt-0.5 font-mono">
                  {timerSettings.workMinutes}m work · {timerSettings.shortBreakMinutes}m break
                </div>
                <div className="text-xs text-muted-foreground mt-1">Click to adjust</div>
              </button>
            )}
          </div>

          {/* Category picker */}
          <div id="coachmark-category" className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Tag className="h-4 w-4 text-emerald-400" />
              What are you working on?
            </label>
            {isAuthenticated && isPro && (
              <div className="relative mb-3">
                <Input
                  placeholder="Describe your task… AI will suggest a category"
                  value={taskDescription}
                  onChange={(e) => onTaskDescriptionChange(e.target.value)}
                  className="pr-8 text-sm bg-muted/50 border-border focus-visible:ring-1 focus-visible:ring-purple-500/50"
                />
                <Wand2
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
                    aiCatSuggesting ? "text-purple-400 animate-pulse" : "text-muted-foreground/40"
                  }`}
                />
              </div>
            )}
            {categories.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onSetSelectedCategory(cat.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2",
                      selectedCategory === cat.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "border-border bg-card text-foreground/80 hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    {cat.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />}
                    {cat.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No categories yet.{" "}
                <button onClick={onNavigateToCategories} className="text-blue-500 hover:underline">
                  Create one
                </button>
              </div>
            )}
          </div>

          {/* Atmosphere */}
          <div className="mb-8">
            <div id="coachmark-atmosphere" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Atmosphere
            </div>
            <FocusSetupAtmosphere
              background={background}
              videoEmbedUrl={videoEmbedUrl}
              overlay={overlay}
              selectedSound={selectedSound}
              isPlaying={isPlaying}
              customVideos={customVideos}
              onSetBackground={onSetBackground}
              onSetVideoEmbedUrl={onSetVideoEmbedUrl}
              onSetOverlay={onSetOverlay}
              onSetSelectedSound={onSetSelectedSound}
              onPlayAudio={onPlayAudio}
              onPauseAudio={onPauseAudio}
              onAddVideoClick={onAddVideoClick}
              onDeleteCustomVideo={onDeleteCustomVideo}
            />
          </div>

          {/* Start button */}
          <Button id="coachmark-start"
            onClick={onStart}
            disabled={!selectedCategory}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            {!selectedCategory ? "Select a category to start" : "Start Focus Session"}
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

      <FocusOnboardingCoachmark />

      <FocusAddVideoDialog
        open={showAddVideoDialog}
        newVideoUrl={newVideoUrl}
        newVideoTitle={newVideoTitle}
        onOpenChange={onSetShowAddVideoDialog}
        onUrlChange={onNewVideoUrlChange}
        onTitleChange={onNewVideoTitleChange}
        onAdd={onAddCustomVideo}
      />

      <FocusTimerSettingsModal
        open={timerSettingsOpen}
        onClose={onCloseTimerSettings}
        settings={timerSettings}
        onSave={onSaveTimerSettings}
      />
    </div>
  );
}
