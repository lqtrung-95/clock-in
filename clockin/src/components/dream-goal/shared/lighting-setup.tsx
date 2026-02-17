"use client";

import { useMemo } from "react";
import type { DreamGoalTheme } from "@/types/dream-goal";

interface LightingSetupProps {
  theme: DreamGoalTheme;
  progress: number;
}

export function LightingSetup({ theme, progress }: LightingSetupProps) {
  const lights = useMemo(() => {
    const t = progress / 100;

    switch (theme) {
      case "mountain":
        return (
          <>
            {/* Sun that gets brighter as you climb higher */}
            <ambientLight intensity={0.3 + t * 0.3} />
            <directionalLight
              position={[10, 20 + t * 10, 10]}
              intensity={0.8 + t * 0.4}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            {/* Blue ambient from sky at higher altitudes */}
            <hemisphereLight
              args={[t > 0.7 ? "#87ceeb" : "#1a202c", "#4a5568", 0.3 + t * 0.3]}
            />
          </>
        );
      case "castle":
        return (
          <>
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[20, 30, 20]}
              intensity={1}
              castShadow
              color="#f6e05e"
            />
            {/* Warm glow for the kingdom */}
            <pointLight position={[0, 10, 0]} intensity={0.5} color="#f6ad55" />
          </>
        );
      case "tree":
        return (
          <>
            <ambientLight intensity={0.3} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={0.8}
              castShadow
            />
            {/* Magical glow at higher levels */}
            {t > 0.5 && (
              <pointLight
                position={[0, t * 30, 0]}
                intensity={t * 0.8}
                color="#9f7aea"
                distance={50}
              />
            )}
          </>
        );
      case "space":
        return (
          <>
            {/* Dark space with stars */}
            <ambientLight intensity={0.2} />
            {/* Sun light from distance */}
            <directionalLight position={[-50, 0, -50]} intensity={0.5} />
            {/* Planet glows */}
            <pointLight position={[10, 5, -20]} intensity={0.3} color="#f56565" />
            <pointLight position={[-15, -5, -40]} intensity={0.3} color="#4299e1" />
          </>
        );
    }
  }, [theme, progress]);

  return <>{lights}</>;
}
