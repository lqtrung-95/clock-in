export interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category_id: string | null;
  target_minutes: number;
  period: "daily" | "weekly" | "monthly";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  user_id: string;
  challenge_key: string;
  target_minutes: number;
  progress_minutes: number;
  period_start: string;
  period_end: string;
  status: "active" | "completed" | "expired";
  created_at: string;
}
