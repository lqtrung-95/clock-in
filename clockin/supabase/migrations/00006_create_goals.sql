CREATE TYPE public.goal_period AS ENUM ('daily', 'weekly', 'monthly');

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  target_minutes INTEGER NOT NULL CHECK (target_minutes > 0),
  period public.goal_period NOT NULL DEFAULT 'weekly',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goals_user_id ON public.goals(user_id);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
