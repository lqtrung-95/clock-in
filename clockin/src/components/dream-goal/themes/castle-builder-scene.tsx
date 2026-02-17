"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface CastleBuilderSceneProps {
  progress: number;
  milestone: number;
}

export function CastleBuilderScene({ progress, milestone }: CastleBuilderSceneProps) {
  const t = progress / 100;

  // Castle pieces that appear at different milestones
  const castlePieces = useMemo(() => {
    const pieces = [];

    // Foundation - always visible
    pieces.push(
      <mesh key="foundation" position={[0, 0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[12, 1, 12]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
    );

    // Walls at 10%
    if (t >= 0.1) {
      const wallOpacity = Math.min(1, (t - 0.1) / 0.05);
      pieces.push(
        <group key="walls">
          {/* Front wall */}
          <mesh position={[0, 2.5, 5]} castShadow>
            <boxGeometry args={[10, 3, 1]} />
            <meshStandardMaterial color="#a8a29e" transparent opacity={wallOpacity} />
          </mesh>
          {/* Back wall */}
          <mesh position={[0, 2.5, -5]} castShadow>
            <boxGeometry args={[10, 3, 1]} />
            <meshStandardMaterial color="#a8a29e" transparent opacity={wallOpacity} />
          </mesh>
          {/* Left wall */}
          <mesh position={[-5, 2.5, 0]} castShadow>
            <boxGeometry args={[1, 3, 10]} />
            <meshStandardMaterial color="#a8a29e" transparent opacity={wallOpacity} />
          </mesh>
          {/* Right wall */}
          <mesh position={[5, 2.5, 0]} castShadow>
            <boxGeometry args={[1, 3, 10]} />
            <meshStandardMaterial color="#a8a29e" transparent opacity={wallOpacity} />
          </mesh>
        </group>
      );
    }

    // Towers at 25%
    if (t >= 0.25) {
      const towerPositions = [
        [-5, 5], [5, 5], [-5, -5], [5, -5]
      ];
      pieces.push(
        <group key="towers">
          {towerPositions.map((pos, i) => (
            <mesh key={i} position={[pos[0], 4, pos[1]]} castShadow>
              <cylinderGeometry args={[1, 1.2, 6, 8]} />
              <meshStandardMaterial color="#d6d3d1" />
            </mesh>
          ))}
        </group>
      );
    }

    // Keep at 50%
    if (t >= 0.5) {
      pieces.push(
        <group key="keep">
          <mesh position={[0, 5, 0]} castShadow>
            <boxGeometry args={[6, 8, 6]} />
            <meshStandardMaterial color="#e7e5e4" />
          </mesh>
          {/* Keep roof */}
          <mesh position={[0, 9.5, 0]} castShadow>
            <coneGeometry args={[4.5, 3, 4]} />
            <meshStandardMaterial color="#7c2d12" />
          </mesh>
        </group>
      );
    }

    // Gate at 75%
    if (t >= 0.75) {
      pieces.push(
        <group key="gate">
          <mesh position={[0, 2.5, 5.5]} castShadow>
            <boxGeometry args={[3, 4, 1.5]} />
            <meshStandardMaterial color="#57534e" />
          </mesh>
          {/* Portcullis */}
          <mesh position={[0, 2, 5.8]}>
            <boxGeometry args={[2.5, 3, 0.1]} />
            <meshStandardMaterial color="#1c1917" wireframe />
          </mesh>
        </group>
      );
    }

    // Village at 100%
    if (t >= 0.95) {
      pieces.push(
        <group key="village">
          {/* Small houses */}
          {[
            [-8, -8], [-10, -5], [-7, -10], [8, -8], [10, -6]
          ].map((pos, i) => (
            <group key={i} position={[pos[0], 0.75, pos[1]]}>
              <mesh castShadow>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color="#d4d4d8" />
              </mesh>
              <mesh position={[0, 1.25, 0]} castShadow>
                <coneGeometry args={[1.2, 1, 4]} />
                <meshStandardMaterial color="#991b1b" />
              </mesh>
            </group>
          ))}
          {/* Celebration banners */}
          <mesh position={[0, 12, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 8]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      );
    }

    return pieces;
  }, [t]);

  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#65a30d" />
      </mesh>

      {/* Castle pieces */}
      {castlePieces}

      {/* Ambient dust particles */}
      <DustParticles count={20} radius={15} />
    </group>
  );
}

function DustParticles({ count, radius }: { count: number; radius: number }) {
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * radius * 2,
      y: Math.random() * 10,
      z: (Math.random() - 0.5) * radius * 2,
    }));
  }, [count, radius]);

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshBasicMaterial color="#fef3c7" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}
