"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FriendsList } from "@/components/social/friends-list";
import { Leaderboard } from "@/components/social/leaderboard";
import { ShareCard } from "@/components/social/share-card";
import { useAuthState } from "@/hooks/use-auth-state";
import { useProStatus } from "@/hooks/use-pro-status";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { ChevronRight, Brain } from "lucide-react";
import { AiInsightsCard } from "@/components/ai/ai-insights-card";
import { SocialPageSkeleton } from "@/components/skeletons/social-page-skeleton";
import { PageShell } from "@/components/ui-app/page-shell";
import { Section } from "@/components/ui-app/section";
import { SEGMENTS } from "@/lib/navigation";

export default function SocialPage() {
  const router = useRouter();
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
        <Section title="Leaderboard">
          <Leaderboard userId={userId} />
        </Section>

        {/* AI Insights — Pro only */}
        {isPro ? (
          <AiInsightsCard />
        ) : (
          <UpgradePrompt
            feature="AI Insights"
            description="Generate personalized productivity insights from your 30-day focus history."
          />
        )}

        {/* Friends — Pro only. Focus rooms live under Focus now. */}
        {isPro ? (
          <Section
            title="Friends"
            action={
              <button
                onClick={() => router.push("/focus/rooms")}
                className="flex items-center gap-1 text-[13px] font-semibold text-accent-solid"
              >
                <Brain className="h-3.5 w-3.5" />
                Focus rooms <ChevronRight className="h-3.5 w-3.5" />
              </button>
            }
          >
            <FriendsList userId={userId} />
          </Section>
        ) : (
          <UpgradePrompt
            feature="Friends & Focus Rooms"
            description="Connect with friends and focus together in real-time rooms."
          />
        )}
    </PageShell>
  );
}
