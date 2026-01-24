import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/game/Header';
import { PlanetCard } from '@/components/game/PlanetCard';
import { useGameProgress } from '@/hooks/useGameProgress';
import { planets } from '@/data/planets';
import { loadCurrentUser, setCurrentUserCache } from '@/utils/userStorage';
import { BookOpen, Trophy, Zap, Target, TrendingUp, Sparkles, Crown, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const { progress, isLoading } = useGameProgress();
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      const user = await loadCurrentUser();
      if (!user) {
        navigate('/select-user', { replace: true });
        return;
      }
      setCurrentUser(user);
      setCurrentUserCache(user);
      setIsInitializing(false);
    };
    init();
  }, [navigate]);

  if (isInitializing || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 计算每个星球的进度
  const getPlanetStats = (planetId: string) => {
    const planet = planets.find((p) => p.id === planetId);
    const planetProgress = progress.planets[planetId];

    if (!planet || !planetProgress) {
      return { completedLevels: 0, totalStars: 0, maxStars: 0 };
    }

    let completedLevels = 0;
    let totalStars = 0;

    planet.levels.forEach((level) => {
      const levelProgress = planetProgress.levels[level.id];
      if (levelProgress?.completed) completedLevels++;
      totalStars += levelProgress?.stars ?? 0;
    });

    return {
      completedLevels,
      totalStars,
      maxStars: planet.levels.length * 3,
    };
  };

  const accuracy = progress.totalQuestions > 0 
    ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 spotlight pointer-events-none" />
      
      <Header
        coins={progress.coins}
        stars={progress.totalStars}
        showAchievements
      />

      <main className="relative z-10 container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-8 safe-bottom">
        {/* Welcome Hero */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl gradient-mesh p-5 sm:p-8 animate-slide-up">
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-tiny sm:text-caption text-primary font-semibold uppercase tracking-wide">欢迎回来</span>
            </div>
            <h1 className="text-headline-lg sm:text-display text-foreground mb-1 sm:mb-2">
              数学小勇士
            </h1>
            <p className="text-body sm:text-body-lg text-muted-foreground max-w-md">
              继续你的数学冒险，征服每一个知识星球，成为真正的数学勇士！
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 animate-slide-up stagger-1">
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <p className="text-title-lg sm:text-headline text-foreground">{progress.totalQuestions}</p>
            <p className="text-tiny sm:text-caption text-muted-foreground">答题总数</p>
          </div>
          
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            </div>
            <p className="text-title-lg sm:text-headline text-foreground">{accuracy}%</p>
            <p className="text-tiny sm:text-caption text-muted-foreground">正确率</p>
          </div>
          
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <p className="text-title-lg sm:text-headline text-foreground">{progress.bestStreak}</p>
            <p className="text-tiny sm:text-caption text-muted-foreground">最佳连胜</p>
          </div>
          
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <p className="text-title-lg sm:text-headline text-foreground">{progress.achievements.length}</p>
            <p className="text-tiny sm:text-caption text-muted-foreground">成就数</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 animate-slide-up stagger-2">
          <Link to="/knowledge-graph">
            <Button
              variant="outline"
              className={cn(
                'w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl border-blue-500/30 hover:bg-blue-500/10',
                'transition-all duration-300 active:scale-95 flex-col gap-0.5 sm:gap-1 touch-target'
              )}
            >
              <Network className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              <span className="text-tiny sm:text-caption">知识图谱</span>
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button
              variant="outline"
              className={cn(
                'w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl border-amber-500/30 hover:bg-amber-500/10',
                'transition-all duration-300 active:scale-95 flex-col gap-0.5 sm:gap-1 touch-target'
              )}
            >
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <span className="text-tiny sm:text-caption">排行榜</span>
            </Button>
          </Link>
          <Link to="/mistakes">
            <Button
              variant="outline"
              className={cn(
                'w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl border-destructive/30 hover:bg-destructive/10',
                'transition-all duration-300 active:scale-95 flex-col gap-0.5 sm:gap-1 relative touch-target'
              )}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              <span className="text-tiny sm:text-caption">错题本</span>
              {progress.mistakes.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground w-4 h-4 sm:w-5 sm:h-5 rounded-full text-tiny flex items-center justify-center">
                  {progress.mistakes.length}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/achievements">
            <Button
              variant="outline"
              className={cn(
                'w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl border-primary/30 hover:bg-primary/10',
                'transition-all duration-300 active:scale-95 flex-col gap-0.5 sm:gap-1 touch-target'
              )}
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-tiny sm:text-caption">成就</span>
            </Button>
          </Link>
        </div>

        {/* Planets Section */}
        <div className="space-y-3 sm:space-y-4 animate-slide-up stagger-3">
          <div className="flex items-center justify-between">
            <h2 className="text-title-lg sm:text-headline-lg text-foreground">知识星球</h2>
            <span className="text-tiny sm:text-caption text-muted-foreground">
              {progress.totalStars} / {planets.length * 9} 星
            </span>
          </div>
          
          <div className="grid gap-3 sm:gap-4">
            {planets.map((planet, index) => {
              const stats = getPlanetStats(planet.id);
              const unlocked = progress.planets[planet.id]?.unlocked ?? false;

              return (
                <div 
                  key={planet.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <PlanetCard
                    planet={planet}
                    unlocked={unlocked}
                    completedLevels={stats.completedLevels}
                    totalStars={stats.totalStars}
                    maxStars={stats.maxStars}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Padding */}
        <div className="h-6 sm:h-8" />
      </main>
    </div>
  );
};

export default Index;
