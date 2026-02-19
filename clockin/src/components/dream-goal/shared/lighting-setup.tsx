"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { DreamGoalTheme } from "@/types/dream-goal";
import * as THREE from "three";

interface LightingSetupProps {
  theme: DreamGoalTheme;
  progress: number;
}

export function LightingSetup({ theme, progress }: LightingSetupProps) {
  const t = progress / 100;

  switch (theme) {
    case "mountain": return <MountainLighting t={t} />;
    case "castle":   return <CastleLighting t={t} />;
    case "tree":     return <TreeLighting t={t} />;
    case "space":    return <SpaceLighting t={t} />;
    default:         return null;
  }
}

/** Mountain: sun rises and intensifies as you climb higher */
function MountainLighting({ t }: { t: number }) {
  const sunColor = t > 0.7 ? "#fff8e7" : t > 0.4 ? "#fde68a" : "#fed7aa";
  const skyColor = t > 0.7 ? "#87ceeb" : "#b0c4de";

  return (
    <>
      <ambientLight intensity={0.25 + t * 0.35} color={skyColor} />
      <directionalLight
        position={[10 + t * 10, 20 + t * 15, 8]}
        intensity={0.9 + t * 0.5}
        color={sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <hemisphereLight args={[skyColor, "#4a5568", 0.3 + t * 0.25]} />
    </>
  );
}

/** Castle: warm golden medieval sunlight with a subtle fill */
function CastleLighting({ t }: { t: number }) {
  const sunIntensity = 1.1 + t * 0.3;

  return (
    <>
      <ambientLight intensity={0.35} color="#fff4d6" />
      <directionalLight
        position={[25, 35, 20]}
        intensity={sunIntensity}
        color="#f6e05e"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      {/* Soft fill from the opposite side */}
      <directionalLight position={[-15, 10, -20]} intensity={0.2} color="#a7c7e7" />
      {/* Central warm fill once castle is partially built */}
      {t > 0.3 && <pointLight position={[0, 12, 0]} intensity={0.4 + t * 0.3} color="#f6ad55" distance={50} decay={2} />}
    </>
  );
}

/** Tree: nature light with growing magical glow and night moonlight */
function TreeLighting({ t }: { t: number }) {
  const isNight = t > 0.75;
  const magicRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (magicRef.current && t > 0.5) {
      // Gentle pulsing magical glow
      magicRef.current.intensity = t * 0.7 + Math.sin(clock.getElapsedTime() * 1.2) * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={isNight ? 0.12 : 0.32} color={isNight ? "#3730a3" : "#d1fae5"} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={isNight ? 0.15 : 0.85}
        color={isNight ? "#818cf8" : "#ffffff"}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      {/* Moonlight from above-left at night */}
      {isNight && (
        <directionalLight position={[-12, 20, -20]} intensity={0.35} color="#e0e7ff" />
      )}
      {/* Growing magical uplight */}
      {t > 0.5 && (
        <pointLight
          ref={magicRef}
          position={[0, t * 20, 0]}
          intensity={t * 0.7}
          color={t > 0.75 ? "#818cf8" : "#9f7aea"}
          distance={60}
          decay={2}
        />
      )}
    </>
  );
}

/** Space: dark ambient, distant sun, colored planet glows */
function SpaceLighting({ t }: { t: number }) {
  return (
    <>
      {/* Very dim ambient — space is dark */}
      <ambientLight intensity={0.08} color="#1e1b4b" />
      {/* Distant star (sun) light */}
      <directionalLight position={[-60, 10, -60]} intensity={0.6} color="#fffbeb" />
      {/* Mars reddish glow */}
      {t > 0.4 && <pointLight position={[-12, -3, -30]} intensity={0.5} color="#ef4444" distance={40} decay={2} />}
      {/* Jupiter/Saturn golden glow */}
      {t > 0.6 && <pointLight position={[15, 5, -50]} intensity={0.6} color="#f59e0b" distance={50} decay={2} />}
      {/* Nebula purple fill at the end */}
      {t > 0.8 && <pointLight position={[-8, 8, -70]} intensity={0.8 * (t - 0.8) * 5} color="#a855f7" distance={80} decay={2} />}
    </>
  );
}
