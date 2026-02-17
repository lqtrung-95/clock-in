"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SpaceJourneySceneProps {
  progress: number;
  milestone: number;
}

export function SpaceJourneyScene({ progress, milestone }: SpaceJourneySceneProps) {
  const rocketRef = useRef<THREE.Group>(null);
  const t = progress / 100;

  // Rocket position along journey path
  const rocketPosition = useMemo(() => {
    return new THREE.Vector3(
      Math.sin(t * Math.PI * 2) * 5,
      Math.cos(t * Math.PI) * 3,
      -t * 40
    );
  }, [t]);

  // Planets data
  const planets = useMemo(() => [
    { position: [0, -10, -5], size: 6, color: "#3b82f6", name: "Earth", distance: 0 },
    { position: [8, 2, -15], size: 1.5, color: "#d1d5db", name: "Moon", distance: 50 },
    { position: [-12, -3, -30], size: 2.5, color: "#ef4444", name: "Mars", distance: 150 },
    { position: [15, 5, -50], size: 5, color: "#d97706", name: "Jupiter", distance: 300 },
    { position: [-8, 8, -70], size: 8, color: "#a855f7", name: "Nebula", distance: 500 },
  ], []);

  useFrame(({ clock }) => {
    if (rocketRef.current) {
      // Smooth rocket movement
      rocketRef.current.position.lerp(rocketPosition, 0.05);

      // Rocket rotation - tilt in direction of movement
      const velocity = rocketPosition.clone().sub(rocketRef.current.position);
      const targetRotation = new THREE.Euler(
        velocity.y * 0.1,
        -velocity.x * 0.05,
        -velocity.x * 0.1
      );
      rocketRef.current.rotation.x = THREE.MathUtils.lerp(
        rocketRef.current.rotation.x,
        targetRotation.x,
        0.05
      );
      rocketRef.current.rotation.z = THREE.MathUtils.lerp(
        rocketRef.current.rotation.z,
        targetRotation.z,
        0.05
      );

      // Engine glow pulse
      const engine = rocketRef.current.children.find(
        (c) => c.userData.isEngine
      ) as THREE.Mesh;
      if (engine?.material) {
        (engine.material as THREE.MeshBasicMaterial).opacity =
          0.6 + Math.sin(clock.getElapsedTime() * 10) * 0.3;
      }
    }
  });

  return (
    <group>
      {/* Planets */}
      {planets.map((planet, i) => {
        const isVisible = t >= i * 0.2;
        if (!isVisible) return null;

        return (
          <group key={planet.name}>
            <mesh position={planet.position as [number, number, number]}>
              <sphereGeometry args={[planet.size, 32, 32]} />
              <meshStandardMaterial
                color={planet.color}
                emissive={planet.color}
                emissiveIntensity={0.2}
              />
            </mesh>
            {/* Planet glow */}
            <mesh position={planet.position as [number, number, number]}>
              <sphereGeometry args={[planet.size * 1.2, 16, 16]} />
              <meshBasicMaterial
                color={planet.color}
                transparent
                opacity={0.1}
              />
            </mesh>
          </group>
        );
      })}

      {/* Rocket */}
      <group ref={rocketRef} position={rocketPosition} rotation={[Math.PI / 2, 0, 0]}>
        {/* Main body */}
        <mesh castShadow>
          <coneGeometry args={[0.5, 2, 8]} />
          <meshStandardMaterial color="#e5e7eb" />
        </mesh>
        {/* Fins */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            rotation={[0, (i * Math.PI) / 2, 0]}
            position={[0, -0.5, 0.3]}
          >
            <boxGeometry args={[0.1, 0.6, 0.4]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        ))}
        {/* Window */}
        <mesh position={[0, 0.2, 0.35]}>
          <circleGeometry args={[0.2, 16]} />
          <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.3} />
        </mesh>
        {/* Engine glow */}
        <mesh
          position={[0, -1.2, 0]}
          userData={{ isEngine: true }}
        >
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.8} />
        </mesh>
        {/* Engine trail */}
        <TrailParticles />
      </group>

      {/* Warp speed lines at high progress */}
      {t > 0.8 && <WarpLines />}
    </group>
  );
}

function TrailParticles() {
  const count = 20;
  const points = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      offset: i * 0.1,
      speed: 0.5 + Math.random() * 0.5,
    }));
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    points.forEach((point, i) => {
      const matrix = new THREE.Matrix4();
      const z = -1 - (i * 0.2 + time * point.speed) % 3;
      const scale = 0.1 + Math.random() * 0.1;
      matrix.setPosition(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        z
      );
      matrix.scale(new THREE.Vector3(scale, scale, scale));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 4, 4]} />
      <meshBasicMaterial color="#f97316" transparent opacity={0.6} />
    </instancedMesh>
  );
}

function WarpLines() {
  const count = 50;
  const lines = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 50,
      y: (Math.random() - 0.5) * 50,
      z: -Math.random() * 100,
      speed: 2 + Math.random() * 3,
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((line, i) => {
      line.position.z += lines[i].speed;
      if (line.position.z > 10) {
        line.position.z = -100;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, line.y, line.z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 3]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}
