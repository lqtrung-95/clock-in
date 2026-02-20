"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Brain, Target, Settings, Users } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/focus", label: "Focus", icon: Brain },
  { href: "/social", label: "Social", icon: Users },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/settings", label: "Settings", icon: Settings },
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
                "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors duration-200",
                isActive
                  ? "text-cyan-400"
                  : "text-muted-foreground/60 hover:text-foreground/80"
              )}
            >
              <Icon className={cn(
                "h-[18px] w-[18px] transition-transform duration-200",
                isActive && "scale-110"
              )} />

              <span className={cn(isActive && "font-semibold")}>
                {item.label}
              </span>

              {isActive && (
                <div className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
