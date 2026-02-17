---
title: "Phase 1: Database Schema & Types"
description: "Create database tables and TypeScript types for gamification system"
status: pending
priority: P1
effort: 4h
dependencies: []
---

# Phase 1: Database Schema & Types

## Overview
Create the foundational database schema and TypeScript types for the gamification system including XP/levels, crystal customizations, badge definitions, weekly challenges, and user stats.

## Key Insights
- User XP and level data will be stored in a separate table with RLS policies
- Crystal customizations need to track unlocked shapes, colors, and themes per user
- Badge definitions are static but user progress needs tracking
- Weekly challenges require automated generation via database function

## Requirements

### Functional Requirements
1. Store user XP, level, and total focused time
2. Track unlocked crystal shapes, colors, and themes
3. Store badge definitions and user earned badges
4. Support weekly challenge generation and progress tracking
5. Maintain user stats summary for quick insights

### Non-Functional Requirements
1. All tables must have RLS policies
2. Indexes on frequently queried columns (user_id, dates)
3. Database functions for automated challenge generation
4. Triggers for XP calculation on time entry completion

## Architecture

### Database Schema

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   user_stats    │     │ crystal_customizations│    │  user_badges     │
├─────────────────┤     ├─────────────────────┤     ├──────────────────┤
│ user_id (PK)    │     │ user_id (PK)        │     │ id (PK)          │
│ total_xp        │     │ unlocked_shapes     │     │ user_id (FK)     │
│ current_level   │     │ unlocked_colors     │     │ badge_key        │
│ total_focus_mins│     │ unlocked_themes     │     │ earned_at        │
│ current_streak  │     │ active_shape        │     └──────────────────┘
│ longest_streak  │     │ active_color        │            ▲
│ updated_at      │     │ active_theme        │            │
└─────────────────┘     └─────────────────────┘     ┌──────────────────┐
                                                    │ badge_definitions│
                                                    ├──────────────────┤
                                                    │ key (PK)         │
