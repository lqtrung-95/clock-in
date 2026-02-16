"use client";

import { createClient } from "@/lib/supabase/client";

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export const streakService = {
  async getStreak(userId: string): Promise<StreakData | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("streaks")
      .select("current_streak, longest_streak, last_active_date")
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  async updateStreak(userId: string): Promise<void> {
    const supabase = createClient();
    const { data: streakData } = await supabase
      .from("streaks")
      .select("current_streak, longest_streak, last_active_date")
      .eq("user_id", userId)
      .single();

    if (!streakData) return;

    const streak = streakData as StreakData;
    const today = new Date().toISOString().split("T")[0];
    const lastActive = streak.last_active_date;

    if (lastActive === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = streak.current_streak;
    if (!lastActive || lastActive === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    await supabase
      .from("streaks")
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak.longest_streak),
        last_active_date: today,
      } as never)
      .eq("user_id", userId);
  },
};
