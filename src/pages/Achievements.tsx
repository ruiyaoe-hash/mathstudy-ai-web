import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/game/Header';
import { useGameProgress } from '@/hooks/useGameProgress';
import { getCurrentUser } from '@/utils/userStorage';
import { achievements } from '@/data/achievements';
import {
  Lock,
  Footprints,
  Castle,
  Compass,
  Calculator,
  Hexagon,
  Waves,
  Star,
  Award,
  Trophy,
  Flame,
  Zap,
  Crown,
  CheckCircle,
  Coins,
  PiggyBank,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 图标映射
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Footprints,
  Castle,
  Compass,
  Calculator,
  Hexagon,
  Waves,
  Star,
  Stars: Star,
  Award,
  Trophy,
  Flame,
  Zap,
  Crown,
  CheckCircle,
  Coins,
  PiggyBank,
};

const Achievements = () => {
  const navigate = useNavigate();
  const { progress } = useGameProgress();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/select-user', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const unlockedCount = progress.achievements.length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 spotlight pointer-events-none" />
      
      <Header
        title="成就中心"
        showBack
        coins={progress.coins}
        stars={progress.totalStars}
      />

      <main className="relative z-10 container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 safe-bottom">
        {/* Stats Card */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 animate-slide-up">
          <div className="absolute inset-0 gradient-primary opacity-80" />
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-title-lg sm:text-headline-lg text-white mb-0.5 sm:mb-1">成就收集</h2>
              <p className="text-body sm:text-body-lg text-white/80">
                已解锁 {unlockedCount} / {totalCount} 个成就
              </p>
            </div>
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur flex-shrink-0">
              <span className="text-headline-lg sm:text-display text-white">
                {Math.round((unlockedCount / totalCount) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid gap-2 sm:gap-4 sm:grid-cols-2">
          {achievements.map((achievement, index) => {
            const isUnlocked = progress.achievements.includes(achievement.id);
            const IconComponent = iconMap[achievement.icon];

            return (
              <div
                key={achievement.id}
                className={cn(
                  'glass rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all animate-slide-up',
                  isUnlocked ? 'opacity-100' : 'opacity-50'
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0',
                    isUnlocked ? 'gradient-primary' : 'bg-secondary'
                  )}
                >
                  {isUnlocked ? (
                    IconComponent && <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  ) : (
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      'text-body sm:text-title font-semibold truncate',
                      isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {achievement.name}
                  </h3>
                  <p className="text-tiny sm:text-caption text-muted-foreground truncate">
                    {achievement.description}
                  </p>
                  <p className="text-tiny text-muted-foreground mt-0.5 sm:mt-1">
                    {isUnlocked ? '已解锁' : achievement.condition}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Achievements;
