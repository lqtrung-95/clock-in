"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProStatus } from "@/hooks/use-pro-status";
import type { PlanType } from "@/types/subscription";
import { cn } from "@/lib/utils";

const PLAN_CONFIG: Record<PlanType, { label: string; className: string }> = {
  free: {
    label: "FREE",
    className: "bg-muted text-muted-foreground border-border hover:bg-muted",
  },
  pro: {
    label: "PRO",
    className:
      "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent hover:from-blue-600 hover:to-cyan-600",
  },
  lifetime: {
    label: "LIFETIME",
    className:
      "bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-transparent hover:from-amber-600 hover:to-yellow-500",
  },
};

interface PlanBadgeProps {
  userId: string | null;
  className?: string;
}

/** Small badge showing current plan tier (FREE / PRO / LIFETIME). */
export function PlanBadge({ userId, className }: PlanBadgeProps) {
  const { plan, isLoading } = useProStatus(userId);

  // Reserve the badge's footprint while the plan resolves so it doesn't pop in.
  if (isLoading) {
    return <Skeleton className={cn("h-4 w-10 rounded-full", className)} />;
  }

  const config = PLAN_CONFIG[plan];

  return (
    <Badge
      className={cn(
        "text-[10px] font-bold tracking-widest px-2 py-0.5",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
