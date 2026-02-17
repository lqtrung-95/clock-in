# Phase 2: Database Schema

## Context Links
- Plan: ./plan.md
- Previous: phase-01-setup-dependencies.md
- Next: phase-03-mountain-scene.md

## Overview
- **Priority**: High
- **Status**: Pending
- **Description**: Create database tables and RLS policies for dream goals

## Requirements

### Migration File
Create `supabase/migrations/00016_create_dream_goals.sql`:

```sql
-- Dream goals table
CREATE TABLE public.dream_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'mountain'
    CHECK (theme IN ('mountain', 'castle', 'tree', 'space')),
  title TEXT NOT NULL DEFAULT 'My Dream Goal',
  description TEXT,
  target_hours INTEGER NOT NULL DEFAULT 100 CHECK (target_hours > 0),
  current_hours DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_hours >= 0),
  milestone_reached INTEGER NOT NULL DEFAULT 0 CHECK (milestone_reached BETWEEN 0 AND 5),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Progress history for tracking
CREATE TABLE public.dream_goal_progress_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_goal_id UUID NOT NULL REFERENCES public.dream_goals(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.time_entries(id) ON DELETE SET NULL,
  hours_added DECIMAL(10,2) NOT NULL,
  previous_hours DECIMAL(10,2) NOT NULL,
  new_hours DECIMAL(10,2) NOT NULL,
  milestone_reached INTEGER CHECK (milestone_reached BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_dream_goals_user_id ON public.dream_goals(user_id);
CREATE INDEX idx_dream_goals_theme ON public.dream_goals(theme);
CREATE INDEX idx_dream_goal_history_goal_id ON public.dream_goal_progress_history(dream_goal_id);
CREATE INDEX idx_dream_goal_history_created_at ON public.dream_goal_progress_history(created_at);

-- RLS Policies
ALTER TABLE public.dream_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_goal_progress_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dream goal"
  ON public.dream_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dream goal"
  ON public.dream_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dream goal"
  ON public.dream_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own progress history"
  ON public.dream_goal_progress_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dream_goals
      WHERE id = dream_goal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create progress history"
  ON public.dream_goal_progress_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dream_goals
      WHERE id = dream_goal_id AND user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_dream_goal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_dream_goal_updated_at
  BEFORE UPDATE ON public.dream_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dream_goal_updated_at();

-- Function to add progress and check milestones
CREATE OR REPLACE FUNCTION public.add_dream_goal_progress(
  p_user_id UUID,
  p_hours DECIMAL(10,2)
)
RETURNS TABLE (
  new_hours DECIMAL(10,2),
  new_milestone INTEGER,
  milestone_just_reached BOOLEAN
) AS $$
DECLARE
  v_goal_id UUID;
  v_old_hours DECIMAL(10,2);
  v_new_hours DECIMAL(10,2);
  v_old_milestone INTEGER;
  v_new_milestone INTEGER;
  v_target_hours INTEGER;
BEGIN
  -- Get current goal
  SELECT id, current_hours, milestone_reached, target_hours
  INTO v_goal_id, v_old_hours, v_old_milestone, v_target_hours
  FROM public.dream_goals
  WHERE user_id = p_user_id;

  IF v_goal_id IS NULL THEN
    RETURN;
  END IF;

  -- Calculate new values
  v_new_hours := LEAST(v_old_hours + p_hours, v_target_hours);
  v_new_milestone := CASE
    WHEN v_new_hours >= v_target_hours THEN 5
    WHEN v_new_hours >= v_target_hours * 0.75 THEN 4
    WHEN v_new_hours >= v_target_hours * 0.5 THEN 3
    WHEN v_new_hours >= v_target_hours * 0.25 THEN 2
    WHEN v_new_hours >= v_target_hours * 0.1 THEN 1
    ELSE 0
  END;

  -- Update goal
  UPDATE public.dream_goals
  SET
    current_hours = v_new_hours,
    milestone_reached = v_new_milestone,
    is_completed = (v_new_hours >= v_target_hours),
    completed_at = CASE WHEN v_new_hours >= v_target_hours AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE id = v_goal_id;

  -- Return results
  RETURN QUERY SELECT
    v_new_hours,
    v_new_milestone,
    (v_new_milestone > v_old_milestone);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Implementation Steps

1. Create migration file
2. Push migration to Supabase
3. Update TypeScript database types
4. Create service functions for CRUD operations
5. Test with sample data

## Success Criteria
- [ ] Migration applies successfully
- [ ] RLS policies work correctly
- [ ] Function properly calculates milestones
- [ ] Service functions handle errors gracefully

## Risk Assessment
- **Risk**: Function may have permission issues
- **Mitigation**: Test with authenticated user in SQL Editor
