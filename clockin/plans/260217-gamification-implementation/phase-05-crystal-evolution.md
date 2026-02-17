---
title: "Phase 5: Crystal Evolution & Customization"
description: "Implement crystal shape evolution, color unlocks, theme selection, and customization UI"
status: pending
priority: P1
effort: 6h
dependencies: [phase-01-database-schema, phase-02-xp-level-system]
---

# Phase 5: Crystal Evolution & Customization

## Overview
Implement the crystal evolution system where the 3D crystal changes shape based on user level, with unlockable colors and themes that users can customize.

## Key Insights
- Crystal shapes unlock at specific levels: 1, 5, 10, 25, 50
- Colors unlock progressively as user levels up
- Themes affect particle effects and glow intensity
- Customizations persist per user and sync across devices

## Requirements

### Functional Requirements
1. Crystal shape evolves at level milestones
2. Colors unlock as user progresses
3. Themes available for visual customization
4. User can select active shape, color, and theme
5. Preview customizations in real-time
6. Unlock notifications for new customizations

### Non-Functional Requirements
1. 3D crystal must perform well on mobile
2. Customizations load instantly from cache
3. Smooth transitions between crystal states
4. Fallback for WebGL unsupported browsers

## Architecture

### Crystal Evolution Stages

| Level | Shape | Display Name | Geometry |
|-------|-------|--------------|----------|
| 1 | icosahedron | Crystal Seed | icosahedron |
| 5 | dodecahedron | Crystal Sprout | dodecahedron |
| 10 | octahedron | Crystal Bloom | octahedron |
| 25 | tetrahedron | Crystal Radiance | tetrahedron |
| 50 | torus_knot | Crystal Infinity | torusKnot |

### Color Unlock Progression

| Level | Color | Display Name |
|-------|-------|--------------|
| 1 | blue | Sapphire |
| 3 | purple | Amethyst |
| 5 | emerald | Emerald |
| 8 | amber | Amber |
| 12 | rose | Rose Quartz |
| 15 | cyan | Aquamarine |
| 20 | gold | Golden Topaz |
| 30 | obsidian | Obsidian |

## Related Code Files

### Files to Create
1. `src/services/crystal-service.ts`
2. `src/stores/crystal-store.ts`
3. `src/components/gamification/crystal-evolution-viewer.tsx`
4. `src/components/gamification/crystal-customization-panel.tsx`
5. `src/components/focus/dream-crystal-evolved.tsx`
6. `src/hooks/use-crystal-config.ts`

### Files to Modify
1. `src/components/focus/dream-crystal.tsx` - integrate evolution
2. `src/components/focus/dream-crystal-mini.tsx` - support customization

## Implementation Steps

### Step 1: Create Crystal Service

**File:** `src/services/crystal-service.ts`

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  CrystalCustomizations,
  CrystalShape,
  CrystalColor,
  CrystalTheme,
} from "@/types/xp-system";
import {
  CRYSTAL_SHAPES,
  CRYSTAL_COLORS,
  CRYSTAL_THEMES,
  getShapeForLevel,
  getUnlockedColors,
} from "@/data/crystal-configs";

