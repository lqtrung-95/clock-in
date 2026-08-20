import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 2-col mobile / 4-col desktop grid for a row of <Stat>s — replaces repeated ad-hoc grid classes. */
export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 rounded-md border border-line bg-surface-raised p-5 shadow-card md:grid-cols-4", className)}>
      {children}
    </div>
  );
}
