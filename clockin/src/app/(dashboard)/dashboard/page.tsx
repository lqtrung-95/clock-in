"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTimerStore } from "@/stores/timer-store";
import { timeEntryService } from "@/services/time-entry-service";
import { categoryService } from "@/services/category-service";
import { streakService } from "@/services/streak-service";
import { goalService } from "@/services/goal-service";
import { useAuthState } from "@/hooks/use-auth-state";
import { useGamification } from "@/hooks/use-gamification";
import { useDreamGoal } from "@/hooks/use-dream-goal";
import { createClient } from "@/lib/supabase/client";
import { guestStorage } from "@/lib/guest-storage";
import { Card } from "@/components/ui/card";
import { EntryList } from "@/components/entries/entry-list";
import { TimerWidget } from "@/components/dashboard/timer-widget";
import { LoginBanner } from "@/components/auth/login-prompt";
import { HomeStatStrip } from "@/components/home/home-stat-strip";
import { HomeQuickStart } from "@/components/home/home-quick-start";
import { HomeStreakCard } from "@/components/home/home-streak-card";
import { HomeWeeklyGlance } from "@/components/home/home-weekly-glance";
import { HomeActiveGoals } from "@/components/home/home-active-goals";
import { HomeMomentumCard } from "@/components/home/home-momentum-card";
import { HomeEmptyState } from "@/components/home/home-empty-state";
import { DashboardPageSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { Sparkles, ChevronRight } from "lucide-react";
import { format, subDays, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";
import type { POMODORO_PRESETS } from "@/lib/constants";
import type { TimeEntry, Category } from "@/types/timer";
import type { Goal } from "@/types/gamification";

interface GoalWithProgress extends Goal {
  progress: { current: number; target: number; percentage: number } | null;
}

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthState();
  const queryClient = useQueryClient();
  const { status } = useTimerStore();
  const { userStats, levelInfo } = useGamification(userId);
  const { dreamGoal, progress: dreamProgress } = useDreamGoal(userId);

  const { data: dashboardData, isLoading: dataLoading } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: async () => {
      if (isAuthenticated && userId) {
        const supabase = createClient();
        const [cats, ents, streakData, goalsData, everTracked] = await Promise.all([
          categoryService.getCategories(userId),
          timeEntryService.getEntries(userId, 7),
          streakService.getStreak(userId),
          goalService.getGoals(userId),
          // Lifetime existence check — cheap head count, no rows returned.
          supabase.from("time_entries").select("id", { count: "exact", head: true }).eq("user_id", userId),
        ]);
        const goalsWithProgress = await Promise.all(
          goalsData.map(async (goal) => {
            const p = await goalService.calculateProgress(userId, goal);
            return { ...goal, progress: p } as GoalWithProgress;
          })
        );
        return {
          categories: cats as Category[],
          entries: ents as TimeEntry[],
          streak: streakData,
          goals: goalsWithProgress,
          hasEverTracked: (everTracked.count ?? 0) > 0,
        };
      }
      const guestEntries = guestStorage.getEntries();
      return {
        categories: guestStorage.getCategories() as unknown as Category[],
        entries: guestEntries as unknown as TimeEntry[],
        streak: null as { current_streak: number } | null,
        goals: [] as GoalWithProgress[],
        hasEverTracked: guestEntries.length > 0,
      };
    },
    enabled: !authLoading,
  });

  const categories = dashboardData?.categories ?? [];
  const entries = dashboardData?.entries ?? [];
  const streak = dashboardData?.streak ?? null;
  const goals = dashboardData?.goals ?? [];
  const hasEverTracked = dashboardData?.hasEverTracked ?? false;

  function invalidateDashboard() {
    queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
  }

  function beginFocus(categoryId: string, preset: keyof typeof POMODORO_PRESETS) {
    router.push(`/focus?cat=${encodeURIComponent(categoryId)}&preset=${encodeURIComponent(preset)}`);
  }

  const todayStats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todays = entries.filter((e) => e.started_at.startsWith(today));
    const minutes = todays.reduce((s, e) => s + (e.duration_seconds || 0) / 60, 0);
    return { hours: Math.round((minutes / 60) * 10) / 10, sessions: todays.length };
  }, [entries]);

  const weekHours = useMemo(
    () => Math.round(entries.reduce((s, e) => s + (e.duration_seconds || 0), 0) / 3600),
    [entries]
  );

  const weeklyData = useMemo(() => {
    const data: { day: string; date: string; hours: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      data.push({ day: format(d, "EEE"), date: format(d, "yyyy-MM-dd"), hours: 0 });
    }
    entries.forEach((e) => {
      if (!e.duration_seconds) return;
      const d = data.find((x) => x.date === format(parseISO(e.started_at), "yyyy-MM-dd"));
      if (d) d.hours += e.duration_seconds / 3600;
    });
    return data.map(({ day, hours }) => ({ day, hours }));
  }, [entries]);

  const weekActiveDays = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      return entries.some((e) => isSameDay(parseISO(e.started_at), day));
    });
  }, [entries]);

  if (dataLoading || authLoading) {
    return <DashboardPageSkeleton />;
  }

  // First-run: authenticated, never tracked a session, and no goals set — guide
  // them in. Uses a lifetime check so returning users idle >7 days aren't sent
  // back to onboarding.
  if (isAuthenticated && !hasEverTracked && goals.length === 0) {
    return (
      <div className="p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <HomeEmptyState
            userName=""
            onStartFocus={() => router.push("/focus")}
            onAddCategories={() => router.push("/categories")}
            onSetGoal={() => router.push("/progress/goals")}
            onBrowseScenes={() => router.push("/focus")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {!isAuthenticated && <LoginBanner feature="sync" />}

        {/* Header */}
        <div>
          <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" /> {format(new Date(), "EEEE, MMMM d")}
          </span>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {greetingFor(new Date())}
          </h1>
          <p className="mt-1 text-muted-foreground">Resume in one tap, or open Focus to fine-tune your setup.</p>
        </div>

        {status !== "idle" && <TimerWidget />}

        <HomeStatStrip
          hoursToday={todayStats.hours}
          sessionsToday={todayStats.sessions}
          streak={streak?.current_streak ?? 0}
          weekHours={weekHours}
        />

        {/* Bento */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <HomeQuickStart categories={categories} onBegin={beginFocus} onFullSetup={() => router.push("/focus")} />
          </div>
          <HomeStreakCard streak={streak?.current_streak ?? 0} weekActiveDays={weekActiveDays} />

          <div className="lg:col-span-2">
            <HomeWeeklyGlance data={weeklyData} onViewInsights={() => router.push("/insights")} />
          </div>
          <HomeActiveGoals goals={goals} onViewAll={() => router.push("/progress/goals")} />

          {/* Recent sessions */}
          <Card className="border border-border bg-card p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Recent sessions</h3>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Your latest tracking</p>
              </div>
              <button
                onClick={() => router.push("/insights/history")}
                className="flex items-center gap-0.5 text-[13px] font-semibold text-cyan-600 dark:text-cyan-400"
              >
                History <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <EntryList entries={entries.slice(0, 5)} onDelete={invalidateDashboard} isGuest={!isAuthenticated} />
          </Card>

          {isAuthenticated && (
            <HomeMomentumCard
              level={userStats?.current_level ?? 1}
              totalXp={userStats?.total_xp ?? 0}
              xpPct={levelInfo?.progressPercentage ?? 0}
              hasDream={!!dreamGoal}
              dreamPct={dreamProgress?.percentage ?? 0}
              onOpenLevel={() => router.push("/progress/badges")}
              onOpenDream={() => router.push("/progress/dream")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
