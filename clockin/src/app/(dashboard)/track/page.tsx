"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCategoryStore } from "@/stores/category-store";
import { categoryService } from "@/services/category-service";
import { timeEntryService } from "@/services/time-entry-service";
import { useTimerStore } from "@/stores/timer-store";
import { useAuthState } from "@/hooks/use-auth-state";
import { guestStorage, GuestTimeEntry, GuestCategory } from "@/lib/guest-storage";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TimerControls } from "@/components/timer/timer-controls";
import { QuickStartWidget } from "@/components/timer/quick-start-widget";
import { EntryList } from "@/components/entries/entry-list";
import { LoginBanner } from "@/components/auth/login-prompt";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Sparkles, FileInput, History } from "lucide-react";
import type { TimeEntry, Category } from "@/types/timer";

// Manual Entry Form Component
function ManualEntryForm({ categories, isGuest, onSuccess }: { categories: Category[]; isGuest: boolean; onSuccess: () => void }) {
  const [categoryId, setCategoryId] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !duration) return;

    setSaving(true);
    const durationMinutes = parseInt(duration);
    const startedAt = new Date(date);
    const endedAt = new Date(startedAt.getTime() + durationMinutes * 60000);

    try {
      if (isGuest) {
        guestStorage.addEntry({
          category_id: categoryId,
          started_at: startedAt.toISOString(),
          ended_at: endedAt.toISOString(),
          duration_seconds: durationMinutes * 60,
          notes: notes || null,
          entry_type: "manual",
        });
      } else {
        const { data: { user } } = await createClient().auth.getUser();
        if (!user) throw new Error("Not authenticated");

        await timeEntryService.createManualEntry({
          user_id: user.id,
          category_id: categoryId,
          started_at: startedAt.toISOString(),
          ended_at: endedAt.toISOString(),
          duration_seconds: durationMinutes * 60,
          notes: notes || undefined,
        });
      }

      onSuccess();
      setCategoryId("");
      setDuration("");
      setNotes("");
    } catch (error) {
      console.error("Failed to save entry:", error);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            placeholder="60"
            min="1"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
          placeholder="What did you work on?"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 py-2.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Add Entry"}
      </button>
    </form>
  );
}

export default function TrackPage() {
  const supabase = createClient();
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [guestEntries, setGuestEntries] = useState<GuestTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories, setCategories } = useCategoryStore();
  const { entryId } = useTimerStore();
  const [activeTab, setActiveTab] = useState("quick");

  async function loadData() {
    if (isAuthenticated) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [cats, ents] = await Promise.all([
        categoryService.getCategories(user.id),
        timeEntryService.getEntries(user.id, 7),
      ]);
      setCategories(cats);
      setEntries(ents);
    } else {
      const cats = guestStorage.getCategories();
      const ents = guestStorage.getEntries();
      setCategories(cats as unknown as Category[]);
      setGuestEntries(ents);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, isAuthenticated]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const displayEntries = isAuthenticated ? entries : (guestEntries as unknown as TimeEntry[]);

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {!isAuthenticated && <LoginBanner feature="sync" />}

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Track Time</h1>
          <p className="text-sm text-muted-foreground">Choose how you want to track</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Timer</span>
              <span className="sm:hidden">Quick</span>
            </TabsTrigger>
            <TabsTrigger value="focus" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Focus Mode</span>
              <span className="sm:hidden">Focus</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <FileInput className="h-4 w-4" />
              <span className="hidden sm:inline">Manual Entry</span>
              <span className="sm:hidden">Manual</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Timer Tab */}
          <TabsContent value="quick" className="space-y-6">
            <QuickStartWidget categories={categories} isGuest={!isAuthenticated} />

            <Card className="relative overflow-hidden border border-border bg-card p-8 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
              <div className="relative">
                <TimerDisplay className="mb-8" />
                <TimerControls categories={categories} isGuest={!isAuthenticated} />
              </div>
            </Card>
          </TabsContent>

          {/* Focus Mode Tab */}
          <TabsContent value="focus">
            <Card className="border border-border bg-gradient-to-br from-blue-500/5 via-card to-cyan-500/5 p-8 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-blue-500" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">Deep Focus Mode</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Immerse yourself with Pomodoro timer, 3D visualization, and ambient backgrounds
              </p>
              <a
                href="/focus"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
              >
                <Sparkles className="h-4 w-4" />
                Enter Focus Mode
              </a>
            </Card>
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual">
            <Card className="border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <FileInput className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-foreground">Log Past Session</h3>
              </div>
              <ManualEntryForm
                categories={categories}
                isGuest={!isAuthenticated}
                onSuccess={loadData}
              />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Entries */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground/80">Recent Entries</h2>
          </div>
          <EntryList
            entries={displayEntries.slice(0, 5)}
            onDelete={loadData}
            isGuest={!isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}
