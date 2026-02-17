"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTimerStore } from "@/stores/timer-store";
import { useCategoryStore } from "@/stores/category-store";
import { timeEntryService } from "@/services/time-entry-service";
import { categoryService } from "@/services/category-service";
import { streakService } from "@/services/streak-service";
import { goalService } from "@/services/goal-service";
import { useAuthState } from "@/hooks/use-auth-state";
import { useGamification } from "@/hooks/use-gamification";
import { guestStorage } from "@/lib/guest-storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EntryList } from "@/components/entries/entry-list";
import { TimerWidget } from "@/components/dashboard/timer-widget";
import { LoginBanner, LoginPrompt } from "@/components/auth/login-prompt";
import { DreamCrystalMini } from "@/components/focus/dream-crystal-mini";
import { EvolvedCrystal } from "@/components/focus/evolved-crystal";
import { XPProgressBar } from "@/components/gamification/xp-progress-bar";
import {
  Clock,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Brain,
  ChevronRight,
  Sparkles,
  Trophy,
} from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import type { TimeEntry, Category } from "@/types/timer";
import type { Goal, ChallengeProgress } from "@/types/gamification";

interface GoalWithProgress extends Goal {
  progress: {
    current: number;
    target: number;
    percentage: number;
  } | null;
}

// Enhanced Stat Card Component
function StatCard({
  icon: Icon,
  value,
  label,
  gradient,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <Card
      className="group relative overflow-hidden border border-border bg-card p-5 transition-all duration-500 hover:-translate-y-1 hover:border-border/80 hover:bg-secondary"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform duration-500 group-hover:scale-110`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

// Glass Card Component for sections
function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`border border-border bg-card backdrop-blur-sm ${className}`}
    >
      {children}
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [streak, setStreak] = useState<{
    current_streak: number;
    longest_streak: number;
  } | null>(null);
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { status } = useTimerStore();

  // Gamification
  const [userId, setUserId] = useState<string | null>(null);
  const { userStats, levelInfo, challenges, crystalConfig } = useGamification(userId);

  useEffect(() => {
    if (isAuthenticated) {
      supabase.auth.getUser().then(({ data }) => {
        setUserId(data.user?.id || null);
      });
    }
  }, [isAuthenticated, supabase]);

  async function loadData() {
    if (isAuthenticated) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [cats, ents, streakData, goalsData] = await Promise.all([
        categoryService.getCategories(user.id),
        timeEntryService.getEntries(user.id, 7),
        streakService.getStreak(user.id),
        goalService.getGoals(user.id),
      ]);

      setCategories(cats);
      setEntries(ents);
      setStreak(streakData);

      const goalsWithProgress = await Promise.all(
        goalsData.map(async (goal) => {
          const progress = await goalService.calculateProgress(user.id, goal);
          return { ...goal, progress };
        })
      );
      setGoals(goalsWithProgress);
    } else {
      const cats = guestStorage.getCategories();
      const ents = guestStorage.getEntries();
      setCategories(cats as unknown as Category[]);
      setEntries(ents as unknown as TimeEntry[]);
      setStreak(null);
      setGoals([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, isAuthenticated]);

  // Today's stats
  const todayStats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayEntries = entries.filter((e) =>
      e.started_at.startsWith(today)
    );
    const totalMinutes = todayEntries.reduce(
      (sum, e) => sum + (e.duration_seconds || 0) / 60,
      0
    );
    return {
      hours: Math.round((totalMinutes / 60) * 10) / 10,
      sessions: todayEntries.length,
    };
  }, [entries]);

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const data: { day: string; hours: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        day: format(date, "EEE"),
        hours: 0,
      });
    }
    entries.forEach((entry) => {
      if (!entry.duration_seconds) return;
      const entryDay = format(parseISO(entry.started_at), "EEE");
      const dayData = data.find((d) => d.day === entryDay);
      if (dayData) {
        dayData.hours += entry.duration_seconds / 3600;
      }
    });
    return data;
  }, [entries]);

  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {!isAuthenticated && <LoginBanner feature="sync" />}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                Welcome back
              </p>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Dashboard
            </h1>
            <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
          </div>
          <Button
            onClick={() => router.push("/focus")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <Brain className="mr-2 h-4 w-4" />
            Focus Mode
          </Button>
        </div>

        {/* Timer Widget - Show when tracking */}
        {status !== "idle" && <TimerWidget />}

        {/* Stats Grid with 3D Crystal */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={Clock}
            value={todayStats.hours}
            label="Hours Today"
            gradient="from-blue-500 to-cyan-500"
            delay={0}
          />
          <StatCard
            icon={Calendar}
            value={todayStats.sessions}
            label="Sessions Today"
            gradient="from-purple-500 to-pink-500"
            delay={100}
          />
          <StatCard
            icon={Flame}
            value={streak?.current_streak || 0}
            label="Day Streak"
            gradient="from-orange-500 to-red-500"
            delay={200}
          />
          <StatCard
            icon={TrendingUp}
            value={Math.round(
              entries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) / 3600
            )}
            label="Hours This Week"
            gradient="from-emerald-500 to-teal-500"
            delay={300}
          />
          {/* 3D Crystal Card */}
          <Card className="group relative overflow-hidden border border-border bg-card p-4 transition-all duration-500 hover:-translate-y-1 hover:border-border/80 hover:bg-secondary flex items-center justify-center min-h-[120px] cursor-pointer"
            style={{ animationDelay: '400ms' }}
            onClick={() => router.push("/achievements")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex flex-col items-center gap-1">
              {isAuthenticated && crystalConfig ? (
                <>
                  <EvolvedCrystal
                    level={userStats?.current_level || 1}
                    progress={levelInfo?.progressPercentage || 0}
                    shape={crystalConfig.active_shape}
                    color={crystalConfig.active_color}
                    theme={crystalConfig.active_theme}
                    size="sm"
                    animate={false}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground">Level {userStats?.current_level || 1}</span>
                </>
              ) : (
                <>
                  <DreamCrystalMini progress={Math.min(todayStats.hours * 10, 100)} size="sm" animate />
                  <span className="text-xs font-medium text-muted-foreground">Daily Energy</span>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Weekly Activity Chart */}
          <GlassCard className="lg:col-span-2 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Weekly Activity
                </h2>
                <p className="text-sm text-muted-foreground">Your focus time this week</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/stats")}
                className="text-muted-foreground hover:text-foreground"
              >
                View Stats
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="flex h-48 items-end justify-between gap-3">
              {weeklyData.map((day) => (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-3">
                  <div className="w-full relative">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-700"
                      style={{
                        height: `${(day.hours / maxHours) * 140}px`,
                        minHeight: day.hours > 0 ? "4px" : "0",
                        opacity: day.hours > 0 ? 1 : 0.2,
                      }}
                    />
                    {/* Glow effect for bars with data */}
                    {day.hours > 0 && (
                      <div
                        className="absolute inset-0 rounded-t-lg bg-cyan-400/30 blur-lg"
                        style={{
                          height: `${(day.hours / maxHours) * 140}px`,
                          minHeight: "4px",
                        }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Goals Preview */}
          <GlassCard className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Active Goals</h2>
                <p className="text-sm text-muted-foreground">Track your progress</p>
              </div>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/goals")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Target className="mr-1 h-4 w-4" />
                  All
                </Button>
              )}
            </div>
            <div className="space-y-5">
              {!isAuthenticated ? (
                <LoginPrompt feature="goals" />
              ) : (
                <>
                  {goals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize text-foreground">
                          {goal.period} Goal
                        </span>
                        <span className="text-cyan-600 dark:text-cyan-400">
                          {goal.progress?.percentage || 0}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
                          style={{ width: `${goal.progress?.percentage || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground/70">
                        {goal.progress?.current || 0}m /{" "}
                        {goal.progress?.target || goal.target_minutes}m
                      </p>
                    </div>
                  ))}
                  {goals.length === 0 && (
                    <div className="py-8 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                        <Target className="h-7 w-7 text-muted-foreground" />
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">No goals yet</p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => router.push("/goals")}
                        className="mt-1 text-cyan-600 dark:text-cyan-400"
                      >
                        Create your first goal
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Weekly Challenges Preview */}
        {isAuthenticated && challenges.length > 0 && (
          <GlassCard className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Weekly Challenges</h2>
                <p className="text-sm text-muted-foreground">Complete to earn bonus XP</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/achievements")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trophy className="mr-1 h-4 w-4" />
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {challenges.slice(0, 3).map((challenge) => (
                <Card key={challenge.id} className="border border-border bg-card/50 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {challenge.challenge?.name || "Challenge"}
                      </span>
                      <span className="text-xs text-cyan-500">+{challenge.challenge?.xp_reward || 0} XP</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                        style={{ width: `${Math.min((challenge.progress_current / challenge.progress_target) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {challenge.progress_current} / {challenge.progress_target}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Recent Entries */}
        <GlassCard className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Entries</h2>
              <p className="text-sm text-muted-foreground">Your latest time tracking sessions</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/history")}
              className="text-muted-foreground hover:text-foreground"
            >
              View History
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <EntryList
            entries={entries.slice(0, 5)}
            onDelete={loadData}
            isGuest={!isAuthenticated}
          />
        </GlassCard>
      </div>
    </div>
  );
}
