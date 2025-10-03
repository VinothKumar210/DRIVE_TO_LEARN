import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGameStore } from '@/lib/stores/useGameStore';
import { useQuestionStore } from '@/lib/stores/useQuestionStore';
import { generateQuestions } from '@/lib/gemini';
import { Loader2, BookOpen } from 'lucide-react';

export default function StudyMaterialInput() {
  const [material, setMaterial] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setStudyMaterial, setGamePhase, startGame } = useGameStore();
  const { setQuestions } = useQuestionStore();

  const handleStartGame = async () => {
    if (!material.trim()) return;
    
    setIsLoading(true);
    setStudyMaterial(material);
    setGamePhase('loading');
    
    try {
      const questions = await generateQuestions(material, 'medium');
      console.log('Generated questions:', questions);
      
      if (questions && questions.length > 0) {
        setQuestions(questions);
        startGame();
      } else {
        throw new Error('No questions generated');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setGamePhase('input');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex flex-col p-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center">
            <div className="bg-blue-500 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">
            Drive to Learn
          </h1>
          <p className="text-gray-600 text-xl">
            AI-Powered 3D Educational Driving Game
          </p>
          <p className="text-sm text-gray-500">
            Paste your study material below and we'll generate questions for you to answer while driving!
          </p>
        </div>
        
        <div className="flex-1 flex flex-col space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Material
            </label>
            <Textarea
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Paste your study notes, textbook content, or any educational material here. The AI will generate multiple-choice questions from this content..."
              className="flex-1 text-sm resize-none"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">How to Play:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Option A:</strong> Drive straight</li>
              <li>• <strong>Option B:</strong> Make a U-turn</li>
              <li>• <strong>Option C:</strong> Turn left</li>
              <li>• <strong>Option D:</strong> Turn right</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              Use WASD or arrow keys to control your car. Choose the correct path to answer questions!
            </p>
          </div>
          
          <Button 
            onClick={handleStartGame}
            disabled={!material.trim() || isLoading}
            className="w-full h-12 text-lg font-semibold bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Questions...
              </>
            ) : (
              'Start Learning Drive'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
