"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import * as socialService from "@/services/social-service";
import type {
  Friendship,
  FocusRoom,
  FocusRoomParticipant,
  FocusRoomMessage,
  LeaderboardEntry,
  FriendSearchResult,
} from "@/types/social";

// ============================================
// FRIENDS HOOK
// ============================================

export function useFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        socialService.getFriends(userId),
        socialService.getPendingRequests(userId),
      ]);
      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (error) {
      console.error("Error loading friends:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const acceptRequest = async (friendshipId: string) => {
    await socialService.acceptFriendRequest(friendshipId);
    await loadFriends();
  };

  const declineRequest = async (friendshipId: string) => {
    await socialService.declineFriendRequest(friendshipId);
    await loadFriends();
  };

  const removeFriend = async (friendshipId: string) => {
    await socialService.removeFriend(friendshipId);
    await loadFriends();
  };

  return {
    friends,
    pendingRequests,
    loading,
    refresh: loadFriends,
    acceptRequest,
    declineRequest,
    removeFriend,
  };
}

// ============================================
// FRIEND SEARCH HOOK
// ============================================

export function useFriendSearch(currentUserId: string | undefined) {
  const [results, setResults] = useState<FriendSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (query: string) => {
      if (!currentUserId || query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await socialService.searchUsers(query, currentUserId);
        setResults(data);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentUserId]
  );

  const sendRequest = async (addresseeId: string) => {
    if (!currentUserId) return;
    await socialService.sendFriendRequest(currentUserId, addresseeId);
    // Refresh search results
    await search("");
  };

  return { results, loading, search, sendRequest };
}

// ============================================
// LEADERBOARD HOOK
// ============================================

export function useLeaderboard(
  userId: string | undefined,
  period: "weekly" | "monthly" = "weekly"
) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await socialService.getFriendsLeaderboard(userId, period);
      setLeaderboard(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, period]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return { leaderboard, loading, refresh: loadLeaderboard };
}

// ============================================
// FOCUS ROOMS HOOK
// ============================================

export function useFocusRooms() {
  const [rooms, setRooms] = useState<FocusRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await socialService.getActiveFocusRooms();
      setRooms(data);
    } catch (error) {
      console.error("Error loading focus rooms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    loadRooms();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel("focus_rooms")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "focus_rooms" },
        () => {
          loadRooms();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadRooms]);

  const createRoom = async (
    name: string,
    userId: string,
    options: Parameters<typeof socialService.createFocusRoom>[2]
  ) => {
    const room = await socialService.createFocusRoom(name, userId, options);
    await loadRooms();
    return room;
  };

  const deleteRoom = async (roomId: string, userId: string) => {
    await socialService.deleteFocusRoom(roomId, userId);
    await loadRooms();
  };

  return { rooms, loading, refresh: loadRooms, createRoom, deleteRoom };
}

// ============================================
// FOCUS ROOM PARTICIPANTS HOOK (Realtime)
// ============================================

export function useFocusRoomParticipants(roomId: string | undefined) {
  const [participants, setParticipants] = useState<FocusRoomParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  const loadParticipants = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const room = await socialService.getFocusRoom(roomId);
      setParticipants(room?.participants || []);
    } catch (error) {
      console.error("Error loading participants:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    const supabase = createClient();
    loadParticipants();

    if (!roomId) return;

    // Subscribe to realtime participant updates
    const subscription = supabase
      .channel(`room_participants_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "focus_room_participants",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId, loadParticipants]);

  return { participants, loading, refresh: loadParticipants };
}

// ============================================
// FOCUS ROOM MESSAGES HOOK (Realtime)
// ============================================

export function useFocusRoomMessages(roomId: string | undefined) {
  const [messages, setMessages] = useState<FocusRoomMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("focus_room_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(100) as { data: FocusRoomMessage[] | null; error: Error | null };

      if (error) throw error;

      // Fetch user profiles for messages
      const userIds = [...new Set((data || []).map((m) => m.user_id).filter(Boolean))];
      let userProfiles: Record<string, { display_name: string; avatar_url?: string }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds) as { data: { user_id: string; display_name: string; avatar_url?: string }[] | null };
        userProfiles = (profiles || []).reduce((acc, p) => ({ ...acc, [p.user_id]: p }), {});
      }

      // Attach user data to messages
      const messagesWithUser = (data || []).map((m) => ({
        ...m,
        user: userProfiles[m.user_id] || { display_name: "Unknown", avatar_url: undefined },
      }));

      setMessages(messagesWithUser);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadMessages();

    if (!roomId) return;

    const supabase = createClient();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`room_messages_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "focus_room_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as FocusRoomMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId, loadMessages]);

  const sendMessage = async (userId: string, message: string) => {
    if (!roomId) return;
    await socialService.sendRoomMessage(roomId, userId, message);
  };

  return { messages, loading, refresh: loadMessages, sendMessage };
}

// ============================================
// CURRENT USER FOCUS STATUS HOOK
// ============================================

export function useFocusStatus(roomId: string | undefined, userId: string | undefined) {
  const [isFocused, setIsFocused] = useState(false);
  const [focusTime, setFocusTime] = useState(0);

  useEffect(() => {
    if (!roomId || !userId) return;

    // Get initial status
    const loadStatus = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("focus_room_participants")
        .select("is_focused, focus_started_at, total_focus_seconds")
        .eq("room_id", roomId)
        .eq("user_id", userId)
        .single() as { data: { is_focused: boolean; focus_started_at: string | null; total_focus_seconds: number } | null };

      if (data) {
        setIsFocused(data.is_focused);
        if (data.is_focused && data.focus_started_at) {
          const elapsed = Math.floor(
            (new Date().getTime() - new Date(data.focus_started_at).getTime()) / 1000
          );
          setFocusTime(data.total_focus_seconds + elapsed);
        } else {
          setFocusTime(data.total_focus_seconds);
        }
      }
    };

    loadStatus();

    const supabase = createClient();

    // Subscribe to own status changes
    const subscription = supabase
      .channel(`user_focus_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "focus_room_participants",
          filter: `room_id=eq.${roomId},user_id=eq.${userId}`,
        },
        (payload) => {
          const newData = payload.new as FocusRoomParticipant;
          setIsFocused(newData.is_focused);
          setFocusTime(newData.total_focus_seconds);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId, userId]);

  // Update focus timer
  useEffect(() => {
    if (!isFocused) return;

    const interval = setInterval(() => {
      setFocusTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isFocused]);

  const toggleFocus = async () => {
    if (!roomId || !userId) return;
    const newStatus = !isFocused;
    await socialService.updateFocusStatus(roomId, userId, newStatus);
    setIsFocused(newStatus);
  };

  return { isFocused, focusTime, toggleFocus };
}
