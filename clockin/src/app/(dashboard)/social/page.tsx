"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FriendsList } from "@/components/social/friends-list";
import { Leaderboard } from "@/components/social/leaderboard";
import { FocusRooms } from "@/components/social/focus-rooms";
import { ShareCard } from "@/components/social/share-card";
import { useAuthState } from "@/hooks/use-auth-state";
import { LoginPrompt } from "@/components/auth/login-prompt";
import { Users, Trophy, MessageSquare, Share2 } from "lucide-react";

export default function SocialPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthState();
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalHours: 0,
    sessions: 0,
    streak: 0,
    focusScore: 0,
  });
  const [userName, setUserName] = useState("User");
  const [userAvatar, setUserAvatar] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        setUserName(user.user_metadata?.display_name || "User");
        setUserAvatar(user.user_metadata?.avatar_url || "");

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

    loadUserData();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-8 lg:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Social</h1>
            <p className="text-muted-foreground">Connect with friends and focus together</p>
          </div>
          <LoginPrompt feature="general" />
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Social</h1>
            <p className="text-muted-foreground">Connect with friends and focus together</p>
          </div>
          <ShareCard
            userName={userName}
            userAvatar={userAvatar}
            stats={stats}
            period="weekly"
          />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Friends List */}
          <div className="space-y-4 flex flex-col">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Friends</h2>
            </div>
            <div className="flex-1">
              <FriendsList userId={userId} />
            </div>
          </div>

          {/* Leaderboard */}
          <div className="space-y-4 flex flex-col">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">Leaderboard</h2>
            </div>
            <div className="flex-1">
              <Leaderboard userId={userId} />
            </div>
          </div>
        </div>

        {/* Focus Rooms */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold">Focus Rooms</h2>
          </div>
          <FocusRooms userId={userId} />
        </div>
      </div>
    </div>
  );
}
