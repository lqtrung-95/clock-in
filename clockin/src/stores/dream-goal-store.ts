import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DreamGoal, DreamGoalTheme, DreamGoalProgress } from '@/types/dream-goal';
import { calculateProgress, getOrCreateDreamGoal, addProgress } from '@/services/dream-goal-service';

interface DreamGoalState {
  dreamGoal: DreamGoal | null;
  progress: DreamGoalProgress | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadDreamGoal: (userId: string) => Promise<void>;
  updateProgress: (userId: string, hours: number) => Promise<boolean>;
  setTheme: (theme: DreamGoalTheme) => void;
  setDreamGoal: (goal: DreamGoal | null) => void;
}

// Guest storage key
const GUEST_STORAGE_KEY = 'dream-goal-guest';

// Helper to get guest goal from localStorage
function getGuestGoal(): DreamGoal | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!stored) return null;

  const parsed = JSON.parse(stored);
  return {
    id: 'guest',
    user_id: 'guest',
    theme: parsed.theme || 'mountain',
    title: parsed.title || 'My Dream Goal',
    description: null,
    target_hours: parsed.target_hours || 100,
    current_hours: parsed.current_hours || 0,
    milestone_reached: parsed.milestone_reached || 0,
    is_completed: parsed.is_completed || false,
    completed_at: parsed.completed_at || null,
    created_at: parsed.created_at || new Date().toISOString(),
    updated_at: parsed.updated_at || new Date().toISOString(),
  };
}

// Helper to save guest goal
function saveGuestGoal(goal: Partial<DreamGoal>) {
  if (typeof window === 'undefined') return;
  const existing = getGuestGoal();
  const updated = { ...existing, ...goal, updated_at: new Date().toISOString() };
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
}

export const useDreamGoalStore = create<DreamGoalState>()(
  persist(
    (set, get) => ({
      dreamGoal: null,
      progress: null,
      isLoading: false,
      error: null,

      loadDreamGoal: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          let goal: DreamGoal;

          if (userId === 'guest') {
            goal = getGuestGoal() || {
              id: 'guest',
              user_id: 'guest',
              theme: 'mountain',
              title: 'My Dream Goal',
              description: null,
              target_hours: 100,
              current_hours: 0,
              milestone_reached: 0,
              is_completed: false,
              completed_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            saveGuestGoal(goal);
          } else {
            goal = await getOrCreateDreamGoal(userId);
          }

          const progress = calculateProgress(goal.current_hours, goal.target_hours);
          set({ dreamGoal: goal, progress, isLoading: false });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      updateProgress: async (userId: string, hours: number): Promise<boolean> => {
        const { dreamGoal } = get();
        if (!dreamGoal) return false;

        try {
          let milestoneReached = false;

          if (userId === 'guest') {
            const newHours = dreamGoal.current_hours + hours;
            const oldMilestone = dreamGoal.milestone_reached;

            // Calculate new milestone
            const percentage = (newHours / dreamGoal.target_hours) * 100;
            let newMilestone = 0;
            if (percentage >= 100) newMilestone = 5;
            else if (percentage >= 75) newMilestone = 4;
            else if (percentage >= 50) newMilestone = 3;
            else if (percentage >= 25) newMilestone = 2;
            else if (percentage >= 10) newMilestone = 1;

            milestoneReached = newMilestone > oldMilestone;

            const updated = {
              ...dreamGoal,
              current_hours: Math.min(newHours, dreamGoal.target_hours),
              milestone_reached: newMilestone,
              is_completed: percentage >= 100,
              completed_at: percentage >= 100 && !dreamGoal.is_completed
                ? new Date().toISOString()
                : dreamGoal.completed_at,
            };

            saveGuestGoal(updated);
            set({
              dreamGoal: updated,
              progress: calculateProgress(updated.current_hours, updated.target_hours),
            });
          } else {
            const result = await addProgress(userId, hours);
            if (result) {
              milestoneReached = result.milestone_just_reached;
              const updated = {
                ...dreamGoal,
                current_hours: result.new_hours,
                milestone_reached: result.new_milestone,
              };
              set({
                dreamGoal: updated,
                progress: calculateProgress(updated.current_hours, updated.target_hours),
              });
            }
          }

          return milestoneReached;
        } catch (err) {
          set({ error: (err as Error).message });
          return false;
        }
      },

      setTheme: (theme: DreamGoalTheme) => {
        const { dreamGoal } = get();
        if (!dreamGoal) return;

        const updated = { ...dreamGoal, theme };

        if (dreamGoal.user_id === 'guest') {
          saveGuestGoal(updated);
        }

        set({ dreamGoal: updated });
      },

      setDreamGoal: (goal: DreamGoal | null) => {
        set({ dreamGoal: goal });
        if (goal) {
          set({ progress: calculateProgress(goal.current_hours, goal.target_hours) });
        }
      },
    }),
    {
      name: 'dream-goal-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dreamGoal: state.dreamGoal?.user_id === 'guest' ? state.dreamGoal : null,
      }),
    }
  )
);
