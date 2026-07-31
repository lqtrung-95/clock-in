import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell, PageHeaderSkeleton } from "@/components/skeletons/skeleton-parts";

/**
 * Mirrors the Goals & Streaks page (max-w-2xl): header, 3-up streak cards,
 * dream goal card, goals list.
 */
export function GoalsPageSkeleton() {
  return (
    <PageShell maxWidth="max-w-2xl">
      <PageHeaderSkeleton />

      {/* Streak cards */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="flex min-h-[140px] flex-col items-center justify-center gap-3 border border-border bg-card p-6"
          >
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>

      {/* Dream goal card */}
      <Card className="border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
      </Card>

      {/* Goals header + list */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border border-border bg-card p-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
