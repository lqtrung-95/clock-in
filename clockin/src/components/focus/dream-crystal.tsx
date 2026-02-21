"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface CrystalCoreProps {
  progress: number;
  phase: "idle" | "work" | "break";
  cycle: number;
  totalCycles: number;
  isComplete?: boolean;
}

function CrystalCore({ progress, phase, cycle, totalCycles, isComplete }: CrystalCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Calculate fill level based on progress
  const fillLevel = progress / 100;

  // Color based on phase
  const color = useMemo(() => {
    if (isComplete) return new THREE.Color("#FFD700"); // Gold for complete
    if (phase === "break") return new THREE.Color("#F97316"); // Orange for break
    // Work phase - gradient from blue to cyan based on progress
    const c1 = new THREE.Color("#3B82F6");
    const c2 = new THREE.Color("#06B6D4");
    return c1.lerp(c2, fillLevel);
  }, [phase, fillLevel, isComplete]);

  // Pulse animation
  useFrame((state) => {
    if (!meshRef.current || !innerRef.current || !glowRef.current) return;

    const time = state.clock.elapsedTime;

    // Gentle floating rotation
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.05;

    // Scale pulse based on progress
    const baseScale = 1 + fillLevel * 0.3;
    const pulse = 1 + Math.sin(time * 2) * 0.02 * (fillLevel + 0.5);
    const scale = baseScale * pulse;

    meshRef.current.scale.setScalar(scale);
    innerRef.current.scale.setScalar(scale * 0.85);

    // Cap glow scale so the sphere never fills the entire viewport.
    // Camera is at z=6, FOV=45 (half=22.5°). Sphere geometry radius=1.5.
    // Sphere subtends > half-FOV when effective radius > 6*tan(22.5°)≈2.49.
    // Keep effective radius < 2.0 → glowScale < 2.0/1.5 ≈ 1.33
    const glowScale = scale * Math.min(1.3, 1.1 + fillLevel * 0.2);
    glowRef.current.scale.setScalar(glowScale);

    // Update material color
    if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      meshRef.current.material.emissive = color;
      meshRef.current.material.emissiveIntensity = 0.3 + fillLevel * 0.7;
      meshRef.current.material.color = color;
    }

    if (innerRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      innerRef.current.material.color = color;
      innerRef.current.material.emissive = color;
      innerRef.current.material.emissiveIntensity = 0.5 + fillLevel * 0.5;
    }
  });

  // Celebration effect when complete
  useEffect(() => {
    if (isComplete && meshRef.current) {
      // Burst scale animation
      const tl = meshRef.current.scale;
      const originalScale = tl.x;

      // Quick burst
      const burst = () => {
        if (!meshRef.current) return;
        meshRef.current.scale.setScalar(originalScale * 1.4);
        setTimeout(() => {
          if (meshRef.current) {
            meshRef.current.scale.setScalar(originalScale);
          }
        }, 200);
      };

      burst();
    }
  }, [isComplete]);

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06 + fillLevel * 0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main crystal */}
      <Float
        speed={1.5}
        rotationIntensity={0.1}
        floatIntensity={0.3}
      >
        <mesh ref={meshRef} castShadow receiveShadow>
          <icosahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial
            color={color}
            metalness={0.1}
            roughness={0.1}
            transmission={0.6}
            thickness={1}
            ior={1.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Inner core */}
        <mesh ref={innerRef}>
          <octahedronGeometry args={[0.6, 0]} />
          <meshPhysicalMaterial
            color={color}
            metalness={0.3}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      {/* Orbiting particles representing cycles */}
      {Array.from({ length: totalCycles }).map((_, i) => {
        const angle = (i / totalCycles) * Math.PI * 2;
        const radius = 2.2;
        const completed = i < cycle;

        return (
          <group
            key={i}
            rotation={[0, angle + Date.now() * 0.0001, 0]}
          >
            <mesh position={[radius, 0, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshPhysicalMaterial
                color={completed ? "#22D3EE" : "#64748B"}
                emissive={completed ? "#22D3EE" : "#000000"}
                emissiveIntensity={completed ? 0.8 : 0}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* Sparkles around the crystal */}
      <Sparkles
        count={20 + Math.floor(fillLevel * 30)}
        scale={3.5 + fillLevel * 1}
        size={1 + fillLevel * 1.5}
        speed={0.3 + fillLevel * 0.5}
        color={color.getStyle()}
      />

      {/* Energy rings */}
      <EnergyRings progress={fillLevel} phase={phase} />
    </group>
  );
}

function EnergyRings({ progress, phase }: { progress: number; phase: string }) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  const color = phase === "break" ? "#F97316" : "#3B82F6";

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.3;
      ring1Ref.current.rotation.y = time * 0.2;
      ring1Ref.current.scale.setScalar(1 + Math.sin(time) * 0.05);
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -time * 0.25;
      ring2Ref.current.rotation.z = time * 0.15;
      ring2Ref.current.scale.setScalar(1.3 + Math.cos(time * 0.8) * 0.05);
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = -time * 0.35;
      ring3Ref.current.rotation.z = -time * 0.2;
      ring3Ref.current.scale.setScalar(1.6 + Math.sin(time * 1.2) * 0.05);
    }
  });

  const opacity = 0.1 + progress * 0.2;

  return (
    <>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.3, 0.015, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.7} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.8, 0.01, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.5} />
      </mesh>
    </>
  );
}

function Scene(props: CrystalCoreProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3B82F6" />
      <CrystalCore {...props} />
      <Environment preset="night" background={false} />
    </>
  );
}

interface DreamCrystalProps {
  progress: number;
  phase: "idle" | "work" | "break";
  cycle: number;
  totalCycles: number;
  isComplete?: boolean;
  className?: string;
}

export function DreamCrystal({
  progress,
  phase,
  cycle,
  totalCycles,
  isComplete,
  className,
}: DreamCrystalProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <Scene
          progress={progress}
          phase={phase}
          cycle={cycle}
          totalCycles={totalCycles}
          isComplete={isComplete}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
