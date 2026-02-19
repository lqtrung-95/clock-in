"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { goalService } from "@/services/goal-service";
import { categoryService } from "@/services/category-service";
import { streakService } from "@/services/streak-service";
import { useAuthState } from "@/hooks/use-auth-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { DreamCrystalMini } from "@/components/focus/dream-crystal-mini";
import { Plus, Flame, Target, Trash2, Trophy, Sparkles, Mountain } from "lucide-react";
import { useDreamGoal } from "@/hooks/use-dream-goal";
import { DreamGoalProgressRing } from "@/components/dream-goal/dream-goal-progress-ring";
import { MountainProgressView } from "@/components/dream-goal/mountain-progress-view";
import { syncDreamGoalWithHistory } from "@/services/dream-goal-service";
import { toast } from "sonner";
import type { Goal } from "@/types/gamification";
import type { Category } from "@/types/timer";

interface GoalWithProgress extends Goal {
  progress: {
    current: number;
    target: number;
    percentage: number;
  } | null;
}

// Streak Card Component
function StreakCard({
  icon: Icon,
  value,
  label,
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  gradient: string;
}) {
  return (
    <Card className="group relative overflow-hidden border border-border bg-card p-6 text-center transition-all duration-500 hover:border-border/80 hover:bg-secondary"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform duration-500 group-hover:scale-110`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <p className="mt-4 text-4xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

export default function GoalsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [streak, setStreak] = useState<{ current_streak: number; longest_streak: number } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(120);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [categoryId, setCategoryId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { dreamGoal, progress, isLoading: dreamGoalLoading } = useDreamGoal(userId);
  const [showDreamGoal, setShowDreamGoal] = useState(false);

  // Sync dream goal with history on first load
  useEffect(() => {
    if (userId && userId !== 'guest' && !dreamGoalLoading && dreamGoal && dreamGoal.current_hours === 0) {
      syncDreamGoalWithHistory(userId).then(() => {
        window.location.reload();
      });
    }
  }, [userId, dreamGoalLoading, dreamGoal]);

  async function loadData() {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [goalsData, streakData, cats] = await Promise.all([
      goalService.getGoals(user.id),
      streakService.getStreak(user.id),
      categoryService.getCategories(user.id),
    ]);

    setStreak(streakData);
    setCategories(cats);

    const goalsWithProgress = await Promise.all(
      goalsData.map(async (goal) => {
        const progress = await goalService.calculateProgress(user.id, goal);
        return { ...goal, progress };
      })
    );

    setGoals(goalsWithProgress);
    setLoading(false);
  }

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUserId(data.user?.id || null);
      });
    }
  }, [isAuthenticated]);

  // Sync dream goal with history on first load
  useEffect(() => {
    if (userId && userId !== 'guest' && !dreamGoalLoading && dreamGoal && dreamGoal.current_hours === 0) {
      syncDreamGoalWithHistory(userId).then(() => {
        window.location.reload();
      });
    }
  }, [userId, dreamGoalLoading, dreamGoal]);

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await goalService.createGoal(user.id, {
        target_minutes: targetMinutes,
        period,
        category_id: categoryId || null,
      });

      toast.success("Goal created");
      setFormOpen(false);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create goal");
    }
    setSaving(false);
  }

  async function handleDeleteGoal(id: string) {
    if (!confirm("Delete this goal?")) return;
    try {
      await goalService.deleteGoal(id);
      toast.success("Goal deleted");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-8 lg:p-10"
      >
        <div className="mx-auto max-w-2xl space-y-6"
        >
          <div className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25"
            >
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Goals & Streaks</h1>
              <p className="text-sm text-muted-foreground">Set targets and track achievements</p>
            </div>
          </div>
          <LoginPrompt feature="goals" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10"
    >
      <div className="mx-auto max-w-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25"
          >
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Goals & Streaks</h1>
            <p className="text-sm text-muted-foreground">Set targets and track achievements</p>
          </div>
        </div>

        {/* Streak Cards with 3D Crystal */}
        {streak && (
          <div className="grid grid-cols-3 gap-4">
            <StreakCard
              icon={Flame}
              value={streak.current_streak}
              label="Current Streak"
              gradient="from-orange-500 to-red-500"
            />
            <StreakCard
              icon={Target}
              value={streak.longest_streak}
              label="Longest Streak"
              gradient="from-blue-500 to-cyan-500"
            />
            {/* 3D Crystal Card */}
            <Card className="group relative overflow-hidden border border-border bg-card p-4 text-center transition-all duration-500 hover:border-border/80 hover:bg-secondary flex flex-col items-center justify-center min-h-[140px]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex flex-col items-center gap-2">
                <DreamCrystalMini
                  progress={Math.min((streak.current_streak / Math.max(streak.longest_streak, 1)) * 100, 100)}
                  size="sm"
                  color="#EC4899"
                  animate
                />
                <span className="text-xs font-medium text-muted-foreground">Streak Power</span>
              </div>
            </Card>
          </div>
        )}

        {/* Dream Goal Section */}
        {dreamGoal && (
          <Card className="border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-foreground">Dream Goal</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {progress?.percentage.toFixed(1)}% · {dreamGoal.current_hours.toFixed(1)}h / {dreamGoal.target_hours}h
              </span>
            </div>
            {/* Progress ring — card-native, no dark background */}
            <div
              className="relative cursor-pointer"
              onClick={() => setShowDreamGoal(true)}
            >
              <DreamGoalProgressRing
                progress={progress?.percentage || 0}
                currentHours={dreamGoal.current_hours}
                targetHours={dreamGoal.target_hours}
                title={dreamGoal.title}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60 bg-muted/40 px-2 py-1 rounded-md">
                Click to explore
              </div>
            </div>
          </Card>
        )}

        {/* Full Screen Dream Goal Dialog */}
        {showDreamGoal && dreamGoal && (
          <MountainProgressView
            progress={progress?.percentage || 0}
            currentHours={dreamGoal.current_hours}
            targetHours={dreamGoal.target_hours}
            title={dreamGoal.title}
            onClose={() => setShowDreamGoal(false)}
          />
        )}

        {/* Goals Section */}
        <div className="flex items-center justify-between"
        >
          <h2 className="text-lg font-semibold text-foreground">Your Goals</h2>
          <Dialog open={formOpen} onOpenChange={setFormOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="border border-border bg-card"
            >
              <DialogHeader>
                <DialogTitle className="text-foreground">Create Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGoal} className="space-y-4"
              >
                <div className="space-y-2"
                >
                  <Label className="text-foreground/80">Target Minutes</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 0)}
                    className="border-border bg-card text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2"
                >
                  <Label className="text-foreground/80">Period</Label>
                  <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}
                  >
                    <SelectTrigger className="border-border bg-card text-foreground"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border border-border bg-card"
                    >
                      <SelectItem value="daily" className="text-foreground"
                      >Daily</SelectItem>
                      <SelectItem value="weekly" className="text-foreground"
                      >Weekly</SelectItem>
                      <SelectItem value="monthly" className="text-foreground"
                      >Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"
                >
                  <Label className="text-foreground/80">Category (optional)</Label>
                  <Select value={categoryId || "all"} onValueChange={(v) => setCategoryId(v === "all" ? "" : v)}
                  >
                    <SelectTrigger className="border-border bg-card text-foreground"
                    >
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent className="border border-border bg-card"
                    >
                      <SelectItem value="all" className="text-foreground"
                      >All categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-foreground"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={saving}
                >
                  {saving ? "Creating..." : "Create Goal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals List */}
        <div className="space-y-3"
        >
          {goals.map((goal) => (
            <Card key={goal.id} className="border border-border bg-card p-5 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between"
              >
                <div className="flex-1"
                >
                  <div className="flex items-center gap-2"
                  >
                    <span className="font-medium capitalize text-foreground"
                    >{goal.period}</span>
                    {goal.category_id && (
                      <span className="text-sm text-muted-foreground"
                      >
                        ·{" "}
                        {categories.find((c) => c.id === goal.category_id)?.name ||
                          "Unknown"}
                      </span>
                    )}
                  </div>
                  {goal.progress && (
                    <>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]"
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
                          style={{ width: `${goal.progress.percentage}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between"
                      >
                        <p className="text-sm text-muted-foreground"
                        >
                          {goal.progress.current}m / {goal.progress.target}m
                        </p>
                        <p className="text-sm font-medium text-cyan-400"
                        >
                          {goal.progress.percentage}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
          {goals.length === 0 && (
            <div className="py-12 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5"
              >
                <Target className="h-8 w-8 text-foreground/30" />
              </div>
              <p className="mt-4 text-muted-foreground"
              >No goals yet. Create one to start tracking!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
