import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the Achievements page (max-w-5xl): header with progress ring,
 * level + crystal cards, tab bar, and a badge grid.
 */
export function AchievementsPageSkeleton() {
  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-3.5 w-56" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-2 text-right">
              <Skeleton className="ml-auto h-3 w-24" />
              <Skeleton className="ml-auto h-6 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>

        {/* Level + crystal */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </Card>
          <Card className="flex flex-col items-center border border-border bg-card p-6">
            <div className="mb-4 flex w-full items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-32 w-32 rounded-full" />
          </Card>
        </div>

        {/* Tabs + badge grid */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md rounded-md" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
