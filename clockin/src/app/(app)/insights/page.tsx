"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { timeEntryService } from "@/services/time-entry-service";
import { streakService } from "@/services/streak-service";
import { getDailyFocusStats } from "@/services/stats-service";
import { useAuthState } from "@/hooks/use-auth-state";
import { useProStatus } from "@/hooks/use-pro-status";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { guestStorage } from "@/lib/guest-storage";
import { CalendarHeatmap } from "@/components/stats/calendar-heatmap";
import { FocusInsightsCard } from "@/components/stats/focus-insights-card";
import { ShareStatsCard } from "@/components/stats/share-stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { StatsPageSkeleton } from "@/components/skeletons/stats-page-skeleton";
import { PageShell } from "@/components/ui-app/page-shell";
import { Section } from "@/components/ui-app/section";
import { DataCard } from "@/components/ui-app/data-card";
import { Stat } from "@/components/ui-app/stat";
import { StatRow } from "@/components/ui-app/stat-row";
import { EmptyState } from "@/components/ui-app/empty-state";
import { MetricChart } from "@/components/ui-app/metric-chart";
import { SEGMENTS } from "@/lib/navigation";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { Clock, Flame, Calendar, BarChart3 } from "lucide-react";
import type { TimeEntry } from "@/types/timer";
import type { DailyStats } from "@/services/stats-service";

const CATEGORY_COLORS = [
  "var(--data-focus)",
  "var(--data-goal)",
  "var(--data-streak)",
  "var(--data-xp)",
  "var(--data-dream)",
  "var(--data-neutral)",
];

export default function AnalyticsPage() {
  const { isAuthenticated, userId, isLoading: authLoading } = useAuthState();
  const { isPro, aiInsightsUsedThisMonth } = useProStatus(userId);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [streak, setStreak] = useState<{ current_streak: number } | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  async function loadData() {
    if (isAuthenticated) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const endDate = format(new Date(), "yyyy-MM-dd");
      const startDate = format(subDays(new Date(), 364), "yyyy-MM-dd");

      const [ents, streakData, dailyStatsData] = await Promise.all([
        timeEntryService.getEntries(user.id, 30),
        streakService.getStreak(user.id),
        getDailyFocusStats(user.id, startDate, endDate),
      ]);
      setEntries(ents);
      setStreak(streakData);
      setDailyStats(dailyStatsData);
    } else {
      const ents = guestStorage.getEntries();
      setEntries(ents as unknown as TimeEntry[]);
      setStreak(null);
      // Generate daily stats from guest entries
      const statsMap = new Map<string, DailyStats>();
      ents.forEach((entry) => {
        if (!entry.duration_seconds) return;
        const date = entry.started_at.split("T")[0];
        const existing = statsMap.get(date);
        if (existing) {
          existing.total_seconds += entry.duration_seconds;
          existing.session_count += 1;
        } else {
          statsMap.set(date, {
            date,
            total_seconds: entry.duration_seconds,
            session_count: 1,
          });
        }
      });
      setDailyStats(Array.from(statsMap.values()));
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, isAuthenticated]);

  const dailyData = useMemo(() => {
    const data: { date: string; minutes: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, "MMM d"),
        minutes: 0,
      });
    }

    entries.forEach((entry) => {
      if (!entry.duration_seconds) return;
      const entryDate = format(parseISO(entry.started_at), "MMM d");
      const dayData = data.find((d) => d.date === entryDate);
      if (dayData) {
        dayData.minutes += Math.round(entry.duration_seconds / 60);
      }
    });

    return data;
  }, [entries, days]);

  const categoryData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    entries.forEach((entry) => {
      if (!entry.duration_seconds || !entry.category) return;
      const name = entry.category.name;
      byCategory[name] = (byCategory[name] || 0) + entry.duration_seconds / 3600;
    });
    return Object.entries(byCategory)
      .map(([name, hours]) => ({ name, hours: Math.round(hours * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 6);
  }, [entries]);

  const totalHours = useMemo(() => {
    return entries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) / 3600;
  }, [entries]);

  const totalEntries = entries.length;

  if (loading || authLoading) {
    return <StatsPageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <PageShell title="Insights" segments={SEGMENTS.insights}>
        <LoginPrompt feature="stats" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Insights"
      segments={SEGMENTS.insights}
      actions={<ShareStatsCard entries={entries} streak={streak?.current_streak ?? 0} />}
    >
      <StatRow>
        <Stat label="Total hours" value={Math.round(totalHours * 10) / 10} icon={Clock} metric="focus" />
        <Stat label="Sessions" value={totalEntries} icon={Calendar} metric="goal" />
        <Stat label="Day streak" value={streak?.current_streak || 0} icon={Flame} metric="streak" />
        <Stat
          label="Avg minutes"
          value={totalEntries > 0 ? Math.round((totalHours * 60) / totalEntries) : 0}
          icon={BarChart3}
          metric="xp"
        />
      </StatRow>

      {/* AI Focus Insights — free users get 3/month, Pro gets unlimited */}
      {userId && (
        !isPro && aiInsightsUsedThisMonth >= 3 ? (
          <UpgradePrompt
            feature="AI Focus Insights"
            description="You've used your 3 free AI insights this month. Upgrade to Pro for unlimited insights."
          />
        ) : (
          <FocusInsightsCard userId={userId} entries={entries} isPro={isPro} aiInsightsUsedThisMonth={aiInsightsUsedThisMonth} />
        )
      )}

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="daily">Daily hours</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="category">By category</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6 space-y-4">
          <div className="flex gap-2">
            {[7, 14, 30].map((d) => (
              <Button key={d} variant={days === d ? "default" : "outline"} size="sm" onClick={() => setDays(d)}>
                {d} days
              </Button>
            ))}
          </div>
          <DataCard>
            <MetricChart
              type="bar"
              data={dailyData}
              xKey="date"
              series={[{ key: "minutes", metric: "focus", label: "Focus time" }]}
              height={300}
              formatValue={(v) => `${v} min`}
              empty={!dailyData.some((d) => d.minutes > 0)}
            />
          </DataCard>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-6 space-y-4">
          {isPro ? (
            <Section title="Activity heatmap">
              <DataCard>
                <CalendarHeatmap data={dailyStats} />
              </DataCard>
            </Section>
          ) : (
            <UpgradePrompt
              feature="Activity Heatmap"
              description="Visualize your entire year of focus sessions in a GitHub-style heatmap."
            />
          )}
        </TabsContent>

        <TabsContent value="category" className="mt-6">
          <DataCard>
            {categoryData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="hours"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(props) => {
                        const { name, value } = props as { name: string; value: number };
                        return `${name}: ${value}h`;
                      }}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface-overlay)",
                        border: "1px solid var(--line)",
                        borderRadius: "12px",
                        color: "var(--ink)",
                      }}
                      itemStyle={{ color: "var(--ink)" }}
                      formatter={(value) => [`${value}h`, "Hours"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <EmptyState
                  icon={BarChart3}
                  title="No category data yet"
                  description="Tag your sessions with categories to see the breakdown"
                />
              </div>
            )}
          </DataCard>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
