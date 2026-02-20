import { createClient } from "@/lib/supabase/client";
import type {
  Friendship,
  UserProfile,
  FocusRoom,
  FocusRoomParticipant,
  FocusRoomMessage,
  LeaderboardEntry,
  SharedAchievement,
  ProgressShareCard,
  FriendSearchResult,
  FocusRoomSession,
} from "@/types/social";

// Helper to get public avatar URL
function getAvatarUrl(avatarUrl: string | undefined | null): string | undefined {
  if (!avatarUrl) return undefined;

  // If it's already a full URL, return it
  if (avatarUrl.startsWith("http")) {
    console.log("Avatar URL (external):", avatarUrl);
    return avatarUrl;
  }

  // If it's a storage path, construct the public URL
  const supabase = createClient();
  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(avatarUrl);

  console.log("Avatar URL (storage):", publicUrl, "from path:", avatarUrl);
  return publicUrl;
}


// ============================================
// FRIENDSHIP OPERATIONS
// ============================================

export async function searchUsers(query: string, currentUserId: string): Promise<FriendSearchResult[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .ilike("display_name", `%${query}%`)
    .neq("user_id", currentUserId)  // user_id holds the auth user ID
    .limit(20) as { data: { user_id: string; display_name: string; avatar_url?: string }[] | null; error: Error | null };

  if (error) throw error;

  const userIds = (data || []).map((u) => u.user_id);

  if (userIds.length === 0) return [];

  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.in.(${userIds.join(",")}),addressee_id.in.(${userIds.join(",")})`)
    .eq("status", "pending") as { data: Friendship[] | null };

  return (data || []).map((user) => {
    const friendship = friendships?.find(
      (f) =>
        (f.requester_id === currentUserId && f.addressee_id === user.user_id) ||
        (f.addressee_id === currentUserId && f.requester_id === user.user_id)
    );

    return {
      id: user.user_id,
      display_name: user.display_name,
      avatar_url: getAvatarUrl(user.avatar_url),
      friendship_status: friendship ? "pending" : "none",
      is_requester: friendship?.requester_id === currentUserId,
    };
  });
}

export async function sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("friendships")
    .insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: "pending",
    } as never)
    .select()
    .single() as { data: Friendship; error: Error | null };

  if (error) throw error;
  return data;
}

export async function acceptFriendRequest(friendshipId: string): Promise<Friendship> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("friendships")
    .update({ status: "accepted", updated_at: new Date().toISOString() } as never)
    .eq("id", friendshipId)
    .select()
    .single() as { data: Friendship; error: Error | null };

  if (error) throw error;
  return data;
}

export async function declineFriendRequest(friendshipId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("friendships")
    .update({ status: "declined", updated_at: new Date().toISOString() } as never)
    .eq("id", friendshipId);

  if (error) throw error;
}

export async function removeFriend(friendshipId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
  if (error) throw error;
}

export async function getFriends(userId: string): Promise<Friendship[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted") as { data: Friendship[] | null; error: Error | null };

  if (error) throw error;
  return data || [];
}

export async function getPendingRequests(userId: string): Promise<Friendship[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .eq("addressee_id", userId)
    .eq("status", "pending") as { data: Friendship[] | null; error: Error | null };

  if (error) throw error;
  return data || [];
}

// ============================================
// LEADERBOARD OPERATIONS
// ============================================

export async function getFriendsLeaderboard(
  userId: string,
  period: "weekly" | "monthly" = "weekly"
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_friends_leaderboard", {
    p_user_id: userId,
    p_period: period,
  } as never) as { data: LeaderboardEntry[] | null; error: Error | null };

  if (error) throw error;

  // Deduplicate entries by friend_id (defensive against duplicate data)
  const seen = new Set<string>();
  const uniqueData = (data || []).filter((entry: LeaderboardEntry) => {
    if (seen.has(entry.friend_id)) return false;
    seen.add(entry.friend_id);
    return true;
  });

  return uniqueData.map((entry: LeaderboardEntry) => ({
    ...entry,
    avatar_url: getAvatarUrl(entry.avatar_url),
    is_current_user: entry.friend_id === userId,
  }));
}

export async function getGlobalLeaderboard(
  userId: string,
  period: "weekly" | "monthly" = "weekly"
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_global_leaderboard", {
    p_user_id: userId,
    p_period: period,
  } as never) as { data: LeaderboardEntry[] | null; error: Error | null };

  if (error) throw error;

  // Deduplicate entries by friend_id (defensive against duplicate data)
  const seen = new Set<string>();
  const uniqueData = (data || []).filter((entry: LeaderboardEntry) => {
    if (seen.has(entry.friend_id)) return false;
    seen.add(entry.friend_id);
    return true;
  });

  return uniqueData.map((entry: LeaderboardEntry) => ({
    ...entry,
    avatar_url: getAvatarUrl(entry.avatar_url),
    is_current_user: entry.friend_id === userId,
  }));
}

// ============================================
// FOCUS ROOM OPERATIONS
// ============================================

export async function createFocusRoom(
  name: string,
  hostId: string,
  options: {
    description?: string;
    isPrivate?: boolean;
    accessCode?: string;
    maxParticipants?: number;
  } = {}
): Promise<FocusRoom> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("focus_rooms")
    .insert({
      name,
      host_id: hostId,
      description: options.description,
      is_private: options.isPrivate || false,
      access_code: options.accessCode,
      max_participants: options.maxParticipants || 10,
      is_active: true,
      started_at: new Date().toISOString(),
    } as never)
    .select()
    .single() as { data: FocusRoom; error: Error | null };

  if (error) throw error;

  // Auto-join host as participant
  await joinFocusRoom(data.id, hostId);

  return data;
}

export async function getActiveFocusRooms(): Promise<FocusRoom[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("focus_rooms")
    .select("*, participants:focus_room_participants(count)")
    .eq("is_active", true)
    .eq("is_private", false)
    .order("created_at", { ascending: false }) as { data: (FocusRoom & { participants: [{ count: number }] })[] | null; error: Error | null };

  if (error) throw error;

  // Get unique host IDs
  const hostIds = [...new Set((data || []).map(r => r.host_id))];

  // Fetch host profiles separately (join on user_id, not id)
  let hostProfiles: Record<string, { id: string; display_name: string; avatar_url?: string }> = {};
  if (hostIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", hostIds) as { data: { user_id: string; display_name: string; avatar_url?: string }[] | null };
    // Map user_id to id for the host object to match UserProfile type
    hostProfiles = (profiles || []).reduce((acc, p) => ({ ...acc, [p.user_id]: { id: p.user_id, display_name: p.display_name, avatar_url: p.avatar_url } }), {});
  }

  return (data || []).map((room) => ({
    ...room,
    participant_count: room.participants?.[0]?.count || 0,
    host: hostProfiles[room.host_id] || { id: room.host_id, display_name: "Unknown", avatar_url: undefined },
  }));
}

export async function getFocusRoom(roomId: string): Promise<FocusRoom | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("focus_rooms")
    .select("*, participants:focus_room_participants(*)")
    .eq("id", roomId)
    .single() as { data: FocusRoom | null; error: Error | null };

  if (error) throw error;
  if (!data) return null;

  // Fetch participant profiles separately
  const participantIds = data.participants?.map((p) => p.user_id) || [];
  let userProfiles: Record<string, { display_name: string; avatar_url?: string }> = {};

  if (participantIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", participantIds) as { data: { user_id: string; display_name: string; avatar_url?: string }[] | null };

    userProfiles = (profiles || []).reduce((acc, p) => ({ ...acc, [p.user_id]: p }), {});
  }

  // Attach user data to participants
  const participantsWithUser = (data.participants || []).map((p) => ({
    ...p,
    user: userProfiles[p.user_id] ? {
      id: p.user_id,
      display_name: userProfiles[p.user_id].display_name,
      avatar_url: getAvatarUrl(userProfiles[p.user_id].avatar_url),
    } : { id: p.user_id, display_name: "Unknown", avatar_url: undefined },
  }));

  return {
    ...data,
    participants: participantsWithUser,
  };
}

export async function joinFocusRoom(roomId: string, userId: string): Promise<FocusRoomParticipant> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("focus_room_participants")
    .upsert(
      {
        room_id: roomId,
        user_id: userId,
        joined_at: new Date().toISOString(),
        left_at: null,
      } as never,
      { onConflict: "room_id,user_id" }
    )
    .select()
    .single() as { data: FocusRoomParticipant; error: Error | null };

  if (error) throw error;
  return data;
}

export async function leaveFocusRoom(roomId: string, userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("focus_room_participants")
    .update({ left_at: new Date().toISOString() } as never)
    .eq("room_id", roomId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function deleteFocusRoom(roomId: string, userId: string): Promise<void> {
  const supabase = createClient();

  // Verify user is the host
  const { data: room } = await supabase
    .from("focus_rooms")
    .select("host_id")
    .eq("id", roomId)
    .single() as { data: { host_id: string } | null };

  if (!room || room.host_id !== userId) {
    throw new Error("Only the room creator can delete this room");
  }

  // Delete room (participants will be cascade deleted if set up, otherwise delete manually)
  const { error: participantsError } = await supabase
    .from("focus_room_participants")
    .delete()
    .eq("room_id", roomId);

  if (participantsError) throw participantsError;

  const { error } = await supabase
    .from("focus_rooms")
    .delete()
    .eq("id", roomId);

  if (error) throw error;
}

export async function updateFocusStatus(
  roomId: string,
  userId: string,
  isFocused: boolean
): Promise<void> {
  const supabase = createClient();
  const updates: Record<string, unknown> = {
    is_focused: isFocused,
  };

  if (isFocused) {
    updates.focus_started_at = new Date().toISOString();
  } else {
    // Calculate total focus time when stopping
    const { data } = await supabase
      .from("focus_room_participants")
      .select("focus_started_at, total_focus_seconds")
      .eq("room_id", roomId)
      .eq("user_id", userId)
      .single() as { data: { focus_started_at: string | null; total_focus_seconds: number } | null };

    if (data?.focus_started_at) {
      const focusDuration = Math.floor(
        (new Date().getTime() - new Date(data.focus_started_at).getTime()) / 1000
      );
      updates.total_focus_seconds = (data.total_focus_seconds || 0) + focusDuration;
      updates.focus_started_at = null;
    }
  }

  const { error } = await supabase
    .from("focus_room_participants")
    .update(updates as never)
    .eq("room_id", roomId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function sendRoomMessage(
  roomId: string,
  userId: string,
  message: string,
  messageType: FocusRoomMessage["message_type"] = "chat"
): Promise<FocusRoomMessage> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("focus_room_messages")
    .insert({
      room_id: roomId,
      user_id: userId,
      message,
      message_type: messageType,
    } as never)
    .select()
    .single() as { data: FocusRoomMessage; error: Error | null };

  if (error) throw error;
  return data;
}

export async function endFocusRoom(roomId: string, hostId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("focus_rooms")
    .update({
      is_active: false,
      ended_at: new Date().toISOString(),
    } as never)
    .eq("id", roomId)
    .eq("host_id", hostId);

  if (error) throw error;
}

// ============================================
// SHARING OPERATIONS
// ============================================

export async function shareAchievement(
  userId: string,
  badgeId: string,
  options: {
    message?: string;
    platform?: string;
  } = {}
): Promise<SharedAchievement> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("shared_achievements")
    .insert({
      user_id: userId,
      badge_id: badgeId,
      share_message: options.message,
      platform: options.platform,
    } as never)
    .select()
    .single() as { data: SharedAchievement; error: Error | null };

  if (error) throw error;
  return data;
}

export async function createProgressShareCard(
  userId: string,
  cardType: ProgressShareCard["card_type"],
  stats: ProgressShareCard["stats"]
): Promise<ProgressShareCard> {
  const supabase = createClient();
  const titles: Record<string, string> = {
    daily: "Daily Focus Report",
    weekly: "Weekly Progress",
    monthly: "Monthly Achievements",
    streak: "Focus Streak Milestone",
    achievement: "Achievement Unlocked",
  };

  const { data, error } = await supabase
    .from("progress_share_cards")
    .insert({
      user_id: userId,
      card_type: cardType,
      title: titles[cardType],
      stats,
    } as never)
    .select()
    .single() as { data: ProgressShareCard; error: Error | null };

  if (error) throw error;
  return data;
}

export async function incrementShareCount(cardId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("increment_share_count", { card_id: cardId } as never);
  if (error) throw error;
}

// ============================================
// FOCUS ROOM SESSION OPERATIONS
// ============================================

export async function startFocusRoomSession(
  roomId: string,
  hostId: string,
  duration: number
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("start_focus_room_session", {
    p_room_id: roomId,
    p_host_id: hostId,
    p_duration: duration,
  } as never) as { data: string; error: Error | null };

  if (error) throw error;
  return data;
}

export async function completeFocusRoomSession(roomId: string, hostId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("complete_focus_room_session", {
    p_room_id: roomId,
    p_host_id: hostId,
  } as never);

  if (error) throw error;
}

export async function pauseFocusRoomSession(roomId: string, hostId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("pause_focus_room_session", {
    p_room_id: roomId,
    p_host_id: hostId,
  } as never);

  if (error) throw error;
}

export async function resetFocusRoomSession(roomId: string, hostId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("reset_focus_room_session", {
    p_room_id: roomId,
    p_host_id: hostId,
  } as never);

  if (error) throw error;
}

export async function completeSessionParticipant(sessionId: string, userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("complete_session_participant", {
    p_session_id: sessionId,
    p_user_id: userId,
  } as never);

  if (error) throw error;
}

export async function getFocusRoomSessions(roomId: string): Promise<FocusRoomSession[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("focus_room_sessions")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(10) as { data: FocusRoomSession[] | null; error: Error | null };

  if (error) throw error;
  return data || [];
}

export async function leaveFocusRoomAndRemove(roomId: string, userId: string): Promise<void> {
  const supabase = createClient();

  // Mark as left
  await supabase
    .from("focus_room_participants")
    .update({ left_at: new Date().toISOString() } as never)
    .eq("room_id", roomId)
    .eq("user_id", userId);

  // If user is host, end the room
  const { data: room } = await supabase
    .from("focus_rooms")
    .select("host_id")
    .eq("id", roomId)
    .single() as { data: { host_id: string } | null };

  if (room?.host_id === userId) {
    await endFocusRoom(roomId, userId);
  }
}
