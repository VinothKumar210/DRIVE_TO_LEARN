import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { useGameStore } from '@/lib/stores/useGameStore';
import { useQuestionStore } from '@/lib/stores/useQuestionStore';

enum Controls {
  forward = 'forward',
  backward = 'backward', 
  left = 'left',
  right = 'right',
  brake = 'brake'
}

export default function CarWithPhysics() {
  const carRef = useRef<THREE.Group>(null);
  const [subscribe, get] = useKeyboardControls<Controls>();
  
  const { stats, updateSpeed, incrementCorrect, incrementQuestion, updateScore } = useGameStore();
  const { currentQuestion, selectAnswer, showAnswer, selectedAnswer } = useQuestionStore();

  const worldRef = useRef<CANNON.World | null>(null);
  const carBodyRef = useRef<CANNON.Body | null>(null);
  const wheelBodiesRef = useRef<CANNON.Body[]>([]);

  // Physics constants
  const maxSteerVal = 0.5;
  const maxForce = 1500;
  const brakeForce = 100;
  
  useEffect(() => {
    // Initialize Cannon.js physics world
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.defaultContactMaterial.friction = 0.3;
    worldRef.current = world;

    // Create ground
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // Create car body (simple box with higher center of mass)
    const carShape = new CANNON.Box(new CANNON.Vec3(0.75, 0.5, 1.5));
    const carBody = new CANNON.Body({ 
      mass: 150,
      position: new CANNON.Vec3(0, 1.5, 0),
      linearDamping: 0.3,
      angularDamping: 0.5
    });
    carBody.addShape(carShape);
    world.addBody(carBody);
    carBodyRef.current = carBody;

    // Log controls for debugging
    const unsubscribe = subscribe(
      (state) => ({ forward: state.forward, backward: state.backward, left: state.left, right: state.right, brake: state.brake }),
      (state) => {
        if (state.forward || state.backward || state.left || state.right || state.brake) {
          console.log('Car physics controls:', state);
        }
      }
    );

    return () => {
      unsubscribe();
      // Clean up physics world
      if (worldRef.current) {
        worldRef.current.bodies.forEach(body => {
          worldRef.current?.removeBody(body);
        });
      }
    };
  }, [subscribe]);

  useFrame((_, delta) => {
    if (!carRef.current || !worldRef.current || !carBodyRef.current) return;

    const controls = get();
    const carBody = carBodyRef.current;

    // Apply forces based on controls
    const forwardVector = new CANNON.Vec3(0, 0, -1);
    carBody.quaternion.vmult(forwardVector, forwardVector);

    if (controls.forward) {
      carBody.applyForce(forwardVector.scale(maxForce), carBody.position);
    }
    if (controls.backward) {
      const reverseForce = forwardVector.clone().scale(-maxForce * 0.5);
      carBody.applyForce(reverseForce, carBody.position);
    }
    if (controls.brake) {
      carBody.velocity.x *= 0.9;
      carBody.velocity.z *= 0.9;
    }

    // Apply steering (rotation around Y axis)
    if (controls.left && carBody.velocity.length() > 0.5) {
      carBody.angularVelocity.y = maxSteerVal;
    } else if (controls.right && carBody.velocity.length() > 0.5) {
      carBody.angularVelocity.y = -maxSteerVal;
    } else {
      carBody.angularVelocity.y *= 0.95;
    }

    // Apply air resistance
    carBody.velocity.scale(0.99, carBody.velocity);
    
    // Limit max speed
    const maxSpeed = 15 + stats.level * 2;
    if (carBody.velocity.length() > maxSpeed) {
      carBody.velocity.normalize();
      carBody.velocity.scale(maxSpeed, carBody.velocity);
    }

    // Step physics simulation
    worldRef.current.step(1 / 60, delta, 3);

    // Update Three.js mesh position from physics body
    carRef.current.position.copy(carBody.position as any);
    carRef.current.quaternion.copy(carBody.quaternion as any);

    // Update game stats
    const speed = carBody.velocity.length();
    updateSpeed(speed);
    
    // Check for answer selection based on position/rotation
    if (currentQuestion && !selectedAnswer) {
      checkAnswerSelection(carRef.current);
    }

    // Keep car on road bounds (apply force to push back)
    if (carBody.position.x > 10) {
      carBody.applyForce(new CANNON.Vec3(-200, 0, 0), carBody.position);
    } else if (carBody.position.x < -10) {
      carBody.applyForce(new CANNON.Vec3(200, 0, 0), carBody.position);
    }
  });

  const checkAnswerSelection = (car: THREE.Group) => {
    const position = car.position;
    const rotation = car.rotation.y;
    
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
        if (carBodyRef.current) {
          carBodyRef.current.position.set(0, 1, 0);
          carBodyRef.current.quaternion.setFromEuler(0, 0, 0);
          carBodyRef.current.velocity.set(0, 0, 0);
          carBodyRef.current.angularVelocity.set(0, 0, 0);
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
      <mesh castShadow position={[-0.7, 0, 1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh castShadow position={[0.7, 0, 1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh castShadow position={[-0.7, 0, -1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh castShadow position={[0.7, 0, -1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
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
