export interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category_id: string | null;
  target_minutes: number;
  period: "daily" | "weekly" | "monthly";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  user_id: string;
  challenge_key: string;
  target_minutes: number;
  progress_minutes: number;
  period_start: string;
  period_end: string;
  status: "active" | "completed" | "expired";
  created_at: string;
}

// New gamification types
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  condition_type: string;
  condition_value: number;
  xp_reward: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_key: string;
  badge_definition_key?: string;
  earned_at: string;
  badge?: BadgeDefinition;
}

export interface WeeklyChallenge {
  id: string;
  challenge_key: string;
  name: string;
  description: string;
  challenge_type: string;
  target_value: number;
  xp_reward: number;
  week_start: string;
  week_end: string;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  progress_current: number;
  progress_target: number;
  status: 'active' | 'completed' | 'expired';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  challenge?: WeeklyChallenge;
}

export interface GamificationState {
  userStats: UserStats | null;
  levelInfo: LevelInfo | null;
  badges: UserBadge[];
  challenges: ChallengeProgress[];
  crystalConfig: CrystalCustomizations | null;
  isLoading: boolean;
}

import type { UserStats, LevelInfo, CrystalCustomizations } from './xp-system';
