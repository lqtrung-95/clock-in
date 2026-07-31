import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell, PageHeaderSkeleton, StatCardSkeleton } from "@/components/skeletons/skeleton-parts";

/**
 * Mirrors the Statistics page (max-w-4xl): header, 4-up stat grid,
 * AI insights card, tab bar + chart card (reserves the 300px chart height).
 */
export function StatsPageSkeleton() {
  return (
    <PageShell maxWidth="max-w-4xl">
      <PageHeaderSkeleton withAction />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* AI insights card */}
      <Card className="border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs + chart */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md rounded-md" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Card className="border border-border bg-card p-6">
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </Card>
      </div>
    </PageShell>
  );
}
