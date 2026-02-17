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

-- Add badge_key reference to existing user_badges table
ALTER TABLE public.user_badges
ADD COLUMN IF NOT EXISTS badge_definition_key TEXT REFERENCES public.badge_definitions(key);

CREATE INDEX idx_user_badges_definition_key ON public.user_badges(badge_definition_key);
CREATE INDEX idx_badge_definitions_rarity ON public.badge_definitions(rarity);

ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badge definitions are viewable by all authenticated users"
  ON public.badge_definitions FOR SELECT
  TO authenticated
  USING (true);

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
('category_explorer', 'Explorer', 'Use 5 different categories', 'Compass', 'common', 'categories_used', 5, 150)
ON CONFLICT (key) DO NOTHING;
