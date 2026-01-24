import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/game/Header';
import { GameProgress as GameProgressComponent } from '@/components/game/GameProgress';
import { QuestionCard } from '@/components/game/QuestionCard';
import { getCurrentUser } from '@/utils/userStorage';
import { getPlanetById } from '@/data/planets';
import { getQuestionsForLevel } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Question, GameResult, MistakeItem } from '@/types/game';
import { ArrowRight, Home, Sparkles } from 'lucide-react';
import * as storage from '@/utils/storage';
import * as api from '@/services/supabaseService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Game = () => {
  const { planetId, levelId } = useParams<{ planetId: string; levelId: string }>();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [ready, setReady] = useState(false);
  
  const timerIdRef = useRef<number | null>(null);
  const userIdRef = useRef<string | null>(null);
  const progressRef = useRef(storage.loadProgress());
  const navigatedRef = useRef(false);

  const planet = planetId ? getPlanetById(planetId) : undefined;
  const level = planet?.levels.find((l) => l.id === levelId);

  // 初始化 - 只在挂载时执行一次
  useEffect(() => {
    // 检查用户
    const user = getCurrentUser();
    if (!user) {
      navigate('/select-user', { replace: true });
      return;
    }
    userIdRef.current = user.id;
    
    // 检查路由参数
    if (!planetId || !levelId || !planet || !level) {
      navigate('/', { replace: true });
      return;
    }

    // 加载题目
    const loadedQuestions = getQuestionsForLevel(planetId, levelId);
    if (loadedQuestions.length === 0) {
      navigate('/', { replace: true });
      return;
    }
    
    setQuestions(loadedQuestions);
    setReady(true);

    // 启动计时器（使用 window.setInterval 确保类型正确）
    timerIdRef.current = window.setInterval(() => {
      setTimeSpent(t => t + 1);
    }, 1000);

    // 清理函数
    return () => {
      if (timerIdRef.current !== null) {
        window.clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
    // 只在挂载时运行，所以禁用依赖检查
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 保存错题
  const saveMistake = useCallback((mistake: Omit<MistakeItem, 'timestamp' | 'reviewed'>) => {
    const updated = storage.addMistake(progressRef.current, mistake);
    progressRef.current = updated;
    storage.saveProgress(updated);
    if (userIdRef.current) {
      api.saveGameProgress(userIdRef.current, updated);
    }
  }, []);

  // 完成游戏
  const finishGame = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    
    // 停止计时器
    if (timerIdRef.current !== null) {
      window.clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }

    // 计算结果
    const total = questions.length;
    const accuracy = total > 0 ? (correctCount / total) * 100 : 0;
    let stars: 0 | 1 | 2 | 3 = 0;
    if (accuracy >= 100) stars = 3;
    else if (accuracy >= 80) stars = 2;
    else if (accuracy >= 60) stars = 1;

    const coinsEarned = correctCount * 10 + (streak > 0 ? Math.floor(streak / 3) * 20 : 0);
    const currentLevel = progressRef.current?.planets[planetId!]?.levels[levelId!];
    const isNewRecord = !currentLevel?.completed || correctCount > (currentLevel.bestScore || 0);

    const result: GameResult = {
      correctCount,
      totalQuestions: total,
      accuracy,
      timeSpent,
      stars,
      coinsEarned,
      isNewRecord,
    };

    navigate('/result', {
      replace: true,
      state: {
        result,
        planetId,
        levelId,
        planetName: planet?.name,
        levelName: level?.name,
      },
    });
  }, [questions.length, correctCount, streak, timeSpent, planetId, levelId, planet?.name, level?.name, navigate]);

  // 答题处理
  const handleAnswer = useCallback((userAnswer: string | number, isCorrect: boolean) => {
    setAnswered(true);

    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
      
      const question = questions[currentIndex];
      if (question && planetId && levelId) {
        saveMistake({
          id: `${planetId}-${levelId}-${question.id}`,
          planetId,
          levelId,
          question,
          userAnswer: String(userAnswer),
        });
      }
    }
  }, [questions, currentIndex, planetId, levelId, saveMistake]);

  // 下一题
  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      // 最后一题，完成游戏
      finishGame();
    } else {
      setAnswered(false);
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, questions.length, finishGame]);

  // 加载中
  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-body-lg text-muted-foreground">加载题目中...</p>
          
          {/* AI 功能提示 */}
          <Alert className="bg-primary/5 border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm">AI 智能功能</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              AI 题目生成和智能推荐功能已完成前端集成，正在等待知识图谱数据导入和后端服务配置。当前使用预设题目。
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-body-lg text-muted-foreground">计算结果中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 stars-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 spotlight pointer-events-none" />

      <Header title={level?.name || '游戏'} showBack />

      <main className="relative z-10 container max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 safe-bottom">
        <div className="animate-slide-up">
          <GameProgressComponent
            currentQuestion={currentIndex}
            totalQuestions={questions.length}
            correctCount={correctCount}
            timeSpent={timeSpent}
            streak={streak}
          />
        </div>

        <div className="animate-slide-up stagger-1">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            showFeedback={true}
          />
        </div>

        {answered && (
          <div className="space-y-2 sm:space-y-3 animate-slide-up">
            <Button
              onClick={handleNext}
              className="w-full h-12 sm:h-14 text-body-lg sm:text-title rounded-xl sm:rounded-2xl gradient-primary text-white font-semibold hover-lift touch-target"
            >
              {currentIndex < questions.length - 1 ? (
                <>
                  下一题
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </>
              ) : (
                <>
                  查看结果
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/', { replace: true })}
              className="w-full h-10 text-muted-foreground hover:text-foreground touch-target"
            >
              <Home className="w-4 h-4 mr-2" />
              退出游戏
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Game;
