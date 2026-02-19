"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface JourneyTrailProps {
  /** Ordered points from journey start to current position */
  points: THREE.Vector3[];
  color?: string;
  opacity?: number;
}

/**
 * Renders the path a character has already traveled as a glowing line.
 * Works with bloom post-processing — use an emissive-equivalent bright color.
 */
export function JourneyTrail({ points, color = "#fbbf24", opacity = 0.55 }: JourneyTrailProps) {
  const geometry = useMemo(() => {
    if (points.length < 2) return null;
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  if (!geometry) return null;

  return (
    // @ts-expect-error — R3F line primitive takes geometry prop
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

/** Sample the mountain spiral path from t=0 to t=progress */
export function useMountainTrailPoints(t: number): THREE.Vector3[] {
  return useMemo(() => {
    const steps = Math.max(2, Math.floor(t * 80));
    return Array.from({ length: steps + 1 }, (_, i) => {
      const ti = (i / steps) * t;
      const angle = ti * Math.PI * 3;
      const radius = 15 * (1 - ti * 0.5);
      return new THREE.Vector3(Math.cos(angle) * radius, ti * 25 + 1.5, Math.sin(angle) * radius);
    });
  }, [t]);
}

/** Sample the space orbit path from t=0 to t=progress */
export function useSpaceTrailPoints(t: number): THREE.Vector3[] {
  return useMemo(() => {
    const steps = Math.max(2, Math.floor(t * 80));
    return Array.from({ length: steps + 1 }, (_, i) => {
      const ti = (i / steps) * t;
      return new THREE.Vector3(Math.sin(ti * Math.PI * 2) * 5, Math.cos(ti * Math.PI) * 3, -ti * 40);
    });
  }, [t]);
}
