"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { timeEntryService } from "@/services/time-entry-service";
import { guestStorage } from "@/lib/guest-storage";
import { createClient } from "@/lib/supabase/client";

interface EntryFormProps {
  categories: { id: string; name: string; color: string }[];
  onSuccess?: () => void;
  isGuest?: boolean;
}

export function EntryForm({ categories, onSuccess, isGuest = false }: EntryFormProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  function calculateDuration(): number {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Select a category");
      return;
    }
    const duration = calculateDuration();
    if (duration <= 0) {
      toast.error("End time must be after start time");
      return;
    }
    if (duration > 86400) {
      toast.error("Entry cannot exceed 24 hours");
      return;
    }

    setLoading(true);
    try {
      if (isGuest) {
        guestStorage.addEntry({
          category_id: categoryId,
          started_at: new Date(`${date}T${startTime}`).toISOString(),
          ended_at: new Date(`${date}T${endTime}`).toISOString(),
          duration_seconds: duration,
          entry_type: "manual",
          notes,
        });
        toast.success("Entry created (local only)");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        await timeEntryService.createManualEntry({
          user_id: user.id,
          category_id: categoryId,
          started_at: new Date(`${date}T${startTime}`).toISOString(),
          ended_at: new Date(`${date}T${endTime}`).toISOString(),
          duration_seconds: duration,
          notes,
        });
        toast.success("Entry created");
      }
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create entry");
    }
    setLoading(false);
  }

  const duration = calculateDuration();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Manual Entry</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="rounded-md bg-muted p-2 text-center text-sm">
            Duration: {Math.floor(duration / 60)} minutes
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Entry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
