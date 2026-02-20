// Social Features Types

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
  // Joined fields
  requester?: UserProfile;
  addressee?: UserProfile;
}

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  email?: string;
}

export interface FocusRoom {
  id: string;
  name: string;
  description?: string;
  host_id: string;
  is_private: boolean;
  access_code?: string;
  max_participants: number;
  is_active: boolean;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
  // Session fields
  session_duration?: number;
  session_started_at?: string;
  session_state?: 'idle' | 'active' | 'paused' | 'completed';
  // Joined fields
  host?: UserProfile;
  participants?: FocusRoomParticipant[];
  participant_count?: number;
}

export interface FocusRoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  is_focused: boolean;
  focus_started_at?: string;
  total_focus_seconds: number;
  // Joined fields
  user?: UserProfile;
}

export interface FocusRoomMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  message_type: 'chat' | 'encouragement' | 'milestone' | 'system';
  created_at: string;
  // Joined fields
  user?: UserProfile;
}

export interface LeaderboardEntry {
  friend_id: string;
  display_name: string;
  avatar_url?: string;
  total_seconds: number;
  session_count: number;
  rank: number;
  is_current_user?: boolean;
}

export interface SharedAchievement {
  id: string;
  user_id: string;
  badge_id: string;
  share_message?: string;
  share_image_url?: string;
  platform?: string;
  share_count: number;
  created_at: string;
  // Joined fields
  user?: UserProfile;
  badge?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: string;
  };
}

export interface ProgressShareCard {
  id: string;
  user_id: string;
  card_type: 'daily' | 'weekly' | 'monthly' | 'streak' | 'achievement';
  title: string;
  subtitle?: string;
  stats: {
    total_hours?: number;
    session_count?: number;
    streak_days?: number;
    focus_score?: number;
    [key: string]: unknown;
  };
  image_url?: string;
  share_count: number;
  created_at: string;
}

export interface FriendSearchResult {
  id: string;
  display_name: string;
  avatar_url?: string;
  friendship_status?: 'pending' | 'accepted' | 'none';
  is_requester?: boolean;
}

// Focus Room Session Types
export interface FocusRoomSession {
  id: string;
  room_id: string;
  host_id: string;
  duration: number;
  started_at: string;
  completed_at?: string;
  participant_count: number;
  completed_count: number;
  created_at: string;
}

export interface FocusRoomSessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  joined_at: string;
  completed_at?: string;
  focus_seconds: number;
}
