import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "input" | "loading" | "playing" | "results";

export interface GameStats {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  totalTime: number;
  accuracy: number;
  speed: number;
  level: number;
}

interface GameState {
  gamePhase: GamePhase;
  studyMaterial: string;
  stats: GameStats;
  startTime: number;
  
  // Actions
  setGamePhase: (phase: GamePhase) => void;
  setStudyMaterial: (material: string) => void;
  updateScore: (points: number) => void;
  incrementCorrect: () => void;
  incrementQuestion: () => void;
  updateSpeed: (speed: number) => void;
  increaseLevel: () => void;
  resetGame: () => void;
  startGame: () => void;
  endGame: () => void;
}

const initialStats: GameStats = {
  score: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  totalTime: 0,
  accuracy: 0,
  speed: 0,
  level: 1,
};

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    gamePhase: "input",
    studyMaterial: "",
    stats: { ...initialStats },
    startTime: 0,
    
    setGamePhase: (phase) => set({ gamePhase: phase }),
    
    setStudyMaterial: (material) => set({ studyMaterial: material }),
    
    updateScore: (points) => set((state) => ({
      stats: { ...state.stats, score: state.stats.score + points }
    })),
    
    incrementCorrect: () => set((state) => ({
      stats: { ...state.stats, correctAnswers: state.stats.correctAnswers + 1 }
    })),
    
    incrementQuestion: () => set((state) => {
      const newQuestionsAnswered = state.stats.questionsAnswered + 1;
      const accuracy = newQuestionsAnswered > 0 
        ? Math.round((state.stats.correctAnswers / newQuestionsAnswered) * 100) 
        : 0;
      
      return {
        stats: { 
          ...state.stats, 
          questionsAnswered: newQuestionsAnswered,
          accuracy 
        }
      };
    }),
    
    updateSpeed: (speed) => set((state) => ({
      stats: { ...state.stats, speed }
    })),
    
    increaseLevel: () => set((state) => ({
      stats: { ...state.stats, level: state.stats.level + 1 }
    })),
    
    resetGame: () => set({
      stats: { ...initialStats },
      gamePhase: "input",
      studyMaterial: "",
      startTime: 0,
    }),
    
    startGame: () => set({
      gamePhase: "playing",
      startTime: Date.now(),
    }),
    
    endGame: () => {
      const { startTime, stats } = get();
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      
      set({
        gamePhase: "results",
        stats: { ...stats, totalTime }
      });
    },
  }))
);
