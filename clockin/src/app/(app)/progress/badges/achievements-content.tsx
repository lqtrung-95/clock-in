"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "@/hooks/use-auth-state";
import { useGamification } from "@/hooks/use-gamification";
import { getLevelInfo, getAllBadgeDefinitions } from "@/services/gamification-service";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XPProgressBar } from "@/components/gamification/xp-progress-bar";
import { BadgeCard } from "@/components/gamification/badge-card";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { EvolvedCrystal } from "@/components/focus/evolved-crystal";
import { Trophy, Target, Award, TrendingUp } from "lucide-react";
import { AchievementsPageSkeleton } from "@/components/skeletons/achievements-page-skeleton";
import { PageShell } from "@/components/ui-app/page-shell";
import { SEGMENTS } from "@/lib/navigation";
import type { BadgeDefinition } from "@/types/gamification";

export default function AchievementsContent() {
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthState();
  const { userStats, levelInfo: hookLevelInfo, badges, crystalConfig, isLoading } = useGamification(userId);

  // Fallback: compute levelInfo from userStats if hook hasn't set it yet
  const levelInfo = hookLevelInfo ?? (userStats ? getLevelInfo(userStats) : null);

  const { data: allBadges = [], isLoading: badgesLoading } = useQuery<BadgeDefinition[]>({
    queryKey: ["badge-definitions"],
    queryFn: getAllBadgeDefinitions,
    // Badge definitions are static — cache indefinitely for the session
    staleTime: Infinity,
  });

  if (authLoading || isLoading || badgesLoading) {
    return <AchievementsPageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <PageShell title="Progress" segments={SEGMENTS.progress}>
        <LoginPrompt feature="achievements" />
      </PageShell>
    );
  }

  const earnedBadgeKeys = new Set(badges.map((b) => b.badge_definition_key || b.badge_key));
  const earnedCount = earnedBadgeKeys.size;
  const totalCount = allBadges.length;
  const progressPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <PageShell
      title="Progress"
      segments={SEGMENTS.progress}
      actions={
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-ink-subtle">Badges earned</p>
            <p className="text-lg font-semibold tabular-nums text-ink">
              {earnedCount} <span className="text-ink-subtle">/ {totalCount}</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-full border-4 border-surface-sunken">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-sunken"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-data-xp"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${progressPercentage}, 100`}
              />
            </svg>
          </div>
        </div>
      }
    >
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
    </PageShell>
  );
}
