"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { goalService } from "@/services/goal-service";
import { categoryService } from "@/services/category-service";
import { streakService } from "@/services/streak-service";
import { useAuthState } from "@/hooks/use-auth-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { DreamCrystalMini } from "@/components/focus/dream-crystal-mini";
import { Plus, Flame, Target, Trash2, Mountain } from "lucide-react";
import { useDreamGoal } from "@/hooks/use-dream-goal";
import { DreamGoalProgressRing } from "@/components/dream-goal/dream-goal-progress-ring";
import { MountainProgressView } from "@/components/dream-goal/mountain-progress-view";
import { syncDreamGoalWithHistory } from "@/services/dream-goal-service";
import { GoalsPageSkeleton } from "@/components/skeletons/goals-page-skeleton";
import { toast } from "sonner";
import type { Goal } from "@/types/gamification";
import type { Category } from "@/types/timer";
import { PageShell } from "@/components/ui-app/page-shell";
import { DataCard } from "@/components/ui-app/data-card";
import { StatRow } from "@/components/ui-app/stat-row";
import { Stat } from "@/components/ui-app/stat";
import { EmptyState } from "@/components/ui-app/empty-state";
import { ProgressMeter } from "@/components/ui-app/progress-meter";
import { Field } from "@/components/ui-app/field";
import { SEGMENTS } from "@/lib/navigation";

interface GoalWithProgress extends Goal {
  progress: {
    current: number;
    target: number;
    percentage: number;
  } | null;
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
  const { dreamGoal, progress, isLoading: dreamGoalLoading, refresh: refreshDreamGoal } = useDreamGoal(userId);
  const [showDreamGoal, setShowDreamGoal] = useState(false);
  const [dreamGoalSynced, setDreamGoalSynced] = useState(false);

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

  // Sync dream goal with historical time entries (once, no page reload)
  useEffect(() => {
    if (!dreamGoalSynced && userId && userId !== 'guest' && !dreamGoalLoading && dreamGoal && dreamGoal.current_hours === 0) {
      setDreamGoalSynced(true);
      syncDreamGoalWithHistory(userId)
        .then(() => { refreshDreamGoal(); })
        .catch((err) => console.error('Failed to sync dream goal history:', err));
    }
  }, [userId, dreamGoalLoading, dreamGoal, dreamGoalSynced, refreshDreamGoal]);

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
    return <GoalsPageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <PageShell title="Progress" segments={SEGMENTS.progress} width="prose">
        <LoginPrompt feature="goals" />
      </PageShell>
    );
  }

  return (
    <PageShell title="Progress" segments={SEGMENTS.progress} width="prose">
        {/* Streak Cards with 3D Crystal */}
        {streak && (
          <StatRow className="grid-cols-3 md:grid-cols-3">
            <Stat label="Current streak" value={streak.current_streak} icon={Flame} metric="streak" size="md" />
            <Stat label="Longest streak" value={streak.longest_streak} icon={Target} metric="goal" size="md" />
            <div className="flex flex-col items-center justify-center gap-2 border-l border-line pl-4">
              <DreamCrystalMini
                progress={Math.min((streak.current_streak / Math.max(streak.longest_streak, 1)) * 100, 100)}
                size="sm"
                color="#EC4899"
                animate
              />
              <span className="text-xs font-medium text-ink-muted">Streak power</span>
            </div>
          </StatRow>
        )}

        {/* Dream Goal Section */}
        {dreamGoal && (
          <DataCard padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line p-4">
              <div className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-data-dream" />
                <h2 className="text-base font-semibold text-ink">Dream goal</h2>
              </div>
              <span className="text-sm text-ink-muted">
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
              <div className="absolute bottom-3 right-3 rounded-sm bg-surface-sunken px-2 py-1 text-xs text-ink-subtle">
                Click to explore
              </div>
            </div>
          </DataCard>
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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Your goals</h2>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                New goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <Field label="Target minutes">
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 0)}
                    required
                  />
                </Field>
                <Field label="Period">
                  <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Category (optional)">
                  <Select value={categoryId || "all"} onValueChange={(v) => setCategoryId(v === "all" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Creating..." : "Create goal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {goals.map((goal) => (
            <DataCard key={goal.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize text-ink">{goal.period}</span>
                    {goal.category_id && (
                      <span className="text-sm text-ink-muted">
                        · {categories.find((c) => c.id === goal.category_id)?.name || "Unknown"}
                      </span>
                    )}
                  </div>
                  {goal.progress && (
                    <ProgressMeter
                      value={goal.progress.current}
                      target={goal.progress.target}
                      metric="goal"
                      showValues
                      className="mt-3"
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-ink-muted hover:bg-danger-soft hover:text-danger"
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </DataCard>
          ))}
          {goals.length === 0 && (
            <EmptyState icon={Target} title="No goals yet" description="Create one to start tracking!" />
          )}
        </div>
    </PageShell>
  );
}
