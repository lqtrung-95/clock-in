-- Weekly challenges table (system-level)
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
CREATE TABLE public.weekly_challenge_progress (
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
CREATE INDEX idx_weekly_challenges_week ON public.weekly_challenges(week_start, week_end);
CREATE INDEX idx_weekly_challenge_progress_user ON public.weekly_challenge_progress(user_id, status);
CREATE INDEX idx_weekly_challenge_progress_challenge ON public.weekly_challenge_progress(challenge_id);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Weekly challenges are viewable by all authenticated users"
  ON public.weekly_challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own challenge progress"
  ON public.weekly_challenge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON public.weekly_challenge_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge progress"
  ON public.weekly_challenge_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

-- Function to initialize challenge progress for a user
CREATE OR REPLACE FUNCTION public.initialize_user_challenge_progress(user_uuid UUID)
RETURNS void AS $$
DECLARE
  challenge_record RECORD;
BEGIN
  FOR challenge_record IN
    SELECT id, target_value FROM public.weekly_challenges WHERE is_active = true
  LOOP
    INSERT INTO public.weekly_challenge_progress (user_id, challenge_id, progress_target)
    VALUES (user_uuid, challenge_record.id, challenge_record.target_value)
    ON CONFLICT (user_id, challenge_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_weekly_challenges() IS 'Generate new weekly challenges. Should be called every Monday at 00:00 UTC';
