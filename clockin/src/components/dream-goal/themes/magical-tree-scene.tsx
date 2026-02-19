"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MagicalTreeSceneProps {
  progress: number;
  milestone: number;
}

const SEASONS = [
  { trunk: "#8b5a2b", leaves: "#84cc16", ground: "#4ade80" }, // Spring
  { trunk: "#92400e", leaves: "#65a30d", ground: "#16a34a" }, // Summer
  { trunk: "#713f12", leaves: "#ea580c", ground: "#854d0e" }, // Autumn
  { trunk: "#5c2b0b", leaves: "#c084fc", ground: "#1e1b4b" }, // Magical winter
];

export function MagicalTreeScene({ progress }: MagicalTreeSceneProps) {
  const treeRef = useRef<THREE.Group>(null);
  const t = progress / 100;

  const seasonIndex = Math.floor(t * 4);
  const colors = SEASONS[Math.min(seasonIndex, 3)];

  const treeScale = Math.max(0.1, t * 1.5);
  const branchLevels = Math.floor(t * 5) + 1;

  // Tree structure with stable random values stored in the memo data
  const treeStructure = useMemo(() => {
    const branches: {
      position: [number, number, number];
      scale: [number, number, number];
      rotation: [number, number, number];
      level: number;
      leafSize: number; // stable — computed once per memo run
    }[] = [];

    const trunkHeight = 2 + t * 8;
    branches.push({
      position: [0, trunkHeight / 2, 0],
      scale: [0.5 + t * 0.3, trunkHeight, 0.5 + t * 0.3],
      rotation: [0, 0, 0],
      level: 0,
      leafSize: 0,
    });

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
          ],
          scale: [0.2 - level * 0.03, length, 0.2 - level * 0.03],
          rotation: [Math.random() * 0.5, angle, Math.random() * 0.3],
          level,
          leafSize: 0.35 + Math.random() * 0.35, // stored here — stable per memo run
        });
        addBranches(branchY + length / 2, level + 1, maxLevel);
      }
    };

    addBranches(trunkHeight * 0.7, 1, 4);
    return branches;
  }, [t, branchLevels]);

  const leafBranches = useMemo(() => treeStructure.slice(5), [treeStructure]);

  useFrame(({ clock }) => {
    if (treeRef.current) {
      treeRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.025;
    }
  });

  const isNight = t > 0.75;

  return (
    <group>
      {/* Ground circle */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[18, 48]} />
        <meshStandardMaterial color={colors.ground} roughness={0.95} />
      </mesh>

      {/* Moon for night/winter stage */}
      {isNight && (
        <group position={[12, 18, -20]}>
          <mesh>
            <sphereGeometry args={[2.5, 24, 24]} />
            <meshBasicMaterial color="#fef9c3" />
          </mesh>
          <pointLight color="#fef9c3" intensity={0.4} distance={80} />
        </group>
      )}

      {/* Tree */}
      <group ref={treeRef} scale={[treeScale, treeScale, treeScale]}>
        {treeStructure.map((branch, i) => (
          <mesh key={i} position={branch.position} rotation={branch.rotation} castShadow>
            <cylinderGeometry args={[branch.scale[0], branch.scale[0] * 0.75, branch.scale[1], 6]} />
            <meshStandardMaterial
              color={branch.level === 0 ? colors.trunk : colors.leaves}
              roughness={0.9}
            />
          </mesh>
        ))}

        {/* Leaf clusters — sizes stored in branch data, not random at render time */}
        {t > 0.1 &&
          leafBranches.map((branch, i) => (
            <mesh key={`leaf-${i}`} position={branch.position}>
              <sphereGeometry args={[branch.leafSize, 7, 7]} />
              <meshStandardMaterial
                color={colors.leaves}
                emissive={isNight ? colors.leaves : "#000000"}
                emissiveIntensity={isNight ? 0.25 : 0}
                roughness={0.85}
              />
            </mesh>
          ))}
      </group>

      {t > 0.5 && <MagicParticles height={t * 15} color={isNight ? "#d8b4fe" : "#f0abfc"} />}
      {isNight && <Fireflies />}
    </group>
  );
}

function MagicParticles({ height, color }: { height: number; color: string }) {
  const count = 40;
  const points = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 12,
        y: Math.random() * height,
        z: (Math.random() - 0.5) * 12,
        speed: 0.25 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      })),
    [height]
  );

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    points.forEach((p, i) => {
      const y = p.y + Math.sin(time * p.speed + p.phase) * 0.4;
      const s = 0.25 + Math.sin(time * 2.5 + p.phase) * 0.15;
      mat.makeScale(s, s, s);
      mat.setPosition(p.x, y, p.z);
      meshRef.current!.setMatrixAt(i, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} />
    </instancedMesh>
  );
}

function Fireflies() {
  const count = 20;
  // Stable positions stored in useMemo — not random at render time
  const flies = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.random() - 0.5) * 14,
        y: 1 + Math.random() * 9,
        z: (Math.random() - 0.5) * 14,
        speed: 0.4 + Math.random() * 0.4,
        phase: (i / count) * Math.PI * 2,
      })),
    []
  );

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    flies.forEach((f, i) => {
      const x = f.x + Math.sin(time * f.speed + f.phase) * 1.2;
      const y = f.y + Math.cos(time * f.speed * 0.7 + f.phase) * 0.8;
      const z = f.z + Math.sin(time * f.speed * 0.9 + f.phase + 1) * 1.0;
      const s = 0.5 + Math.sin(time * 3 + f.phase) * 0.4; // twinkle
      mat.makeScale(s, s, s);
      mat.setPosition(x, y, z);
      meshRef.current!.setMatrixAt(i, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.06, 4, 4]} />
      <meshBasicMaterial color="#fef08a" transparent opacity={0.9} />
    </instancedMesh>
  );
}
