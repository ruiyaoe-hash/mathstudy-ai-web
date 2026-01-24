import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Star, Coins, Clock, Target, ArrowRight, RotateCcw, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/game/StarRating';
import { useGameProgress } from '@/hooks/useGameProgress';
import { GameResult } from '@/types/game';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface LocationState {
  result: GameResult;
  planetId: string;
  levelId: string;
  planetName: string;
  levelName: string;
}

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateLevelProgress, addCoins } = useGameProgress();
  const hasUpdatedRef = useRef(false);

  const state = location.state as LocationState | undefined;

  // 更新进度（只执行一次）
  useEffect(() => {
    if (state && !hasUpdatedRef.current) {
      hasUpdatedRef.current = true;
      const { result, planetId, levelId } = state;
      updateLevelProgress(planetId, levelId, result.stars, result.timeSpent, result.correctCount);
      addCoins(result.coinsEarned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { result, planetId, levelId, planetName, levelName } = state;
  const isPassed = result.stars >= 1;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 spotlight pointer-events-none" />
      
      {/* Success Glow */}
      {isPassed && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-gradient-radial from-success/30 to-transparent blur-3xl pointer-events-none" />
      )}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 safe-bottom">
        {/* Result Card */}
        <div className="w-full max-w-md space-y-4 sm:space-y-6 animate-slide-up">
          {/* Header */}
          <div className="text-center">
            <div className={cn(
              'inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6',
              isPassed ? 'bg-success glow-success' : 'bg-destructive'
            )}>
              {isPassed ? (
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              ) : (
                <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
            <h1 className="text-headline-lg sm:text-display text-foreground mb-1 sm:mb-2">
              {isPassed ? '恭喜过关！' : '再接再厉！'}
            </h1>
            <p className="text-body sm:text-body-lg text-muted-foreground">
              {planetName} · {levelName}
            </p>
          </div>

          {/* Star Rating */}
          <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center">
            <StarRating stars={result.stars} size="lg" animated />
            {result.isNewRecord && (
              <p className="mt-3 sm:mt-4 text-body-lg sm:text-title text-primary font-semibold animate-bounce-in">
                新纪录！
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <p className="text-title-lg sm:text-headline text-success">
                {result.correctCount}/{result.totalQuestions}
              </p>
              <p className="text-tiny sm:text-caption text-muted-foreground">正确题数</p>
            </div>

            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className="text-title sm:text-title-lg text-primary">{formatTime(result.timeSpent)}</p>
              <p className="text-tiny sm:text-caption text-muted-foreground">用时</p>
            </div>

            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              </div>
              <p className="text-title-lg sm:text-headline text-amber-500 animate-coin-pop">
                +{result.coinsEarned}
              </p>
              <p className="text-tiny sm:text-caption text-muted-foreground">获得金币</p>
            </div>

            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent fill-accent" />
              </div>
              <p className="text-title-lg sm:text-headline text-accent">
                {Math.round(result.accuracy)}%
              </p>
              <p className="text-tiny sm:text-caption text-muted-foreground">正确率</p>
            </div>
          </div>

          {/* Message */}
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <p className="text-body sm:text-body-lg text-foreground">
              {result.accuracy === 100
                ? '太棒了！你已经完全掌握了这些知识！'
                : result.accuracy >= 80
                ? '做得很好！继续保持！'
                : result.accuracy >= 60
                ? '还不错，多练习会更好！'
                : '加油！多做几遍就能掌握了！'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            {!isPassed && (
              <Button
                onClick={() => navigate(`/game/${planetId}/${levelId}`, { replace: true })}
                className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover-lift touch-target"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                再试一次
              </Button>
            )}

            {isPassed && (
              <Button
                onClick={() => navigate(`/planet/${planetId}`, { replace: true })}
                className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl gradient-primary text-white font-semibold hover-lift touch-target"
              >
                继续冒险
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => navigate('/', { replace: true })}
              className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl border-muted-foreground/30 touch-target"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              返回首页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
