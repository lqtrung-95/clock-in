import { createClient } from '@/lib/supabase/client';
import type { DreamGoal, DreamGoalTheme, DreamGoalProgress } from '@/types/dream-goal';
import { MILESTONE_THRESHOLDS } from '@/types/dream-goal';

const supabase = createClient();

export function calculateProgress(
  currentHours: number,
  targetHours: number
): DreamGoalProgress {
  const percentage = Math.min((currentHours / targetHours) * 100, 100);

  let currentMilestone = 0;
  for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (percentage >= MILESTONE_THRESHOLDS[i]) {
      currentMilestone = i;
      break;
    }
  }

  const nextMilestoneIndex = Math.min(currentMilestone + 1, MILESTONE_THRESHOLDS.length - 1);
  const nextMilestonePercentage = MILESTONE_THRESHOLDS[nextMilestoneIndex];
  const hoursForNextMilestone = (nextMilestonePercentage / 100) * targetHours;
  const hoursToNextMilestone = Math.max(0, hoursForNextMilestone - currentHours);

  return {
    percentage,
    currentMilestone,
    hoursToNextMilestone,
    nextMilestonePercentage,
  };
}

export async function getDreamGoal(userId: string): Promise<DreamGoal | null> {
  const { data, error } = await supabase
    .from('dream_goals')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching dream goal:', error);
    throw error;
  }

  return data as DreamGoal | null;
}

export async function createDreamGoal(
  userId: string,
  theme: DreamGoalTheme = 'mountain',
  title: string = 'My Dream Goal',
  targetHours: number = 100
): Promise<DreamGoal> {
  const { data, error } = await supabase
    .from('dream_goals')
    .insert({
      user_id: userId,
      theme,
      title,
      target_hours: targetHours,
    } as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating dream goal:', error);
    throw error;
  }

  return data as DreamGoal;
}

export async function updateDreamGoal(
  goalId: string,
  updates: Partial<Pick<DreamGoal, 'theme' | 'title' | 'target_hours'>>
): Promise<DreamGoal> {
  const { data, error } = await supabase
    .from('dream_goals')
    .update(updates as never)
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    console.error('Error updating dream goal:', error);
    throw error;
  }

  return data as DreamGoal;
}

export async function addProgress(
  userId: string,
  hours: number
): Promise<{
  new_hours: number;
  new_milestone: number;
  milestone_just_reached: boolean;
} | null> {
  const { data, error } = await supabase.rpc('add_dream_goal_progress', {
    p_user_id: userId,
    p_hours: hours,
  } as never);

  if (error) {
    console.error('Error adding progress:', error);
    throw error;
  }

  return data;
}

export async function getOrCreateDreamGoal(
  userId: string,
  theme: DreamGoalTheme = 'mountain'
): Promise<DreamGoal> {
  const existing = await getDreamGoal(userId);
  if (existing) return existing;

  // Create new dream goal and sync with past sessions
  const newGoal = await createDreamGoal(userId, theme);

  // Sync with historical data (for authenticated users)
  if (userId !== 'guest') {
    try {
      await syncDreamGoalWithHistory(userId);
      // Return updated goal after sync
      const updated = await getDreamGoal(userId);
      if (updated) return updated;
    } catch (err) {
      console.error('Failed to sync dream goal history:', err);
    }
  }

  return newGoal;
}

export async function resetDreamGoal(goalId: string): Promise<void> {
  const { error } = await supabase
    .from('dream_goals')
    .update({
      current_hours: 0,
      milestone_reached: 0,
      is_completed: false,
      completed_at: null,
    } as never)
    .eq('id', goalId);

  if (error) {
    console.error('Error resetting dream goal:', error);
    throw error;
  }
}

// Sync dream goal with existing time entries
export async function syncDreamGoalWithHistory(userId: string): Promise<number> {
  // Calculate total hours from all time entries
  const { data: entries, error } = await supabase
    .from('time_entries')
    .select('duration_seconds')
    .eq('user_id', userId) as { data: { duration_seconds: number }[] | null; error: Error | null };

  if (error) {
    console.error('Error fetching time entries:', error);
    throw error;
  }

  const totalHours = (entries || []).reduce((sum, entry) => {
    return sum + (entry.duration_seconds || 0) / 3600;
  }, 0);

  // Get or create dream goal
  let goal = await getDreamGoal(userId);
  if (!goal) {
    goal = await createDreamGoal(userId);
  }

  // Update dream goal with total hours
  const { error: updateError } = await supabase
    .from('dream_goals')
    .update({
      current_hours: totalHours,
      milestone_reached: calculateMilestone(totalHours, goal.target_hours),
      is_completed: totalHours >= goal.target_hours,
    } as never)
    .eq('id', goal.id);

  if (updateError) {
    console.error('Error updating dream goal:', updateError);
    throw updateError;
  }

  return totalHours;
}

function calculateMilestone(currentHours: number, targetHours: number): number {
  const percentage = (currentHours / targetHours) * 100;
  if (percentage >= 100) return 5;
  if (percentage >= 75) return 4;
  if (percentage >= 50) return 3;
  if (percentage >= 25) return 2;
  if (percentage >= 10) return 1;
  return 0;
}
