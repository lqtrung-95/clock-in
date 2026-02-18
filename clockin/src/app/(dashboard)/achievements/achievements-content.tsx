"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthState } from "@/hooks/use-auth-state";
import { useGamification } from "@/hooks/use-gamification";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XPProgressBar } from "@/components/gamification/xp-progress-bar";
import { BadgeCard } from "@/components/gamification/badge-card";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { EvolvedCrystal } from "@/components/focus/evolved-crystal";
import { getAllBadgeDefinitions } from "@/services/gamification-service";
import { Trophy, Target, Award, TrendingUp } from "lucide-react";
import type { BadgeDefinition } from "@/types/gamification";

export default function AchievementsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [userId, setUserId] = useState<string | null>(null);
  const { userStats, levelInfo, badges, crystalConfig, isLoading } = useGamification(userId);
  const [allBadges, setAllBadges] = useState<BadgeDefinition[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUserId(data.user?.id || null);
      });
      getAllBadgeDefinitions().then(setAllBadges);
    }
  }, [isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
              <p className="text-sm text-muted-foreground">Track your progress and earn badges</p>
            </div>
          </div>
          <LoginPrompt feature="achievements" />
        </div>
      </div>
    );
  }

  const earnedBadgeKeys = new Set(badges.map((b) => b.badge_definition_key || b.badge_key));
  const earnedCount = earnedBadgeKeys.size;
  const totalCount = allBadges.length;
  const progressPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  // Group badges by rarity
  const badgesByRarity = allBadges.reduce((acc, badge) => {
    if (!acc[badge.rarity]) acc[badge.rarity] = [];
    acc[badge.rarity].push(badge);
    return acc;
  }, {} as Record<string, BadgeDefinition[]>);

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
              <p className="text-sm text-muted-foreground">Track your progress and earn badges</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Badges Earned</p>
              <p className="text-2xl font-bold text-foreground">
                {earnedCount} <span className="text-muted-foreground">/ {totalCount}</span>
              </p>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-muted">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-amber-500"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${progressPercentage}, 100`}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Level & Crystal Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Level Progress */}
          <Card className="border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-foreground">Level Progress</h2>
            </div>
            <div className="space-y-4">
              <XPProgressBar levelInfo={levelInfo} size="lg" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total XP: {userStats?.total_xp || 0}</span>
                <span>Next Level: {levelInfo ? levelInfo.xpForNextLevel - (levelInfo.currentLevel - 1) * 1000 - levelInfo.xpProgress : 1000} XP</span>
              </div>
            </div>
          </Card>

          {/* Crystal Preview */}
          <Card className="border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-foreground">Your Crystal</h2>
            </div>
            <div className="flex items-center justify-center">
              <EvolvedCrystal
                level={userStats?.current_level || 1}
                progress={levelInfo?.progressPercentage || 0}
                shape={crystalConfig?.active_shape || "icosahedron"}
                color={crystalConfig?.active_color || "blue"}
                theme={crystalConfig?.active_theme || "default"}
                size="md"
              />
            </div>
          </Card>
        </div>

        {/* Badges Section */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="earned">Earned</TabsTrigger>
            <TabsTrigger value="rare">Rare+</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allBadges.map((badge) => (
                <BadgeCard
                  key={badge.key}
                  badge={badge}
                  earned={earnedBadgeKeys.has(badge.key)}
                  earnedAt={badges.find((b) => (b.badge_definition_key || b.badge_key) === badge.key)?.earned_at}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="earned" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {badges
                .filter((b) => b.badge)
                .map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge.badge!}
                    earned={true}
                    earnedAt={badge.earned_at}
                  />
                ))}
              {badges.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">No badges earned yet. Start focusing to earn your first badge!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rare" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allBadges
                .filter((b) => b.rarity === "rare" || b.rarity === "epic" || b.rarity === "legendary")
                .map((badge) => (
                  <BadgeCard
                    key={badge.key}
                    badge={badge}
                    earned={earnedBadgeKeys.has(badge.key)}
                    earnedAt={badges.find((b) => (b.badge_definition_key || b.badge_key) === badge.key)?.earned_at}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="locked" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allBadges
                .filter((b) => !earnedBadgeKeys.has(b.key))
                .map((badge) => (
                  <BadgeCard
                    key={badge.key}
                    badge={badge}
                    earned={false}
                  />
                ))}
              {allBadges.filter((b) => !earnedBadgeKeys.has(b.key)).length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <Target className="mx-auto h-12 w-12 text-green-500" />
                  <p className="mt-4 text-muted-foreground">Amazing! You&apos;ve earned all available badges!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