export const crystalService = {
  async getCustomizations(userId: string): Promise<CrystalCustomizations | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("crystal_customizations")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async initializeCustomizations(userId: string): Promise<CrystalCustomizations> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("crystal_customizations")
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCustomizations(
    userId: string,
    updates: Partial<CrystalCustomizations>
  ): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("crystal_customizations")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) throw error;
  },

  async checkAndUnlockForLevel(
    userId: string,
    level: number
  ): Promise<{
    newShapes: CrystalShape[];
    newColors: CrystalColor[];
    newThemes: CrystalTheme[];
  }> {
    const supabase = createClient();
    const customizations = await this.getCustomizations(userId);

    if (!customizations) {
      await this.initializeCustomizations(userId);
      return this.checkAndUnlockForLevel(userId, level);
    }

    const newShapes: CrystalShape[] = [];
    const newColors: CrystalColor[] = [];
    const newThemes: CrystalTheme[] = [];

    // Check for new shapes
    CRYSTAL_SHAPES.forEach((shape) => {
      if (
        level >= shape.minLevel &&
        !customizations.unlocked_shapes.includes(shape.shape)
      ) {
        newShapes.push(shape.shape);
      }
    });

    // Check for new colors
    CRYSTAL_COLORS.forEach((color) => {
      const unlockLevel = color.unlockedAtLevel || 1;
      if (
        level >= unlockLevel &&
        !customizations.unlocked_colors.includes(color.color)
      ) {
        newColors.push(color.color);
      }
    });

    // Check for new themes (unlock at levels 1, 5, 10, 20, 30, 40)
    const themeUnlockLevels = [1, 5, 10, 20, 30, 40];
    CRYSTAL_THEMES.forEach((theme, index) => {
      const unlockLevel = themeUnlockLevels[index] || 999;
      if (
        level >= unlockLevel &&
        !customizations.unlocked_themes.includes(theme.theme)
      ) {
        newThemes.push(theme.theme);
      }
    });

    // Update database if there are new unlocks
    if (newShapes.length > 0 || newColors.length > 0 || newThemes.length > 0) {
      const updates: Partial<CrystalCustomizations> = {};

      if (newShapes.length > 0) {
        updates.unlocked_shapes = [
          ...customizations.unlocked_shapes,
          ...newShapes,
        ];
        // Auto-switch to newest shape
        updates.active_shape = newShapes[newShapes.length - 1];
      }

      if (newColors.length > 0) {
        updates.unlocked_colors = [
          ...customizations.unlocked_colors,
          ...newColors,
        ];
      }

      if (newThemes.length > 0) {
        updates.unlocked_themes = [
          ...customizations.unlocked_themes,
          ...newThemes,
        ];
      }

      await this.updateCustomizations(userId, updates);
    }

    return { newShapes, newColors, newThemes };
  },

  getShapeGeometry(shape: CrystalShape): string {
    const config = CRYSTAL_SHAPES.find((s) => s.shape === shape);
    return config?.geometry || "icosahedron";
  },

  getColorHex(color: CrystalColor): string {
    const config = CRYSTAL_COLORS.find((c) => c.color === color);
    return config?.hex || "#3B82F6";
  },

  getThemeConfig(theme: CrystalTheme) {
    return (
      CRYSTAL_THEMES.find((t) => t.theme === theme) || CRYSTAL_THEMES[0]
    );
  },
};
```

### Step 2: Create Crystal Store

**File:** `src/stores/crystal-store.ts`

```typescript
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CrystalCustomizations,
  CrystalShape,
  CrystalColor,
  CrystalTheme,
} from "@/types/xp-system";
import { crystalService } from "@/services/crystal-service";

interface CrystalState {
  customizations: CrystalCustomizations | null;
  isLoading: boolean;

  // Actions
  loadCustomizations: (userId: string) => Promise<void>;
  setActiveShape: (userId: string, shape: CrystalShape) => Promise<void>;
  setActiveColor: (userId: string, color: CrystalColor) => Promise<void>;
  setActiveTheme: (userId: string, theme: CrystalTheme) => Promise<void>;
  checkUnlocks: (userId: string, level: number) => Promise<{
    newShapes: CrystalShape[];
    newColors: CrystalColor[];
    newThemes: CrystalTheme[];
  }>;
}

export const useCrystalStore = create<CrystalState>()(
  persist(
    (set, get) => ({
      customizations: null,
      isLoading: false,

      loadCustomizations: async (userId: string) => {
        set({ isLoading: true });
        try {
          let customizations = await crystalService.getCustomizations(userId);

          if (!customizations) {
            customizations = await crystalService.initializeCustomizations(userId);
          }

          set({ customizations, isLoading: false });
        } catch (error) {
          console.error("Failed to load crystal customizations:", error);
          set({ isLoading: false });
        }
      },

      setActiveShape: async (userId: string, shape: CrystalShape) => {
        const { customizations } = get();
        if (!customizations) return;

        // Optimistic update
        set({
          customizations: { ...customizations, active_shape: shape },
        });

        try {
          await crystalService.updateCustomizations(userId, {
            active_shape: shape,
          });
        } catch (error) {
          // Revert on error
          set({ customizations });
          throw error;
        }
      },

      setActiveColor: async (userId: string, color: CrystalColor) => {
        const { customizations } = get();
        if (!customizations) return;

        set({
          customizations: { ...customizations, active_color: color },
        });

        try {
          await crystalService.updateCustomizations(userId, {
            active_color: color,
          });
        } catch (error) {
          set({ customizations });
          throw error;
        }
      },

      setActiveTheme: async (userId: string, theme: CrystalTheme) => {
        const { customizations } = get();
        if (!customizations) return;

        set({
          customizations: { ...customizations, active_theme: theme },
        });

        try {
          await crystalService.updateCustomizations(userId, {
            active_theme: theme,
          });
        } catch (error) {
          set({ customizations });
          throw error;
        }
      },

      checkUnlocks: async (userId: string, level: number) => {
        const unlocks = await crystalService.checkAndUnlockForLevel(userId, level);

        // Refresh customizations after unlock
        await get().loadCustomizations(userId);

        return unlocks;
      },
    }),
    {
      name: "clockin-crystal",
      partialize: (state) => ({
        customizations: state.customizations,
      }),
    }
  )
);
```

### Step 3: Create Crystal Config Hook

**File:** `src/hooks/use-crystal-config.ts`

```typescript
"use client";

