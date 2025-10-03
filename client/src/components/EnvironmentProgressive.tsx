import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/lib/stores/useGameStore';
import { useMemo } from 'react';

type EnvironmentMode = 'highway' | 'city' | 'night';

export default function EnvironmentProgressive() {
  const grassTexture = useTexture('/textures/grass.png');
  const { stats } = useGameStore();
  
  // Configure grass texture
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 10);

  // Determine environment mode based on score and level
  const environmentMode: EnvironmentMode = useMemo(() => {
    if (stats.score >= 500 || stats.level >= 5) return 'night';
    if (stats.score >= 250 || stats.level >= 3) return 'city';
    return 'highway';
  }, [stats.score, stats.level]);

  // Generate obstacles based on level and environment
  const obstacles = useMemo(() => {
    const obstacleCount = Math.min(stats.level * 2, 15);
    const positions: [number, number, number][] = [];
    
    for (let i = 0; i < obstacleCount; i++) {
      positions.push([
        (Math.random() - 0.5) * 15,
        0.5,
        Math.random() * 40 - 50
      ]);
    }
    
    return positions;
  }, [stats.level]);

  // Environment-specific colors and settings
  const envSettings = useMemo(() => {
    switch (environmentMode) {
      case 'highway':
        return {
          skyColor: '#87CEEB',
          groundColor: '#4a7c59',
          ambientIntensity: 0.6,
          directionalIntensity: 1.0,
          fogColor: '#87CEEB',
          buildingCount: 8,
          treeCount: 20
        };
      case 'city':
        return {
          skyColor: '#B0C4DE',
          groundColor: '#5a8c69',
          ambientIntensity: 0.7,
          directionalIntensity: 0.9,
          fogColor: '#B0C4DE',
          buildingCount: 16,
          treeCount: 10
        };
      case 'night':
        return {
          skyColor: '#1a1a2e',
          groundColor: '#2a3c4a',
          ambientIntensity: 0.3,
          directionalIntensity: 0.5,
          fogColor: '#1a1a2e',
          buildingCount: 20,
          treeCount: 5
        };
    }
  }, [environmentMode]);

  // Generate buildings based on environment
  const buildings = useMemo(() => {
    const buildingData: Array<{x: number, z: number, height: number, color: string}> = [];
    
    for (let i = 0; i < envSettings.buildingCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (20 + Math.random() * 10);
      const z = (i - envSettings.buildingCount / 2) * 15;
      const height = environmentMode === 'city' || environmentMode === 'night'
        ? 10 + Math.random() * 20
        : 5 + Math.random() * 10;
      
      let color: string;
      if (environmentMode === 'night') {
        color = `hsl(${Math.random() * 30 + 200}, 20%, 30%)`;
      } else if (environmentMode === 'city') {
        color = `hsl(${Math.random() * 60 + 200}, 40%, 60%)`;
      } else {
        color = `hsl(${Math.random() * 60 + 200}, 30%, 70%)`;
      }
      
      buildingData.push({ x, z, height, color });
    }
    
    return buildingData;
  }, [envSettings.buildingCount, environmentMode]);

  // Generate trees based on environment
  const trees = useMemo(() => {
    const treeData: Array<{x: number, z: number}> = [];
    
    for (let i = 0; i < envSettings.treeCount; i++) {
      const angle = (i / envSettings.treeCount) * Math.PI * 2;
      const radius = 40 + Math.random() * 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      treeData.push({ x, z });
    }
    
    return treeData;
  }, [envSettings.treeCount]);

  return (
    <group>
      {/* Ground/Grass */}
      <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshLambertMaterial map={grassTexture} color={envSettings.groundColor} />
      </mesh>
      
      {/* Sky */}
      <mesh position={[0, 50, 0]}>
        <sphereGeometry args={[100, 16, 16]} />
        <meshBasicMaterial color={envSettings.skyColor} side={THREE.BackSide} />
      </mesh>
      
      {/* Ambient and directional lighting */}
      <ambientLight intensity={envSettings.ambientIntensity} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={envSettings.directionalIntensity}
        castShadow
      />
      
      {/* Night mode - add street lights */}
      {environmentMode === 'night' && (
        <>
          {Array.from({ length: 10 }, (_, i) => {
            const z = (i - 5) * 8;
            return (
              <group key={`light-${i}`}>
                {/* Left side light */}
                <pointLight
                  position={[-8, 4, z]}
                  intensity={1.5}
                  distance={15}
                  color="#ffaa00"
                />
                <mesh position={[-8, 3, z]}>
                  <sphereGeometry args={[0.3, 8, 8]} />
                  <meshBasicMaterial color="#ffaa00" />
                </mesh>
                <mesh position={[-8, 1.5, z]}>
                  <cylinderGeometry args={[0.1, 0.1, 3]} />
                  <meshLambertMaterial color="#333333" />
                </mesh>
                
                {/* Right side light */}
                <pointLight
                  position={[8, 4, z]}
                  intensity={1.5}
                  distance={15}
                  color="#ffaa00"
                />
                <mesh position={[8, 3, z]}>
                  <sphereGeometry args={[0.3, 8, 8]} />
                  <meshBasicMaterial color="#ffaa00" />
                </mesh>
                <mesh position={[8, 1.5, z]}>
                  <cylinderGeometry args={[0.1, 0.1, 3]} />
                  <meshLambertMaterial color="#333333" />
                </mesh>
              </group>
            );
          })}
        </>
      )}
      
      {/* Trees */}
      {trees.map((tree, i) => (
        <group key={`tree-${i}`} position={[tree.x, 0, tree.z]}>
          {/* Tree trunk */}
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.3, 0.5, 4]} />
            <meshLambertMaterial color="#8b4513" />
          </mesh>
          {/* Tree leaves */}
          <mesh position={[0, 5, 0]}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshLambertMaterial color={environmentMode === 'night' ? '#1a4d2e' : '#228b22'} />
          </mesh>
        </group>
      ))}
      
      {/* Buildings */}
      {buildings.map((building, i) => (
        <group key={`building-${i}`} position={[building.x, building.height / 2, building.z]}>
          <mesh>
            <boxGeometry args={[4, building.height, 6]} />
            <meshLambertMaterial color={building.color} />
          </mesh>
          
          {/* Building windows (night mode) */}
          {environmentMode === 'night' && (
            <>
              {Array.from({ length: Math.floor(building.height / 3) }, (_, row) => (
                <group key={`window-row-${row}`}>
                  {Array.from({ length: 2 }, (_, col) => {
                    const isLit = Math.random() > 0.3;
                    return (
                      <mesh
                        key={`window-${row}-${col}`}
                        position={[
                          col === 0 ? -1 : 1,
                          -building.height / 2 + row * 3 + 2,
                          3.1
                        ]}
                      >
                        <planeGeometry args={[0.8, 1.5]} />
                        <meshBasicMaterial 
                          color={isLit ? '#ffff88' : '#333333'} 
                          transparent 
                          opacity={0.9}
                        />
                      </mesh>
                    );
                  })}
                </group>
              ))}
            </>
          )}
        </group>
      ))}
      
      {/* Traffic Obstacles */}
      {obstacles.map((pos, i) => (
        <group key={`obstacle-${i}`} position={pos}>
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
      
      {/* Environment transition notification (UI overlay) */}
      {environmentMode !== 'highway' && (
        <mesh position={[0, 6, -15]}>
          <planeGeometry args={[10, 2]} />
          <meshBasicMaterial 
            color={environmentMode === 'night' ? '#1a1a2e' : '#B0C4DE'} 
            transparent 
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
