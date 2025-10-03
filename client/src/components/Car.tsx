import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/lib/stores/useGameStore';
import { useQuestionStore } from '@/lib/stores/useQuestionStore';

enum Controls {
  forward = 'forward',
  backward = 'backward', 
  left = 'left',
  right = 'right',
  brake = 'brake'
}

export default function Car() {
  const carRef = useRef<THREE.Group>(null);
  const [subscribe, get] = useKeyboardControls<Controls>();
  
  const { stats, updateSpeed, incrementCorrect, incrementQuestion, updateScore } = useGameStore();
  const { currentQuestion, selectAnswer, showAnswer, selectedAnswer } = useQuestionStore();

  const velocity = useRef(new THREE.Vector3());
  const maxSpeed = 15 + stats.level * 2; // Speed increases with level
  const acceleration = 0.3;
  const friction = 0.95;
  const turnSpeed = 0.05;

  useEffect(() => {
    // Log controls for debugging
    const unsubscribe = subscribe(
      (state) => ({ forward: state.forward, left: state.left, right: state.right }),
      (state) => {
        if (state.forward || state.left || state.right) {
          console.log('Car controls:', state);
        }
      }
    );
    return unsubscribe;
  }, [subscribe]);

  useFrame(() => {
    if (!carRef.current) return;

    const controls = get();
    const car = carRef.current;

    // Handle movement
    if (controls.forward) {
      velocity.current.z -= acceleration;
    }
    if (controls.backward) {
      velocity.current.z += acceleration * 0.5;
    }
    if (controls.brake) {
      velocity.current.multiplyScalar(0.8);
    }

    // Handle turning (only when moving)
    const speed = velocity.current.length();
    if (speed > 0.5) {
      if (controls.left) {
        car.rotation.y += turnSpeed;
        velocity.current.x -= Math.sin(car.rotation.y) * acceleration * 0.5;
      }
      if (controls.right) {
        car.rotation.y -= turnSpeed;
        velocity.current.x += Math.sin(car.rotation.y) * acceleration * 0.5;
      }
    }

    // Apply friction and speed limits
    velocity.current.multiplyScalar(friction);
    velocity.current.clampLength(0, maxSpeed);
    
    // Update position
    car.position.add(velocity.current.clone().multiplyScalar(0.1));
    
    // Update game stats
    updateSpeed(speed);
    
    // Check for answer selection based on position/rotation
    if (currentQuestion && !selectedAnswer) {
      checkAnswerSelection(car);
    }

    // Keep car on road bounds
    car.position.x = Math.max(-10, Math.min(10, car.position.x));
  });

  const checkAnswerSelection = (car: THREE.Group) => {
    const position = car.position;
    const rotation = car.rotation.y;
    
    // Define answer zones based on car position and rotation
    let selectedIndex = -1;
    
    // A: Straight (forward movement, minimal rotation)
    if (position.z < -5 && Math.abs(rotation) < 0.3) {
      selectedIndex = 0;
    }
    // B: U-turn (significant rotation > 2.5 radians)
    else if (Math.abs(rotation) > 2.5) {
      selectedIndex = 1;
    }
    // C: Left turn (left position and left rotation)
    else if (position.x < -3 && rotation > 0.8) {
      selectedIndex = 2;
    }
    // D: Right turn (right position and right rotation)
    else if (position.x > 3 && rotation < -0.8) {
      selectedIndex = 3;
    }

    if (selectedIndex >= 0) {
      console.log('Answer selected:', selectedIndex);
      selectAnswer(selectedIndex);
      
      // Update game stats
      incrementQuestion();
      if (selectedIndex === currentQuestion?.correctAnswer) {
        incrementCorrect();
        updateScore(100 * stats.level);
      } else {
        updateScore(-20);
      }
      
      // Show answer feedback
      showAnswer();
      
      // Reset car position after answer
      setTimeout(() => {
        if (carRef.current) {
          carRef.current.position.set(0, 1, 0);
          carRef.current.rotation.y = 0;
          velocity.current.set(0, 0, 0);
        }
      }, 2000);
    }
  };

  return (
    <group ref={carRef} position={[0, 1, 0]}>
      {/* Car Body */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.6, 3]} />
        <meshLambertMaterial color="#ff4444" />
      </mesh>
      
      {/* Car Roof */}
      <mesh castShadow position={[0, 0.8, -0.3]}>
        <boxGeometry args={[1.2, 0.4, 1.5]} />
        <meshLambertMaterial color="#cc2222" />
      </mesh>
      
      {/* Wheels */}
      <mesh castShadow position={[-0.7, 0, 1]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh castShadow position={[0.7, 0, 1]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh castShadow position={[-0.7, 0, -1]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh castShadow position={[0.7, 0, -1]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0, 0.7, 0.8]}>
        <planeGeometry args={[1.2, 0.4]} />
        <meshLambertMaterial color="#4488ff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
