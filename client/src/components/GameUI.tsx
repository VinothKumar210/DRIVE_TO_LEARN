import { useGameStore } from '@/lib/stores/useGameStore';
import { useQuestionStore } from '@/lib/stores/useQuestionStore';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function GameUI() {
  const { stats } = useGameStore();
  const { questions, currentQuestionIndex } = useQuestionStore();

  const progress = questions.length > 0 
    ? (currentQuestionIndex / questions.length) * 100 
    : 0;

  return (
    <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
      {/* Top Stats Bar */}
      <div className="flex gap-4 mb-4">
        {/* Score */}
        <Card className="bg-black/70 border-white/20">
          <CardContent className="p-3">
            <div className="text-white text-center">
              <div className="text-xs opacity-80">SCORE</div>
              <div className="text-xl font-bold">{stats.score.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Accuracy */}
        <Card className="bg-black/70 border-white/20">
          <CardContent className="p-3">
            <div className="text-white text-center">
              <div className="text-xs opacity-80">ACCURACY</div>
              <div className="text-xl font-bold">{stats.accuracy}%</div>
            </div>
          </CardContent>
        </Card>

        {/* Level */}
        <Card className="bg-black/70 border-white/20">
          <CardContent className="p-3">
            <div className="text-white text-center">
              <div className="text-xs opacity-80">LEVEL</div>
              <div className="text-xl font-bold">{stats.level}</div>
            </div>
          </CardContent>
        </Card>

        {/* Speed */}
        <Card className="bg-black/70 border-white/20">
          <CardContent className="p-3">
            <div className="text-white text-center">
              <div className="text-xs opacity-80">SPEED</div>
              <div className="text-xl font-bold">{Math.round(stats.speed)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="bg-black/70 border-white/20">
        <CardContent className="p-3">
          <div className="text-white text-xs mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4">
        <Card className="bg-black/70 border-white/20">
          <CardContent className="p-3">
            <div className="text-white text-xs space-y-1">
              <div><strong>WASD</strong> - Drive</div>
              <div><strong>Space</strong> - Brake</div>
              <div className="text-xs opacity-60 mt-2">
                Drive into the correct answer path!
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
