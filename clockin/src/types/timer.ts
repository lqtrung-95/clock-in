export type TimerStatus = "idle" | "running" | "paused";
export type EntryType = "timer" | "manual" | "pomodoro";

export interface TimeEntry {
  id: string;
  user_id: string;
  category_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  entry_type: EntryType;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ManualEntryInput {
  user_id: string;
  category_id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  notes?: string;
}
