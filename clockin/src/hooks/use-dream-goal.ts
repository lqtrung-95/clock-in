import { useEffect, useCallback } from 'react';
import { useDreamGoalStore } from '@/stores/dream-goal-store';
import type { DreamGoalTheme } from '@/types/dream-goal';

export function useDreamGoal(userId: string | null) {
  const {
    dreamGoal,
    progress,
    isLoading,
    error,
    loadDreamGoal,
    updateProgress,
    setTheme,
  } = useDreamGoalStore();

  useEffect(() => {
    if (userId) {
      loadDreamGoal(userId);
    }
  }, [userId, loadDreamGoal]);

  const addProgress = useCallback(
    async (hours: number): Promise<boolean> => {
      if (!userId) return false;
      return updateProgress(userId, hours);
    },
    [userId, updateProgress]
  );

  const changeTheme = useCallback(
    (theme: DreamGoalTheme) => {
      setTheme(theme);
    },
    [setTheme]
  );

  return {
    dreamGoal,
    progress,
    isLoading,
    error,
    addProgress,
    changeTheme,
    refresh: () => userId && loadDreamGoal(userId),
  };
}
