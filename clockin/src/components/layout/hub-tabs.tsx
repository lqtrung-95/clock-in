"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface HubTab {
  label: string;
  href: string;
}

/**
 * Sub-navigation for a consolidated hub (Insights, Progress). Highlights the
 * tab whose href prefixes the current path.
 */
export function HubTabs({ tabs }: { tabs: HubTab[] }) {
  const pathname = usePathname();
  return (
    <div className="inline-flex gap-1 rounded-2xl border border-border bg-card p-1.5">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
              active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
