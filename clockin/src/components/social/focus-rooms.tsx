"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFocusRooms } from "@/hooks/use-social";
import { Users, Plus, Lock, Globe, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface FocusRoomsProps {
  userId: string;
}

function RoomCard({
  room,
  onJoin,
  currentUserId,
  onDelete,
}: {
  room: {
    id: string;
    name: string;
    description?: string;
    is_private: boolean;
    participant_count?: number;
    max_participants: number;
    host?: {
      id: string;
      display_name: string;
      avatar_url?: string;
    };
  };
  onJoin: (id: string) => void;
  currentUserId: string;
  onDelete: (id: string) => void;
}) {
  const isFull = (room.participant_count || 0) >= room.max_participants;
  const isHost = room.host?.id === currentUserId;

  return (
    <Card className="p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{room.name}</h4>
            {room.is_private ? (
              <Lock className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Globe className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          {room.description && (
            <p className="text-sm text-muted-foreground truncate mb-3">
              {room.description}
            </p>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                  {room.host?.display_name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {room.host?.display_name}
              </span>
            </div>

            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {room.participant_count || 0}/{room.max_participants}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {isHost && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(room.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onJoin(room.id)}
            disabled={isFull}
          >
            {isFull ? "Full" : "Join"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CreateRoomDialog({
  userId,
  onCreate,
}: {
  userId: string;
  onCreate: (room: { id: string }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [open, setOpen] = useState(false);
  const { createRoom } = useFocusRooms();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const room = await createRoom(name.trim(), userId, {
      description: description.trim() || undefined,
      isPrivate,
    });

    setOpen(false);
    onCreate(room);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Focus Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Room Name</label>
            <Input
              placeholder="e.g., Study Session"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description (optional)</label>
            <Input
              placeholder="What are you focusing on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="private" className="text-sm">
              Private room
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={!name.trim()}>
            Create Room
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FocusRooms({ userId }: FocusRoomsProps) {
  const router = useRouter();
  const { rooms, loading, deleteRoom } = useFocusRooms();

  const handleJoin = (roomId: string) => {
    router.push(`/focus-room/${roomId}`);
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await deleteRoom(roomId, userId);
      toast.success("Room deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete room");
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Focus Rooms</h3>
          <p className="text-sm text-muted-foreground">
            Study together virtually
          </p>
        </div>
        <CreateRoomDialog userId={userId} onCreate={(room) => handleJoin(room.id)} />
      </div>

      <div className="space-y-3">
        {rooms.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No active focus rooms. Create one to get started!
            </p>
          </div>
        ) : (
          rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={handleJoin}
              currentUserId={userId}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </Card>
  );
}
