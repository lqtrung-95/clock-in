"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MountainClimbSceneProps {
  progress: number;
  milestone: number;
}

export function MountainClimbScene({ progress, milestone }: MountainClimbSceneProps) {
  const climberRef = useRef<THREE.Group>(null);
  const t = progress / 100;

  // Procedural terrain
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(60, 60, 64, 64);
    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      // Create mountain shape - higher in center
      const distFromCenter = Math.sqrt(x * x + y * y);
      const height = Math.max(0, 20 - distFromCenter * 0.5) +
                     Math.sin(x * 0.2) * Math.cos(y * 0.2) * 3;
      positions[i + 2] = Math.max(0, height);
    }

    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // Color based on height/zone
  const terrainMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: t < 0.3 ? "#4ade80" : t < 0.6 ? "#a3a3a3" : "#e5e7eb",
      roughness: 0.8,
      metalness: 0.1,
    });
  }, [t]);

  // Climber position along spiral path
  const climberPosition = useMemo(() => {
    const angle = t * Math.PI * 3;
    const radius = 15 * (1 - t * 0.5);
    const height = t * 25;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      height + 2,
      Math.sin(angle) * radius
    );
  }, [t]);

  useFrame(() => {
    if (climberRef.current) {
      climberRef.current.position.lerp(climberPosition, 0.05);
      // Look at center
      climberRef.current.lookAt(0, climberRef.current.position.y, 0);
    }
  });

  return (
    <group>
      {/* Mountain terrain */}
      <mesh
        geometry={terrainGeometry}
        material={terrainMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -5, 0]}
        receiveShadow
      />

      {/* Climber */}
      <group ref={climberRef} position={climberPosition}>
        {/* Body */}
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#fca5a5" />
        </mesh>
        {/* Backpack */}
        <mesh position={[0, 0.2, -0.3]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.2]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </group>

      {/* Summit flag at 100% */}
      {t >= 0.99 && (
        <group position={[0, 20, 0]}>
          {/* Flag pole */}
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 4]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
          {/* Flag */}
          <mesh position={[0.5, 3.5, 0]}>
            <boxGeometry args={[1, 0.6, 0.05]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.2} />
          </mesh>
          {/* Celebration particles */}
          <Sparkles position={[0, 2, 0]} scale={4} />
        </group>
      )}

      {/* Milestone markers */}
      {[0.25, 0.5, 0.75].map((milestoneT) => (
        <MilestoneMarker
          key={milestoneT}
          progress={t}
          milestoneProgress={milestoneT}
          reached={t >= milestoneT}
        />
      ))}
    </group>
  );
}

function MilestoneMarker({
  progress,
  milestoneProgress,
  reached,
}: {
  progress: number;
  milestoneProgress: number;
  reached: boolean;
}) {
  const angle = milestoneProgress * Math.PI * 3;
  const radius = 15 * (1 - milestoneProgress * 0.5);
  const height = milestoneProgress * 25;

  const position = new THREE.Vector3(
    Math.cos(angle) * radius,
    height,
    Math.sin(angle) * radius
  );

  return (
    <group position={position}>
      {/* Marker pole */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 1.5]} />
        <meshStandardMaterial color={reached ? "#22c55e" : "#6b7280"} />
      </mesh>
      {/* Marker top */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={reached ? "#22c55e" : "#6b7280"}
          emissive={reached ? "#22c55e" : "#000000"}
          emissiveIntensity={reached ? 0.3 : 0}
        />
      </mesh>
    </group>
  );
}

// Simple sparkle effect
function Sparkles({ position, scale = 1 }: { position: [number, number, number] | THREE.Vector3; scale?: number }) {
  const points = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * scale * 2,
          Math.random() * scale,
          (Math.random() - 0.5) * scale * 2,
        ] as [number, number, number],
        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, [scale]);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    points.forEach((point, i) => {
      const matrix = new THREE.Matrix4();
      const y = point.position[1] + Math.sin(time * point.speed + point.phase) * 0.5;
      const scale = 0.5 + Math.sin(time * 2 + point.phase) * 0.3;
      matrix.setPosition(point.position[0], y, point.position[2]);
      matrix.scale(new THREE.Vector3(scale, scale, scale));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]} position={position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
    </instancedMesh>
  );
}
