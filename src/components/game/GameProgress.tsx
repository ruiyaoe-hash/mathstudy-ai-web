import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  correctCount: number;
  timeSpent: number;
  streak: number;
  timeLimit?: number;
}

export const GameProgress = ({
  currentQuestion,
  totalQuestions,
  correctCount,
  timeSpent,
  streak,
  timeLimit,
}: GameProgressProps) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const remainingTime = timeLimit ? timeLimit - timeSpent : null;
  const isTimeWarning = remainingTime !== null && remainingTime <= 30;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Progress Bar */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex justify-between text-tiny sm:text-caption text-muted-foreground">
          <span>答题进度</span>
          <span className="font-semibold text-foreground">
            {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>
        <div className="h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full progress-gradient rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Correct Count */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-tiny sm:text-caption text-muted-foreground">正确</span>
          <span className="text-title sm:text-title-lg font-bold text-success">{correctCount}</span>
        </div>

        {/* Timer */}
        <div
          className={cn(
            'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all',
            timeLimit
              ? isTimeWarning
                ? 'bg-destructive/20 animate-pulse-glow'
                : 'bg-secondary'
              : 'bg-secondary'
          )}
        >
          <Clock
            className={cn(
              'w-3.5 h-3.5 sm:w-4 sm:h-4',
              isTimeWarning ? 'text-destructive' : 'text-muted-foreground'
            )}
          />
          <span
            className={cn(
              'text-body sm:text-title font-bold tabular-nums',
              isTimeWarning ? 'text-destructive' : 'text-foreground'
            )}
          >
            {timeLimit ? formatTime(Math.max(0, remainingTime ?? 0)) : formatTime(timeSpent)}
          </span>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full animate-bounce-in">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
            <span className="text-tiny sm:text-caption font-bold text-amber-500">
              {streak}连胜
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
