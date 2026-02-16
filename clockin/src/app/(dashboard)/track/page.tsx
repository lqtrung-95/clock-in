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
import { Clock, History } from "lucide-react";
import type { TimeEntry, Category } from "@/types/timer";

export default function TrackPage() {
  const supabase = createClient();
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [guestEntries, setGuestEntries] = useState<GuestTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories, setCategories } = useCategoryStore();
  const { entryId } = useTimerStore();

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
      <div className="mx-auto max-w-md space-y-6">
        {!isAuthenticated && <LoginBanner feature="sync" />}

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Track Time</h1>
          <p className="text-sm text-muted-foreground">Start a new focus session</p>
        </div>

        <QuickStartWidget categories={categories} isGuest={!isAuthenticated} />

        {/* Timer Card */}
        <Card className="relative overflow-hidden border border-border bg-card p-8 backdrop-blur-sm">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />

          <div className="relative">
            <TimerDisplay className="mb-8" />
            <TimerControls categories={categories} isGuest={!isAuthenticated} />
          </div>
        </Card>

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
