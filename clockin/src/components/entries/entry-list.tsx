"use client";

import { useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import type { TimeEntry } from "@/types/timer";
import { formatSecondsWithSeconds } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { timeEntryService } from "@/services/time-entry-service";
import { guestStorage } from "@/lib/guest-storage";

interface EntryListProps {
  entries: TimeEntry[];
  onDelete?: () => void;
  isGuest?: boolean;
}

function groupEntriesByDate(entries: TimeEntry[]) {
  const groups: Record<string, TimeEntry[]> = {};
  entries.forEach((entry) => {
    const date = entry.started_at.split("T")[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

export function EntryList({ entries, onDelete, isGuest = false }: EntryListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const grouped = groupEntriesByDate(entries);

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    setDeleting(id);
    try {
      if (isGuest) {
        guestStorage.deleteEntry(id);
      } else {
        await timeEntryService.deleteEntry(id);
      }
      toast.success("Entry deleted");
      onDelete?.();
    } catch {
      toast.error("Failed to delete");
    }
    setDeleting(null);
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No entries yet. Start a timer to track your time!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, dayEntries]) => {
        const dateObj = parseISO(date);
        const today = new Date();
        const isToday = isSameDay(dateObj, today);

        return (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isToday ? "Today" : format(dateObj, "EEEE, MMMM d")}
            </h3>
            <div className="space-y-2">
              {dayEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={() => handleDelete(entry.id)}
                  deleting={deleting === entry.id}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface EntryCardProps {
  entry: TimeEntry;
  onDelete: () => void;
  deleting: boolean;
}

function EntryCard({ entry, onDelete, deleting }: EntryCardProps) {
  const startTime = format(parseISO(entry.started_at), "h:mm a");
  const endTime = entry.ended_at
    ? format(parseISO(entry.ended_at), "h:mm a")
    : "ongoing";

  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        {entry.category && (
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: entry.category.color }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {entry.category?.name || "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground">
            {startTime} - {endTime}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono font-medium">
            {entry.duration_seconds
              ? formatSecondsWithSeconds(entry.duration_seconds)
              : "--"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      {entry.notes && (
        <p className="mt-2 text-sm text-muted-foreground pl-6">
          {entry.notes}
        </p>
      )}
    </Card>
  );
}
