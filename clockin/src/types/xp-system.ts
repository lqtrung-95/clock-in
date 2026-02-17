export interface UserStats {
  user_id: string;
  total_xp: number;
  current_level: number;
  total_focus_minutes: number;
  weekly_focus_minutes: number;
  monthly_focus_minutes: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  xpProgress: number;
  progressPercentage: number;
}

export type CrystalShape = 'icosahedron' | 'dodecahedron' | 'octahedron' | 'tetrahedron' | 'torus_knot';
export type CrystalColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'gold' | 'obsidian';
export type CrystalTheme = 'default' | 'ethereal' | 'fiery' | 'ocean' | 'cosmic' | 'forest';

export interface CrystalCustomizations {
  user_id: string;
  unlocked_shapes: CrystalShape[];
  unlocked_colors: CrystalColor[];
  unlocked_themes: CrystalTheme[];
  active_shape: CrystalShape;
  active_color: CrystalColor;
  active_theme: CrystalTheme;
  created_at: string;
  updated_at: string;
}

export interface CrystalConfig {
  shape: CrystalShape;
  minLevel: number;
  geometry: string;
  displayName: string;
}

export interface ColorConfig {
  color: CrystalColor;
  hex: string;
  displayName: string;
  unlockedAtLevel?: number;
}

export interface ThemeConfig {
  theme: CrystalTheme;
  displayName: string;
  particleColor: string;
  glowIntensity: number;
}
