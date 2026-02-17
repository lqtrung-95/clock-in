"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useAuthState } from "@/hooks/use-auth-state";
import {
  useFocusRoomParticipants,
  useFocusRoomMessages,
  useFocusStatus,
} from "@/hooks/use-social";
import * as socialService from "@/services/social-service";
import type { FocusRoomParticipant } from "@/types/social";
import {
  Users,
  Send,
  Play,
  Square,
  Clock,
  ArrowLeft,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function ParticipantCard({
  participant,
  isHost,
}: {
  participant: {
    user_id: string;
    user?: {
      display_name: string;
      avatar_url?: string;
    };
    is_focused: boolean;
    total_focus_seconds: number;
  };
  isHost: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        participant.is_focused
          ? "border-green-500/50 bg-green-500/10"
          : "border-border bg-card"
      )}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
            {participant.user?.display_name?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        {isHost && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
            <Crown className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {participant.user?.display_name || "Unknown"}
        </p>
        <p className="text-xs text-muted-foreground">
          {participant.is_focused ? (
            <span className="text-green-500 flex items-center gap-1">
              <Play className="h-3 w-3" /> Focusing
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(participant.total_focus_seconds)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function FocusRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const { userId: currentUserId } = useAuthState();

  const { participants, loading: participantsLoading } =
    useFocusRoomParticipants(roomId);
  const { messages, sendMessage } = useFocusRoomMessages(roomId);
  const { isFocused, focusTime, toggleFocus } = useFocusStatus(
    roomId,
    currentUserId || undefined
  );

  const [messageInput, setMessageInput] = useState("");
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;

    // Check if user is host and join room
    const init = async () => {
      try {
        const room = await socialService.getFocusRoom(roomId);
        if (room) {
          setIsHost(room.host_id === currentUserId);
          // Join if not already
          await socialService.joinFocusRoom(roomId, currentUserId);
        }
      } catch (error) {
        console.error("Error joining room:", error);
      }
    };

    init();

    // Leave room on unmount
    return () => {
      if (currentUserId) {
        socialService.leaveFocusRoom(roomId, currentUserId);
      }
    };
  }, [roomId, currentUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentUserId) return;

    await sendMessage(currentUserId, messageInput.trim());
    setMessageInput("");
  };

  const handleLeave = async () => {
    if (currentUserId) {
      await socialService.leaveFocusRoom(roomId, currentUserId);
    }
    router.push("/social");
  };

  if (!currentUserId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Please sign in to join focus rooms</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLeave}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave
          </Button>
          <div>
            <h1 className="font-semibold">Focus Room</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {participants.length} participants
            </p>
          </div>
        </div>

        {/* Focus Toggle */}
        <Button
          size="lg"
          onClick={toggleFocus}
          className={cn(
            "gap-2",
            isFocused
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          )}
        >
          {isFocused ? (
            <>
              <Square className="h-5 w-5" />
              Stop Focus
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Start Focus
            </>
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Participants Sidebar */}
        <div className="w-64 border-r p-4 hidden md:block">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants
          </h3>
          <ScrollArea className="h-[calc(100%-2rem)]">
            <div className="space-y-2">
              {participants.map((participant) => (
                <ParticipantCard
                  key={participant.user_id}
                  participant={participant}
                  isHost={participant.user_id === currentUserId && isHost}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center - Focus Timer */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="p-12 text-center">
            <div
              className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6",
                isFocused
                  ? "bg-green-500/20 animate-pulse"
                  : "bg-muted"
              )}
            >
              {isFocused ? (
                <Play className="h-12 w-12 text-green-500" />
              ) : (
                <Clock className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="text-5xl font-bold font-mono mb-2">
              {formatTime(focusTime)}
            </div>
            <p className="text-muted-foreground">
              {isFocused ? "Stay focused!" : "Ready to focus?"}
            </p>
          </Card>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 border-l flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-medium">Room Chat</h3>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "text-sm",
                    msg.message_type === "system" && "text-center text-xs text-muted-foreground"
                  )}
                >
                  {msg.message_type !== "system" && (
                    <span className="font-medium text-muted-foreground">
                      {msg.user?.display_name}:
                    </span>
                  )}{" "}
                  {msg.message}
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
            <Input
              placeholder="Send a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!messageInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
