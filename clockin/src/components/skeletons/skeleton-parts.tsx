import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Shared skeleton building blocks used across dashboard page skeletons.
 * Each mirrors the real layout's spacing/height so swapping skeleton -> content
 * does not shift the page.
 */

// Standard page padding + centered container matching the real pages.
export function PageShell({
  children,
  maxWidth = "max-w-4xl",
  className,
}: {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}) {
  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className={cn("mx-auto space-y-6", maxWidth, className)}>{children}</div>
    </div>
  );
}

// Icon-box + title + subtitle header used by most pages.
export function PageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3.5 w-52" />
        </div>
      </div>
      {withAction && <Skeleton className="h-9 w-32 rounded-md" />}
    </div>
  );
}

// A stat card matching the dashboard/stats gradient-icon stat cards.
export function StatCardSkeleton() {
  return (
    <Card className="border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
        <div className="space-y-2 pt-1">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </Card>
  );
}

// A single list-row placeholder (entries, badges lists, etc.).
export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

// A list of rows inside a card — mirrors EntryList / CategoryList loading.
export function CardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="border border-border bg-card p-6">
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    </Card>
  );
}
