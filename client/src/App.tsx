import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter";
import "./index.css";

import Game from "./components/Game";
import StudyMaterialInput from "./components/StudyMaterialInput";
import GameResults from "./components/GameResults";
import { useGameStore } from "./lib/stores/useGameStore";

// Define control keys for the driving game
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "brake", keys: ["Space"] },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});

function App() {
  const { gamePhase } = useGameStore();

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {gamePhase === 'input' && <StudyMaterialInput />}
        
        {gamePhase === 'results' && <GameResults />}
        
        {(gamePhase === 'playing' || gamePhase === 'loading') && (
          <KeyboardControls map={controls}>
            <Canvas
              shadows
              camera={{
                position: [0, 8, 12],
                fov: 60,
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "high-performance"
              }}
            >
              <color attach="background" args={["#87CEEB"]} />
              
              <Suspense fallback={null}>
                <Game />
              </Suspense>
            </Canvas>
          </KeyboardControls>
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
