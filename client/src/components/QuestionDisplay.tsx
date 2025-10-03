import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuestionStore } from '@/lib/stores/useQuestionStore';
import { useGameStore } from '@/lib/stores/useGameStore';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function QuestionDisplay() {
  const { 
    currentQuestion, 
    showingAnswer, 
    selectedAnswer, 
    isCorrect,
    nextQuestion,
    hideAnswer,
    questions,
    currentQuestionIndex 
  } = useQuestionStore();
  
  const { endGame, increaseLevel, stats } = useGameStore();

  // Auto-advance to next question after showing answer
  useEffect(() => {
    if (showingAnswer) {
      const timer = setTimeout(() => {
        hideAnswer();
        
        if (currentQuestionIndex + 1 < questions.length) {
          nextQuestion();
        } else {
          // Game complete
          endGame();
        }
        
        // Level up every 3 questions
        if ((currentQuestionIndex + 1) % 3 === 0) {
          increaseLevel();
        }
      }, 3000); // Show answer for 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showingAnswer, currentQuestionIndex, questions.length, nextQuestion, hideAnswer, endGame, increaseLevel]);

  if (!currentQuestion) return null;

  return (
    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
      <Card className="w-[600px] bg-white/95 border-2 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-center text-gray-800">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-2">
            {currentQuestion.options.map((option, index) => {
              const letters = ['A', 'B', 'C', 'D'];
              const colors = ['bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-pink-500'];
              const directions = ['STRAIGHT', 'U-TURN', 'LEFT', 'RIGHT'];
              
              let optionStyle = `${colors[index]} text-white p-3 rounded-lg`;
              
              if (showingAnswer) {
                if (index === currentQuestion.correctAnswer) {
                  optionStyle += ' ring-4 ring-green-400';
                } else if (index === selectedAnswer && !isCorrect) {
                  optionStyle += ' ring-4 ring-red-400';
                }
              }
              
              return (
                <div key={index} className={optionStyle}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {letters[index]}: {option}
                    </span>
                    <span className="text-sm opacity-90">
                      {directions[index]}
                    </span>
                    {showingAnswer && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="h-5 w-5" />
                    )}
                    {showingAnswer && index === selectedAnswer && !isCorrect && (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Answer Feedback */}
          {showingAnswer && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center mb-2">
                {isCorrect ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-semibold text-green-700">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-semibold text-red-700">Incorrect</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-700">
                {currentQuestion.explanation}
              </p>
              
              <div className="flex items-center justify-center mt-3 text-sm text-gray-500">
                <ArrowRight className="h-4 w-4 mr-1" />
                Next question in 3 seconds...
              </div>
            </div>
          )}
          
          {/* Instructions */}
          {!showingAnswer && (
            <div className="text-center text-sm text-gray-600 mt-4">
              Drive your car into the path that represents your answer choice
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
