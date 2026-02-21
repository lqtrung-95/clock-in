"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Brain,
  Users,
  Target,
  MoreHorizontal,
  List,
  BarChart3,
  Trophy,
  Tags,
  Settings,
  LogOut,
  LogIn,
  X,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Primary tabs always visible in bottom bar
const primaryNavItems = [
  { href: "/focus", label: "Focus", icon: Brain },
  { href: "/dashboard", label: "Summary", icon: Home },
  { href: "/social", label: "Social", icon: Users },
  { href: "/goals", label: "Goals", icon: Target },
];

// Secondary items shown in the "More" sheet
const secondaryNavItems = [
  { href: "/history", label: "History", icon: List },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/install", label: "Install App", icon: Download },
];

// Pages that count as "More" being active
const moreActiveRoutes = secondaryNavItems.map((i) => i.href);

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <Icon className={cn("h-[18px] w-[18px] transition-transform duration-200", isActive && "scale-110")} />
      <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{label}</span>
      {isActive && (
        <div className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
      )}
    </>
  );

  const className = cn(
    "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors duration-200",
    isActive ? "text-cyan-400" : "text-muted-foreground/60 hover:text-foreground/80"
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
  }, []);

  // Close sheet when navigating
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  const isMoreActive = moreActiveRoutes.some((route) => pathname.startsWith(route));

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <div className="flex h-16 items-center rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden">
          {primaryNavItems.map((item) => {
            const isActive =
              item.href === "/focus"
                ? pathname === "/focus" || pathname.startsWith("/focus?")
                : item.href === "/social"
                ? pathname.startsWith("/social") || pathname.startsWith("/focus-room")
                : pathname.startsWith(item.href);
            return (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
              />
            );
          })}

          {/* More button */}
          <NavItem
            label="More"
            icon={MoreHorizontal}
            isActive={isMoreActive || sheetOpen}
            onClick={() => setSheetOpen((v) => !v)}
          />
        </div>
      </nav>

      {/* More Sheet */}
      {sheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setSheetOpen(false)}
          />

          {/* Sheet panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-in slide-in-from-bottom duration-300">
            <div className="mx-4 mb-4 rounded-3xl border border-border bg-card/98 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
              {/* Handle */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">More</span>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Secondary nav grid */}
              <div className="grid grid-cols-3 gap-2 p-4">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl p-3 transition-colors duration-200",
                        isActive
                          ? "bg-blue-500/10 border border-blue-500/20 text-cyan-400"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className={cn("text-[11px] font-medium", isActive && "font-semibold")}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-4 h-px bg-border" />

              {/* Auth action */}
              <div className="p-4">
                {isAuthenticated ? (
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                      <LogOut className="h-4 w-4" />
                    </div>
                    Sign out
                  </button>
                ) : isAuthenticated === false ? (
                  <button
                    onClick={() => router.push("/login")}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                      <LogIn className="h-4 w-4" />
                    </div>
                    Sign in
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
