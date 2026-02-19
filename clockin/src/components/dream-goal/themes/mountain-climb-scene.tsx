"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { JourneyTrail, useMountainTrailPoints } from "../shared/journey-trail";

interface MountainClimbSceneProps {
  progress: number;
  milestone: number;
}

export function MountainClimbScene({ progress }: MountainClimbSceneProps) {
  const climberRef = useRef<THREE.Group>(null);
  const t = progress / 100;
  const trailPoints = useMountainTrailPoints(t);

  // Procedural terrain with vertex colors (green → rocky → snow)
  const { geometry: terrainGeometry, material: terrainMaterial } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 60, 80, 80);
    const positions = geo.attributes.position.array as Float32Array;
    const colors = new Float32Array(positions.length);

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const dist = Math.sqrt(x * x + y * y);
      // Mountain height formula
      const h = Math.max(
        0,
        20 - dist * 0.48 + Math.sin(x * 0.3) * Math.cos(y * 0.3) * 2.5 + Math.sin(x * 0.7 + y * 0.5) * 1.2
      );
      positions[i + 2] = h;

      // Vertex colors based on height
      if (h < 1.5) {
        // Grass
        colors[i] = 0.28; colors[i + 1] = 0.65; colors[i + 2] = 0.22;
      } else if (h < 6) {
        // Shrubs / lower rocky
        const blend = (h - 1.5) / 4.5;
        colors[i] = 0.28 + blend * 0.32; colors[i + 1] = 0.65 - blend * 0.28; colors[i + 2] = 0.22 - blend * 0.1;
      } else if (h < 12) {
        // Rocky grey
        colors[i] = 0.52; colors[i + 1] = 0.48; colors[i + 2] = 0.44;
      } else if (h < 17) {
        // High rock / dark grey
        colors[i] = 0.64; colors[i + 1] = 0.62; colors[i + 2] = 0.60;
      } else {
        // Snow cap — blue-white
        const blend = Math.min((h - 17) / 5, 1);
        colors[i] = 0.88 + blend * 0.08; colors[i + 1] = 0.92 + blend * 0.04; colors[i + 2] = 0.96 + blend * 0.04;
      }
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0.05 });
    return { geometry: geo, material: mat };
  }, []);

  // Climber path along the spiral
  const climberPosition = useMemo(() => {
    const angle = t * Math.PI * 3;
    const radius = 15 * (1 - t * 0.5);
    return new THREE.Vector3(Math.cos(angle) * radius, t * 25 + 2, Math.sin(angle) * radius);
  }, [t]);

  useFrame(() => {
    if (climberRef.current) {
      climberRef.current.position.lerp(climberPosition, 0.05);
      climberRef.current.lookAt(0, climberRef.current.position.y, 0);
    }
  });

  return (
    <group>
      {/* Vertex-colored mountain terrain */}
      <mesh geometry={terrainGeometry} material={terrainMaterial} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow />

      {/* Climber */}
      <group ref={climberRef} position={climberPosition}>
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshStandardMaterial color="#f97316" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#fed7aa" />
        </mesh>
        <mesh position={[0, 0.2, -0.32]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.2]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.8} />
        </mesh>
      </group>

      {/* Summit flag */}
      {t >= 0.99 && (
        <group position={[0, 20, 0]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 4]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
          <mesh position={[0.5, 3.5, 0]}>
            <boxGeometry args={[1, 0.6, 0.05]} />
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.3} />
          </mesh>
          <Sparkles position={[0, 2, 0]} scale={5} />
        </group>
      )}

      {/* Milestone markers */}
      {[0.25, 0.5, 0.75].map((mt) => (
        <MilestoneMarker key={mt} milestoneProgress={mt} reached={t >= mt} />
      ))}

      {/* Glowing trail showing the path already climbed */}
      {t > 0.02 && <JourneyTrail points={trailPoints} color="#fbbf24" opacity={0.65} />}

      {/* Snow particles at high altitude */}
      {t > 0.6 && <SnowParticles intensity={t} />}
    </group>
  );
}

function MilestoneMarker({ milestoneProgress, reached }: { milestoneProgress: number; reached: boolean }) {
  const angle = milestoneProgress * Math.PI * 3;
  const radius = 15 * (1 - milestoneProgress * 0.5);
  const pos: [number, number, number] = [
    Math.cos(angle) * radius,
    milestoneProgress * 25,
    Math.sin(angle) * radius,
  ];

  return (
    <group position={pos}>
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 1.8]} />
        <meshStandardMaterial color={reached ? "#22c55e" : "#6b7280"} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={reached ? "#22c55e" : "#6b7280"}
          emissive={reached ? "#16a34a" : "#000000"}
          emissiveIntensity={reached ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
}

function SnowParticles({ intensity }: { intensity: number }) {
  const count = Math.floor(intensity * 60);
  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 30,
        y: 5 + Math.random() * 25,
        z: (Math.random() - 0.5) * 30,
        speed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      })),
    [count]
  );

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    particles.forEach((p, i) => {
      const y = ((p.y - time * p.speed) % 30) + 5;
      const s = 0.06 + Math.sin(time + p.phase) * 0.02;
      mat.makeScale(s, s, s);
      mat.setPosition(p.x + Math.sin(time * 0.4 + p.phase) * 0.5, y, p.z);
      meshRef.current!.setMatrixAt(i, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.08, 4, 4]} />
      <meshBasicMaterial color="#e0f2fe" transparent opacity={0.75} />
    </instancedMesh>
  );
}

function Sparkles({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const points = useMemo(
    () =>
      Array.from({ length: 35 }, () => ({
        pos: [(Math.random() - 0.5) * scale * 2, Math.random() * scale, (Math.random() - 0.5) * scale * 2] as [number, number, number],
        speed: 0.5 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      })),
    [scale]
  );

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    points.forEach((p, i) => {
      const y = p.pos[1] + Math.sin(time * p.speed + p.phase) * 0.6;
      const s = 0.5 + Math.sin(time * 2.5 + p.phase) * 0.3;
      mat.makeScale(s, s, s);
      mat.setPosition(p.pos[0], y, p.pos[2]);
      meshRef.current!.setMatrixAt(i, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]} position={position}>
      <sphereGeometry args={[0.1, 6, 6]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} />
    </instancedMesh>
  );
}
