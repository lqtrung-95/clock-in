export interface PresetCategory {
  name: string;
  color: string;
  icon: string;
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  { name: "Work", color: "#3b82f6", icon: "briefcase" },
  { name: "Study", color: "#8b5cf6", icon: "book-open" },
  { name: "Exercise", color: "#10b981", icon: "dumbbell" },
  { name: "Reading", color: "#f59e0b", icon: "book" },
  { name: "Side Project", color: "#ec4899", icon: "code" },
  { name: "Creative", color: "#06b6d4", icon: "palette" },
  { name: "Meditation", color: "#6366f1", icon: "brain" },
  { name: "Language", color: "#ef4444", icon: "languages" },
];
