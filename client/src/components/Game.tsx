import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

import CarWithPhysics from './CarWithPhysics';
import Road from './Road';
import EnvironmentProgressive from './EnvironmentProgressive';
import RoadSigns from './RoadSigns';

import { useGameStore } from '@/lib/stores/useGameStore';

export default function Game() {
  const { stats, gamePhase } = useGameStore();
  
  // Dynamic lighting based on environment
  const lightingConfig = useMemo(() => {
    if (stats.score >= 500 || stats.level >= 5) {
      return {
        sunColor: '#4444ff',
        sunIntensity: 0.3,
        ambientIntensity: 0.2,
        hemisphereIntensity: 0.3,
        bloomIntensity: 1.5
      };
    } else if (stats.score >= 250 || stats.level >= 3) {
      return {
        sunColor: '#ffd700',
        sunIntensity: 0.8,
        ambientIntensity: 0.5,
        hemisphereIntensity: 0.6,
        bloomIntensity: 0.8
      };
    } else {
      return {
        sunColor: '#ffffff',
        sunIntensity: 1.2,
        ambientIntensity: 0.4,
        hemisphereIntensity: 0.8,
        bloomIntensity: 0.5
      };
    }
  }, [stats.score, stats.level]);

  // Camera follow system
  useFrame((state) => {
    // Smooth camera follow
    const targetPosition = new THREE.Vector3(0, 8, 12 + stats.speed * 0.1);
    state.camera.position.lerp(targetPosition, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  if (gamePhase === 'loading') {
    return (
      <group>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <EnvironmentProgressive />
        
        {/* Loading text */}
        <mesh position={[0, 5, 0]}>
          <planeGeometry args={[8, 2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>
    );
  }

  return (
    <>
      {/* Enhanced Lighting System */}
      <ambientLight intensity={lightingConfig.ambientIntensity} />
      
      {/* Hemisphere light for realistic sky/ground lighting */}
      <hemisphereLight
        color="#87CEEB"
        groundColor="#4a7c59"
        intensity={lightingConfig.hemisphereIntensity}
      />
      
      {/* Main directional light (sun) */}
      <directionalLight 
        position={[50, 50, 30]} 
        intensity={lightingConfig.sunIntensity}
        color={lightingConfig.sunColor}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light for softer shadows */}
      <directionalLight 
        position={[-30, 20, -10]} 
        intensity={lightingConfig.sunIntensity * 0.3}
        color={lightingConfig.sunColor}
      />
      
      {/* Fog for depth - color changes with environment */}
      <fog attach="fog" args={[
        stats.score >= 500 || stats.level >= 5 ? '#1a1a2e' : 
        stats.score >= 250 || stats.level >= 3 ? '#B0C4DE' : 
        '#87CEEB', 
        30, 
        150
      ]} />
      
      {/* Game World */}
      <EnvironmentProgressive />
      <Road />
      <CarWithPhysics />
      <RoadSigns />
      
      {/* Post-processing Effects for Cinematic Quality */}
      <EffectComposer>
        <Bloom 
          intensity={lightingConfig.bloomIntensity}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          height={300}
        />
        <DepthOfField 
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={3}
        />
        <Vignette 
          offset={0.3}
          darkness={0.5}
        />
      </EffectComposer>
      
      {/* Debug controls (remove in production) */}
      {/* <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} /> */}
    </>
  );
}
