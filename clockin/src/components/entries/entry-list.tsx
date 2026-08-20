"use client";

import { useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import type { TimeEntry } from "@/types/timer";
import { formatSecondsWithSeconds } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
      <div className="py-8 text-center text-sm text-ink-muted">
        No entries yet. Start a timer to track your time!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {grouped.map(([date, dayEntries]) => {
        const dateObj = parseISO(date);
        const today = new Date();
        const isToday = isSameDay(dateObj, today);

        return (
          <div key={date}>
            <h3 className="text-label mb-2 text-ink-subtle">
              {isToday ? "Today" : format(dateObj, "EEEE, MMMM d")}
            </h3>
            <div className="flex flex-col divide-y divide-line">
              {dayEntries.map((entry) => (
                <EntryRow
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

interface EntryRowProps {
  entry: TimeEntry;
  onDelete: () => void;
  deleting: boolean;
}

function EntryRow({ entry, onDelete, deleting }: EntryRowProps) {
  const startTime = format(parseISO(entry.started_at), "h:mm a");
  const endTime = entry.ended_at
    ? format(parseISO(entry.ended_at), "h:mm a")
    : "ongoing";

  return (
    <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
      {entry.category && (
        <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.category.color }} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{entry.category?.name || "Unknown"}</p>
        <p className="text-xs text-ink-subtle">
          {startTime} – {endTime}
          {entry.notes && <span className="ml-1.5 truncate">· {entry.notes}</span>}
        </p>
      </div>
      <p className="text-data text-sm text-ink-muted">
        {entry.duration_seconds ? formatSecondsWithSeconds(entry.duration_seconds) : "--"}
      </p>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete} disabled={deleting}>
        <Trash2 className="h-4 w-4 text-ink-subtle" />
      </Button>
    </div>
  );
}
