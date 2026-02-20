"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeaderboard } from "@/hooks/use-social";
import { Trophy, Medal, Award, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  userId: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30">
        <Trophy className="h-4 w-4" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-400/30">
        <Medal className="h-4 w-4" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-lg shadow-orange-700/30">
        <Award className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
      {rank}
    </div>
  );
}

function LeaderboardEntry({
  entry,
  index,
}: {
  entry: {
    friend_id: string;
    display_name: string;
    avatar_url?: string;
    total_seconds: number;
    session_count: number;
    rank: number;
    is_current_user?: boolean;
  };
  index: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl transition-colors",
        entry.is_current_user
          ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
          : "hover:bg-muted/50"
      )}
    >
      <RankBadge rank={entry.rank} />

      <Avatar className="h-10 w-10">
        {entry.avatar_url && (
          <img src={entry.avatar_url} alt={entry.display_name} className="h-full w-full object-cover rounded-full" />
        )}
        <AvatarFallback
          className={cn(
            "text-white text-sm",
            entry.rank <= 3
              ? "bg-gradient-to-br from-purple-500 to-pink-500"
              : "bg-gradient-to-br from-blue-500 to-cyan-500"
          )}
        >
          {entry.display_name?.charAt(0).toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {entry.display_name}
          {entry.is_current_user && (
            <span className="ml-2 text-xs text-primary">(You)</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {entry.session_count} sessions
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold text-sm flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDuration(entry.total_seconds)}
        </p>
      </div>
    </div>
  );
}

export function Leaderboard({ userId }: LeaderboardProps) {
  const {
    leaderboard: weeklyLeaderboard,
    loading: weeklyLoading,
    refresh: refreshWeekly,
  } = useLeaderboard(userId, "weekly");
  const {
    leaderboard: monthlyLeaderboard,
    loading: monthlyLoading,
    refresh: refreshMonthly,
  } = useLeaderboard(userId, "monthly");

  const loading = weeklyLoading || monthlyLoading;

  if (loading) {
    return (
      <Card className="p-6 h-full">
        <div className="flex items-center justify-center py-12 h-full">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Friend Leaderboard</h3>
          <p className="text-sm text-muted-foreground">
            Compete with your friends
          </p>
        </div>
        <Trophy className="h-8 w-8 text-yellow-500" />
      </div>

      <Tabs defaultValue="weekly">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-2">
          {weeklyLeaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No activity this week. Start focusing to appear on the
                leaderboard!
              </p>
            </div>
          ) : (
            weeklyLeaderboard.map((entry, index) => (
              <LeaderboardEntry key={`weekly-${entry.friend_id}`} entry={entry} index={index} />
            ))
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-2">
          {monthlyLeaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No activity this month. Start focusing to appear on the
                leaderboard!
              </p>
            </div>
          ) : (
            monthlyLeaderboard.map((entry, index) => (
              <LeaderboardEntry key={`monthly-${entry.friend_id}`} entry={entry} index={index} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
