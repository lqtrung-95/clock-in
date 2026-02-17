"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { RARITY_COLORS, RARITY_LABELS } from "@/data/badge-definitions";
import type { BadgeDefinition } from "@/types/gamification";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned?: boolean;
  earnedAt?: string;
  showRarity?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BadgeCard({
  badge,
  earned = false,
  earnedAt,
  showRarity = true,
  size = "md",
  className,
}: BadgeCardProps) {
  // Get icon component dynamically
  const IconComponent = (LucideIcons[badge.icon as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.Award;

  const sizeClasses = {
    sm: "p-3 gap-2",
    md: "p-4 gap-3",
    lg: "p-5 gap-4",
  };

  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const rarityColor = RARITY_COLORS[badge.rarity];

  return (
    <Card
      className={cn(
        "group relative flex flex-col items-center text-center transition-all duration-300",
        earned
          ? "border-border bg-card hover:border-border/80 hover:bg-secondary"
          : "border-dashed border-border/50 bg-muted/30 opacity-60",
        sizeClasses[size],
        className
      )}
    >
      {/* Rarity indicator */}
      {showRarity && (
        <div
          className="absolute right-2 top-2 h-2 w-2 rounded-full"
          style={{ backgroundColor: rarityColor }}
        />
      )}

      {/* Icon container */}
      <div
        className={cn(
          "flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
          iconSizes[size]
        )}
        style={{
          backgroundColor: earned ? `${rarityColor}20` : "transparent",
          color: earned ? rarityColor : "#64748b",
          border: earned ? `2px solid ${rarityColor}40` : "2px dashed #64748b",
        }}
      >
        <IconComponent className={cn("h-1/2 w-1/2", !earned && "opacity-40")} />
      </div>

      {/* Badge info */}
      <div className="space-y-1">
        <h4 className={cn("font-semibold text-foreground", !earned && "text-muted-foreground")}>
          {badge.name}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>

        {earned && earnedAt && (
          <p className="text-[10px] text-muted-foreground/70">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}

        {showRarity && (
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{
              backgroundColor: `${rarityColor}20`,
              color: rarityColor,
            }}
          >
            {RARITY_LABELS[badge.rarity]}
          </span>
        )}
      </div>

      {/* XP reward */}
      <div className="mt-auto pt-2">
        <span className="text-xs font-medium text-cyan-500">+{badge.xp_reward} XP</span>
      </div>
    </Card>
  );
}
