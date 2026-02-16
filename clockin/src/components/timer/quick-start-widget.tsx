"use client";

import { useTimerStore } from "@/stores/timer-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Play } from "lucide-react";
import { toast } from "sonner";
import { timeEntryService } from "@/services/time-entry-service";
import { guestStorage } from "@/lib/guest-storage";
import { createClient } from "@/lib/supabase/client";

interface QuickStartWidgetProps {
  categories: { id: string; name: string; color: string }[];
  isGuest?: boolean;
}

export function QuickStartWidget({ categories, isGuest = false }: QuickStartWidgetProps) {
  const { lastCategoryId, status, start } = useTimerStore();
  const lastCategory = categories.find((c) => c.id === lastCategoryId);
  const supabase = createClient();

  async function handleQuickStart() {
    if (!lastCategory) return;
    try {
      if (isGuest) {
        const entry = guestStorage.addEntry({
          category_id: lastCategory.id,
          started_at: new Date().toISOString(),
          ended_at: null,
          duration_seconds: null,
          entry_type: "timer",
          notes: null,
        });
        start(lastCategory.id, entry.id);
        toast.success(`Started: ${lastCategory.name} (local only)`);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Not authenticated");
          return;
        }
        const entry = await timeEntryService.startTimer(user.id, lastCategory.id);
        start(lastCategory.id, entry.id);
        toast.success(`Started: ${lastCategory.name}`);
      }
    } catch {
      toast.error("Failed to start timer");
    }
  }

  if (status !== "idle" || !lastCategory) return null;

  return (
    <Card className="group relative overflow-hidden border-border/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: lastCategory.color }}
          >
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Quick start</p>
            <p className="font-semibold">{lastCategory.name}</p>
          </div>
        </div>
        <Button
          onClick={handleQuickStart}
          size="sm"
          className="bg-gradient-to-r from-primary to-cyan-500 text-white shadow-md shadow-primary/20 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
        >
          <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
          Start
        </Button>
      </div>
    </Card>
  );
}
