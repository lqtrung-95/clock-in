"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  UserBadge,
  ChallengeProgress,
  WeeklyChallenge,
  BadgeDefinition,
} from "@/types/gamification";
import type {
  UserStats,
  LevelInfo,
  CrystalCustomizations,
} from "@/types/xp-system";


// XP Calculations
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

export function xpForNextLevel(level: number): number {
  return level * 1000;
}

export function getLevelInfo(userStats: UserStats): LevelInfo {
  const currentLevel = userStats.current_level;
  const currentXP = userStats.total_xp;
  const xpForNext = xpForNextLevel(currentLevel);
  const xpProgress = currentXP - (currentLevel - 1) * 1000;
  const progressPercentage = Math.min((xpProgress / 1000) * 100, 100);

  return {
    currentLevel,
    currentXP,
    xpForNextLevel: xpForNext,
    xpProgress,
    progressPercentage,
  };
}

// User Stats Service
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No stats found, create default
      return createDefaultUserStats(userId);
    }
    console.error("Error fetching user stats:", error);
    return null;
  }

  return data as UserStats;
}

export async function createDefaultUserStats(userId: string): Promise<UserStats> {
  const supabase = createClient();
  // Check if already exists first (race condition fix)
  const { data: existing } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existing) {
    return existing as UserStats;
  }

  const defaultStats = {
    user_id: userId,
    total_xp: 0,
    current_level: 1,
    total_focus_minutes: 0,
    weekly_focus_minutes: 0,
    monthly_focus_minutes: 0,
    current_streak: 0,
    longest_streak: 0,
    last_active_date: null as string | null,
  };

  const { data, error } = await supabase
    .from("user_stats")
    .insert(defaultStats as never)
    .select()
    .single();

  if (error) {
    // If duplicate key, fetch existing
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (existing) return existing as UserStats;
    }
    console.error("Error creating user stats:", error);
    throw error;
  }

  // Also create default crystal customizations
  try {
    await createDefaultCrystalCustomizations(userId);
  } catch {
    // Ignore if already exists
  }

  return data as UserStats;
}

export async function addXP(userId: string, xpAmount: number): Promise<void> {
  const supabase = createClient();
  const { data: stats } = await supabase
    .from("user_stats")
    .select("total_xp")
    .eq("user_id", userId)
    .single();

  if (stats && typeof stats === 'object' && 'total_xp' in stats) {
    const currentXp = (stats as { total_xp: number }).total_xp;
    await supabase
      .from("user_stats")
      .update({ total_xp: currentXp + xpAmount } as never)
      .eq("user_id", userId);
  }
}

// Crystal Customizations Service
export async function getCrystalCustomizations(
  userId: string
): Promise<CrystalCustomizations | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("crystal_customizations")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return createDefaultCrystalCustomizations(userId);
    }
    console.error("Error fetching crystal customizations:", error);
    return null;
  }

  return data as unknown as CrystalCustomizations;
}

export async function createDefaultCrystalCustomizations(
  userId: string
): Promise<CrystalCustomizations> {
  const supabase = createClient();
  // Check if already exists first (race condition fix)
  const { data: existing } = await supabase
    .from("crystal_customizations")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existing) {
    return existing as unknown as CrystalCustomizations;
  }

  const defaults = {
    user_id: userId,
    unlocked_shapes: ["icosahedron"],
    unlocked_colors: ["blue"],
    unlocked_themes: ["default"],
    active_shape: "icosahedron",
    active_color: "blue",
    active_theme: "default",
  };

  const { data, error } = await supabase
    .from("crystal_customizations")
    .insert(defaults as never)
    .select()
    .single();

  if (error) {
    // If duplicate key, fetch existing
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("crystal_customizations")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (existing) return existing as unknown as CrystalCustomizations;
    }
    console.error("Error creating crystal customizations:", error);
    throw error;
  }

  return data as unknown as CrystalCustomizations;
}

export async function updateCrystalCustomization(
  userId: string,
  updates: Partial<CrystalCustomizations>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("crystal_customizations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating crystal customization:", error);
    throw error;
  }
}

// Badge Service
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_badges")
    .select("*, badge_definition:badge_definition_key(*)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }

  return (data || []) as unknown as UserBadge[];
}

export async function getAllBadgeDefinitions(): Promise<BadgeDefinition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("badge_definitions")
    .select("*")
    .order("xp_reward", { ascending: true });

  if (error) {
    console.error("Error fetching badge definitions:", error);
    return [];
  }

  return (data || []) as BadgeDefinition[];
}

