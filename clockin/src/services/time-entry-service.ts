"use client";

import { createClient } from "@/lib/supabase/client";
import type { TimeEntry, ManualEntryInput } from "@/types/timer";

export const timeEntryService = {
  async startTimer(userId: string, categoryId: string): Promise<TimeEntry> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        user_id: userId,
        category_id: categoryId,
        started_at: new Date().toISOString(),
        entry_type: "timer",
      } as never)
      .select("*")
      .single();
    if (error) throw error;
    return data as TimeEntry;
  },

  async stopTimer(entryId: string, durationSeconds: number): Promise<TimeEntry> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("time_entries")
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
      } as never)
      .eq("id", entryId)
      .select("*")
      .single();
    if (error) throw error;
    return data as TimeEntry;
  },

  async createManualEntry(input: ManualEntryInput): Promise<TimeEntry> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        user_id: input.user_id,
        category_id: input.category_id,
        started_at: input.started_at,
        ended_at: input.ended_at,
        duration_seconds: input.duration_seconds,
        entry_type: "manual",
        notes: input.notes || null,
      } as never)
      .select("*")
      .single();
    if (error) throw error;
    return data as TimeEntry;
  },

  async getEntries(userId: string, days = 7): Promise<TimeEntry[]> {
    const supabase = createClient();
    const from = new Date();
    from.setDate(from.getDate() - days);
    const { data, error } = await supabase
      .from("time_entries")
      .select("*, category:categories(*)")
      .eq("user_id", userId)
      .gte("started_at", from.toISOString())
      .order("started_at", { ascending: false });
    if (error) throw error;
    return (data as TimeEntry[] | null) ?? [];
  },

  async getEntriesForDateRange(userId: string, start: string, end: string): Promise<TimeEntry[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("time_entries")
      .select("*, category:categories(*)")
      .eq("user_id", userId)
      .gte("started_at", start)
      .lte("started_at", end)
      .order("started_at", { ascending: false });
    if (error) throw error;
    return (data as TimeEntry[] | null) ?? [];
  },

  async deleteEntry(entryId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("time_entries").delete().eq("id", entryId);
    if (error) throw error;
  },

  async getActiveEntry(userId: string): Promise<TimeEntry | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("time_entries")
      .select("*, category:categories(*)")
      .eq("user_id", userId)
      .is("ended_at", null)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return (data || null) as TimeEntry | null;
  },

  async getTotalHours(userId: string, days = 7): Promise<number> {
    const supabase = createClient();
    const from = new Date();
    from.setDate(from.getDate() - days);
    const { data, error } = await supabase
      .from("time_entries")
      .select("duration_seconds")
      .eq("user_id", userId)
      .gte("started_at", from.toISOString())
      .not("duration_seconds", "is", null);
    if (error) throw error;
    const totalSeconds = ((data || []) as { duration_seconds: number | null }[]).reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
    return Math.round((totalSeconds / 3600) * 10) / 10;
  },
};
