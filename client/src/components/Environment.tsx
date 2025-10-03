import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/lib/stores/useGameStore';
import { useMemo } from 'react';

export default function Environment() {
  const grassTexture = useTexture('/textures/grass.png');
  const { stats } = useGameStore();
  
  // Configure grass texture
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 10);

  // Generate obstacles based on level
  const obstacles = useMemo(() => {
    const obstacleCount = Math.min(stats.level * 2, 10);
    const positions: [number, number, number][] = [];
    
    for (let i = 0; i < obstacleCount; i++) {
      positions.push([
        (Math.random() - 0.5) * 15, // x: road width
        0.5, // y: height
        Math.random() * 30 - 40 // z: ahead of player
      ]);
    }
    
    return positions;
  }, [stats.level]);

  return (
    <group>
      {/* Ground/Grass */}
      <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshLambertMaterial map={grassTexture} color="#4a7c59" />
      </mesh>
      
      {/* Sky */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[100, 16, 16]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>
      
      {/* Trees (simple) */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 40 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Tree trunk */}
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[0.3, 0.5, 4]} />
              <meshLambertMaterial color="#8b4513" />
            </mesh>
            {/* Tree leaves */}
            <mesh position={[0, 5, 0]}>
              <sphereGeometry args={[2, 8, 8]} />
              <meshLambertMaterial color="#228b22" />
            </mesh>
          </group>
        );
      })}
      
      {/* Traffic Obstacles */}
      {obstacles.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Traffic Cone */}
          <mesh>
            <coneGeometry args={[0.3, 1, 8]} />
            <meshLambertMaterial color="#ff6600" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <ringGeometry args={[0.2, 0.35, 8]} />
            <meshLambertMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
      
      {/* Buildings (simple) */}
      {Array.from({ length: 8 }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (20 + Math.random() * 10);
        const z = (i - 4) * 15;
        const height = 5 + Math.random() * 10;
        
        return (
          <mesh key={i} position={[x, height / 2, z]}>
            <boxGeometry args={[4, height, 6]} />
            <meshLambertMaterial color={`hsl(${Math.random() * 60 + 200}, 30%, 70%)`} />
          </mesh>
        );
      })}
    </group>
  );
}
