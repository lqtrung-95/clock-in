"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthState } from "@/hooks/use-auth-state";
import { useDreamGoal } from "@/hooks/use-dream-goal";
import { DreamGoalCanvas } from "@/components/dream-goal/dream-goal-canvas";
import { ThemeSelector } from "@/components/dream-goal/theme-selector";
import { MilestoneModal } from "@/components/dream-goal/milestone-modal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { ArrowLeft, Target, Clock, Trophy, Sparkles } from "lucide-react";
import { DreamPageSkeleton } from "@/components/skeletons/list-page-skeletons";
import { format } from "date-fns";
import { PageShell } from "@/components/ui-app/page-shell";
import { SEGMENTS } from "@/lib/navigation";

export default function DreamGoalPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [userId, setUserId] = useState<string | null>(null);
  const { dreamGoal, progress, isLoading, changeTheme } = useDreamGoal(userId);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneReached, setMilestoneReached] = useState(0);

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

  if (authLoading || isLoading) {
    return <DreamPageSkeleton />;
  }

  if (!isAuthenticated && !dreamGoal) {
    return (
      <PageShell title="Progress" segments={SEGMENTS.progress}>
        <LoginPrompt feature="goals" />
      </PageShell>
    );
  }

  const percentage = progress?.percentage || 0;
  const hoursToNext = progress?.hoursToNextMilestone || 0;

  // Full-bleed canvas, deliberately outside PageShell — the 3D scene is the
  // page. h-14 (3.5rem) accounts for the app shell's topbar.
  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <DreamGoalCanvas
          theme={dreamGoal?.theme}
          progress={percentage}
          isActive={true}
        />
      </div>

      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/today")}
        className="absolute left-4 top-4 z-10 bg-surface/80 backdrop-blur-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Progress Overlay */}
      <Card className="absolute bottom-4 left-4 right-4 z-10 border border-line bg-surface-raised/90 p-4 backdrop-blur-md md:bottom-8 md:left-8 md:right-auto md:w-80">
        <div className="space-y-4">
          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-solid">
              <Target className="h-4 w-4 text-accent-fg" />
            </div>
            <div>
              <h2 className="font-semibold text-ink">
                {dreamGoal?.title || "My Dream Goal"}
              </h2>
              <p className="text-xs text-ink-muted">
                {dreamGoal?.theme === "mountain" && "Mountain Climb"}
                {dreamGoal?.theme === "castle" && "Castle Builder"}
                {dreamGoal?.theme === "tree" && "Magical Tree"}
                {dreamGoal?.theme === "space" && "Space Journey"}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Progress</span>
              <span className="font-medium text-ink">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>{dreamGoal?.current_hours?.toFixed(1) || 0}h completed</span>
              <span>{dreamGoal?.target_hours || 100}h goal</span>
            </div>
          </div>

          {/* Next Milestone */}
          {hoursToNext > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-surface-sunken p-2 text-xs">
              <Trophy className="h-3 w-3 text-data-xp" />
              <span className="text-ink-muted">
                {hoursToNext.toFixed(1)}h to next milestone
              </span>
            </div>
          )}

          {/* Completed */}
          {dreamGoal?.is_completed && (
            <div className="flex items-center gap-2 rounded-sm bg-success-soft p-2 text-xs text-success">
              <Sparkles className="h-3 w-3" />
              <span>Goal completed on {dreamGoal.completed_at ? format(new Date(dreamGoal.completed_at), "MMM d, yyyy") : ""}!</span>
            </div>
          )}
        </div>
      </Card>

      {/* Theme Selector */}
      <div className="absolute right-4 top-4 z-10 md:right-8 md:top-8">
        <ThemeSelector
          currentTheme={dreamGoal?.theme}
          onThemeChange={changeTheme}
        />
      </div>

      {/* Milestone Modal */}
      <MilestoneModal
        milestone={milestoneReached}
        open={showMilestone}
        onClose={() => setShowMilestone(false)}
      />
    </div>
  );
}
