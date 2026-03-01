"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/category-service";
import { timeEntryService } from "@/services/time-entry-service";
import { useCategoryStore } from "@/stores/category-store";
import { useAuthState } from "@/hooks/use-auth-state";
import { guestStorage } from "@/lib/guest-storage";
import { EntryList } from "@/components/entries/entry-list";
import { EntryForm } from "@/components/entries/entry-form";
import { LoginBanner } from "@/components/auth/login-prompt";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, Download } from "lucide-react";
import { exportEntriesToCsv } from "@/lib/export-csv";
import type { TimeEntry, Category } from "@/types/timer";

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthState();
  const queryClient = useQueryClient();
  const { setCategories } = useCategoryStore();

  const { data, isLoading } = useQuery({
    queryKey: ["history", userId],
    queryFn: async () => {
      if (isAuthenticated && userId) {
        const [cats, ents] = await Promise.all([
          categoryService.getCategories(userId),
          timeEntryService.getEntries(userId, 30),
        ]);
        return { entries: ents as TimeEntry[], categories: cats };
      }

      // Guest mode
      const cats = guestStorage.getCategories() as unknown as Category[];
      const rawEntries = guestStorage.getEntries();
      const enriched = rawEntries.map((e) => ({
        ...e,
        category: cats.find((c) => c.id === e.category_id),
      })) as unknown as TimeEntry[];
      return { entries: enriched, categories: cats };
    },
    enabled: !authLoading,
  });

  const entries = data?.entries ?? [];
  const categories = data?.categories ?? [];

  // Keep Zustand store in sync for EntryForm category picker
  useEffect(() => {
    setCategories(categories);
  }, [categories, setCategories]);

  function invalidateHistory() {
    queryClient.invalidateQueries({ queryKey: ["history", userId] });
  }

  if (isLoading || authLoading) {
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
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportEntriesToCsv(entries, categories)}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
            <EntryForm categories={categories} onSuccess={invalidateHistory} isGuest={!isAuthenticated} />
          </div>
        </div>

        {/* Entries List */}
        <Card className="border border-border bg-card p-6 backdrop-blur-sm">
          <EntryList entries={entries} onDelete={invalidateHistory} isGuest={!isAuthenticated} />
        </Card>
      </div>
    </div>
  );
}
