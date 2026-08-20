"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/category-service";
import { timeEntryService } from "@/services/time-entry-service";
import { useCategoryStore } from "@/stores/category-store";
import { useAuthState } from "@/hooks/use-auth-state";
import { useProStatus } from "@/hooks/use-pro-status";
import { guestStorage } from "@/lib/guest-storage";
import { EntryList } from "@/components/entries/entry-list";
import { EntryForm } from "@/components/entries/entry-form";
import { Button } from "@/components/ui/button";
import { Download, Lock } from "lucide-react";
import { exportEntriesToCsv } from "@/lib/export-csv";
import { HistoryPageSkeleton } from "@/components/skeletons/list-page-skeletons";
import { PageShell } from "@/components/ui-app/page-shell";
import { DataCard } from "@/components/ui-app/data-card";
import { LocalDataBanner } from "@/components/ui-app/local-data-banner";
import { SEGMENTS } from "@/lib/navigation";
import type { TimeEntry, Category } from "@/types/timer";

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthState();
  const queryClient = useQueryClient();
  const setCategories = useCategoryStore((s) => s.setCategories);
  const { isPro } = useProStatus(userId);

  // Free users see last 7 days; Pro users see last 365 days
  const historyDays = isPro ? 365 : 7;

  const { data, isLoading } = useQuery({
    queryKey: ["history", userId, historyDays],
    queryFn: async () => {
      if (isAuthenticated && userId) {
        const [cats, ents] = await Promise.all([
          categoryService.getCategories(userId),
          timeEntryService.getEntries(userId, historyDays),
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
    queryClient.invalidateQueries({ queryKey: ["history", userId, historyDays] });
  }

  if (isLoading || authLoading) {
    return <HistoryPageSkeleton />;
  }

  return (
    <PageShell
      title="Insights"
      segments={SEGMENTS.insights}
      actions={
        <>
          {entries.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => exportEntriesToCsv(entries, categories)}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
          <EntryForm categories={categories} onSuccess={invalidateHistory} isGuest={!isAuthenticated} />
        </>
      }
    >
      {!isAuthenticated && <LocalDataBanner />}

      {isAuthenticated && !isPro && (
        <div className="flex items-center gap-2 rounded-sm border border-warn/30 bg-warn-soft px-4 py-2.5 text-sm">
          <Lock className="h-4 w-4 shrink-0 text-warn" />
          <span className="text-ink-muted">
            Showing last 7 days. <span className="font-medium text-ink">Upgrade to Pro</span> for full history.
          </span>
        </div>
      )}

      <DataCard>
        <EntryList entries={entries} onDelete={invalidateHistory} isGuest={!isAuthenticated} />
      </DataCard>
    </PageShell>
  );
}
