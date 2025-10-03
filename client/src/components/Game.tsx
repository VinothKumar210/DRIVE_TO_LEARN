import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import CarWithPhysics from './CarWithPhysics';
import Road from './Road';
import EnvironmentProgressive from './EnvironmentProgressive';
import RoadSigns from './RoadSigns';
import GameUI from './GameUI';
import QuestionDisplay from './QuestionDisplay';

import { useGameStore } from '@/lib/stores/useGameStore';
import { useQuestionStore } from '@/lib/stores/useQuestionStore';

export default function Game() {
  const { stats, gamePhase } = useGameStore();
  const { currentQuestion } = useQuestionStore();

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
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fog for depth - color changes with environment */}
      <fog attach="fog" args={[
        stats.score >= 500 || stats.level >= 5 ? '#1a1a2e' : 
        stats.score >= 250 || stats.level >= 3 ? '#B0C4DE' : 
        '#87CEEB', 
        20, 
        100
      ]} />
      
      {/* Game World */}
      <EnvironmentProgressive />
      <Road />
      <CarWithPhysics />
      <RoadSigns />
      
      {/* UI Overlays */}
      <GameUI />
      <QuestionDisplay />
      
      {/* Debug controls (remove in production) */}
      {/* <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} /> */}
    </>
  );
}
