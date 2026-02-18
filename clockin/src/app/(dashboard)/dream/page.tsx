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
import { format } from "date-fns";

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
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated && !dreamGoal) {
    return (
      <div className="p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-4xl">
          <LoginPrompt feature="goals" />
        </div>
      </div>
    );
  }

  const percentage = progress?.percentage || 0;
  const hoursToNext = progress?.hoursToNextMilestone || 0;

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
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
        onClick={() => router.push("/dashboard")}
        className="absolute left-4 top-4 z-10 bg-background/80 backdrop-blur-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Progress Overlay */}
      <Card className="absolute bottom-4 left-4 right-4 z-10 border border-border bg-card/90 p-4 backdrop-blur-md md:bottom-8 md:left-8 md:right-auto md:w-80">
        <div className="space-y-4">
          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {dreamGoal?.title || "My Dream Goal"}
              </h2>
              <p className="text-xs text-muted-foreground">
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
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{dreamGoal?.current_hours?.toFixed(1) || 0}h completed</span>
              <span>{dreamGoal?.target_hours || 100}h goal</span>
            </div>
          </div>

          {/* Next Milestone */}
          {hoursToNext > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-2 text-xs">
              <Trophy className="h-3 w-3 text-yellow-500" />
              <span className="text-muted-foreground">
                {hoursToNext.toFixed(1)}h to next milestone
              </span>
            </div>
          )}

          {/* Completed */}
          {dreamGoal?.is_completed && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-2 text-xs text-green-600">
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
