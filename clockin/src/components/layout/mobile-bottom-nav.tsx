"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Brain, BarChart3, Target, Trophy, Users } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/focus", label: "Focus", icon: Brain },
  { href: "/social", label: "Social", icon: Users },
  { href: "/achievements", label: "Rewards", icon: Trophy },
  { href: "/goals", label: "Goals", icon: Target },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 md:hidden">
      <div className="flex h-16 items-center rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all duration-300",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground/70 hover:text-foreground/80"
              )}
            >
              {/* Active Background */}
              {isActive && (
                <div className="absolute inset-x-2 inset-y-1 rounded-xl bg-gradient-to-b from-blue-500/20 to-cyan-500/10 border border-blue-500/20" />
              )}

              {/* Icon Container */}
              <span className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
                isActive
                  ? "text-cyan-400"
                  : ""
              )}>
                <Icon className={cn(
                  "h-[18px] w-[18px] transition-transform duration-300",
                  isActive && "scale-110"
                )} />
              </span>

              {/* Label */}
              <span className={cn(
                "relative z-10 transition-all duration-300",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>

              {/* Active Glow Dot */}
              {isActive && (
                <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