import { useEffect, useCallback } from "react";
import { useCrystalStore } from "@/stores/crystal-store";
import type { CrystalShape, CrystalColor, CrystalTheme } from "@/types/xp-system";
import { toast } from "sonner";

export function useCrystalConfig(userId: string, currentLevel: number) {
  const {
    customizations,
    isLoading,
    loadCustomizations,
    setActiveShape,
    setActiveColor,
    setActiveTheme,
    checkUnlocks,
  } = useCrystalStore();

  // Load on mount
  useEffect(() => {
    if (userId) {
      loadCustomizations(userId);
    }
  }, [userId, loadCustomizations]);

  // Check for unlocks when level changes
  useEffect(() => {
    async function checkForUnlocks() {
      if (!userId || !currentLevel) return;

      const unlocks = await checkUnlocks(userId, currentLevel);

      // Show notifications for new unlocks
      if (unlocks.newShapes.length > 0) {
        unlocks.newShapes.forEach((shape, index) => {
          setTimeout(() => {
            toast.success("New Crystal Shape Unlocked!", {
              description: `You've unlocked the ${shape} crystal form!`,
              duration: 5000,
            });
          }, index * 300);
        });
      }

      if (unlocks.newColors.length > 0) {
        unlocks.newColors.forEach((color, index) => {
          setTimeout(() => {
            toast.success("New Color Unlocked!", {
              description: `The ${color} hue is now available!`,
              duration: 4000,
            });
          }, index * 200);
        });
      }
    }

    checkForUnlocks();
  }, [userId, currentLevel, checkUnlocks]);

  const changeShape = useCallback(
    async (shape: CrystalShape) => {
      if (!customizations?.unlocked_shapes.includes(shape)) {
        toast.error("This shape is locked");
        return;
      }
      await setActiveShape(userId, shape);
    },
    [userId, customizations, setActiveShape]
  );

  const changeColor = useCallback(
    async (color: CrystalColor) => {
      if (!customizations?.unlocked_colors.includes(color)) {
        toast.error("This color is locked");
        return;
      }
      await setActiveColor(userId, color);
    },
    [userId, customizations, setActiveColor]
  );

  const changeTheme = useCallback(
    async (theme: CrystalTheme) => {
      if (!customizations?.unlocked_themes.includes(theme)) {
        toast.error("This theme is locked");
        return;
      }
      await setActiveTheme(userId, theme);
    },
    [userId, customizations, setActiveTheme]
  );

  return {
    customizations,
    isLoading,
    changeShape,
    changeColor,
    changeTheme,
  };
}
```

### Step 4: Create Crystal Customization Panel

**File:** `src/components/gamification/crystal-customization-panel.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";
import type { CrystalCustomizations } from "@/types/xp-system";
import { CRYSTAL_SHAPES, CRYSTAL_COLORS, CRYSTAL_THEMES } from "@/data/crystal-configs";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Sparkles, Palette, Shapes, Sparkle } from "lucide-react";

interface CrystalCustomizationPanelProps {
  customizations: CrystalCustomizations | null;
  currentLevel: number;
  onShapeChange: (shape: string) => void;
  onColorChange: (color: string) => void;
  onThemeChange: (theme: string) => void;
  className?: string;
}

