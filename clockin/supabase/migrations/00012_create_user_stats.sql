-- User XP, Level and Stats tracking
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
