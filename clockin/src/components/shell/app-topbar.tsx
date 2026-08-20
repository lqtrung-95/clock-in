"use client";

import { usePathname } from "next/navigation";
import { PRIMARY_NAV, SECONDARY_NAV, SEGMENTS } from "@/lib/navigation";
import { AccountMenu } from "./account-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Owns breadcrumb + account menu — nothing else. Never a title: PageHeader
 * (rendered by PageShell, inside the scrollable content) is the only place a
 * page title appears. A title here would reopen the double-header bug this
 * whole shell exists to prevent. AiCoachPanel keeps its own floating
 * trigger, mounted separately in (app)/layout.tsx as before.
 */
export function AppTopbar() {
  const pathname = usePathname();
  const crumb = deriveBreadcrumb(pathname);

  return (
    <header
      data-shell-topbar
      className="sticky top-0 flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface/80 px-4 backdrop-blur md:px-6"
      style={{ zIndex: "var(--z-topbar)" }}
    >
      <div className="hidden md:block">
        {crumb.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {crumb.map((label, i) => (
                <span key={label} className="flex items-center gap-1.5">
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <AccountMenu />
      </div>
    </header>
  );
}

function deriveBreadcrumb(pathname: string): string[] {
  const primary = [...PRIMARY_NAV, ...SECONDARY_NAV].find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  if (!primary) return [];

  const segmentKey = primary.href.slice(1);
  const segments = SEGMENTS[segmentKey];
  if (!segments) return [primary.label];

  const active = segments.find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`));
  return active ? [primary.label, active.label] : [primary.label];
}
