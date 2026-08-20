"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronsLeft, ChevronsRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, SECONDARY_NAV, ROUTES } from "@/lib/navigation";
import { NavItem } from "./nav-item";

const COLLAPSE_COOKIE = "sidebar-collapsed";

/**
 * Flush-left column, not the old floating m-4 rounded-3xl panel — a floating
 * card forced the 3xl radius tier and fought the calm/recede brief.
 * `defaultCollapsed` comes from a cookie read server-side in (app)/layout.tsx
 * so there's no expand-flash on first paint.
 */
export function AppSidebar({ defaultCollapsed }: { defaultCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = next
      ? `${COLLAPSE_COOKIE}=1; path=/; max-age=31536000`
      : `${COLLAPSE_COOKIE}=; path=/; max-age=0`;
  }

  return (
    <aside
      data-shell-sidebar
      className={cn(
        "hidden shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-300 md:flex",
        collapsed ? "w-16" : "w-60"
      )}
      style={{ zIndex: "var(--z-sidebar)" }}
    >
      <div className={cn("flex h-14 items-center border-b border-line px-4", collapsed && "justify-center px-0")}>
        <Link href={ROUTES.home} className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-accent-solid text-accent-fg">
            <Flame className="h-4 w-4" />
          </span>
          {!collapsed && <span className="truncate text-sm font-semibold tracking-tight text-ink">Effortful</span>}
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {PRIMARY_NAV.map((item) => (
          <NavItem key={item.href} item={item} variant="sidebar" collapsed={collapsed} />
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-line p-2">
        {SECONDARY_NAV.map((item) => (
          <NavItem key={item.href} item={item} variant="sidebar" collapsed={collapsed} />
        ))}
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
