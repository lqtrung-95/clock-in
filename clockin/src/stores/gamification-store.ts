"use client";

import { create } from "zustand";
import type {
  UserBadge,
  ChallengeProgress,
} from "@/types/gamification";
import type {
  UserStats,
  LevelInfo,
  CrystalCustomizations,
} from "@/types/xp-system";
import type { UserStats as UserStatsType } from "@/types/xp-system";

interface GamificationState {
  // User Stats
  userStats: UserStatsType | null;
  levelInfo: LevelInfo | null;

  // Badges
  badges: UserBadge[];

  // Challenges
  challenges: ChallengeProgress[];

  // Crystal
  crystalConfig: CrystalCustomizations | null;

  // Loading
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUserStats: (stats: UserStatsType | null) => void;
  setLevelInfo: (info: LevelInfo | null) => void;
  setBadges: (badges: UserBadge[]) => void;
  setChallenges: (challenges: ChallengeProgress[]) => void;
  setCrystalConfig: (config: CrystalCustomizations | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;

  // Computed
  addBadge: (badge: UserBadge) => void;
  updateChallenge: (challengeId: string, updates: Partial<ChallengeProgress>) => void;
  updateXP: (xpAmount: number) => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  userStats: null,
  levelInfo: null,
  badges: [],
  challenges: [],
  crystalConfig: null,
  isLoading: true,
  isInitialized: false,

  setUserStats: (stats) => set({ userStats: stats }),
  setLevelInfo: (info) => set({ levelInfo: info }),
  setBadges: (badges) => set({ badges }),
  setChallenges: (challenges) => set({ challenges }),
  setCrystalConfig: (config) => set({ crystalConfig: config }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsInitialized: (initialized) => set({ isInitialized: initialized }),

  addBadge: (badge) => {
    const { badges } = get();
    set({ badges: [badge, ...badges] });
  },

  updateChallenge: (challengeId, updates) => {
    const { challenges } = get();
    set({
      challenges: challenges.map((c) =>
        c.id === challengeId ? { ...c, ...updates } : c
      ),
    });
  },

  updateXP: (xpAmount) => {
    const { userStats, levelInfo } = get();
    if (!userStats || !levelInfo) return;

    const newXP = userStats.total_xp + xpAmount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    const xpForNext = newLevel * 1000;
    const xpProgress = newXP - (newLevel - 1) * 1000;
    const progressPercentage = Math.min((xpProgress / 1000) * 100, 100);

    set({
      userStats: {
        ...userStats,
        total_xp: newXP,
        current_level: newLevel,
      },
      levelInfo: {
        currentLevel: newLevel,
        currentXP: newXP,
        xpForNextLevel: xpForNext,
        xpProgress,
        progressPercentage,
      },
    });
  },
}));
