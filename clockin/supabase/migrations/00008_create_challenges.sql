CREATE TYPE public.challenge_status AS ENUM ('active', 'completed', 'expired');

CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_key TEXT NOT NULL,
  target_minutes INTEGER NOT NULL CHECK (target_minutes > 0),
  progress_minutes INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status public.challenge_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX idx_challenges_active ON public.challenges(user_id) WHERE status = 'active';
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
