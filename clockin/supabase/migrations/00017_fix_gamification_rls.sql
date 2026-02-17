-- Fix RLS policies for gamification tables
-- Add missing INSERT policies

-- ============================================
-- Fix user_stats RLS policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;
CREATE POLICY "Users can insert own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Fix crystal_customizations RLS policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert own crystal customizations" ON public.crystal_customizations;
CREATE POLICY "Users can insert own crystal customizations"
  ON public.crystal_customizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Fix user_badges RLS policies (if needed)
-- ============================================

DROP POLICY IF EXISTS "Users can insert own badges" ON public.user_badges;
CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Fix weekly_challenge_progress RLS policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert own challenge progress" ON public.weekly_challenge_progress;
CREATE POLICY "Users can insert own challenge progress"
  ON public.weekly_challenge_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Fix dream_goals RLS policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert own dream goal" ON public.dream_goals;
CREATE POLICY "Users can insert own dream goal"
  ON public.dream_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Fix dream_goal_progress_history RLS policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert progress history" ON public.dream_goal_progress_history;
CREATE POLICY "Users can insert progress history"
  ON public.dream_goal_progress_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dream_goals
      WHERE id = dream_goal_id AND user_id = auth.uid()
    )
  );
