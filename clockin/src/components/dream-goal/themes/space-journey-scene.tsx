"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { JourneyTrail, useSpaceTrailPoints } from "../shared/journey-trail";

interface SpaceJourneySceneProps {
  progress: number;
  milestone: number;
}

export function SpaceJourneyScene({ progress }: SpaceJourneySceneProps) {
  const rocketRef = useRef<THREE.Group>(null);
  const planetRefs = useRef<(THREE.Group | null)[]>([]);
  const t = progress / 100;
  const orbitTrail = useSpaceTrailPoints(t);

  const rocketPosition = useMemo(
    () => new THREE.Vector3(Math.sin(t * Math.PI * 2) * 5, Math.cos(t * Math.PI) * 3, -t * 40),
    [t]
  );

  const planets = useMemo(
    () => [
      { pos: [0, -10, -5] as [number, number, number], size: 6, color: "#3b82f6", hasRings: false },
      { pos: [8, 2, -15] as [number, number, number], size: 1.5, color: "#d1d5db", hasRings: false },
      { pos: [-12, -3, -30] as [number, number, number], size: 2.5, color: "#ef4444", hasRings: false },
      { pos: [15, 5, -50] as [number, number, number], size: 5, color: "#f59e0b", hasRings: true },
      { pos: [-8, 8, -70] as [number, number, number], size: 8, color: "#a855f7", hasRings: false },
    ],
    []
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (rocketRef.current) {
      rocketRef.current.position.lerp(rocketPosition, 0.05);
      const vel = rocketPosition.clone().sub(rocketRef.current.position);
      rocketRef.current.rotation.x = THREE.MathUtils.lerp(rocketRef.current.rotation.x, vel.y * 0.1, 0.05);
      rocketRef.current.rotation.z = THREE.MathUtils.lerp(rocketRef.current.rotation.z, -vel.x * 0.1, 0.05);

      const engine = rocketRef.current.children.find((c) => c.userData.isEngine) as THREE.Mesh;
      if (engine?.material) {
        (engine.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 12) * 0.4;
      }
    }

    // Slowly rotate planets
    planetRefs.current.forEach((ref, i) => {
      if (ref) ref.rotation.y = time * 0.05 * (i + 1);
    });
  });

  return (
    <group>
      {/* Planets */}
      {planets.map((planet, i) => {
        if (t < i * 0.2) return null;
        return (
          <group key={i} ref={(el) => { planetRefs.current[i] = el; }}>
            <mesh position={planet.pos}>
              <sphereGeometry args={[planet.size, 32, 32]} />
              <meshStandardMaterial
                color={planet.color}
                emissive={planet.color}
                emissiveIntensity={0.15}
                roughness={0.8}
              />
            </mesh>
            {/* Atmosphere glow */}
            <mesh position={planet.pos}>
              <sphereGeometry args={[planet.size * 1.18, 16, 16]} />
              <meshBasicMaterial color={planet.color} transparent opacity={0.07} side={THREE.BackSide} />
            </mesh>
            {/* Rings (Saturn-style) */}
            {planet.hasRings && (
              <group position={planet.pos} rotation={[Math.PI / 4, 0, 0.3]}>
                <mesh>
                  <torusGeometry args={[planet.size * 1.8, planet.size * 0.45, 2, 64]} />
                  <meshBasicMaterial color="#c8a96e" transparent opacity={0.55} side={THREE.DoubleSide} />
                </mesh>
                <mesh>
                  <torusGeometry args={[planet.size * 2.3, planet.size * 0.2, 2, 64]} />
                  <meshBasicMaterial color="#b08050" transparent opacity={0.3} side={THREE.DoubleSide} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* Rocket */}
      <group ref={rocketRef} position={rocketPosition} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.5, 2.5, 8]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.7} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]} position={[0, -0.8, 0.38]}>
            <boxGeometry args={[0.12, 0.75, 0.4]} />
            <meshStandardMaterial color="#dc2626" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.3, 0.43]}>
          <circleGeometry args={[0.18, 16]} />
          <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.6} />
        </mesh>
        {/* Engine glow */}
        <mesh position={[0, -1.45, 0]} userData={{ isEngine: true }}>
          <sphereGeometry args={[0.38, 8, 8]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.85} />
        </mesh>
        <TrailParticles />
      </group>

      {/* Glowing orbit trail showing the route already traveled */}
      {t > 0.02 && <JourneyTrail points={orbitTrail} color="#60a5fa" opacity={0.45} />}

      {t > 0.8 && <WarpLines />}
    </group>
  );
}

function TrailParticles() {
  const count = 25;
  // Store stable offsets — never call Math.random() inside useFrame!
  const points = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        offset: i * 0.12,
        speed: 0.5 + i * 0.035,
        xOff: (i % 5 - 2) * 0.09,
        yOff: (Math.floor(i / 5) - 2) * 0.09,
      })),
    []
  );

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    points.forEach((p, i) => {
      const z = -1.2 - ((p.offset + time * p.speed) % 2.8);
      const s = 0.07 + Math.sin(time * 4 + i) * 0.03;
      mat.makeScale(s, s, s);
      mat.setPosition(p.xOff, p.yOff, z);
      meshRef.current!.setMatrixAt(i, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.05, 4, 4]} />
      <meshBasicMaterial color="#fb923c" transparent opacity={0.75} />
    </instancedMesh>
  );
}

function WarpLines() {
  const count = 70;
  const lines = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 70,
        y: (Math.random() - 0.5) * 70,
        z: -Math.random() * 100,
        speed: 3 + Math.random() * 5,
        length: 2.5 + Math.random() * 5,
      })),
    []
  );

  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((line, i) => {
      line.position.z += lines[i].speed;
      if (line.position.z > 15) line.position.z = -100;
    });
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, line.y, line.z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, line.length]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}
