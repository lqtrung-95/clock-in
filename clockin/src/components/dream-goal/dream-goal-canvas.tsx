"use client";

import { Suspense, useMemo, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment, Stars } from "@react-three/drei";
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

const SceneSelector = memo(function SceneSelector({
  theme,
  progress,
}: {
  theme: DreamGoalTheme;
  progress: number;
}) {
  const sceneProps = useMemo(
    () => ({
      progress,
      milestone: Math.floor(progress / 20),
    }),
    [progress]
  );

  switch (theme) {
    case "castle":
      return <CastleBuilderScene {...sceneProps} />;
    case "tree":
      return <MagicalTreeScene {...sceneProps} />;
    case "space":
      return <SpaceJourneyScene {...sceneProps} />;
    case "mountain":
    default:
      return <MountainClimbScene {...sceneProps} />;
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
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-b from-sky-100 to-sky-50 dark:from-slate-900 dark:to-slate-950">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        frameloop={isActive ? "always" : "never"}
      >
        <PerspectiveCamera makeDefault position={[0, 10, 30]} fov={50} />
        <CameraController progress={progress} theme={theme} />
        <LightingSetup theme={theme} progress={progress} />

        {theme === "space" && <Stars radius={100} depth={50} count={5000} />}

        <Suspense fallback={null}>
          <SceneSelector theme={theme} progress={progress} />
        </Suspense>

        <Environment preset="sunset" />
      </Canvas>

      {/* Loading overlay */}
      <Suspense fallback={<LoadingFallback />}>
        <div className="pointer-events-none absolute inset-0" />
      </Suspense>
    </div>
  );
});
