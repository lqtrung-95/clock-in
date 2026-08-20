"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isRouteActive, type NavItem as NavItemData } from "@/lib/navigation";

/**
 * Shared by app-sidebar.tsx and mobile-tab-bar.tsx so the two can never
 * diverge in what counts as "active" the way the old app-sidebar.tsx and
 * mobile-bottom-nav.tsx did (each had its own hand-rolled if/else chain).
 */
export function NavItem({
  item,
  variant,
  collapsed = false,
}: {
  item: NavItemData;
  variant: "sidebar" | "tab";
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const active = isRouteActive(pathname, item);
  const Icon = item.icon;

  if (variant === "tab") {
    return (
      <Link
        href={item.href}
        className={cn(
          "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-ink-subtle transition-colors",
          active && "text-accent-solid"
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
        <span className={cn("text-[10px] font-medium", active && "font-semibold")}>{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active ? "bg-accent-soft text-accent-solid" : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
