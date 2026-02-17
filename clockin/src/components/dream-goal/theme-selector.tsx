"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEME_CONFIG, type DreamGoalTheme } from "@/types/dream-goal";
import { Mountain, Castle, TreePine, Rocket, Palette } from "lucide-react";

const ICONS = {
  Mountain,
  Castle,
  TreePine,
  Rocket,
};

interface ThemeSelectorProps {
  currentTheme?: DreamGoalTheme;
  onThemeChange: (theme: DreamGoalTheme) => void;
}

export function ThemeSelector({ currentTheme = "mountain", onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const themes: DreamGoalTheme[] = ["mountain", "castle", "tree", "space"];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Palette className="mr-2 h-4 w-4" />
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themes.map((theme) => {
          const config = THEME_CONFIG[theme];
          const Icon = ICONS[config.icon as keyof typeof ICONS];
          const isActive = currentTheme === theme;

          return (
            <DropdownMenuItem
              key={theme}
              onClick={() => {
                onThemeChange(theme);
                setIsOpen(false);
              }}
              className={isActive ? "bg-accent" : ""}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${config.color}-500/20`}
                >
                  <Icon className={`h-4 w-4 text-${config.color}-500`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{config.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {config.description}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
