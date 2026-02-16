import type { Badge } from "@/types/gamification";

export const BADGE_DEFINITIONS: Badge[] = [
  { key: "first_entry", name: "First Step", description: "Log your first time entry", icon: "rocket", condition: "total_entries >= 1" },
  { key: "streak_3", name: "On a Roll", description: "3-day streak", icon: "flame", condition: "current_streak >= 3" },
  { key: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "zap", condition: "current_streak >= 7" },
  { key: "streak_30", name: "Monthly Master", description: "30-day streak", icon: "trophy", condition: "current_streak >= 30" },
  { key: "hours_10", name: "Getting Started", description: "10 total hours logged", icon: "clock", condition: "total_hours >= 10" },
  { key: "hours_100", name: "Centurion", description: "100 total hours logged", icon: "medal", condition: "total_hours >= 100" },
  { key: "hours_500", name: "Dedication", description: "500 total hours logged", icon: "award", condition: "total_hours >= 500" },
  { key: "pomodoro_10", name: "Focus Finder", description: "Complete 10 Pomodoro sessions", icon: "target", condition: "pomodoro_count >= 10" },
  { key: "pomodoro_50", name: "Deep Worker", description: "Complete 50 Pomodoro sessions", icon: "brain", condition: "pomodoro_count >= 50" },
  { key: "categories_3", name: "Diversified", description: "Log time in 3 different categories", icon: "layout-grid", condition: "unique_categories >= 3" },
  { key: "early_bird", name: "Early Bird", description: "Start a session before 7 AM", icon: "sunrise", condition: "session_started_before_7am" },
  { key: "night_owl", name: "Night Owl", description: "Log time after 11 PM", icon: "moon", condition: "session_after_11pm" },
];
