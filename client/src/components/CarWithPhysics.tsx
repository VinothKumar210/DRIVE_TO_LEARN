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

  // Racing game physics constants
  const maxSteerVal = 0.8;
  const acceleration = 2500;
  const reverseAcceleration = 1200;
  const brakeForce = 0.85;
  const driftFactor = 0.92;
  const steeringResponse = 0.08;
  
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

    // Get forward and right vectors based on car rotation
    const forwardVector = new CANNON.Vec3(0, 0, -1);
    const rightVector = new CANNON.Vec3(1, 0, 0);
    carBody.quaternion.vmult(forwardVector, forwardVector);
    carBody.quaternion.vmult(rightVector, rightVector);

    const currentSpeed = carBody.velocity.length();
    const maxSpeed = 18 + stats.level * 2;

    // Smooth acceleration with curves (like racing games)
    if (controls.forward) {
      const accelForce = acceleration * (1 - currentSpeed / maxSpeed);
      carBody.applyForce(forwardVector.scale(accelForce), carBody.position);
    }
    
    // Reverse with lower max speed
    if (controls.backward) {
      if (currentSpeed < 2) {
        const reverseForce = forwardVector.clone().scale(-reverseAcceleration);
        carBody.applyForce(reverseForce, carBody.position);
      } else {
        // Act as brake when moving forward
        carBody.velocity.x *= brakeForce;
        carBody.velocity.z *= brakeForce;
      }
    }
    
    // Dedicated brake
    if (controls.brake) {
      carBody.velocity.x *= brakeForce;
      carBody.velocity.z *= brakeForce;
    }

    // Speed-dependent steering (slower at high speeds, more responsive at low speeds)
    const steeringSensitivity = Math.max(0.3, 1 - currentSpeed / maxSpeed);
    const targetSteer = controls.left ? maxSteerVal * steeringSensitivity : 
                        controls.right ? -maxSteerVal * steeringSensitivity : 0;
    
    // Only steer when moving
    if (currentSpeed > 0.5) {
      // Smooth steering interpolation
      carBody.angularVelocity.y += (targetSteer - carBody.angularVelocity.y) * steeringResponse;
    } else {
      carBody.angularVelocity.y *= 0.9;
    }

    // Drift/lateral friction for better handling
    const lateralVelocity = new CANNON.Vec3();
    rightVector.scale(carBody.velocity.dot(rightVector), lateralVelocity);
    carBody.velocity.x -= lateralVelocity.x * (1 - driftFactor);
    carBody.velocity.z -= lateralVelocity.z * (1 - driftFactor);
    
    // Natural deceleration (friction)
    carBody.velocity.scale(0.985, carBody.velocity);
    
    // Limit max speed
    if (currentSpeed > maxSpeed) {
      carBody.velocity.normalize();
      carBody.velocity.scale(maxSpeed, carBody.velocity);
    }

    // Step physics simulation
    worldRef.current.step(1 / 60, delta, 3);

    // Update Three.js mesh position from physics body
    carRef.current.position.copy(carBody.position as any);
    carRef.current.quaternion.copy(carBody.quaternion as any);

    // Update game stats
    updateSpeed(currentSpeed);
    
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
    <group ref={carRef} name="player-car" position={[0, 1, 0]}>
      {/* Car Body - Enhanced with PBR materials */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.6, 0.7, 3.2]} />
        <meshStandardMaterial 
          color="#ff3333"
          roughness={0.3}
          metalness={0.6}
          emissive="#ff0000"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Car Roof */}
      <mesh castShadow receiveShadow position={[0, 0.85, -0.3]}>
        <boxGeometry args={[1.3, 0.5, 1.6]} />
        <meshStandardMaterial 
          color="#dd2222"
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>
      
      {/* Wheels - More detailed */}
      {[
        [-0.75, 0, 1.2],
        [0.75, 0, 1.2],
        [-0.75, 0, -1.2],
        [0.75, 0, -1.2]
      ].map((pos, i) => (
        <group key={`wheel-${i}`} position={pos as [number, number, number]}>
          {/* Tire */}
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.32, 16]} />
            <meshStandardMaterial 
              color="#cccccc"
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        </group>
      ))}
      
      {/* Windshield */}
      <mesh position={[0, 0.8, 0.9]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[1.3, 0.5]} />
        <meshStandardMaterial 
          color="#88ccff"
          transparent 
          opacity={0.4}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[-0.5, 0.4, 1.6]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#ffff88"
          emissive="#ffff88"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0.5, 0.4, 1.6]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#ffff88"
          emissive="#ffff88"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[-0.5, 0.4, -1.6]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh position={[0.5, 0.4, -1.6]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}
