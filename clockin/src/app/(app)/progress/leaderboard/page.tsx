"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FriendsList } from "@/components/social/friends-list";
import { Leaderboard } from "@/components/social/leaderboard";
import { FocusRooms } from "@/components/social/focus-rooms";
import { ShareCard } from "@/components/social/share-card";
import { useAuthState } from "@/hooks/use-auth-state";
import { useProStatus } from "@/hooks/use-pro-status";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { Users, Trophy, MessageSquare, Share2 } from "lucide-react";
import { AiInsightsCard } from "@/components/ai/ai-insights-card";
import { SocialPageSkeleton } from "@/components/skeletons/social-page-skeleton";
import { PageShell } from "@/components/ui-app/page-shell";
import { SEGMENTS } from "@/lib/navigation";

export default function SocialPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [userId, setUserId] = useState<string | null>(null);
  const { isPro } = useProStatus(userId);
  const [stats, setStats] = useState({
    totalHours: 0,
    sessions: 0,
    streak: 0,
    focusScore: 0,
  });
  const [userName, setUserName] = useState("User");
  const [userAvatar, setUserAvatar] = useState<string>("");

  const loadUserData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);

      // Load profile from database (not auth metadata) to get custom changes
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single() as { data: { display_name: string; avatar_url: string } | null };

      // Use profile data if available, fallback to auth metadata
      setUserName(profile?.display_name || user.user_metadata?.display_name || "User");
      setUserAvatar(profile?.avatar_url || user.user_metadata?.avatar_url || "");

      // Load stats
      const { data: entries } = await supabase
        .from("time_entries")
        .select("duration_seconds")
        .eq("user_id", user.id)
        .gte("started_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) as { data: { duration_seconds: number }[] | null };

      const { data: streakData } = await supabase
        .from("streaks")
        .select("current_streak")
        .eq("user_id", user.id)
        .single() as { data: { current_streak: number } | null };

      const totalSeconds = entries?.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) || 0;

      setStats({
        totalHours: totalSeconds / 3600,
        sessions: entries?.length || 0,
        streak: streakData?.current_streak || 0,
        focusScore: Math.min(100, Math.round((totalSeconds / 3600) * 10)),
      });
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadUserData();
  }, [isAuthenticated]);


  if (authLoading) {
    return <SocialPageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <PageShell title="Progress" segments={SEGMENTS.progress} width="wide">
        <LoginPrompt feature="general" />
      </PageShell>
    );
  }

  if (!userId) {
    return <SocialPageSkeleton />;
  }

  return (
    <PageShell
      title="Progress"
      segments={SEGMENTS.progress}
      width="wide"
      actions={<ShareCard userName={userName} userAvatar={userAvatar} stats={stats} period="weekly" />}
    >
        {/* Leaderboard — free for all authenticated users */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Leaderboard</h2>
          </div>
          <Leaderboard userId={userId} />
        </div>

        {/* AI Insights — Pro only */}
        {isPro ? (
          <AiInsightsCard />
        ) : (
          <UpgradePrompt
            feature="AI Insights"
            description="Generate personalized productivity insights from your 30-day focus history."
          />
        )}

        {/* Friends + Focus Rooms — Pro only */}
        {isPro ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Friends</h2>
              </div>
              <FriendsList userId={userId} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold">Focus Rooms</h2>
              </div>
              <FocusRooms userId={userId} />
            </div>
          </>
        ) : (
          <UpgradePrompt
            feature="Friends & Focus Rooms"
            description="Connect with friends and focus together in real-time rooms."
          />
        )}
    </PageShell>
  );
}
