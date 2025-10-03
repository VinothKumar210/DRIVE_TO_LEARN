import { Text } from '@react-three/drei';
import { useQuestionStore } from '@/lib/stores/useQuestionStore';

export default function RoadSigns() {
  const { currentQuestion } = useQuestionStore();

  if (!currentQuestion) return null;

  return (
    <group>
      {/* Option A - Straight Sign */}
      <group position={[0, 3, -8]}>
        <mesh>
          <boxGeometry args={[3, 1.5, 0.1]} />
          <meshLambertMaterial color="#00ff00" />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.3}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
          textAlign="center"
        >
          A: {currentQuestion.options[0]}
        </Text>
        <Text
          position={[0, -0.8, 0.1]}
          fontSize={0.2}
          color="#000000"
          anchorX="center"
          anchorY="middle"
        >
          STRAIGHT
        </Text>
      </group>

      {/* Option B - U-turn Sign */}
      <group position={[0, 3, 8]}>
        <mesh>
          <boxGeometry args={[3, 1.5, 0.1]} />
          <meshLambertMaterial color="#ff8800" />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.3}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
          textAlign="center"
        >
          B: {currentQuestion.options[1]}
        </Text>
        <Text
          position={[0, -0.8, 0.1]}
          fontSize={0.2}
          color="#000000"
          anchorX="center"
          anchorY="middle"
        >
          U-TURN
        </Text>
      </group>

      {/* Option C - Left Turn Sign */}
      <group position={[-8, 3, -2]}>
        <mesh>
          <boxGeometry args={[3, 1.5, 0.1]} />
          <meshLambertMaterial color="#0088ff" />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
          textAlign="center"
        >
          C: {currentQuestion.options[2]}
        </Text>
        <Text
          position={[0, -0.8, 0.1]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          LEFT
        </Text>
      </group>

      {/* Option D - Right Turn Sign */}
      <group position={[8, 3, -2]}>
        <mesh>
          <boxGeometry args={[3, 1.5, 0.1]} />
          <meshLambertMaterial color="#ff0088" />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
          textAlign="center"
        >
          D: {currentQuestion.options[3]}
        </Text>
        <Text
          position={[0, -0.8, 0.1]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          RIGHT
        </Text>
      </group>
    </group>
  );
}
