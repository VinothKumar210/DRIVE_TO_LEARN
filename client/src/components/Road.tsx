import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';

export default function Road() {
  const asphaltTexture = useTexture('/textures/asphalt.png');
  
  // Configure texture for realistic road appearance
  useMemo(() => {
    asphaltTexture.wrapS = THREE.RepeatWrapping;
    asphaltTexture.wrapT = THREE.RepeatWrapping;
    asphaltTexture.repeat.set(6, 40);
    asphaltTexture.anisotropy = 16;
  }, [asphaltTexture]);

  return (
    <group>
      {/* Main Road - Enhanced with better material */}
      <mesh receiveShadow castShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 150]} />
        <meshStandardMaterial 
          map={asphaltTexture}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Road Markings - Center line (dashed) */}
      {Array.from({ length: 30 }, (_, i) => (
        <mesh key={`center-${i}`} position={[0, 0.01, i * 5 - 75]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 2]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
        </mesh>
      ))}
      
      {/* Road Markings - Left boundary */}
      <mesh position={[-11, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 150]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Road Markings - Right boundary */}
      <mesh position={[11, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 150]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Answer Path Markings - Enhanced with glow */}
      {/* A - Straight (Green) */}
      <mesh position={[0, 0.02, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 5]} />
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00"
          emissiveIntensity={0.5}
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* B - U-turn area (Orange) */}
      <mesh position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 6, 32]} />
        <meshStandardMaterial 
          color="#ff8800" 
          emissive="#ff8800"
          emissiveIntensity={0.5}
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* C - Left turn (Blue) */}
      <mesh position={[-7, 0.02, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial 
          color="#0088ff" 
          emissive="#0088ff"
          emissiveIntensity={0.5}
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* D - Right turn (Pink) */}
      <mesh position={[7, 0.02, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial 
          color="#ff0088" 
          emissive="#ff0088"
          emissiveIntensity={0.5}
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Road Shoulders */}
      <mesh receiveShadow position={[-14, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 150]} />
        <meshStandardMaterial color="#3a5a40" roughness={0.9} />
      </mesh>
      <mesh receiveShadow position={[14, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 150]} />
        <meshStandardMaterial color="#3a5a40" roughness={0.9} />
      </mesh>
    </group>
  );
}
