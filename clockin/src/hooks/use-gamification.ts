"use client";

import { useEffect, useCallback } from "react";
import { useGamificationStore } from "@/stores/gamification-store";
import {
  getUserStats,
  getLevelInfo,
  getUserBadges,
  getUserChallengeProgress,
  getCrystalCustomizations,
  initializeUserChallenges,
  trackFocusTime,
  addXP,
} from "@/services/gamification-service";
import type { UserStats, CrystalCustomizations } from "@/types/xp-system";

export function useGamification(userId: string | null) {
  const {
    userStats,
    levelInfo,
    badges,
    challenges,
    crystalConfig,
    isLoading,
    isInitialized,
    setUserStats,
    setLevelInfo,
    setBadges,
    setChallenges,
    setCrystalConfig,
    setIsLoading,
    setIsInitialized,
    updateXP,
  } = useGamificationStore();

  // Initialize gamification data
  useEffect(() => {
    if (isInitialized) return;

    async function initialize() {
      setIsLoading(true);

      if (!userId) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        // Fetch all gamification data in parallel
        const [stats, userBadges, userChallenges, crystal] = await Promise.all([
          getUserStats(userId),
          getUserBadges(userId),
          getUserChallengeProgress(userId),
          getCrystalCustomizations(userId),
        ]);

        if (stats) {
          setUserStats(stats);
          setLevelInfo(getLevelInfo(stats));
        }

        setBadges(userBadges);
        setChallenges(userChallenges);
        setCrystalConfig(crystal);

        // Initialize challenges if needed
        if (userChallenges.length === 0) {
          await initializeUserChallenges(userId);
          const newChallenges = await getUserChallengeProgress(userId);
          setChallenges(newChallenges);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing gamification:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [
    userId,
    isInitialized,
    setUserStats,
    setLevelInfo,
    setBadges,
    setChallenges,
    setCrystalConfig,
    setIsLoading,
    setIsInitialized,
  ]);

  // Track focus time and award XP
  const trackSession = useCallback(
    async (minutes: number, categoryId?: string) => {
      if (!userId) return;

      await trackFocusTime(userId, minutes, categoryId);

      // Refresh stats
      const stats = await getUserStats(userId);
      if (stats) {
        setUserStats(stats);
        setLevelInfo(getLevelInfo(stats));
      }

      // Refresh badges
      const userBadges = await getUserBadges(userId);
      setBadges(userBadges);

      // Refresh challenges
      const userChallenges = await getUserChallengeProgress(userId);
      setChallenges(userChallenges);
    },
    [userId, setUserStats, setLevelInfo, setBadges, setChallenges]
  );

  // Award bonus XP
  const awardBonusXP = useCallback(
    async (xpAmount: number) => {
      if (!userId) return;

      await addXP(userId, xpAmount);
      updateXP(xpAmount);

      // Refresh full stats
      const stats = await getUserStats(userId);
      if (stats) {
        setUserStats(stats);
        setLevelInfo(getLevelInfo(stats));
      }
    },
    [userId, updateXP, setUserStats, setLevelInfo]
  );

  // Refresh all data
  const refresh = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      const [stats, userBadges, userChallenges, crystal] = await Promise.all([
        getUserStats(userId),
        getUserBadges(userId),
        getUserChallengeProgress(userId),
        getCrystalCustomizations(userId),
      ]);

      if (stats) {
        setUserStats(stats);
        setLevelInfo(getLevelInfo(stats));
      }

      setBadges(userBadges);
      setChallenges(userChallenges);
      setCrystalConfig(crystal);
    } catch (error) {
      console.error("Error refreshing gamification:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    userId,
    setUserStats,
    setLevelInfo,
    setBadges,
    setChallenges,
    setCrystalConfig,
    setIsLoading,
  ]);

  return {
    // State
    userStats,
    levelInfo,
    badges,
    challenges,
    crystalConfig,
    isLoading,
    isInitialized,

    // Actions
    trackSession,
    awardBonusXP,
    refresh,
  };
}
