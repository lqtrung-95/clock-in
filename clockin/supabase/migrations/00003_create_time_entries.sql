CREATE TYPE public.entry_type AS ENUM ('timer', 'manual', 'pomodoro');

CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER CHECK (duration_seconds IS NULL OR (duration_seconds > 0 AND duration_seconds <= 86400)),
  entry_type public.entry_type NOT NULL DEFAULT 'timer',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_started_at ON public.time_entries(user_id, started_at);
CREATE INDEX idx_time_entries_date_range ON public.time_entries(started_at, ended_at);
CREATE INDEX idx_time_entries_active ON public.time_entries(user_id) WHERE ended_at IS NULL;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
