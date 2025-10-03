import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/stores/useGameStore';
import { useQuestionStore } from '@/lib/stores/useQuestionStore';
import { Trophy, Target, Clock, Zap, RotateCcw, Home } from 'lucide-react';

export default function GameResults() {
  const { stats, resetGame } = useGameStore();
  const { resetQuestions } = useQuestionStore();

  const handlePlayAgain = () => {
    resetGame();
    resetQuestions();
  };

  const getGrade = (accuracy: number) => {
    if (accuracy >= 90) return { grade: 'A+', color: 'text-green-500', emoji: '🌟' };
    if (accuracy >= 80) return { grade: 'A', color: 'text-green-400', emoji: '⭐' };
    if (accuracy >= 70) return { grade: 'B', color: 'text-blue-500', emoji: '👍' };
    if (accuracy >= 60) return { grade: 'C', color: 'text-yellow-500', emoji: '👌' };
    return { grade: 'D', color: 'text-red-500', emoji: '💪' };
  };

  const gradeInfo = getGrade(stats.accuracy);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-purple-500 p-4 rounded-full">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-gray-800">
            Drive Complete! {gradeInfo.emoji}
          </CardTitle>
          <div className={`text-6xl font-bold ${gradeInfo.color}`}>
            {gradeInfo.grade}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Performance Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">{stats.accuracy}%</div>
                <div className="text-sm text-blue-600">Accuracy</div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{stats.score.toLocaleString()}</div>
                <div className="text-sm text-green-600">Total Score</div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{stats.totalTime}s</div>
                <div className="text-sm text-purple-600">Time Taken</div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">{stats.level}</div>
                <div className="text-sm text-orange-600">Max Level</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Results */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Performance Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span className="font-semibold">{stats.questionsAnswered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Correct Answers:</span>
                  <span className="font-semibold text-green-600">{stats.correctAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wrong Answers:</span>
                  <span className="font-semibold text-red-600">{stats.questionsAnswered - stats.correctAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Speed:</span>
                  <span className="font-semibold">{Math.round(stats.speed)} km/h</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Feedback Message */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <h3 className="font-bold mb-2">
                {stats.accuracy >= 80 
                  ? "Excellent driving and learning!" 
                  : stats.accuracy >= 60 
                  ? "Good job! Keep practicing to improve." 
                  : "Keep studying and you'll improve next time!"}
              </h3>
              <p className="text-sm opacity-90">
                {stats.accuracy >= 80 
                  ? "You've mastered this material. Ready for more advanced topics?" 
                  : "Focus on reviewing the questions you missed for better understanding."}
              </p>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handlePlayAgain}
              className="flex-1 h-12 text-lg bg-blue-500 hover:bg-blue-600"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Study New Material
            </Button>
            <Button 
              variant="outline"
              onClick={handlePlayAgain}
              className="flex-1 h-12 text-lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
