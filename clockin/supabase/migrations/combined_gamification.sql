-- Combined Gamification Migration (00012-00015)
-- Run this in Supabase Dashboard SQL Editor if db push fails

-- ============================================
-- Migration 00012: User XP, Level and Stats tracking
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_stats (
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

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_level ON public.user_stats(current_level);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
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

DROP TRIGGER IF EXISTS trigger_update_level ON public.user_stats;
CREATE TRIGGER trigger_update_level
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();

-- ============================================
-- Migration 00013: Crystal Customizations
-- ============================================

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crystal_shape') THEN
    CREATE TYPE public.crystal_shape AS ENUM ('icosahedron', 'dodecahedron', 'octahedron', 'tetrahedron', 'torus_knot');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crystal_color') THEN
    CREATE TYPE public.crystal_color AS ENUM ('blue', 'purple', 'emerald', 'amber', 'rose', 'cyan', 'gold', 'obsidian');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crystal_theme') THEN
    CREATE TYPE public.crystal_theme AS ENUM ('default', 'ethereal', 'fiery', 'ocean', 'cosmic', 'forest');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.crystal_customizations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked_shapes public.crystal_shape[] NOT NULL DEFAULT ARRAY['icosahedron']::public.crystal_shape[],
  unlocked_colors public.crystal_color[] NOT NULL DEFAULT ARRAY['blue']::public.crystal_color[],
  unlocked_themes public.crystal_theme[] NOT NULL DEFAULT ARRAY['default']::public.crystal_theme[],
  active_shape public.crystal_shape NOT NULL DEFAULT 'icosahedron',
  active_color public.crystal_color NOT NULL DEFAULT 'blue',
  active_theme public.crystal_theme NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_active_shape CHECK (active_shape = ANY(unlocked_shapes)),
  CONSTRAINT valid_active_color CHECK (active_color = ANY(unlocked_colors)),
  CONSTRAINT valid_active_theme CHECK (active_theme = ANY(unlocked_themes))
);

CREATE INDEX IF NOT EXISTS idx_crystal_customizations_user_id ON public.crystal_customizations(user_id);

ALTER TABLE public.crystal_customizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own crystal customizations" ON public.crystal_customizations;
CREATE POLICY "Users can view own crystal customizations"
  ON public.crystal_customizations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own crystal customizations" ON public.crystal_customizations;
CREATE POLICY "Users can update own crystal customizations"
  ON public.crystal_customizations FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_crystal_customizations_updated_at ON public.crystal_customizations;
CREATE TRIGGER trigger_crystal_customizations_updated_at
  BEFORE UPDATE ON public.crystal_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 00014: Badge Definitions
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_rarity') THEN
    CREATE TYPE public.badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.badge_definitions (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity public.badge_rarity NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_badge_definitions_rarity ON public.badge_definitions(rarity);

-- Insert default badges
INSERT INTO public.badge_definitions (key, name, description, icon, rarity, xp_reward, requirement_type, requirement_value) VALUES
  ('first_focus', 'First Focus', 'Complete your first focus session', 'Sparkles', 'common', 50, 'focus_sessions', 1),
  ('focus_10', 'Focus Apprentice', 'Complete 10 focus sessions', 'Target', 'common', 100, 'focus_sessions', 10),
  ('focus_50', 'Focus Enthusiast', 'Complete 50 focus sessions', 'Zap', 'rare', 250, 'focus_sessions', 50),
  ('focus_100', 'Focus Master', 'Complete 100 focus sessions', 'Trophy', 'epic', 500, 'focus_sessions', 100),
  ('focus_500', 'Focus Legend', 'Complete 500 focus sessions', 'Crown', 'legendary', 2000, 'focus_sessions', 500),
  ('hours_10', 'Getting Started', 'Focus for 10 hours total', 'Clock', 'common', 100, 'focus_hours', 10),
  ('hours_50', 'Deep Worker', 'Focus for 50 hours total', 'Hourglass', 'rare', 250, 'focus_hours', 50),
  ('hours_100', 'Century Club', 'Focus for 100 hours total', 'Medal', 'epic', 500, 'focus_hours', 100),
  ('hours_500', 'Time Lord', 'Focus for 500 hours total', 'Star', 'legendary', 3000, 'focus_hours', 500),
  ('streak_7', 'Week Warrior', 'Maintain a 7-day streak', 'Flame', 'rare', 200, 'streak_days', 7),
  ('streak_30', 'Monthly Master', 'Maintain a 30-day streak', 'Fire', 'epic', 500, 'streak_days', 30),
  ('streak_100', 'Streak Legend', 'Maintain a 100-day streak', 'Sun', 'legendary', 2000, 'streak_days', 100),
  ('level_5', 'Rising Star', 'Reach level 5', 'TrendingUp', 'common', 100, 'level', 5),
  ('level_10', 'Crystal Adept', 'Reach level 10', 'Award', 'rare', 200, 'level', 10),
  ('level_25', 'Crystal Master', 'Reach level 25', 'Gem', 'epic', 500, 'level', 25),
  ('level_50', 'Crystal Legend', 'Reach level 50', 'Crown', 'legendary', 1000, 'level', 50),
  ('early_adopter', 'Early Adopter', 'Joined during beta', 'Rocket', 'legendary', 500, 'special', 1)
ON CONFLICT (key) DO NOTHING;

-- Create user_badges table if not exists
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_definition_key TEXT NOT NULL REFERENCES public.badge_definitions(key) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_definition_key)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_key ON public.user_badges(badge_definition_key);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- Migration 00015: Weekly Challenges
-- ============================================

CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  progress_target INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekly_challenges_dates ON public.weekly_challenges(start_date, end_date);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view weekly challenges" ON public.weekly_challenges;
CREATE POLICY "Users can view weekly challenges"
  ON public.weekly_challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.weekly_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  progress_current INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_challenge_progress_user_id ON public.weekly_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_challenge_progress_challenge_id ON public.weekly_challenge_progress(challenge_id);

ALTER TABLE public.weekly_challenge_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own challenge progress" ON public.weekly_challenge_progress;
CREATE POLICY "Users can view own challenge progress"
  ON public.weekly_challenge_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenge progress" ON public.weekly_challenge_progress;
CREATE POLICY "Users can update own challenge progress"
  ON public.weekly_challenge_progress FOR UPDATE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trigger_weekly_challenge_progress_updated_at ON public.weekly_challenge_progress;
CREATE TRIGGER trigger_weekly_challenge_progress_updated_at
  BEFORE UPDATE ON public.weekly_challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate weekly challenges
CREATE OR REPLACE FUNCTION public.generate_weekly_challenges()
RETURNS void AS $$
DECLARE
  week_start DATE := date_trunc('week', now())::date;
  week_end DATE := (date_trunc('week', now()) + interval '6 days')::date;
BEGIN
  -- Only create if no challenges exist for this week
  IF NOT EXISTS (SELECT 1 FROM public.weekly_challenges WHERE start_date = week_start) THEN
    INSERT INTO public.weekly_challenges (name, description, challenge_type, progress_target, xp_reward, start_date, end_date)
    VALUES
      ('Focus Streak', 'Complete 5 focus sessions this week', 'focus_sessions', 5, 150, week_start, week_end),
      ('Time Master', 'Focus for 10 hours this week', 'focus_hours', 10, 200, week_start, week_end),
      ('Consistency King', 'Maintain a 3-day streak', 'streak_days', 3, 100, week_start, week_end);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Run it once to create initial challenges
SELECT public.generate_weekly_challenges();
