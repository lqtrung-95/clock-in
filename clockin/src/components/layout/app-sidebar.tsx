"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  Play,
  Brain,
  List,
  BarChart3,
  Target,
  Settings,
  LogOut,
  LogIn,
  Flame,
  Tags,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/track", label: "Track", icon: Play },
  { href: "/focus", label: "Focus", icon: Brain },
  { href: "/history", label: "History", icon: List },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="hidden w-72 flex-col md:flex z-50">
      {/* Floating Sidebar Container */}
      <div className="m-4 flex h-[calc(100vh-2rem)] flex-col rounded-3xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden">
        {/* Logo Section */}
        <div className="flex h-20 items-center border-b border-border px-6">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:shadow-blue-500/50 group-hover:scale-105">
              <Flame className="h-5 w-5 fill-current" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground">
                Clockin
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
                Focus & Flow
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {/* Active Background Glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/10 opacity-100" />
                )}
                {/* Active Border Glow */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl border border-blue-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
                )}

                <span className={cn(
                  "relative z-10 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                )}>
                  <Icon className={cn(
                    "h-[18px] w-[18px] transition-transform duration-300",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                </span>
                <span className="relative z-10 tracking-wide">
                  {item.label}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth Section */}
        <div className="border-t border-border p-4">
          {isAuthenticated === null ? (
            // Loading state
            <div className="h-12 rounded-2xl bg-muted animate-pulse" />
          ) : isAuthenticated ? (
            // Sign out button for authenticated users
            <Button
              variant="ghost"
              className="w-full justify-start gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
              onClick={handleSignOut}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <LogOut className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              Sign out
            </Button>
          ) : (
            // Sign in button for guests
            <Button
              variant="ghost"
              className="w-full justify-start gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-blue-500/10 hover:text-blue-400"
              onClick={() => router.push("/login")}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <LogIn className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
