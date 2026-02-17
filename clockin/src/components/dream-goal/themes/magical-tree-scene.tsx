"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MagicalTreeSceneProps {
  progress: number;
  milestone: number;
}

export function MagicalTreeScene({ progress, milestone }: MagicalTreeSceneProps) {
  const treeRef = useRef<THREE.Group>(null);
  const t = progress / 100;

  // Tree growth stages
  const treeScale = Math.max(0.1, t * 1.5);
  const branchLevels = Math.floor(t * 5) + 1; // 1-6 levels

  // Generate tree structure
  const treeStructure = useMemo(() => {
    const branches = [];

    // Main trunk
    const trunkHeight = 2 + t * 8;
    branches.push({
      position: [0, trunkHeight / 2, 0] as [number, number, number],
      scale: [0.5 + t * 0.3, trunkHeight, 0.5 + t * 0.3] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      level: 0,
    });

    // Branch recursively
    const addBranches = (y: number, level: number, maxLevel: number) => {
      if (level >= maxLevel || level >= branchLevels) return;

      const numBranches = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numBranches; i++) {
        const angle = (i / numBranches) * Math.PI * 2 + level * 0.5;
        const length = 1.5 - level * 0.2;
        const branchY = y + Math.random() * 1.5;

        branches.push({
          position: [
            Math.cos(angle) * (0.5 + level * 0.3),
            branchY,
            Math.sin(angle) * (0.5 + level * 0.3),
          ] as [number, number, number],
          scale: [0.2 - level * 0.03, length, 0.2 - level * 0.03] as [number, number, number],
          rotation: [Math.random() * 0.5, angle, Math.random() * 0.3] as [number, number, number],
          level,
        });

        addBranches(branchY + length / 2, level + 1, maxLevel);
      }
    };

    addBranches(trunkHeight * 0.7, 1, 4);
    return branches;
  }, [t, branchLevels]);

  // Season colors
  const seasonColors = useMemo(() => {
    if (t < 0.25) return { trunk: "#8b5a2b", leaves: "#84cc16" }; // Spring
    if (t < 0.5) return { trunk: "#92400e", leaves: "#65a30d" }; // Summer
    if (t < 0.75) return { trunk: "#713f12", leaves: "#ea580c" }; // Autumn
    return { trunk: "#5c2b0b", leaves: "#c084fc" }; // Magical winter
  }, [t]);

  useFrame(({ clock }) => {
    if (treeRef.current) {
      // Gentle sway
      treeRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
    }
  });

  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color={t > 0.75 ? "#1e1b4b" : "#4ade80"} />
      </mesh>

      {/* Tree */}
      <group ref={treeRef} scale={[treeScale, treeScale, treeScale]}>
        {treeStructure.map((branch, i) => (
          <mesh
            key={i}
            position={branch.position}
            rotation={branch.rotation || [0, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[branch.scale[0], branch.scale[0] * 0.7, branch.scale[1], 6]} />
            <meshStandardMaterial
              color={branch.level === 0 ? seasonColors.trunk : seasonColors.leaves}
            />
          </mesh>
        ))}

        {/* Leaf clusters at branch ends */}
        {t > 0.1 &&
          treeStructure.slice(5).map((branch, i) => (
            <mesh key={`leaf-${i}`} position={branch.position}>
              <sphereGeometry args={[0.4 + Math.random() * 0.3, 6, 6]} />
              <meshStandardMaterial
                color={seasonColors.leaves}
                emissive={t > 0.75 ? seasonColors.leaves : "#000000"}
                emissiveIntensity={t > 0.75 ? 0.3 : 0}
              />
            </mesh>
          ))}
      </group>

      {/* Magical particles at higher levels */}
      {t > 0.5 && <MagicParticles count={30} height={t * 15} />}

      {/* Fireflies at night stage */}
      {t > 0.75 && <Fireflies count={15} />}
    </group>
  );
}

function MagicParticles({ count, height }: { count: number; height: number }) {
  const points = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 10,
        Math.random() * height,
        (Math.random() - 0.5) * 10,
      ] as [number, number, number],
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [count, height]);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    points.forEach((point, i) => {
      const matrix = new THREE.Matrix4();
      const y = point.position[1] + Math.sin(time * point.speed + point.phase) * 0.3;
      const scale = 0.3 + Math.sin(time * 3 + point.phase) * 0.2;
      matrix.setPosition(point.position[0], y, point.position[2]);
      matrix.scale(new THREE.Vector3(scale, scale, scale));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color="#f0abfc" transparent opacity={0.8} />
    </instancedMesh>
  );
}

function Fireflies({ count }: { count: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      child.position.x += Math.sin(time * 0.5 + i) * 0.01;
      child.position.y += Math.cos(time * 0.3 + i) * 0.01;
      child.position.z += Math.sin(time * 0.4 + i) * 0.01;
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 12,
            1 + Math.random() * 8,
            (Math.random() - 0.5) * 12,
          ]}
        >
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
      ))}
    </group>
  );
}
