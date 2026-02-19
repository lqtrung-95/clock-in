"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CastleBuilderSceneProps {
  progress: number;
  milestone: number;
}

const WALL_COLOR = "#a8a29e";
const STONE_COLOR = "#d6d3d1";

export function CastleBuilderScene({ progress }: CastleBuilderSceneProps) {
  const t = progress / 100;

  const castlePieces = useMemo(() => {
    const pieces = [];
    const wallOpacity = t >= 0.1 ? Math.min(1, (t - 0.1) / 0.05) : 0;

    // Foundation — always visible
    pieces.push(
      <mesh key="foundation" position={[0, 0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[12, 1, 12]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} />
      </mesh>
    );

    // Walls at 10%
    if (t >= 0.1) {
      pieces.push(
        <group key="walls">
          {[
            { pos: [0, 2.5, 5] as [number, number, number], size: [10, 3, 1] as [number, number, number] },
            { pos: [0, 2.5, -5] as [number, number, number], size: [10, 3, 1] as [number, number, number] },
            { pos: [-5, 2.5, 0] as [number, number, number], size: [1, 3, 10] as [number, number, number] },
            { pos: [5, 2.5, 0] as [number, number, number], size: [1, 3, 10] as [number, number, number] },
          ].map(({ pos, size }, i) => (
            <mesh key={i} position={pos} castShadow>
              <boxGeometry args={size} />
              <meshStandardMaterial color={WALL_COLOR} transparent opacity={wallOpacity} roughness={0.85} />
            </mesh>
          ))}
          {/* Crenellations on top of front wall */}
          {[-4, -2, 0, 2, 4].map((x) => (
            <mesh key={x} position={[x, 4.4, 5]} castShadow>
              <boxGeometry args={[0.7, 0.8, 0.8]} />
              <meshStandardMaterial color="#9ca3af" transparent opacity={wallOpacity} roughness={0.9} />
            </mesh>
          ))}
        </group>
      );
    }

    // Towers at 25%
    if (t >= 0.25) {
      const towerPositions: [number, number][] = [[-5, 5], [5, 5], [-5, -5], [5, -5]];
      pieces.push(
        <group key="towers">
          {towerPositions.map((pos, i) => (
            <group key={i} position={[pos[0], 0, pos[1]]}>
              <mesh position={[0, 4, 0]} castShadow>
                <cylinderGeometry args={[1, 1.2, 8, 8]} />
                <meshStandardMaterial color={STONE_COLOR} roughness={0.85} />
              </mesh>
              {/* Tower battlements */}
              {Array.from({ length: 8 }, (_, j) => (
                <mesh
                  key={j}
                  position={[
                    Math.cos((j / 8) * Math.PI * 2) * 1.08,
                    8.5,
                    Math.sin((j / 8) * Math.PI * 2) * 1.08,
                  ]}
                  castShadow
                >
                  <boxGeometry args={[0.5, 0.6, 0.5]} />
                  <meshStandardMaterial color="#e5e5e4" roughness={0.9} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      );
    }

    // Keep (central tower) at 50%
    if (t >= 0.5) {
      pieces.push(
        <group key="keep">
          <mesh position={[0, 5, 0]} castShadow>
            <boxGeometry args={[6, 10, 6]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
          </mesh>
          <mesh position={[0, 10.5, 0]} castShadow>
            <coneGeometry args={[4.5, 3.5, 4]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.7} />
          </mesh>
        </group>
      );
    }

    // Gatehouse at 75%
    if (t >= 0.75) {
      pieces.push(
        <group key="gate">
          <mesh position={[0, 2.5, 5.5]} castShadow>
            <boxGeometry args={[3, 5, 1.5]} />
            <meshStandardMaterial color="#57534e" roughness={0.9} />
          </mesh>
          <mesh position={[0, 2, 5.8]}>
            <boxGeometry args={[2.5, 3.5, 0.1]} />
            <meshStandardMaterial color="#1c1917" wireframe />
          </mesh>
        </group>
      );
    }

    // Village at 100%
    if (t >= 0.95) {
      const housePositions: [number, number][] = [[-8, -8], [-10, -5], [-7, -10], [8, -8], [10, -6]];
      pieces.push(
        <group key="village">
          {housePositions.map((pos, i) => (
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
        </group>
      );
    }

    return pieces;
  }, [t]);

  return (
    <group>
      {/* Grass ground */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#65a30d" roughness={0.95} />
      </mesh>

      {castlePieces}

      {/* Flickering torch lights once towers are built */}
      {t >= 0.25 && <TorchLights />}

      {/* Animated ambient dust motes */}
      <DustParticles count={30} radius={18} />
    </group>
  );
}

function TorchLights() {
  const positions: [number, number, number][] = [[-5, 8.8, 5], [5, 8.8, 5], [-5, 8.8, -5], [5, 8.8, -5]];
  const lightRefs = useRef<(THREE.PointLight | null)[]>([]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    lightRefs.current.forEach((light, i) => {
      if (light) {
        // Natural torch flicker
        light.intensity = 0.6 + Math.sin(time * 7.3 + i * 1.4) * 0.18 + Math.sin(time * 13 + i * 2.1) * 0.08;
      }
    });
  });

  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <sphereGeometry args={[0.14, 6, 6]} />
            <meshBasicMaterial color="#fb923c" />
          </mesh>
          <pointLight
            ref={(el) => { lightRefs.current[i] = el; }}
            color="#f97316"
            intensity={0.65}
            distance={14}
            decay={2}
          />
        </group>
      ))}
    </>
  );
}

function DustParticles({ count, radius }: { count: number; radius: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * radius * 2,
        baseY: Math.random() * 10,
        z: (Math.random() - 0.5) * radius * 2,
        speed: 0.12 + Math.random() * 0.2,
        phase: Math.random() * Math.PI * 2,
      })),
    [count, radius]
  );

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    particles.forEach((p, i) => {
      const y = p.baseY + Math.sin(time * p.speed + p.phase) * 0.9;
      const s = 0.04 + Math.sin(time * 0.5 + p.phase) * 0.015;
      mat.makeScale(s, s, s);
      mat.setPosition(p.x, y, p.z);
      meshRef.current!.setMatrixAt(i, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.06, 4, 4]} />
      <meshBasicMaterial color="#fef3c7" transparent opacity={0.35} />
    </instancedMesh>
  );
}
