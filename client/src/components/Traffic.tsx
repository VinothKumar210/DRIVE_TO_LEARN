import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/lib/stores/useGameStore';

interface TrafficCarProps {
  position: [number, number, number];
  color: string;
  speed: number;
  lane: number;
}

function TrafficCar({ position: initialPosition, color, speed, lane }: TrafficCarProps) {
  const carRef = useRef<THREE.Group>(null);
  const positionRef = useRef(initialPosition[2]);

  useFrame(() => {
    if (!carRef.current) return;

    positionRef.current += speed;
    
    if (positionRef.current > 80) {
      positionRef.current = -80;
    } else if (positionRef.current < -80) {
      positionRef.current = 80;
    }

    carRef.current.position.set(lane, 0.5, positionRef.current);
  });

  return (
    <group ref={carRef} position={initialPosition}>
      {/* Car Body */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.4, 0.6, 2.8]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>
      
      {/* Car Roof */}
      <mesh castShadow receiveShadow position={[0, 0.75, -0.2]}>
        <boxGeometry args={[1.1, 0.4, 1.4]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      
      {/* Wheels */}
      {[
        [-0.65, 0, 1],
        [0.65, 0, 1],
        [-0.65, 0, -1],
        [0.65, 0, -1]
      ].map((pos, i) => (
        <mesh 
          key={`wheel-${i}`}
          castShadow
          position={pos as [number, number, number]} 
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.25, 12]} />
          <meshStandardMaterial 
            color="#222222"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      ))}
      
      {/* Headlights or taillights based on direction */}
      {speed > 0 ? (
        <>
          <mesh position={[-0.4, 0.35, 1.4]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0.4, 0.35, 1.4]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.5}
            />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-0.4, 0.35, -1.4]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial 
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0.4, 0.35, -1.4]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial 
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.4}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

export default function Traffic() {
  const { stats } = useGameStore();
  
  const trafficCars = useMemo(() => {
    const carCount = Math.min(3 + stats.level, 12);
    const colors = ['#3366ff', '#44aa44', '#ffaa00', '#aa44aa', '#44aaaa', '#ff6644'];
    const lanes = [-6, -3, 3, 6];
    
    return Array.from({ length: carCount }, (_, i) => {
      const lane = lanes[i % lanes.length];
      const color = colors[i % colors.length];
      const speed = (0.05 + Math.random() * 0.1) * (i % 2 === 0 ? 1 : -1);
      const startZ = (i * 15) - 60;
      
      return {
        id: `traffic-${i}`,
        position: [lane, 0.5, startZ] as [number, number, number],
        color,
        speed,
        lane
      };
    });
  }, [stats.level]);

  if (stats.level < 2) {
    return null;
  }

  return (
    <group>
      {trafficCars.map((car) => (
        <TrafficCar
          key={car.id}
          position={car.position}
          color={car.color}
          speed={car.speed}
          lane={car.lane}
        />
      ))}
    </group>
  );
}