┌─────────────────┐     ┌─────────────────────┐     │ name             │
│weekly_challenges│     │ challenge_progress  │     │ description      │
├─────────────────┤     ├─────────────────────┤     │ icon             │
│ id (PK)         │     │ id (PK)             │     │ condition_type   │
│ challenge_key   │     │ user_id (FK)        │     │ condition_value  │
│ name            │     │ challenge_id (FK)   │     │ xp_reward        │
│ description     │     │ progress_current    │     └──────────────────┘
│ target_value    │     │ progress_target     │
│ xp_reward       │     │ status              │
│ start_date      │     │ updated_at          │
│ end_date        │     └─────────────────────┘
│ is_active       │
└─────────────────┘
```

## Related Code Files

### Files to Create
1. `supabase/migrations/00012_create_user_xp_and_levels.sql`
2. `supabase/migrations/00013_create_crystal_customizations.sql`
3. `supabase/migrations/00014_create_badge_definitions.sql`
4. `supabase/migrations/00015_create_weekly_challenges.sql`
5. `supabase/migrations/00016_create_user_stats_summary.sql`
6. `src/types/xp-system.ts`
7. `src/data/badge-definitions.ts`
8. `src/data/crystal-configs.ts`

### Files to Modify
1. `src/types/gamification.ts` - extend existing types
2. `src/types/database.ts` - add new table types

## Implementation Steps

### Step 1: Create User XP and Level Table

**File:** `supabase/migrations/00012_create_user_xp_and_levels.sql`

```sql
-- User XP and Level tracking
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_focus_minutes INTEGER NOT NULL DEFAULT 0,
  weekly_focus_minutes INTEGER NOT NULL DEFAULT 0,
  monthly_focus_minutes INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX idx_user_stats_level ON public.user_stats(current_level);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(user_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN floor(user_xp / 1000) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get XP needed for next level
CREATE OR REPLACE FUNCTION public.xp_for_next_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN current_level * 1000;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update level when XP changes
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.current_level := public.calculate_level(NEW.total_xp);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_level
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();
```

### Step 2: Create Crystal Customizations Table

**File:** `supabase/migrations/00013_create_crystal_customizations.sql`

```sql
-- Crystal shapes available
CREATE TYPE public.crystal_shape AS ENUM (
  'icosahedron',    -- Level 1 (default)
  'dodecahedron',   -- Level 5
  'octahedron',     -- Level 10
  'tetrahedron',    -- Level 25
  'torus_knot'      -- Level 50
);

-- Crystal color themes
CREATE TYPE public.crystal_color AS ENUM (
  'blue',        -- Default
  'purple',
  'emerald',
  'amber',
  'rose',
  'cyan',
  'gold',
  'obsidian'
);

-- Crystal visual themes
CREATE TYPE public.crystal_theme AS ENUM (
  'default',
  'ethereal',
  'fiery',
  'ocean',
  'cosmic',
  'forest'
);

CREATE TABLE public.crystal_customizations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked_shapes public.crystal_shape[] NOT NULL DEFAULT ARRAY['icosahedron']::public.crystal_shape[],
  unlocked_colors public.crystal_color[] NOT NULL DEFAULT ARRAY['blue']::public.crystal_color[],
  unlocked_themes public.crystal_theme[] NOT NULL DEFAULT ARRAY['default']::public.crystal_theme[],
  active_shape public.crystal_shape NOT NULL DEFAULT 'icosahedron',
  active_color public.crystal_color NOT NULL DEFAULT 'blue',
  active_theme public.crystal_theme NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crystal_customizations_user_id ON public.crystal_customizations(user_id);

ALTER TABLE public.crystal_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crystal customizations"
  ON public.crystal_customizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own crystal customizations"
  ON public.crystal_customizations FOR UPDATE
  USING (auth.uid() = user_id);
```

### Step 3: Create Badge Definitions and User Badges

**File:** `supabase/migrations/00014_create_badge_definitions.sql`

```sql
-- Badge rarity levels
CREATE TYPE public.badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Badge definitions (static data)
CREATE TABLE public.badge_definitions (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity public.badge_rarity NOT NULL DEFAULT 'common',
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User earned badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL REFERENCES public.badge_definitions(key),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_badge_key ON public.user_badges(badge_key);

ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badge definitions are viewable by all authenticated users"
  ON public.badge_definitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Insert default badge definitions
INSERT INTO public.badge_definitions (key, name, description, icon, rarity, condition_type, condition_value, xp_reward) VALUES
-- Time-based badges
('first_10h', 'Getting Started', 'Complete 10 hours of focused time', 'Clock', 'common', 'total_hours', 10, 100),
('first_50h', 'Focus Apprentice', 'Complete 50 hours of focused time', 'Hourglass', 'common', 'total_hours', 50, 250),
('first_100h', 'Focus Master', 'Complete 100 hours of focused time', 'Trophy', 'rare', 'total_hours', 100, 500),
('first_500h', 'Focus Legend', 'Complete 500 hours of focused time', 'Crown', 'epic', 'total_hours', 500, 1000),

-- Streak badges
('streak_7', 'Week Warrior', 'Maintain a 7-day streak', 'Flame', 'common', 'streak_days', 7, 150),
('streak_30', 'Monthly Master', 'Maintain a 30-day streak', 'Calendar', 'rare', 'streak_days', 30, 500),
('streak_100', 'Centurion', 'Maintain a 100-day streak', 'Star', 'legendary', 'streak_days', 100, 2000),

-- Session badges
('early_bird', 'Early Bird', 'Complete a session before 7 AM', 'Sunrise', 'common', 'early_session', 1, 100),
('night_owl', 'Night Owl', 'Complete a session after 10 PM', 'Moon', 'common', 'late_session', 1, 100),
('weekend_warrior', 'Weekend Warrior', 'Complete sessions on both Saturday and Sunday', 'CalendarDays', 'rare', 'weekend_sessions', 2, 200),

-- Consistency badges
('daily_7', 'Daily Grinder', 'Complete at least one session every day for 7 days', 'Repeat', 'common', 'daily_consistency', 7, 200),
('daily_30', 'Habit Formed', 'Complete at least one session every day for 30 days', 'CheckCircle', 'rare', 'daily_consistency', 30, 600),

-- Challenge badges
('challenge_first', 'Challenge Accepted', 'Complete your first weekly challenge', 'Target', 'common', 'challenges_completed', 1, 150),
('challenge_10', 'Challenge Champion', 'Complete 10 weekly challenges', 'Award', 'rare', 'challenges_completed', 10, 500),

-- Special badges
('pomodoro_master', 'Pomodoro Master', 'Complete 50 pomodoro sessions', 'Timer', 'rare', 'pomodoro_sessions', 50, 400),
('category_explorer', 'Explorer', 'Use 5 different categories', 'Compass', 'common', 'categories_used', 5, 150);
```

### Step 4: Create Weekly Challenges System

**File:** `supabase/migrations/00015_create_weekly_challenges.sql`

```sql
-- Weekly challenges table
CREATE TABLE public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 200,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User progress on weekly challenges
CREATE TABLE public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  progress_current INTEGER NOT NULL DEFAULT 0,
  progress_target INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_weekly_challenges_active ON public.weekly_challenges(is_active, week_start);
CREATE INDEX idx_challenge_progress_user ON public.challenge_progress(user_id, status);
CREATE INDEX idx_challenge_progress_challenge ON public.challenge_progress(challenge_id);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Weekly challenges are viewable by all authenticated users"
  ON public.weekly_challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own challenge progress"
  ON public.challenge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON public.challenge_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to generate weekly challenges
CREATE OR REPLACE FUNCTION public.generate_weekly_challenges()
RETURNS void AS $$
DECLARE
  week_start_date DATE;
  week_end_date DATE;
BEGIN
  week_start_date := date_trunc('week', now())::date;
  week_end_date := week_start_date + interval '6 days';

  -- Only generate if not exists for this week
  IF NOT EXISTS (
    SELECT 1 FROM public.weekly_challenges
    WHERE week_start = week_start_date
  ) THEN
    -- Deactivate old challenges
    UPDATE public.weekly_challenges
    SET is_active = false
    WHERE week_end < week_start_date;

    -- Generate new challenges
    INSERT INTO public.weekly_challenges (challenge_key, name, description, challenge_type, target_value, xp_reward, week_start, week_end)
    VALUES
      ('weekly_hours_' || week_start_date, 'Weekly Focus', 'Focus for 10 hours this week', 'total_minutes', 600, 300, week_start_date, week_end_date),
      ('weekly_sessions_' || week_start_date, 'Session Master', 'Complete 15 sessions this week', 'session_count', 15, 250, week_start_date, week_end_date),
      ('weekly_streak_' || week_start_date, 'Perfect Week', 'Focus every day this week', 'daily_streak', 7, 400, week_start_date, week_end_date);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Schedule challenge generation (run via edge function or cron)
COMMENT ON FUNCTION public.generate_weekly_challenges() IS 'Generate new weekly challenges. Should be called every Monday at 00:00 UTC';
```

### Step 5: Create User Stats Summary View

**File:** `supabase/migrations/00016_create_user_stats_summary.sql`

```sql
-- Materialized view for user stats summary (for insights)
CREATE MATERIALIZED VIEW public.user_stats_summary AS
SELECT
  u.user_id,
  u.total_xp,
  u.current_level,
  u.total_focus_minutes,
  u.current_streak,
  u.longest_streak,
  COUNT(DISTINCT ub.badge_key) as total_badges,
  COUNT(DISTINCT CASE WHEN cp.status = 'completed' THEN cp.id END) as challenges_completed,
  c.active_shape,
  c.active_color,
  c.active_theme
FROM public.user_stats u
LEFT JOIN public.user_badges ub ON u.user_id = ub.user_id
LEFT JOIN public.challenge_progress cp ON u.user_id = cp.user_id
LEFT JOIN public.crystal_customizations c ON u.user_id = c.user_id
GROUP BY u.user_id, u.total_xp, u.current_level, u.total_focus_minutes,
         u.current_streak, u.longest_streak, c.active_shape, c.active_color, c.active_theme;

CREATE UNIQUE INDEX idx_user_stats_summary_user_id ON public.user_stats_summary(user_id);

-- Function to refresh stats summary
CREATE OR REPLACE FUNCTION public.refresh_user_stats_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_stats_summary;
END;
$$ LANGUAGE plpgsql;
```

### Step 6: Create TypeScript Types

**File:** `src/types/xp-system.ts`

```typescript
export interface UserStats {
  user_id: string;
  total_xp: number;
  current_level: number;
  total_focus_minutes: number;
  weekly_focus_minutes: number;
  monthly_focus_minutes: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  xpProgress: number;
  progressPercentage: number;
}

export type CrystalShape = 'icosahedron' | 'dodecahedron' | 'octahedron' | 'tetrahedron' | 'torus_knot';
export type CrystalColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'gold' | 'obsidian';
export type CrystalTheme = 'default' | 'ethereal' | 'fiery' | 'ocean' | 'cosmic' | 'forest';

export interface CrystalCustomizations {
  user_id: string;
  unlocked_shapes: CrystalShape[];
  unlocked_colors: CrystalColor[];
  unlocked_themes: CrystalTheme[];
  active_shape: CrystalShape;
  active_color: CrystalColor;
  active_theme: CrystalTheme;
  created_at: string;
  updated_at: string;
}

export interface CrystalConfig {
  shape: CrystalShape;
  minLevel: number;
  geometry: string;
  displayName: string;
}

export interface ColorConfig {
  color: CrystalColor;
  hex: string;
  displayName: string;
  unlockedAtLevel?: number;
}

export interface ThemeConfig {
  theme: CrystalTheme;
  displayName: string;
  particleColor: string;
  glowIntensity: number;
}
```

**File:** `src/types/gamification.ts` (extend existing)

```typescript
// Add to existing gamification.ts

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
```

### Step 7: Create Data Configuration Files

**File:** `src/data/badge-definitions.ts`

```typescript
import type { BadgeDefinition } from '@/types/gamification';

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

export const RARITY_COLORS = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_LABELS = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};
```

**File:** `src/data/crystal-configs.ts`

```typescript
import type { CrystalConfig, ColorConfig, ThemeConfig } from '@/types/xp-system';

export const CRYSTAL_SHAPES: CrystalConfig[] = [
  { shape: 'icosahedron', minLevel: 1, geometry: 'icosahedron', displayName: 'Crystal Seed' },
  { shape: 'dodecahedron', minLevel: 5, geometry: 'dodecahedron', displayName: 'Crystal Sprout' },
  { shape: 'octahedron', minLevel: 10, geometry: 'octahedron', displayName: 'Crystal Bloom' },
  { shape: 'tetrahedron', minLevel: 25, geometry: 'tetrahedron', displayName: 'Crystal Radiance' },
  { shape: 'torus_knot', minLevel: 50, geometry: 'torusKnot', displayName: 'Crystal Infinity' },
];

export const CRYSTAL_COLORS: ColorConfig[] = [
  { color: 'blue', hex: '#3B82F6', displayName: 'Sapphire', unlockedAtLevel: 1 },
  { color: 'purple', hex: '#8B5CF6', displayName: 'Amethyst', unlockedAtLevel: 3 },
  { color: 'emerald', hex: '#10B981', displayName: 'Emerald', unlockedAtLevel: 5 },
  { color: 'amber', hex: '#F59E0B', displayName: 'Amber', unlockedAtLevel: 8 },
  { color: 'rose', hex: '#F43F5E', displayName: 'Rose Quartz', unlockedAtLevel: 12 },
  { color: 'cyan', hex: '#06B6D4', displayName: 'Aquamarine', unlockedAtLevel: 15 },
  { color: 'gold', hex: '#F59E0B', displayName: 'Golden Topaz', unlockedAtLevel: 20 },
  { color: 'obsidian', hex: '#1F2937', displayName: 'Obsidian', unlockedAtLevel: 30 },
];

export const CRYSTAL_THEMES: ThemeConfig[] = [
  { theme: 'default', displayName: 'Classic', particleColor: '#3B82F6', glowIntensity: 0.5 },
  { theme: 'ethereal', displayName: 'Ethereal', particleColor: '#E0E7FF', glowIntensity: 0.8 },
  { theme: 'fiery', displayName: 'Inferno', particleColor: '#EF4444', glowIntensity: 0.7 },
  { theme: 'ocean', displayName: 'Ocean', particleColor: '#06B6D4', glowIntensity: 0.6 },
  { theme: 'cosmic', displayName: 'Cosmic', particleColor: '#A855F7', glowIntensity: 0.9 },
  { theme: 'forest', displayName: 'Forest', particleColor: '#10B981', glowIntensity: 0.6 },
];

export function getShapeForLevel(level: number): string {
  const shape = [...CRYSTAL_SHAPES].reverse().find(s => level >= s.minLevel);
  return shape?.geometry || 'icosahedron';
}

export function getUnlockedColors(level: number): ColorConfig[] {
  return CRYSTAL_COLORS.filter(c => (c.unlockedAtLevel || 1) <= level);
}

export function getColorHex(color: string): string {
  return CRYSTAL_COLORS.find(c => c.color === color)?.hex || '#3B82F6';
}
```

## Todo List

- [ ] Create migration 00012: User XP and Levels table
- [ ] Create migration 00013: Crystal Customizations table
- [ ] Create migration 00014: Badge Definitions and User Badges
- [ ] Create migration 00015: Weekly Challenges system
- [ ] Create migration 00016: User Stats Summary view
- [ ] Create TypeScript types file: xp-system.ts
- [ ] Extend gamification.ts with new types
- [ ] Create badge-definitions.ts data file
- [ ] Create crystal-configs.ts data file
- [ ] Run migrations locally and verify
- [ ] Update database.ts with new table types

## Success Criteria

1. All migrations run successfully without errors
2. RLS policies properly restrict access to user data
3. TypeScript types match database schema exactly
4. Database functions (calculate_level, generate_weekly_challenges) work correctly
5. Indexes are created for performance

## Next Steps

After completing this phase:
1. Proceed to Phase 2: XP & Level System
2. Implement XP service to interact with these tables
3. Create hooks for gamification state management

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration conflicts | High | Test on fresh database first, use transaction blocks |
| Type mismatches | Medium | Use strict TypeScript, validate with tests |
| RLS policy errors | High | Test with different user contexts |
