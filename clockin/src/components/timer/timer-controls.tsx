"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTimerStore } from "@/stores/timer-store";
import { timeEntryService } from "@/services/time-entry-service";
import { guestStorage } from "@/lib/guest-storage";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Play, Pause, Square, Trash2 } from "lucide-react";

interface TimerControlsProps {
  categories: { id: string; name: string; color: string }[];
  isGuest?: boolean;
}

export function TimerControls({ categories, isGuest = false }: TimerControlsProps) {
  const router = useRouter();
  const { status, categoryId, entryId, start, pause, resume, stop, reset } = useTimerStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || "");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isIdle = status === "idle";

  async function handleStart() {
    if (!selectedCategory) {
      toast.error("Select a category first");
      return;
    }
    setLoading(true);
    try {
      if (isGuest) {
        // Guest mode - save to local storage
        const entry = guestStorage.addEntry({
          category_id: selectedCategory,
          started_at: new Date().toISOString(),
          ended_at: null,
          duration_seconds: null,
          entry_type: "timer",
          notes: null,
        });
        start(selectedCategory, entry.id);
        toast.success("Timer started (local only)");
      } else {
        // Authenticated - save to server
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const entry = await timeEntryService.startTimer(user.id, selectedCategory);
        start(selectedCategory, entry.id);
        toast.success("Timer started");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start timer");
    }
    setLoading(false);
  }

  async function handleStop() {
    if (!entryId) return;
    setLoading(true);
    try {
      const store = useTimerStore.getState();
      const elapsedMs = Date.now() - (store.startedAt || 0) - store.accumulatedMs;
      const durationSeconds = Math.floor(elapsedMs / 1000);

      if (isGuest) {
        // Guest mode - update local storage
        const endedAt = new Date().toISOString();
        guestStorage.updateEntry(entryId, {
          ended_at: endedAt,
          duration_seconds: durationSeconds,
        });
      } else {
        // Authenticated - update server
        await timeEntryService.stopTimer(entryId, durationSeconds);
      }
      stop();
      toast.success("Timer stopped");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to stop timer");
    }
    setLoading(false);
  }

  function handlePause() {
    pause();
    toast.info("Timer paused");
  }

  function handleResume() {
    resume();
    toast.info("Timer resumed");
  }

  function handleDiscard() {
    reset();
    toast.info("Timer discarded");
  }

  return (
    <div className="space-y-4">
      {isIdle && (
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex justify-center gap-3">
        {isIdle && (
          <Button
            size="lg"
            onClick={handleStart}
            disabled={loading}
            className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            Start Timer
          </Button>
        )}

        {(isRunning || isPaused) && (
          <>
            {isRunning ? (
              <Button
                size="lg"
                variant="outline"
                onClick={handlePause}
                disabled={loading}
                className="border-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Pause className="mr-2 h-5 w-5 fill-current" />
                Pause
              </Button>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                onClick={handleResume}
                disabled={loading}
                className="transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                Resume
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleStop}
              disabled={loading}
              className="bg-gradient-to-r from-accent to-orange-400 hover:from-accent/90 hover:to-orange-400/90 text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Square className="mr-2 h-5 w-5 fill-current" />
              Stop
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleDiscard}
              disabled={loading}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Discard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