export async function awardBadge(
  userId: string,
  badgeKey: string,
  xpReward: number
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("user_badges").insert({
    user_id: userId,
    badge_definition_key: badgeKey,
    earned_at: new Date().toISOString(),
  } as never);

  if (error) {
    if (error.code === "23505") {
      // Already has badge
      return;
    }
    console.error("Error awarding badge:", error);
    throw error;
  }

  // Award XP for the badge
  await addXP(userId, xpReward);
}

// Weekly Challenges Service
export async function getActiveWeeklyChallenges(): Promise<WeeklyChallenge[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("weekly_challenges")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching weekly challenges:", error);
    return [];
  }

  return (data || []) as WeeklyChallenge[];
}

export async function getUserChallengeProgress(
  userId: string
): Promise<ChallengeProgress[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("weekly_challenge_progress")
    .select("*, challenge:challenge_id(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching challenge progress:", error);
    return [];
  }

  return (data || []) as unknown as ChallengeProgress[];
}

export async function initializeUserChallenges(userId: string): Promise<void> {
  const supabase = createClient();
  // Get active challenges
  const challenges = await getActiveWeeklyChallenges();

  // Initialize progress for each challenge
  for (const challenge of challenges) {
    await supabase.from("weekly_challenge_progress").upsert(
      {
        user_id: userId,
        challenge_id: challenge.id,
        progress_target: challenge.target_value,
        status: "active",
      } as never,
      { onConflict: "user_id,challenge_id" }
    );
  }
}

export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  progress: number
): Promise<void> {
  const supabase = createClient();
  const { data: currentProgress } = await supabase
    .from("weekly_challenge_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .single();

  if (!currentProgress || (currentProgress as { status?: string }).status === "completed") {
    return;
  }

  const typedProgress = currentProgress as {
    progress_current: number;
    progress_target: number;
    challenge?: { xp_reward?: number };
  };

  const newProgress = typedProgress.progress_current + progress;
  const isCompleted = newProgress >= typedProgress.progress_target;

  const { error } = await supabase
    .from("weekly_challenge_progress")
    .update({
      progress_current: Math.min(newProgress, typedProgress.progress_target),
      status: isCompleted ? "completed" : "active",
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("user_id", userId)
    .eq("challenge_id", challengeId);

  if (error) {
    console.error("Error updating challenge progress:", error);
    throw error;
  }

  // Award XP if completed
  if (isCompleted && typedProgress.challenge?.xp_reward) {
    await addXP(userId, typedProgress.challenge.xp_reward);
  }
}

// Time Entry Tracking
export async function trackFocusTime(
  userId: string,
  minutes: number,
  categoryId?: string
): Promise<void> {
  const supabase = createClient();
  // Get current stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!stats) return;

  const typedStats = stats as {
    current_streak: number;
    total_focus_minutes: number;
    weekly_focus_minutes: number;
    monthly_focus_minutes: number;
    total_xp: number;
  };

  // Calculate XP with streak bonus
  let xpEarned = minutes;
  const streakMultiplier = typedStats.current_streak >= 30 ? 1.25 : typedStats.current_streak >= 7 ? 1.1 : 1;
  xpEarned = Math.floor(xpEarned * streakMultiplier);

  // Update stats
  const updates = {
    total_focus_minutes: (typedStats.total_focus_minutes || 0) + minutes,
    weekly_focus_minutes: (typedStats.weekly_focus_minutes || 0) + minutes,
    monthly_focus_minutes: (typedStats.monthly_focus_minutes || 0) + minutes,
    total_xp: (typedStats.total_xp || 0) + xpEarned,
    last_active_date: new Date().toISOString().split("T")[0],
  };

  await supabase.from("user_stats").update(updates as never).eq("user_id", userId);

  // Check for badge unlocks
  await checkAndAwardBadges(userId, typedStats as UserStats);
}

async function checkAndAwardBadges(
  userId: string,
  stats: UserStats
): Promise<void> {
  const badges = await getAllBadgeDefinitions();
  const userBadges = await getUserBadges(userId);
  const earnedBadgeKeys = new Set(userBadges.map((b) => b.badge_definition_key || b.badge_key));

  const totalHours = stats.total_focus_minutes / 60;

  for (const badge of badges) {
    if (earnedBadgeKeys.has(badge.key)) continue;

    let shouldAward = false;

    switch (badge.condition_type) {
      case "total_hours":
        shouldAward = totalHours >= badge.condition_value;
        break;
      case "streak_days":
        shouldAward = stats.current_streak >= badge.condition_value;
        break;
      // Add more conditions as needed
    }

    if (shouldAward) {
      await awardBadge(userId, badge.key, badge.xp_reward);
    }
  }
}
