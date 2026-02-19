"use client";

import { Suspense, useMemo, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { DreamGoalTheme } from "@/types/dream-goal";
import { MountainClimbScene } from "./themes/mountain-climb-scene";
import { CastleBuilderScene } from "./themes/castle-builder-scene";
import { MagicalTreeScene } from "./themes/magical-tree-scene";
import { SpaceJourneyScene } from "./themes/space-journey-scene";
import { CameraController } from "./shared/camera-controller";
import { LightingSetup } from "./shared/lighting-setup";

interface DreamGoalCanvasProps {
  theme?: DreamGoalTheme;
  progress: number;
  isActive?: boolean;
}

// Per-theme bloom intensity — space is most dramatic, mountain subtlest
const BLOOM_INTENSITY: Record<DreamGoalTheme, number> = {
  space: 2.2,
  tree: 1.4,
  castle: 1.1,
  mountain: 0.8,
};

const THEME_ATMOSPHERE: Record<
  DreamGoalTheme,
  { bg: string; env: "dawn" | "sunset" | "forest" | "park" | null; fogColor: string | null; fogNear: number; fogFar: number }
> = {
  mountain: { bg: "from-sky-300 via-sky-200 to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950", env: "dawn",   fogColor: "#b8d4ec", fogNear: 45, fogFar: 130 },
  castle:   { bg: "from-amber-100 via-yellow-50 to-lime-50 dark:from-amber-950 dark:via-stone-900 dark:to-slate-900",  env: "sunset", fogColor: "#d4b896", fogNear: 55, fogFar: 200 },
  tree:     { bg: "from-emerald-100 to-green-50 dark:from-indigo-950 dark:to-slate-950",                                env: "forest", fogColor: null, fogNear: 0, fogFar: 0 },
  space:    { bg: "from-slate-950 via-slate-900 to-black dark:from-black dark:to-slate-950",                            env: null,     fogColor: null, fogNear: 0, fogFar: 0 },
};

const SceneSelector = memo(function SceneSelector({ theme, progress }: { theme: DreamGoalTheme; progress: number }) {
  const sceneProps = useMemo(() => ({ progress, milestone: Math.floor(progress / 20) }), [progress]);
  switch (theme) {
    case "castle": return <CastleBuilderScene {...sceneProps} />;
    case "tree":   return <MagicalTreeScene {...sceneProps} />;
    case "space":  return <SpaceJourneyScene {...sceneProps} />;
    default:       return <MountainClimbScene {...sceneProps} />;
  }
});

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading your dream...</p>
      </div>
    </div>
  );
}

export const DreamGoalCanvas = memo(function DreamGoalCanvas({
  theme = "mountain",
  progress,
  isActive = true,
}: DreamGoalCanvasProps) {
  const atm = THEME_ATMOSPHERE[theme];
  const bloomIntensity = BLOOM_INTENSITY[theme];

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-b ${atm.bg}`}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        frameloop={isActive ? "always" : "never"}
        shadows
      >
        <PerspectiveCamera makeDefault position={[0, 10, 30]} fov={50} />
        <CameraController progress={progress} theme={theme} />
        <LightingSetup theme={theme} progress={progress} />

        {atm.fogColor && <fog attach="fog" args={[atm.fogColor, atm.fogNear, atm.fogFar]} />}

        {theme === "space" && <Stars radius={100} depth={50} count={5000} saturation={0} fade speed={0.5} />}
        {theme === "tree" && progress >= 75 && <Stars radius={80} depth={30} count={2000} saturation={0.2} fade />}

        <Suspense fallback={null}>
          <SceneSelector theme={theme} progress={progress} />
        </Suspense>

        {atm.env && <Environment preset={atm.env} />}

        {/* Bloom post-processing — makes emissive/bright materials glow */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.25}
            luminanceSmoothing={0.9}
            intensity={bloomIntensity}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <Suspense fallback={<LoadingFallback />}>
        <div className="pointer-events-none absolute inset-0" />
      </Suspense>
    </div>
  );
});
