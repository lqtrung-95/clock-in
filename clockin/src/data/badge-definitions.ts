import type { BadgeDefinition, BadgeRarity } from '@/types/gamification';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Time-based badges
  { key: 'first_10h', name: 'Getting Started', description: 'Complete 10 hours of focused time', icon: 'Clock', rarity: 'common', condition_type: 'total_hours', condition_value: 10, xp_reward: 100, created_at: '' },
  { key: 'first_50h', name: 'Focus Apprentice', description: 'Complete 50 hours of focused time', icon: 'Hourglass', rarity: 'common', condition_type: 'total_hours', condition_value: 50, xp_reward: 250, created_at: '' },
  { key: 'first_100h', name: 'Focus Master', description: 'Complete 100 hours of focused time', icon: 'Trophy', rarity: 'rare', condition_type: 'total_hours', condition_value: 100, xp_reward: 500, created_at: '' },
  { key: 'first_500h', name: 'Focus Legend', description: 'Complete 500 hours of focused time', icon: 'Crown', rarity: 'epic', condition_type: 'total_hours', condition_value: 500, xp_reward: 1000, created_at: '' },

  // Streak badges
  { key: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'Flame', rarity: 'common', condition_type: 'streak_days', condition_value: 7, xp_reward: 150, created_at: '' },
  { key: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: 'Calendar', rarity: 'rare', condition_type: 'streak_days', condition_value: 30, xp_reward: 500, created_at: '' },
  { key: 'streak_100', name: 'Centurion', description: 'Maintain a 100-day streak', icon: 'Star', rarity: 'legendary', condition_type: 'streak_days', condition_value: 100, xp_reward: 2000, created_at: '' },

  // Session badges
  { key: 'early_bird', name: 'Early Bird', description: 'Complete a session before 7 AM', icon: 'Sunrise', rarity: 'common', condition_type: 'early_session', condition_value: 1, xp_reward: 100, created_at: '' },
  { key: 'night_owl', name: 'Night Owl', description: 'Complete a session after 10 PM', icon: 'Moon', rarity: 'common', condition_type: 'late_session', condition_value: 1, xp_reward: 100, created_at: '' },
  { key: 'weekend_warrior', name: 'Weekend Warrior', description: 'Complete sessions on both Saturday and Sunday', icon: 'CalendarDays', rarity: 'rare', condition_type: 'weekend_sessions', condition_value: 2, xp_reward: 200, created_at: '' },

  // Consistency badges
  { key: 'daily_7', name: 'Daily Grinder', description: 'Complete at least one session every day for 7 days', icon: 'Repeat', rarity: 'common', condition_type: 'daily_consistency', condition_value: 7, xp_reward: 200, created_at: '' },
  { key: 'daily_30', name: 'Habit Formed', description: 'Complete at least one session every day for 30 days', icon: 'CheckCircle', rarity: 'rare', condition_type: 'daily_consistency', condition_value: 30, xp_reward: 600, created_at: '' },

  // Challenge badges
  { key: 'challenge_first', name: 'Challenge Accepted', description: 'Complete your first weekly challenge', icon: 'Target', rarity: 'common', condition_type: 'challenges_completed', condition_value: 1, xp_reward: 150, created_at: '' },
  { key: 'challenge_10', name: 'Challenge Champion', description: 'Complete 10 weekly challenges', icon: 'Award', rarity: 'rare', condition_type: 'challenges_completed', condition_value: 10, xp_reward: 500, created_at: '' },

  // Special badges
  { key: 'pomodoro_master', name: 'Pomodoro Master', description: 'Complete 50 pomodoro sessions', icon: 'Timer', rarity: 'rare', condition_type: 'pomodoro_sessions', condition_value: 50, xp_reward: 400, created_at: '' },
  { key: 'category_explorer', name: 'Explorer', description: 'Use 5 different categories', icon: 'Compass', rarity: 'common', condition_type: 'categories_used', condition_value: 5, xp_reward: 150, created_at: '' },
];

export const RARITY_COLORS: Record<BadgeRarity, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_LABELS: Record<BadgeRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};
