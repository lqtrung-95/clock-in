"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SegmentTab } from "@/lib/navigation";

/**
 * Sub-nav for hub routes (Insights: Trends/History, Progress: Goals/Badges/...).
 * Takes its tabs as data via PageShell's `segments` prop — there is no hub
 * layout rendering this anymore, so there is nowhere for a second header to
 * sneak in.
 */
export function SegmentedNav({ segments }: { segments: SegmentTab[] }) {
  const pathname = usePathname();

  return (
    <div className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1">
      {segments.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-surface-sunken text-ink" : "text-ink-muted hover:text-ink"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
