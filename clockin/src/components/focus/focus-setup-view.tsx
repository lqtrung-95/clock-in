"use client";

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
  Brain, CheckCircle2, Clock, Coffee, Play, SlidersHorizontal, Tag, Wand2,
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
    <div className="min-h-screen bg-surface px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-wide overflow-hidden rounded-lg border border-line bg-surface-raised shadow-card">
        <div className="grid md:grid-cols-[1fr_0.85fr]">
          {/* Config — calm, token-driven */}
          <div className="flex flex-col gap-8 p-6 sm:p-10">
            <div>
              <h1 className="text-title text-ink">Ready to focus?</h1>
              <p className="mt-1 text-sm text-ink-muted">Pick a duration, tag what you&apos;re working on, and go.</p>
            </div>

            {isPro && <AiSessionSuggestion isAuthenticated={!!isAuthenticated} onApply={onApplyAiSuggestion} />}

            {/* Preset picker */}
            <div id="coachmark-preset">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-label flex items-center gap-1.5 text-ink-subtle">
                  <Clock className="h-3.5 w-3.5" />
                  Session duration
                </span>
                <button
                  onClick={onOpenTimerSettings}
                  className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Customize
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {(Object.keys(POMODORO_PRESETS) as Array<keyof typeof POMODORO_PRESETS>).map((key) => (
                  <button
                    key={key}
                    onClick={() => onPresetSelect(key)}
                    className={cn(
                      "relative rounded-sm border p-3 text-left transition-colors",
                      effectivePreset === key
                        ? "border-accent-solid bg-accent-soft"
                        : "border-line bg-surface-sunken hover:border-line-strong"
                    )}
                  >
                    {effectivePreset === key && (
                      <CheckCircle2 className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-accent-solid" />
                    )}
                    <div className="text-sm font-semibold text-ink">{key}</div>
                    <div className="mt-0.5 text-xs text-ink-subtle">
                      {POMODORO_PRESETS[key].work}m · {POMODORO_PRESETS[key].break}m
                    </div>
                  </button>
                ))}
              </div>
              {!effectivePreset && (
                <button
                  onClick={onOpenTimerSettings}
                  className="relative mt-2.5 w-full rounded-sm border border-accent-solid bg-accent-soft p-3 text-left transition-colors hover:bg-accent-soft/70"
                >
                  <CheckCircle2 className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-accent-solid" />
                  <div className="text-sm font-semibold text-ink">Custom</div>
                  <div className="mt-0.5 font-mono text-xs text-accent-solid">
                    {timerSettings.workMinutes}m work · {timerSettings.shortBreakMinutes}m break
                  </div>
                </button>
              )}
            </div>

            {/* Category picker */}
            <div id="coachmark-category">
              <label className="text-label mb-3 flex items-center gap-1.5 text-ink-subtle">
                <Tag className="h-3.5 w-3.5" />
                What are you working on?
              </label>
              {isAuthenticated && isPro && (
                <div className="relative mb-3">
                  <Input
                    placeholder="Describe your task… AI will suggest a category"
                    value={taskDescription}
                    onChange={(e) => onTaskDescriptionChange(e.target.value)}
                    className="pr-8 text-sm"
                  />
                  <Wand2
                    className={cn(
                      "absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2",
                      aiCatSuggesting ? "animate-pulse text-data-xp" : "text-ink-subtle"
                    )}
                  />
                </div>
              )}
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => onSetSelectedCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        selectedCategory === cat.id
                          ? "border-data-goal bg-data-goal/10 text-data-goal"
                          : "border-line text-ink-muted hover:border-line-strong hover:text-ink"
                      )}
                    >
                      {cat.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                      {cat.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-ink-muted">
                  No categories yet.{" "}
                  <button onClick={onNavigateToCategories} className="text-accent-solid hover:underline">
                    Create one
                  </button>
                </div>
              )}
            </div>

            <Button id="coachmark-start" onClick={onStart} disabled={!selectedCategory} className="h-12 w-full text-base font-semibold">
              <Play className="h-4 w-4 fill-current" />
              {!selectedCategory ? "Select a category to start" : "Start focus session"}
            </Button>

            <div className="flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:gap-4">
              {[
                { icon: Brain, text: "Eliminate distractions" },
                { icon: Coffee, text: "Take breaks between sessions" },
                { icon: CheckCircle2, text: "Track your progress" },
              ].map((tip, i) => (
                <div key={i} className="flex flex-1 items-center gap-2 text-xs text-ink-subtle">
                  <tip.icon className="h-3.5 w-3.5 shrink-0 text-accent-solid" />
                  {tip.text}
                </div>
              ))}
            </div>
          </div>

          {/* Atmosphere preview — the one expressive surface on this screen,
              because it's literally previewing the user's session background. */}
          <div id="coachmark-atmosphere" className="border-t border-line md:border-t-0 md:border-l">
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
