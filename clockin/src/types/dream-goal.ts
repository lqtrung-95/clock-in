export type DreamGoalTheme = 'mountain' | 'castle' | 'tree' | 'space';

export interface DreamGoal {
  id: string;
  user_id: string;
  theme: DreamGoalTheme;
  title: string;
  description: string | null;
  target_hours: number;
  current_hours: number;
  milestone_reached: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DreamGoalProgress {
  percentage: number;
  currentMilestone: number;
  hoursToNextMilestone: number;
  nextMilestonePercentage: number;
}

export interface DreamGoalProgressHistory {
  id: string;
  dream_goal_id: string;
  session_id: string | null;
  hours_added: number;
  previous_hours: number;
  new_hours: number;
  milestone_reached: number | null;
  created_at: string;
}

export const MILESTONE_THRESHOLDS = [0, 10, 25, 50, 75, 100];

export const THEME_CONFIG: Record<DreamGoalTheme, {
  name: string;
  description: string;
  color: string;
  icon: string;
}> = {
  mountain: {
    name: 'Mountain Climb',
    description: 'Ascend from base camp to the summit',
    color: 'emerald',
    icon: 'Mountain',
  },
  castle: {
    name: 'Castle Builder',
    description: 'Build your kingdom piece by piece',
    color: 'amber',
    icon: 'Castle',
  },
  tree: {
    name: 'Magical Tree',
    description: 'Grow from seed to cosmic tree',
    color: 'green',
    icon: 'TreePine',
  },
  space: {
    name: 'Space Journey',
    description: 'Travel from Earth to distant galaxies',
    color: 'purple',
    icon: 'Rocket',
  },
};
