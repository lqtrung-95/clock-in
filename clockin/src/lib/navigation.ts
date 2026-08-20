import type { LucideIcon } from "lucide-react";
import { Brain, Sun, BarChart3, Trophy, Settings } from "lucide-react";

/**
 * Single source of truth for the app shell's navigation. The sidebar and the
 * mobile tab bar both render from PRIMARY_NAV/SECONDARY_NAV so desktop and
 * mobile can never diverge in structure the way the old app-sidebar.tsx /
 * mobile-bottom-nav.tsx pair did (Social was a primary item on desktop but
 * buried in a "More" sheet on mobile).
 */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Path prefixes that count as "active" for this item, beyond href itself. */
  match?: string[];
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/focus", label: "Focus", icon: Brain },
  { href: "/today", label: "Today", icon: Sun },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/progress", label: "Progress", icon: Trophy },
];

export const SECONDARY_NAV: NavItem[] = [{ href: "/settings", label: "Settings", icon: Settings }];

export interface SegmentTab {
  label: string;
  href: string;
}

/** Sub-nav for hub routes, passed as data into PageShell — hub layouts render no chrome of their own. */
export const SEGMENTS: Record<string, SegmentTab[]> = {
  insights: [
    { label: "Trends", href: "/insights" },
    { label: "History", href: "/insights/history" },
  ],
  progress: [
    { label: "Goals", href: "/progress" },
    { label: "Badges", href: "/progress/badges" },
    { label: "Dream", href: "/progress/dream" },
    { label: "Leaderboard", href: "/progress/leaderboard" },
  ],
  settings: [
    { label: "Profile", href: "/settings" },
    { label: "Categories", href: "/settings/categories" },
    { label: "Timer", href: "/settings/timer" },
    { label: "Billing", href: "/settings/billing" },
    { label: "Install", href: "/settings/install" },
  ],
};

export const ROUTES = {
  home: "/focus",
  signIn: "/login",
  signUp: "/signup",
  landing: "/",
} as const;

/**
 * A route is active for a nav item if the pathname equals the item's href,
 * or sits under it. `/focus` also covers `/focus/rooms/*` — rooms are
 * "start work with others," the same intent as solo focus.
 */
export function isRouteActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.href) return true;
  if (pathname.startsWith(`${item.href}/`)) return true;
  return item.match?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ?? false;
}
