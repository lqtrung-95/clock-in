CREATE TYPE public.theme_mode AS ENUM ('light', 'dark', 'system');
CREATE TYPE public.pomodoro_preset AS ENUM ('25/5', '50/10', '90/20', 'custom');

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme public.theme_mode NOT NULL DEFAULT 'system',
  preferred_background TEXT DEFAULT 'default',
  preferred_ambient_sound TEXT DEFAULT 'none',
  pomodoro_preset public.pomodoro_preset NOT NULL DEFAULT '25/5',
  custom_work_minutes INTEGER DEFAULT 25 CHECK (custom_work_minutes > 0 AND custom_work_minutes <= 180),
  custom_break_minutes INTEGER DEFAULT 5 CHECK (custom_break_minutes > 0 AND custom_break_minutes <= 60),
  email_digest_enabled BOOLEAN NOT NULL DEFAULT true,
  last_digest_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_prefs_user_id ON public.user_preferences(user_id);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