export function CrystalCustomizationPanel({
  customizations,
  currentLevel,
  onShapeChange,
  onColorChange,
  onThemeChange,
  className,
}: CrystalCustomizationPanelProps) {
  if (!customizations) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-muted rounded" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Crystal Customization</h2>
          <p className="text-sm text-muted-foreground">
            Personalize your focus crystal
          </p>
        </div>
      </div>

      <Tabs defaultValue="shapes">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shapes">
            <Shapes className="h-4 w-4 mr-2" />
            Shapes
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="themes">
            <Sparkle className="h-4 w-4 mr-2" />
            Themes
          </TabsTrigger>
        </TabsList>

        {/* Shapes Tab */}
        <TabsContent value="shapes" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CRYSTAL_SHAPES.map((shape) => {
              const isUnlocked = customizations.unlocked_shapes.includes(shape.shape);
              const isActive = customizations.active_shape === shape.shape;

              return (
                <button
                  key={shape.shape}
                  onClick={() => isUnlocked && onShapeChange(shape.shape)}
                  disabled={!isUnlocked}
                  className={cn(
                    "relative p-4 rounded-xl border-2 text-left transition-all",
                    isActive
                      ? "border-blue-500 bg-blue-500/10"
                      : isUnlocked
                      ? "border-border hover:border-foreground/30 bg-card"
                      : "border-dashed border-muted-foreground/20 bg-muted/50 cursor-not-allowed"
                  )}
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                      <div className="text-center">
                        <Lock className="h-5 w-5 mx-auto text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1 block">
                          Level {shape.minLevel}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="font-medium text-sm">{shape.displayName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {shape.shape.replace("_", " ")}
                  </div>
                </button>
              );
            })}
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="mt-4">
          <div className="grid grid-cols-4 gap-3">
            {CRYSTAL_COLORS.map((color) => {
              const isUnlocked = customizations.unlocked_colors.includes(color.color);
              const isActive = customizations.active_color === color.color;

              return (
                <button
                  key={color.color}
                  onClick={() => isUnlocked && onColorChange(color.color)}
                  disabled={!isUnlocked}
                  className={cn(
                    "relative aspect-square rounded-xl border-2 transition-all",
                    isActive
                      ? "border-foreground scale-105"
                      : isUnlocked
                      ? "border-transparent hover:scale-105"
                      : "border-dashed border-muted-foreground/20 cursor-not-allowed grayscale"
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                      <Lock className="h-4 w-4 text-foreground" />
                    </div>
                  )}

                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}

                  <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-white bg-black/50 rounded px-1 truncate">
                    {color.displayName}
                  </span>
                </button>
              );
            })}
          </div>
        </TabsContent>

        {/* Themes Tab */}
        <TabsContent value="themes" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CRYSTAL_THEMES.map((theme, index) => {
              const isUnlocked = customizations.unlocked_themes.includes(theme.theme);
              const isActive = customizations.active_theme === theme.theme;
              const unlockLevels = [1, 5, 10, 20, 30, 40];
              const requiredLevel = unlockLevels[index] || 999;

              return (
                <button
                  key={theme.theme}
                  onClick={() => isUnlocked && onThemeChange(theme.theme)}
                  disabled={!isUnlocked}
                  className={cn(
                    "relative p-4 rounded-xl border-2 text-left transition-all",
                    isActive
                      ? "border-purple-500 bg-purple-500/10"
                      : isUnlocked
                      ? "border-border hover:border-foreground/30 bg-card"
                      : "border-dashed border-muted-foreground/20 bg-muted/50 cursor-not-allowed"
                  )}
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                      <div className="text-center">
                        <Lock className="h-5 w-5 mx-auto text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1 block">
                          Level {requiredLevel}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="font-medium text-sm">{theme.displayName}</div>
                  <div
                    className="w-full h-2 rounded-full mt-2"
                    style={{ backgroundColor: theme.particleColor }}
                  />
                </button>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
```

### Step 5: Create Evolved Dream Crystal Component

**File:** `src/components/focus/dream-crystal-evolved.tsx`

```typescript
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import type { CrystalShape, CrystalColor, CrystalTheme } from "@/types/xp-system";
import { crystalService } from "@/services/crystal-service";

interface EvolvedCrystalProps {
  progress: number;
  phase: "idle" | "work" | "break";
  cycle: number;
  totalCycles: number;
  isComplete?: boolean;
  shape?: CrystalShape;
  color?: CrystalColor;
  theme?: CrystalTheme;
}

function getGeometry(shape: CrystalShape): THREE.BufferGeometry {
  switch (shape) {
    case "dodecahedron":
      return new THREE.DodecahedronGeometry(1, 0);
    case "octahedron":
      return new THREE.OctahedronGeometry(1, 0);
    case "tetrahedron":
      return new THREE.TetrahedronGeometry(1, 0);
    case "torus_knot":
      return new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16);
    case "icosahedron":
    default:
      return new THREE.IcosahedronGeometry(1, 1);
  }
}

function CrystalCore({
  progress,
  phase,
  cycle,
  totalCycles,
  isComplete,
  shape = "icosahedron",
  color = "blue",
  theme = "default",
}: EvolvedCrystalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const fillLevel = progress / 100;
  const colorHex = crystalService.getColorHex(color);
  const themeConfig = crystalService.getThemeConfig(theme);

  const baseColor = useMemo(() => new THREE.Color(colorHex), [colorHex]);

  const geometry = useMemo(() => getGeometry(shape), [shape]);

  useFrame((state) => {
    if (!meshRef.current || !innerRef.current || !glowRef.current) return;

    const time = state.clock.elapsedTime;

    // Rotation based on shape
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.05;

    // Scale pulse
    const baseScale = 1 + fillLevel * 0.3;
    const pulse = 1 + Math.sin(time * 2) * 0.02 * (fillLevel + 0.5);
    const scale = baseScale * pulse;

    meshRef.current.scale.setScalar(scale);
    innerRef.current.scale.setScalar(scale * 0.85);

    // Glow intensity based on theme
    const glowScale = scale * (1.2 + fillLevel * 0.5 * themeConfig.glowIntensity);
    glowRef.current.scale.setScalar(glowScale);

    // Update material
    if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      meshRef.current.material.emissive = baseColor;
      meshRef.current.material.emissiveIntensity =
        0.3 + fillLevel * 0.7 * themeConfig.glowIntensity;
      meshRef.current.material.color = baseColor;
    }

    if (innerRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      innerRef.current.material.color = baseColor;
      innerRef.current.material.emissive = baseColor;
      innerRef.current.material.emissiveIntensity =
        0.5 + fillLevel * 0.5 * themeConfig.glowIntensity;
    }
  });

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.1 + fillLevel * 0.15 * themeConfig.glowIntensity}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main crystal */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh ref={meshRef} castShadow receiveShadow geometry={geometry}>
          <meshPhysicalMaterial
            color={baseColor}
            metalness={0.1}
            roughness={0.1}
            transmission={0.6}
            thickness={1}
            ior={1.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={baseColor}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Inner core */}
        <mesh ref={innerRef}>
          <octahedronGeometry args={[0.6, 0]} />
          <meshPhysicalMaterial
            color={baseColor}
            metalness={0.3}
            roughness={0.2}
            emissive={baseColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      {/* Orbiting particles */}
      {Array.from({ length: totalCycles }).map((_, i) => {
        const angle = (i / totalCycles) * Math.PI * 2;
        const radius = 2.2;
        const completed = i < cycle;

        return (
          <group key={i} rotation={[0, angle + Date.now() * 0.0001, 0]}>
            <mesh position={[radius, 0, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshPhysicalMaterial
                color={completed ? themeConfig.particleColor : "#64748B"}
                emissive={completed ? themeConfig.particleColor : "#000000"}
                emissiveIntensity={completed ? 0.8 : 0}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* Sparkles based on theme */}
      <Sparkles
        count={20 + Math.floor(fillLevel * 30)}
        scale={4 + fillLevel * 2}
        size={2 + fillLevel * 3}
        speed={0.3 + fillLevel * 0.5}
        color={themeConfig.particleColor}
      />
    </group>
  );
}

interface DreamCrystalEvolvedProps {
  progress: number;
  phase: "idle" | "work" | "break";
  cycle: number;
  totalCycles: number;
  isComplete?: boolean;
  shape?: CrystalShape;
  color?: CrystalColor;
  theme?: CrystalTheme;
  className?: string;
}

export function DreamCrystalEvolved({
  progress,
  phase,
  cycle,
  totalCycles,
  isComplete,
  shape,
  color,
  theme,
  className,
}: DreamCrystalEvolvedProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color={crystalService.getColorHex(color || "blue")} />
        <CrystalCore
          progress={progress}
          phase={phase}
          cycle={cycle}
          totalCycles={totalCycles}
          isComplete={isComplete}
          shape={shape}
          color={color}
          theme={theme}
        />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
```

## Todo List

- [ ] Create crystal-service.ts with customization logic
- [ ] Create crystal-store.ts for state management
- [ ] Create use-crystal-config.ts hook
- [ ] Create CrystalCustomizationPanel component
- [ ] Create DreamCrystalEvolved component with shape support
- [ ] Integrate crystal evolution with level progression
- [ ] Add unlock notifications for shapes/colors/themes
- [ ] Test all 5 crystal shapes render correctly
- [ ] Verify color and theme changes apply immediately

## Success Criteria

1. Crystal shape changes based on user level
2. Colors unlock at correct level thresholds
3. Customizations persist across sessions
4. Preview updates in real-time
5. Unlock notifications appear when leveling up
6. All 5 crystal shapes render correctly in 3D
7. Theme affects particle and glow effects

## Next Steps

After completing this phase:
1. Proceed to Phase 6: Calendar Heatmap & AI Insights
2. Integrate crystal into dashboard stats
3. Add crystal to user profile display

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| 3D performance on mobile | Medium | Reduce particle count, use simpler geometry |
| WebGL not supported | Low | Fallback to 2D crystal representation |
| Customization sync issues | Low | Optimistic UI with rollback on error |
