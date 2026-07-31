import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton, CardListSkeleton } from "@/components/skeletons/skeleton-parts";

/**
 * Mirrors the Dashboard layout (max-w-6xl): header, 5-up stat grid,
 * activity chart + goals row, recent entries. Keeps height stable on load.
 */
export function DashboardPageSkeleton() {
  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>

        {/* Stats grid (5-up on lg) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
          <Card className="flex min-h-[120px] items-center justify-center border border-border bg-card p-4">
            <Skeleton className="h-16 w-16 rounded-full" />
          </Card>
        </div>

        {/* Chart + goals */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border border-border bg-card p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3.5 w-44" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <div className="flex h-48 items-end justify-between gap-3">
              {[56, 98, 42, 126, 77, 105, 63].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-3">
                  <Skeleton className="w-full rounded-t-lg" style={{ height: `${h}px` }} />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="h-8 w-14 rounded-md" />
            </div>
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-56" />
            </div>
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
          <CardListSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
}
