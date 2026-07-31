import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-page skeleton for the Focus setup view. The Focus page shows this until
 * ALL setup data (categories, goals, today-stats, plan) is ready, then swaps to
 * the real view in one shot — so dynamic blocks (active goals, today stats)
 * never pop in and shift the layout mid-render.
 *
 * Mirrors focus-setup-view.tsx section-for-section so the swap is height-stable.
 */
export function FocusSetupSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background pattern (same as the real view) */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.05),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <Skeleton className="h-9 w-32 rounded-full mb-6" />
          <Skeleton className="h-12 w-72 sm:w-80 mb-4" />
          <Skeleton className="h-6 w-80 max-w-full" />
        </div>

        {/* Today stats pills */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>

        {/* Active goals card */}
        <div className="mb-6 rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>

        <Card className="border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
          {/* Session Duration */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[76px] rounded-xl" />
              ))}
            </div>
          </div>

          {/* Category picker */}
          <div className="mb-8">
            <Skeleton className="h-4 w-44 mb-3" />
            <div className="flex gap-2 flex-wrap">
              {[92, 110, 84, 120, 96, 100].map((w, i) => (
                <Skeleton key={i} className="h-10 rounded-xl" style={{ width: w }} />
              ))}
            </div>
          </div>

          {/* Atmosphere */}
          <div className="mb-8">
            <Skeleton className="h-4 w-28 mb-4" />
            <Skeleton className="h-3 w-24 mb-2" />
            <div className="flex gap-3 overflow-hidden mb-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-24 shrink-0 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-3 w-24 mb-2" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-24 shrink-0 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Start button */}
          <Skeleton className="h-14 w-full rounded-xl" />
        </Card>

        {/* Tips */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[52px] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
