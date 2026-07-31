import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell, PageHeaderSkeleton, CardListSkeleton } from "@/components/skeletons/skeleton-parts";

/** History page (max-w-3xl): header with export/add actions + entries card. */
export function HistoryPageSkeleton() {
  return (
    <PageShell maxWidth="max-w-3xl">
      <PageHeaderSkeleton withAction />
      <CardListSkeleton rows={6} />
    </PageShell>
  );
}

/** Categories page (max-w-2xl): header with "New Category" action + list card. */
export function CategoriesPageSkeleton() {
  return (
    <PageShell maxWidth="max-w-2xl">
      <PageHeaderSkeleton withAction />
      <CardListSkeleton rows={5} />
    </PageShell>
  );
}

/** Settings page (max-w-2xl): header + a tall settings card with sections. */
export function SettingsPageSkeleton() {
  return (
    <PageShell maxWidth="max-w-2xl">
      <PageHeaderSkeleton />
      <Card className="space-y-8 border border-border bg-card p-6">
        {Array.from({ length: 3 }).map((_, section) => (
          <div key={section} className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </Card>
    </PageShell>
  );
}

/**
 * Dream goal page: full-height 3D scene with a corner progress card.
 * Fills the viewport so there's no shift when the canvas mounts.
 */
export function DreamPageSkeleton() {
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      <Skeleton className="absolute inset-0 rounded-none" />
      <Card className="absolute bottom-4 left-4 right-4 z-10 border border-border bg-card/90 p-4 backdrop-blur-md md:bottom-8 md:left-8 md:right-auto md:w-80">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
