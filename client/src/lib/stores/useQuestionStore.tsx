import { create } from "zustand";

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string]; // A, B, C, D
  correctAnswer: number; // 0-3 index
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuestionState {
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  showingAnswer: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  
  // Actions
  setQuestions: (questions: Question[]) => void;
  nextQuestion: () => void;
  selectAnswer: (answerIndex: number) => void;
  showAnswer: () => void;
  hideAnswer: () => void;
  resetQuestions: () => void;
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: [],
  currentQuestionIndex: 0,
  currentQuestion: null,
  showingAnswer: false,
  selectedAnswer: null,
  isCorrect: null,
  
  setQuestions: (questions) => set({
    questions,
    currentQuestionIndex: 0,
    currentQuestion: questions[0] || null,
    showingAnswer: false,
    selectedAnswer: null,
    isCorrect: null,
  }),
  
  nextQuestion: () => set((state) => {
    const nextIndex = state.currentQuestionIndex + 1;
    return {
      currentQuestionIndex: nextIndex,
      currentQuestion: state.questions[nextIndex] || null,
      showingAnswer: false,
      selectedAnswer: null,
      isCorrect: null,
    };
  }),
  
  selectAnswer: (answerIndex) => {
    const { currentQuestion } = get();
    if (!currentQuestion) return;
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    set({
      selectedAnswer: answerIndex,
      isCorrect,
    });
  },
  
  showAnswer: () => set({ showingAnswer: true }),
  
  hideAnswer: () => set({ showingAnswer: false }),
  
  resetQuestions: () => set({
    questions: [],
    currentQuestionIndex: 0,
    currentQuestion: null,
    showingAnswer: false,
    selectedAnswer: null,
    isCorrect: null,
  }),
}));
