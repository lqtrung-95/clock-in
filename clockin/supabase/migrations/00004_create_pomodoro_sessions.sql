CREATE TYPE public.pomodoro_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  time_entry_id UUID REFERENCES public.time_entries(id) ON DELETE SET NULL,
  work_minutes INTEGER NOT NULL DEFAULT 25,
  break_minutes INTEGER NOT NULL DEFAULT 5,
  completed_cycles INTEGER NOT NULL DEFAULT 0,
  total_cycles INTEGER NOT NULL DEFAULT 4,
  status public.pomodoro_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pomodoro_user_id ON public.pomodoro_sessions(user_id);
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
