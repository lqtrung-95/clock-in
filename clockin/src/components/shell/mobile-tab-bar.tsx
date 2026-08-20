"use client";

import { PRIMARY_NAV } from "@/lib/navigation";
import { NavItem } from "./nav-item";

/**
 * Same 4 destinations as the desktop sidebar, no "More" sheet — Settings and
 * sign-out live behind the topbar's AccountMenu on both breakpoints instead.
 * The old app had Social as a primary sidebar item but buried under "More"
 * on mobile; that split is gone because it no longer exists.
 */
export function MobileTabBar() {
  return (
    <nav
      data-shell-tabbar
      className="fixed inset-x-0 bottom-0 flex h-16 items-center border-t border-line bg-surface md:hidden"
      style={{ zIndex: "var(--z-tabbar)" }}
    >
      {PRIMARY_NAV.map((item) => (
        <NavItem key={item.href} item={item} variant="tab" />
      ))}
    </nav>
  );
}
