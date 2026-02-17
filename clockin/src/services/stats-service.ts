import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface DailyStats {
  date: string;
  total_seconds: number;
  session_count: number;
}

export async function getDailyFocusStats(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyStats[]> {
  const { data, error } = await supabase
    .from("time_entries")
    .select("started_at, duration_seconds")
    .eq("user_id", userId)
    .gte("started_at", startDate)
    .lte("started_at", endDate)
    .order("started_at", { ascending: true });

  if (error) {
    console.error("Error fetching daily stats:", error);
    throw error;
  }

  // Aggregate by date
  const statsMap = new Map<string, DailyStats>();

  (data || []).forEach((entry: { started_at: string; duration_seconds: number | null }) => {
    const date = entry.started_at.split("T")[0];
    const existing = statsMap.get(date);

    if (existing) {
      existing.total_seconds += entry.duration_seconds || 0;
      existing.session_count += 1;
    } else {
      statsMap.set(date, {
        date,
        total_seconds: entry.duration_seconds || 0,
        session_count: 1,
      });
    }
  });

  return Array.from(statsMap.values());
}

export function getContributionLevel(hours: number): number {
  if (hours === 0) return 0;
  if (hours < 1) return 1;
  if (hours < 3) return 2;
  if (hours < 5) return 3;
  return 4;
}
