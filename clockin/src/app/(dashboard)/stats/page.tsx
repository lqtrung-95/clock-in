"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { timeEntryService } from "@/services/time-entry-service";
import { streakService } from "@/services/streak-service";
import { getDailyFocusStats } from "@/services/stats-service";
import { useAuthState } from "@/hooks/use-auth-state";
import { guestStorage } from "@/lib/guest-storage";
import { Card } from "@/components/ui/card";
import { CalendarHeatmap } from "@/components/stats/calendar-heatmap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginPrompt } from "@/components/auth/login-prompt";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { Clock, Flame, Calendar, BarChart3, Grid3X3, TrendingUp } from "lucide-react";
import type { TimeEntry } from "@/types/timer";
import type { DailyStats } from "@/services/stats-service";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];

// Stat Card Component
function StatCard({
  icon: Icon,
  value,
  label,
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  gradient: string;
}) {
  return (
    <Card className="group relative overflow-hidden border border-border bg-card p-5 transition-all duration-500 hover:border-border/80 hover:bg-secondary">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="relative flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-transform duration-500 group-hover:scale-110`}>
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

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
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
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
              <p className="text-sm text-muted-foreground">Track your productivity trends</p>
            </div>
          </div>
          <LoginPrompt feature="stats" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
            <p className="text-sm text-muted-foreground">Track your productivity trends</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Clock}
            value={Math.round(totalHours * 10) / 10}
            label="Total Hours"
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Calendar}
            value={totalEntries}
            label="Sessions"
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={Flame}
            value={streak?.current_streak || 0}
            label="Day Streak"
            gradient="from-orange-500 to-red-500"
          />
          <StatCard
            icon={BarChart3}
            value={totalEntries > 0 ? Math.round((totalHours * 60) / totalEntries) : 0}
            label="Avg Minutes"
            gradient="from-emerald-500 to-teal-500"
          />
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 border border-white/5 bg-white/5 p-1">
            <TabsTrigger value="daily" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">
              Daily Hours
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">
              Heatmap
            </TabsTrigger>
            <TabsTrigger value="category" className="data-[state=active]:bg-white/10 data-[state=active]:text-foreground">
              By Category
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 mt-6">
            <div className="flex gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                    days === d
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
            <Card className="border border-border bg-card p-6">
              {dailyData.some((d) => d.minutes > 0) ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} barCategoryGap="30%">
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}m`}
                        width={36}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted))", radius: 6 }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          color: "hsl(var(--foreground))",
                          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                          fontSize: "13px",
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value) => [`${value} min`, "Focus time"]}
                      />
                      <Bar dataKey="minutes" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <TrendingUp className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">No focus sessions yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Start a session to see your daily progress here</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4 mt-6">
            <Card className="border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Grid3X3 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  Activity Heatmap
                </h3>
              </div>
              <CalendarHeatmap data={dailyStats} />
            </Card>
          </TabsContent>

          <TabsContent value="category" className="mt-6">
            <Card className="border border-border bg-card p-6">
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
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))" }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value) => [`${value}h`, "Hours"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <BarChart3 className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">No category data yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Tag your sessions with categories to see the breakdown</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
