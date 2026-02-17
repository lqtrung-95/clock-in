import type { CrystalConfig, ColorConfig, ThemeConfig } from '@/types/xp-system';

export const CRYSTAL_SHAPES: CrystalConfig[] = [
  { shape: 'icosahedron', minLevel: 1, geometry: 'icosahedron', displayName: 'Crystal Seed' },
  { shape: 'dodecahedron', minLevel: 5, geometry: 'dodecahedron', displayName: 'Crystal Sprout' },
  { shape: 'octahedron', minLevel: 10, geometry: 'octahedron', displayName: 'Crystal Bloom' },
  { shape: 'tetrahedron', minLevel: 25, geometry: 'tetrahedron', displayName: 'Crystal Radiance' },
  { shape: 'torus_knot', minLevel: 50, geometry: 'torusKnot', displayName: 'Crystal Infinity' },
];

export const CRYSTAL_COLORS: ColorConfig[] = [
  { color: 'blue', hex: '#3B82F6', displayName: 'Sapphire', unlockedAtLevel: 1 },
  { color: 'purple', hex: '#8B5CF6', displayName: 'Amethyst', unlockedAtLevel: 3 },
  { color: 'emerald', hex: '#10B981', displayName: 'Emerald', unlockedAtLevel: 5 },
  { color: 'amber', hex: '#F59E0B', displayName: 'Amber', unlockedAtLevel: 8 },
  { color: 'rose', hex: '#F43F5E', displayName: 'Rose Quartz', unlockedAtLevel: 12 },
  { color: 'cyan', hex: '#06B6D4', displayName: 'Aquamarine', unlockedAtLevel: 15 },
  { color: 'gold', hex: '#F59E0B', displayName: 'Golden Topaz', unlockedAtLevel: 20 },
  { color: 'obsidian', hex: '#1F2937', displayName: 'Obsidian', unlockedAtLevel: 30 },
];

export const CRYSTAL_THEMES: ThemeConfig[] = [
  { theme: 'default', displayName: 'Classic', particleColor: '#3B82F6', glowIntensity: 0.5 },
  { theme: 'ethereal', displayName: 'Ethereal', particleColor: '#E0E7FF', glowIntensity: 0.8 },
  { theme: 'fiery', displayName: 'Inferno', particleColor: '#EF4444', glowIntensity: 0.7 },
  { theme: 'ocean', displayName: 'Ocean', particleColor: '#06B6D4', glowIntensity: 0.6 },
  { theme: 'cosmic', displayName: 'Cosmic', particleColor: '#A855F7', glowIntensity: 0.9 },
  { theme: 'forest', displayName: 'Forest', particleColor: '#10B981', glowIntensity: 0.6 },
];

export function getShapeForLevel(level: number): string {
  const shape = [...CRYSTAL_SHAPES].reverse().find(s => level >= s.minLevel);
  return shape?.geometry || 'icosahedron';
}

export function getUnlockedColors(level: number): ColorConfig[] {
  return CRYSTAL_COLORS.filter(c => (c.unlockedAtLevel || 1) <= level);
}

export function getColorHex(color: string): string {
  return CRYSTAL_COLORS.find(c => c.color === color)?.hex || '#3B82F6';
}

export function getUnlockedShapes(level: number): CrystalConfig[] {
  return CRYSTAL_SHAPES.filter(s => level >= s.minLevel);
}

export function getUnlockedThemes(level: number): ThemeConfig[] {
  // Themes unlock at levels: 1, 5, 10, 15, 20, 25
  const themeLevels = [1, 5, 10, 15, 20, 25];
  return CRYSTAL_THEMES.filter((_, index) => level >= (themeLevels[index] || 1));
}
