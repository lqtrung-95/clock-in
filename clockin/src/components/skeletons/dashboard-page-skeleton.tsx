import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the Home command center (max-w-6xl): header, 4 stat tiles, and the
 * bento (quick-start + streak, weekly + goals, recent + momentum). Height-stable
 * so the route/loading swap doesn't shift.
 */
function TileSkeleton() {
  return (
    <Card className="flex items-center gap-3 border border-border bg-card p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </Card>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <TileSkeleton key={i} />)}
        </div>

        {/* Bento */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border border-border bg-card p-6 lg:col-span-2">
            <Skeleton className="mb-4 h-5 w-32" />
            <Skeleton className="mb-4 h-8 w-64 rounded-xl" />
            <Skeleton className="mb-4 h-8 w-52 rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </Card>
          <Card className="border border-border bg-card p-6">
            <Skeleton className="mb-4 h-4 w-20" />
            <Skeleton className="mb-4 h-12 w-32" />
            <Skeleton className="h-6 w-full rounded-lg" />
          </Card>

          <Card className="border border-border bg-card p-6 lg:col-span-2">
            <Skeleton className="mb-5 h-5 w-32" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </Card>
          <Card className="border border-border bg-card p-6">
            <Skeleton className="mb-5 h-5 w-28" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-full rounded" />
              <Skeleton className="h-8 w-full rounded" />
            </div>
          </Card>

          <Card className="border border-border bg-card p-6 lg:col-span-2">
            <Skeleton className="mb-5 h-5 w-36" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="border border-border bg-card p-6">
            <Skeleton className="mb-4 h-4 w-24" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="mx-auto h-[104px] w-[104px] rounded-full" />
              <Skeleton className="mx-auto h-[104px] w-[104px] rounded-full" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
