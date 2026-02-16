"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { categoryService } from "@/services/category-service";
import { timeEntryService } from "@/services/time-entry-service";
import { useCategoryStore } from "@/stores/category-store";
import { useAuthState } from "@/hooks/use-auth-state";
import { guestStorage } from "@/lib/guest-storage";
import { EntryList } from "@/components/entries/entry-list";
import { EntryForm } from "@/components/entries/entry-form";
import { LoginBanner } from "@/components/auth/login-prompt";
import { Card } from "@/components/ui/card";
import { List, Plus } from "lucide-react";
import type { TimeEntry, Category } from "@/types/timer";

export default function HistoryPage() {
  const supabase = createClient();
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories, setCategories } = useCategoryStore();

  async function loadData() {
    if (isAuthenticated) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [cats, ents] = await Promise.all([
        categoryService.getCategories(user.id),
        timeEntryService.getEntries(user.id, 30),
      ]);
      setCategories(cats);
      setEntries(ents);
    } else {
      const cats = guestStorage.getCategories();
      const ents = guestStorage.getEntries();
      setCategories(cats as unknown as Category[]);
      setEntries(ents as unknown as TimeEntry[]);
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

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {!isAuthenticated && <LoginBanner feature="sync" />}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
              <List className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">History</h1>
              <p className="text-sm text-muted-foreground">View and manage your time entries</p>
            </div>
          </div>
          <EntryForm categories={categories} onSuccess={loadData} isGuest={!isAuthenticated} />
        </div>

        {/* Entries List */}
        <Card className="border border-border bg-card p-6 backdrop-blur-sm">
          <EntryList entries={entries} onDelete={loadData} isGuest={!isAuthenticated} />
        </Card>
      </div>
    </div>
  );
}
