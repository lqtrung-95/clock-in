"use client";

import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/types/gamification";

export const goalService = {
  async getGoals(userId: string): Promise<Goal[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createGoal(
    userId: string,
    data: {
      category_id?: string | null;
      target_minutes: number;
      period: "daily" | "weekly" | "monthly";
    }
  ): Promise<Goal> {
    const supabase = createClient();
    const { data: goal, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        category_id: data.category_id || null,
        target_minutes: data.target_minutes,
        period: data.period,
      } as never)
      .select()
      .single();
    if (error) throw error;
    return goal as Goal;
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("goals").update(updates as never).eq("id", id);
    if (error) throw error;
  },

  async deleteGoal(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) throw error;
  },

  async calculateProgress(
    userId: string,
    goal: Goal
  ): Promise<{ current: number; target: number; percentage: number }> {
    const supabase = createClient();

    let startDate: Date;
    const now = new Date();

    switch (goal.period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    let query = supabase
      .from("time_entries")
      .select("duration_seconds")
      .eq("user_id", userId)
      .gte("started_at", startDate.toISOString());

    if (goal.category_id) {
      query = query.eq("category_id", goal.category_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    const totalSeconds = ((data || []) as { duration_seconds: number | null }[]).reduce(
      (sum, e) => sum + (e.duration_seconds || 0),
      0
    );
    const currentMinutes = Math.floor(totalSeconds / 60);
    const percentage = Math.min(
      100,
      Math.round((currentMinutes / goal.target_minutes) * 100)
    );

    return {
      current: currentMinutes,
      target: goal.target_minutes,
      percentage,
    };
  },
};
