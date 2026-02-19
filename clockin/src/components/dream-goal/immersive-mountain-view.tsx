"use client";

import { Suspense, useMemo, useRef, memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sky, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing";
import { MountainClimbScene } from "./themes/mountain-climb-scene";
import { JourneyTrail, useMountainTrailPoints } from "./shared/journey-trail";
import * as THREE from "three";

interface ImmersiveMountainViewProps {
  progress: number;
  title: string;
  onClose: () => void;
}

/** Sun position shifts from dawn (0%) → noon (50%) → dusk (100%) */
function useSunPosition(progress: number): [number, number, number] {
  return useMemo(() => {
    const t = progress / 100;
    const elevation = Math.sin(t * Math.PI) * 0.65 + 0.04; // low→high→low
    const lateral = (t - 0.5) * 18;
    return [lateral, elevation * 12, 5];
  }, [progress]);
}

/** Slow-drifting cloud mesh */
function Cloud({ position, speed, scale }: { position: [number, number, number]; speed: number; scale: number }) {
  const ref = useRef<THREE.Group>(null);
  const base = useMemo(() => position[0], [position]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = base + Math.sin(clock.getElapsedTime() * speed * 0.1) * 8;
    }
  });

  return (
    <group ref={ref} position={position}>
      {[
        { x: 0, y: 0, z: 0, r: 2.8 },
        { x: 2.5, y: 0.4, z: 0.5, r: 2.2 },
        { x: -2.2, y: 0.3, z: -0.3, r: 2.0 },
        { x: 0.8, y: 1.0, z: 0, r: 1.8 },
      ].map((s, i) => (
        <mesh key={i} position={[s.x * scale, s.y * scale, s.z * scale]}>
          <sphereGeometry args={[s.r * scale, 7, 7]} />
          <meshStandardMaterial color="white" transparent opacity={0.55} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

const CLOUDS: { pos: [number, number, number]; speed: number; scale: number }[] = [
  { pos: [-18, 14, -15], speed: 0.8, scale: 1.1 },
  { pos: [20,  16, -20], speed: 0.5, scale: 1.4 },
  { pos: [-8,  18, -30], speed: 1.1, scale: 0.9 },
  { pos: [12,  12, -10], speed: 0.7, scale: 1.0 },
];

/** Subtle wind streaks — thin cylinder instances */
function WindParticles({ visible }: { visible: boolean }) {
  const count = 30;
  const particles = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 40, y: 4 + Math.random() * 20,
    z: (Math.random() - 0.5) * 40, speed: 0.8 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2,
  })), []);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !visible) return;
    const t = clock.getElapsedTime();
    particles.forEach((p, i) => {
      const x = ((p.x + t * p.speed * 2) % 40) - 20;
      const y = p.y + Math.sin(t * 0.3 + p.phase) * 0.4;
      mat.makeRotationZ(Math.PI / 2);
      mat.setPosition(x, y, p.z);
      meshRef.current!.setMatrixAt(i, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!visible) return null;
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.015, 0.015, 3 + Math.random() * 2]} />
      <meshBasicMaterial color="#e0f2fe" transparent opacity={0.25} />
    </instancedMesh>
  );
}

function SceneContent({ progress }: { progress: number }) {
  const t = progress / 100;
  const sunPosition = useSunPosition(progress);
  const trailPoints = useMountainTrailPoints(t);

  return (
    <>
      {/* Procedural sky — shifts from dawn to dusk with progress */}
      <Sky distance={450000} sunPosition={sunPosition} turbidity={8} rayleigh={t < 0.1 ? 3 : 1.5} />

      {/* Atmospheric fog for depth */}
      <fog attach="fog" args={["#d4e8f5", 40, 130]} />

      {/* Lighting matches sun position */}
      <ambientLight intensity={0.3 + t * 0.25} color={t < 0.2 ? "#ffcba4" : "#fff8f0"} />
      <directionalLight
        position={sunPosition} intensity={1.0 + t * 0.4} color={t < 0.15 ? "#ff9a3c" : "#fffef0"}
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120} shadow-camera-left={-30} shadow-camera-right={30}
        shadow-camera-top={30} shadow-camera-bottom={-30}
      />
      <hemisphereLight args={[t > 0.7 ? "#87ceeb" : "#b0c4de", "#4a5568", 0.35 + t * 0.2]} />

      {/* Clouds */}
      {CLOUDS.map((c, i) => <Cloud key={i} position={c.pos} speed={c.speed} scale={c.scale} />)}

      {/* Wind streaks at higher altitude */}
      <WindParticles visible={t > 0.3} />

      {/* Mountain scene (terrain + climber + snow + sparkles) */}
      <Suspense fallback={null}>
        <MountainClimbScene progress={progress} milestone={Math.floor(progress / 20)} />
      </Suspense>

      {/* Golden journey trail */}
      {t > 0.02 && <JourneyTrail points={trailPoints} color="#fbbf24" opacity={0.7} />}

      {/* Post-processing: soft bloom + subtle depth of field */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.3} intensity={0.8} mipmapBlur />
        <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={2} />
      </EffectComposer>
    </>
  );
}

export const ImmersiveMountainView = memo(function ImmersiveMountainView({
  progress, title, onClose,
}: ImmersiveMountainViewProps) {
  return (
    <div className="fixed inset-0 z-50">
      <Canvas
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        camera={{ position: [18, 12, 28], fov: 48 }}
        shadows
      >
        <OrbitControls
          enablePan={false}
          minDistance={12} maxDistance={65}
          maxPolarAngle={Math.PI / 2.1}
          dampingFactor={0.06}
          enableDamping
          autoRotate={false}
        />
        <SceneContent progress={progress} />
      </Canvas>

      {/* Minimal overlay — title + close */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5">
        <div className="pointer-events-auto">
          <p className="text-xs font-medium uppercase tracking-widest text-white/50">Dream Goal</p>
          <h2 className="text-xl font-bold text-white drop-shadow-lg">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="pointer-events-auto rounded-full bg-black/30 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition hover:bg-black/50"
        >
          Close
        </button>
      </div>

      {/* Bottom hint */}
      <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/40">
        Drag to explore · Scroll to zoom
      </p>
    </div>
  );
});
