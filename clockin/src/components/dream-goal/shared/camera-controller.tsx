"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import type { DreamGoalTheme } from "@/types/dream-goal";
import * as THREE from "three";

interface CameraControllerProps {
  progress: number;
  theme: DreamGoalTheme;
}

export function CameraController({ progress, theme }: CameraControllerProps) {
  const targetPosition = useRef(new THREE.Vector3(0, 10, 30));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const t = progress / 100;

    switch (theme) {
      case "mountain":
        // Camera follows climber up the mountain
        targetPosition.current.set(
          Math.sin(t * Math.PI) * 25,
          5 + t * 35,
          20 + Math.cos(t * Math.PI) * 10
        );
        currentLookAt.current.set(0, t * 20, 0);
        break;
      case "castle":
        // Orbit around castle as it builds
        targetPosition.current.set(
          Math.sin(t * Math.PI * 2) * 40,
          15 + t * 10,
          Math.cos(t * Math.PI * 2) * 40
        );
        currentLookAt.current.set(0, t * 15, 0);
        break;
      case "tree":
        // Pull back as tree grows taller
        targetPosition.current.set(
          15 + t * 5,
          10 + t * 20,
          25 + t * 10
        );
        currentLookAt.current.set(0, t * 25, 0);
        break;
      case "space":
        // Move forward through space
        targetPosition.current.set(
          Math.sin(t * Math.PI) * 10,
          Math.cos(t * Math.PI * 0.5) * 5,
          30 - t * 25
        );
        currentLookAt.current.set(0, 0, -t * 50);
        break;
    }
  }, [progress, theme]);

  useFrame((state) => {
    const camera = state.camera;

    // Smooth camera movement
    camera.position.lerp(targetPosition.current, 0.02);

    // Smooth look-at transition
    const currentTarget = new THREE.Vector3();
    camera.getWorldDirection(currentTarget);
    const desiredTarget = currentLookAt.current.clone().sub(camera.position).normalize();
    const lerpedTarget = currentTarget.lerp(desiredTarget, 0.02);
    camera.lookAt(camera.position.clone().add(lerpedTarget));
  });

  return null;
}
