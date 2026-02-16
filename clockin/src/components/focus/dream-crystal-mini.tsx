"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface MiniCrystalProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  color?: string;
  animate?: boolean;
}

function Crystal({ progress, color = "#3B82F6", animate = true }: MiniCrystalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const fillLevel = progress / 100;
  const baseColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;
    const time = state.clock.elapsedTime;

    if (animate) {
      meshRef.current.rotation.y = time * 0.15;
      meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }

    const scale = 0.8 + fillLevel * 0.4;
    const pulse = 1 + Math.sin(time * 2) * 0.03 * (fillLevel + 0.5);
    meshRef.current.scale.setScalar(scale * pulse);
    glowRef.current.scale.setScalar(scale * 1.3);

    if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      meshRef.current.material.emissive = baseColor;
      meshRef.current.material.emissiveIntensity = 0.2 + fillLevel * 0.6;
    }
  });

  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial color={baseColor} transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>

      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={meshRef} castShadow>
          <icosahedronGeometry args={[0.7, 0]} />
          <meshPhysicalMaterial
            color={baseColor}
            metalness={0.2}
            roughness={0.2}
            transmission={0.5}
            thickness={0.5}
            emissive={baseColor}
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>

      <Sparkles count={10} scale={3} size={2} speed={0.4} color={color} />
    </group>
  );
}

export function DreamCrystalMini({ progress, size = "md", color, animate, className }: MiniCrystalProps & { className?: string }) {
  const sizeMap = { sm: 80, md: 120, lg: 160 };
  const pixelSize = sizeMap[size];

  return (
    <div className={cn("", className)} style={{ width: pixelSize, height: pixelSize }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 3, 3]} intensity={0.8} />
        <Crystal progress={progress} size={size} color={color} animate={animate} />
      </Canvas>
    </div>
  );
}
