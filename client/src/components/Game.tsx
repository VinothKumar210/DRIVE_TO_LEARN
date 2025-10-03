import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

import CarWithPhysics from './CarWithPhysics';
import Road from './Road';
import EnvironmentProgressive from './EnvironmentProgressive';
import RoadSigns from './RoadSigns';
import Traffic from './Traffic';

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
        bloomIntensity: 1.5,
        shadowMapSize: 2048
      };
    } else if (stats.score >= 250 || stats.level >= 3) {
      return {
        sunColor: '#ffd700',
        sunIntensity: 0.8,
        ambientIntensity: 0.5,
        hemisphereIntensity: 0.6,
        bloomIntensity: 0.8,
        shadowMapSize: 2048
      };
    } else {
      return {
        sunColor: '#ffffff',
        sunIntensity: 1.2,
        ambientIntensity: 0.4,
        hemisphereIntensity: 0.8,
        bloomIntensity: 0.5,
        shadowMapSize: 2048
      };
    }
  }, [stats.score, stats.level]);

  // Racing game camera follow system
  useFrame((state) => {
    // Find the car in the scene
    const car = state.scene.getObjectByName('player-car');
    if (!car) return;
    
    // Dynamic camera position based on speed (like racing games)
    const speedFactor = Math.min(stats.speed / 20, 1);
    const cameraDistance = 12 + speedFactor * 4;
    const cameraHeight = 8 + speedFactor * 2;
    
    // Get car's forward vector from its rotation
    const carForward = new THREE.Vector3(0, 0, -1);
    carForward.applyQuaternion(car.quaternion);
    
    // Camera position: behind the car (opposite of forward direction)
    const cameraOffset = carForward.clone().multiplyScalar(-cameraDistance);
    const targetPosition = new THREE.Vector3(
      car.position.x + cameraOffset.x,
      car.position.y + cameraHeight,
      car.position.z + cameraOffset.z
    );
    
    // Look at point: slightly ahead of the car when moving fast
    const lookAheadOffset = carForward.clone().multiplyScalar(speedFactor * 3);
    const targetLookAt = new THREE.Vector3(
      car.position.x + lookAheadOffset.x,
      car.position.y + 1,
      car.position.z + lookAheadOffset.z
    );
    
    // Smooth camera movement
    state.camera.position.lerp(targetPosition, 0.1);
    state.camera.lookAt(targetLookAt);
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
        shadow-mapSize-width={lightingConfig.shadowMapSize}
        shadow-mapSize-height={lightingConfig.shadowMapSize}
        shadow-camera-far={150}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
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
      <Traffic />
      <RoadSigns />
      
      {/* Post-processing Effects for Cinematic Quality */}
      <EffectComposer>
        <Bloom 
          intensity={lightingConfig.bloomIntensity * 0.6}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.9}
          height={300}
        />
        <Vignette 
          offset={0.5}
          darkness={0.3}
        />
      </EffectComposer>
      
      {/* Debug controls (remove in production) */}
      {/* <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} /> */}
    </>
  );
}
