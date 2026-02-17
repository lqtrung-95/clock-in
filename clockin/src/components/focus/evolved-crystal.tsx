"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Trail } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import type { CrystalShape, CrystalColor, CrystalTheme } from "@/types/xp-system";
import { getColorHex, CRYSTAL_THEMES } from "@/data/crystal-configs";

interface CrystalMeshProps {
  shape: CrystalShape;
  color: CrystalColor;
  theme: CrystalTheme;
  level: number;
  animate?: boolean;
  progress?: number;
}

function CrystalMesh({ shape, color, theme, level, animate = true, progress = 0 }: CrystalMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const baseColor = useMemo(() => new THREE.Color(getColorHex(color)), [color]);
  const fillLevel = progress / 100;

  // Get theme config
  const themeConfig = CRYSTAL_THEMES.find(t => t.theme === theme) || CRYSTAL_THEMES[0];

  // Determine geometry based on shape
  const geometry = useMemo(() => {
    switch (shape) {
      case 'dodecahedron':
        return new THREE.DodecahedronGeometry(0.7, 0);
      case 'octahedron':
        return new THREE.OctahedronGeometry(0.8, 0);
      case 'tetrahedron':
        return new THREE.TetrahedronGeometry(0.9, 0);
      case 'torus_knot':
        return new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16);
      case 'icosahedron':
      default:
        return new THREE.IcosahedronGeometry(0.7, 0);
    }
  }, [shape]);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;
    const time = state.clock.elapsedTime;

    if (animate) {
      // Rotation speed increases with level
      const rotationSpeed = 0.15 + (level * 0.01);
      meshRef.current.rotation.y = time * rotationSpeed;
      meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;

      // Floating animation
      meshRef.current.position.y = Math.sin(time * 0.5) * 0.1;
    }

    // Pulsing based on progress
    const pulse = 1 + Math.sin(time * 2) * 0.03 * (fillLevel + 0.5);
    const baseScale = 0.8 + (level * 0.02);
    meshRef.current.scale.setScalar(baseScale * pulse);
    glowRef.current.scale.setScalar(baseScale * 1.3);

    // Update emissive intensity
    if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      meshRef.current.material.emissiveIntensity = 0.2 + fillLevel * 0.6;
    }
  });

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main crystal */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={meshRef} castShadow geometry={geometry}>
          <meshPhysicalMaterial
            color={baseColor}
            metalness={0.2}
            roughness={0.2}
            transmission={0.5}
            thickness={0.5}
            emissive={baseColor}
            emissiveIntensity={0.3}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>

      {/* Level-based particle effects */}
      <Sparkles
        count={Math.min(10 + level * 2, 30)}
        scale={3 + level * 0.1}
        size={2}
        speed={0.4}
        color={themeConfig.particleColor}
      />

      {/* Orbit rings for higher levels */}
      {level >= 5 && (
        <OrbitRings color={baseColor} level={level} />
      )}

      {/* Energy aura for legendary levels */}
      {level >= 25 && (
        <EnergyAura color={baseColor} intensity={themeConfig.glowIntensity} />
      )}
    </group>
  );
}

function OrbitRings({ color, level }: { color: THREE.Color; level: number }) {
  const ringCount = Math.min(Math.floor((level - 5) / 5) + 1, 3);

  return (
    <>
      {Array.from({ length: ringCount }).map((_, i) => (
        <OrbitRing
          key={i}
          color={color}
          radius={1.5 + i * 0.3}
          speed={0.5 - i * 0.1}
          tilt={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        />
      ))}
    </>
  );
}

function OrbitRing({
  color,
  radius,
  speed,
  tilt,
}: {
  color: THREE.Color;
  radius: number;
  speed: number;
  tilt: [number, number, number];
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z = state.clock.elapsedTime * speed;
  });

  return (
    <mesh ref={ringRef} rotation={tilt}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

function EnergyAura({ color, intensity }: { color: THREE.Color; intensity: number }) {
  const auraRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!auraRef.current) return;
    const scale = 1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    auraRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={auraRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={intensity * 0.2}
      />
    </mesh>
  );
}

interface EvolvedCrystalProps {
  level?: number;
  progress?: number;
  shape?: CrystalShape;
  color?: CrystalColor;
  theme?: CrystalTheme;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

export function EvolvedCrystal({
  level = 1,
  progress = 0,
  shape = "icosahedron",
  color = "blue",
  theme = "default",
  size = "md",
  animate = true,
  className,
}: EvolvedCrystalProps) {
  const sizeMap = { sm: 200, md: 320, lg: 480 };
  const pixelSize = sizeMap[size];

  return (
    <div
      className={cn("relative", className)}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 3]} intensity={0.8} />
        <pointLight position={[-3, -3, -3]} color={getColorHex(color)} intensity={0.5} />

        <CrystalMesh
          shape={shape}
          color={color}
          theme={theme}
          level={level}
          animate={animate}
          progress={progress}
        />
      </Canvas>

      {/* Level badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
        <span className="text-xs font-medium text-white">Level {level}</span>
      </div>
    </div>
  );
}
