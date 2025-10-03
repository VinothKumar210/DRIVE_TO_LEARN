import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function Road() {
  const asphaltTexture = useTexture('/textures/asphalt.png');
  
  // Configure texture
  asphaltTexture.wrapS = THREE.RepeatWrapping;
  asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(4, 20);

  return (
    <group>
      {/* Main Road */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 100]} />
        <meshLambertMaterial map={asphaltTexture} />
      </mesh>
      
      {/* Road Markings - Center line */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 100]} />
        <meshLambertMaterial color="#ffff00" />
      </mesh>
      
      {/* Road Markings - Left boundary */}
      <mesh position={[-9, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 100]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      
      {/* Road Markings - Right boundary */}
      <mesh position={[9, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 100]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      
      {/* Answer Path Markings */}
      {/* A - Straight */}
      <mesh position={[0, 0.02, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 4]} />
        <meshLambertMaterial color="#00ff00" transparent opacity={0.7} />
      </mesh>
      
      {/* B - U-turn area */}
      <mesh position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 5, 8]} />
        <meshLambertMaterial color="#ff8800" transparent opacity={0.7} />
      </mesh>
      
      {/* C - Left turn */}
      <mesh position={[-6, 0.02, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 2]} />
        <meshLambertMaterial color="#0088ff" transparent opacity={0.7} />
      </mesh>
      
      {/* D - Right turn */}
      <mesh position={[6, 0.02, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 2]} />
        <meshLambertMaterial color="#ff0088" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}
