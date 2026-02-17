"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriends, useFriendSearch } from "@/hooks/use-social";
import { UserPlus, Search, Check, X, UserMinus, Clock } from "lucide-react";
import type { Friendship } from "@/types/social";

interface FriendsListProps {
  userId: string;
}

function FriendCard({
  friendship,
  currentUserId,
  onRemove,
}: {
  friendship: Friendship;
  currentUserId: string;
  onRemove: (id: string) => void;
}) {
  const isRequester = friendship.requester_id === currentUserId;
  const friend = isRequester ? friendship.addressee : friendship.requester;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
            {friend?.display_name?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{friend?.display_name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground">Friend</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(friendship.id)}
        className="text-muted-foreground hover:text-destructive"
      >
        <UserMinus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function PendingRequestCard({
  request,
  onAccept,
  onDecline,
}: {
  request: Friendship;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-sm">
            {request.requester?.display_name?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{request.requester?.display_name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Wants to be friends
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAccept(request.id)}
          className="h-8 w-8 p-0"
        >
          <Check className="h-4 w-4 text-green-500" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDecline(request.id)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function SearchResults({
  userId,
}: {
  userId: string;
}) {
  const [query, setQuery] = useState("");
  const { results, loading, search, sendRequest } = useFriendSearch(userId);

  const handleSearch = (value: string) => {
    setQuery(value);
    search(value);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by username..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {query.length >= 2 && (
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-4">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No users found
            </p>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm">
                      {user.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm">{user.display_name}</p>
                </div>
                {user.friendship_status === "pending" ? (
                  <span className="text-xs text-muted-foreground">
                    {user.is_requester ? "Request sent" : "Pending"}
                  </span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => sendRequest(user.id)}
                    className="h-8"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function FriendsList({ userId }: FriendsListProps) {
  const { friends, pendingRequests, loading, acceptRequest, declineRequest, removeFriend } =
    useFriends(userId);

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
      <Tabs defaultValue="friends">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="friends">
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="add">
            Add Friend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Pending Requests ({pendingRequests.length})
              </h4>
              {pendingRequests.map((request) => (
                <PendingRequestCard
                  key={request.id}
                  request={request}
                  onAccept={acceptRequest}
                  onDecline={declineRequest}
                />
              ))}
            </div>
          )}

          {/* Friends List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Your Friends
            </h4>
            {friends.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No friends yet. Add some friends to compare progress!
              </p>
            ) : (
              friends.map((friendship) => (
                <FriendCard
                  key={friendship.id}
                  friendship={friendship}
                  currentUserId={userId}
                  onRemove={removeFriend}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="add">
          <SearchResults userId={userId} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
