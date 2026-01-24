import { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Header } from '@/components/game/Header';
import { LevelButton } from '@/components/game/LevelButton';
import { useGameProgress, checkLevelUnlocked } from '@/hooks/useGameProgress';
import { useAIRecommendation } from '@/hooks/useAIRecommendation';
import { getCurrentUser } from '@/utils/userStorage';
import { getPlanetById } from '@/data/planets';
import { Castle, Compass, Calculator, Hexagon, Waves, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

// 图标映射
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Castle,
  Compass,
  Calculator,
  Hexagon,
  Waves,
};

const gradientClasses: Record<number, string> = {
  1: 'planet-gradient-1',
  2: 'planet-gradient-2',
  3: 'planet-gradient-3',
  4: 'planet-gradient-4',
  5: 'planet-gradient-5',
};

const Planet = () => {
  const { planetId } = useParams<{ planetId: string }>();
  const navigate = useNavigate();
  const { progress } = useGameProgress();
  const { recommendations, loading: recommendationLoading } = useAIRecommendation();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/select-user', { replace: true });
    }
  }, [currentUser, navigate]);

  const planet = planetId ? getPlanetById(planetId) : undefined;

  if (!currentUser) return null;

  if (!planet || !progress.planets[planet.id]?.unlocked) {
    return <Navigate to="/" replace />;
  }

  const IconComponent = iconMap[planet.icon];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 spotlight pointer-events-none" />
      
      <Header
        title={planet.name}
        showBack
        coins={progress.coins}
        stars={progress.totalStars}
      />

      <main className="relative z-10 container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-8 safe-bottom">
        {/* Planet Hero */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center animate-slide-up">
          <div className={cn(
            'absolute inset-0 opacity-20',
            gradientClasses[planet.color]
          )} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl opacity-30"
            style={{ background: `linear-gradient(135deg, hsl(var(--planet-${planet.color}-from)), hsl(var(--planet-${planet.color}-to)))` }}
          />
          
          <div className="relative z-10">
            <div className={cn(
              'w-18 h-18 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-float',
              gradientClasses[planet.color]
            )}
            style={{ width: '72px', height: '72px' }}
            >
              {IconComponent && <IconComponent className="w-9 h-9 sm:w-12 sm:h-12 text-white" />}
            </div>
            
            <h1 className="text-headline-lg sm:text-display text-foreground mb-1 sm:mb-2">{planet.name}</h1>
            <p className="text-body sm:text-body-lg text-muted-foreground mb-4 sm:mb-6">{planet.description}</p>

            {/* Knowledge Points */}
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {planet.knowledgePoints.map((point) => (
                <span
                  key={point}
                  className="glass text-tiny sm:text-caption text-foreground px-2 sm:px-3 py-1 sm:py-1.5 rounded-full"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendation Section */}
        {recommendations.length > 0 && (
          <Card className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 animate-slide-up stagger-0-5 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
              <h2 className="text-title sm:text-title-lg text-foreground">AI 智能推荐</h2>
              {recommendationLoading && (
                <span className="text-xs text-muted-foreground">加载中...</span>
              )}
            </div>
            <div className="space-y-2 sm:space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.knowledgeId}
                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    index === 0 ? 'bg-primary text-primary-foreground' :
                    index === 1 ? 'bg-primary/80 text-primary-foreground' :
                    'bg-primary/60 text-primary-foreground'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm sm:text-base font-medium text-foreground truncate">
                        {rec.knowledgeName || rec.knowledgeId}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground flex-shrink-0">
                        难度 {rec.expectedDifficulty}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {rec.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Levels Grid */}
        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 animate-slide-up stagger-1">
          <h2 className="text-title-lg sm:text-headline text-foreground mb-4 sm:mb-6 text-center">选择关卡</h2>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {planet.levels.map((level, index) => {
              const levelProgress = progress.planets[planet.id]?.levels[level.id];
              const unlocked = checkLevelUnlocked(progress.planets, planet.id, level.id);

              return (
                <LevelButton
                  key={level.id}
                  planetId={planet.id}
                  planetColor={planet.color}
                  level={level}
                  progress={levelProgress}
                  unlocked={unlocked}
                  index={index}
                />
              );
            })}
          </div>
        </div>

        {/* Level Info */}
        <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 animate-slide-up stagger-2">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-title sm:text-title-lg text-foreground">关卡说明</h2>
          </div>
          <ul className="space-y-2 sm:space-y-3 text-caption sm:text-body text-muted-foreground">
            <li className="flex items-center gap-2 sm:gap-3">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary flex-shrink-0" />
              每关包含 6 道精选题目
            </li>
            <li className="flex items-center gap-2 sm:gap-3">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success flex-shrink-0" />
              答对 4 题及以上即可通关
            </li>
            <li className="flex items-center gap-2 sm:gap-3">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-star flex-shrink-0" />
              全对可获得 3 颗星星
            </li>
            <li className="flex items-center gap-2 sm:gap-3">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent flex-shrink-0" />
              完成前一关才能解锁下一关
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Planet;
