import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/game/Header';
import { useGameProgress } from '@/hooks/useGameProgress';
import { getCurrentUser } from '@/utils/userStorage';
import { getLeaderboard, LeaderboardEntry } from '@/services/supabaseService';
import { avatarOptions } from '@/types/user';
import {
  Trophy,
  Medal,
  Star,
  Zap,
  Target,
  Loader2,
  Rocket,
  Heart,
  Flame,
  Sparkles,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 图标映射
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  rocket: Rocket,
  star: Star,
  heart: Heart,
  zap: Zap,
  flame: Flame,
  sparkles: Sparkles,
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const { progress } = useGameProgress();
  const currentUser = getCurrentUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/select-user', { replace: true });
      return;
    }

    const loadLeaderboard = async () => {
      const data = await getLeaderboard(50);
      setEntries(data);
      setIsLoading(false);
    };

    loadLeaderboard();
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const getAvatarIcon = (avatarId: string, size: 'sm' | 'md' = 'md') => {
    const avatar = avatarOptions.find(a => a.id === avatarId);
    if (!avatar) return null;
    const IconComponent = iconMap[avatar.emoji];
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5';
    return IconComponent ? <IconComponent className={cn(sizeClass, 'text-white')} /> : null;
  };

  const getAvatarColor = (avatarId: string) => {
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar?.color || 'from-violet-500 to-purple-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />;
    return <span className="text-body sm:text-title font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-primary/20 border border-primary/30';
    if (rank === 1) return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-slate-400/20 to-slate-500/20 border border-slate-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border border-amber-600/30';
    return 'glass';
  };

  // 找到当前用户的排名
  const currentUserRank = entries.findIndex(e => e.id === currentUser.id) + 1;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 spotlight pointer-events-none" />
      
      <Header
        title="排行榜"
        showBack
        coins={progress.coins}
        stars={progress.totalStars}
      />

      <main className="relative z-10 container max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 safe-bottom">
        {/* Header Card */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/80 to-orange-600/80" />
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-title-lg sm:text-headline-lg text-white mb-0.5 sm:mb-1">全球排行榜</h2>
              <p className="text-body sm:text-body-lg text-white/80">
                与其他数学小勇士一较高下！
              </p>
            </div>
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur flex-shrink-0">
              <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Current User Rank */}
        {currentUserRank > 0 && (
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between animate-slide-up stagger-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br',
                getAvatarColor(currentUser.avatar)
              )}>
                {getAvatarIcon(currentUser.avatar)}
              </div>
              <div>
                <p className="text-tiny sm:text-caption text-muted-foreground">你的排名</p>
                <p className="text-title-lg sm:text-headline text-primary">第 {currentUserRank} 名</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-star fill-star" />
                <span className="text-body-lg sm:text-title font-bold">{progress.totalStars}</span>
              </div>
              <p className="text-tiny sm:text-caption text-muted-foreground">{progress.coins} 金币</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="text-center py-12 sm:py-16">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-body sm:text-body-lg text-muted-foreground">加载排行榜...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 sm:py-16 animate-slide-up">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
            </div>
            <h3 className="text-title-lg sm:text-headline text-foreground mb-2">暂无数据</h3>
            <p className="text-body sm:text-body-lg text-muted-foreground">
              完成游戏后即可上榜！
            </p>
          </div>
        ) : (
          /* Leaderboard List */
          <div className="space-y-2 sm:space-y-3">
            {entries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.id === currentUser.id;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    'rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-4 animate-slide-up',
                    getRankBg(rank, isCurrentUser)
                  )}
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  {/* Rank */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-secondary/50 flex-shrink-0">
                    {getRankIcon(rank)}
                  </div>

                  {/* Avatar */}
                  <div className={cn(
                    'w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br flex-shrink-0',
                    getAvatarColor(entry.avatar)
                  )}>
                    {getAvatarIcon(entry.avatar, 'sm')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <h3 className={cn(
                        'text-body sm:text-title font-semibold truncate',
                        isCurrentUser ? 'text-primary' : 'text-foreground'
                      )}>
                        {entry.name}
                      </h3>
                      {isCurrentUser && (
                        <span className="text-tiny bg-primary/20 text-primary px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">你</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-tiny sm:text-caption text-muted-foreground">
                      <span className="flex items-center gap-0.5 sm:gap-1">
                        <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {entry.accuracy}%
                      </span>
                      <span className="flex items-center gap-0.5 sm:gap-1">
                        <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {entry.best_streak}连胜
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-0.5 sm:gap-1 justify-end">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-star fill-star" />
                      <span className="text-body sm:text-title font-bold">{entry.total_stars}</span>
                    </div>
                    <p className="text-tiny sm:text-caption text-muted-foreground">{entry.coins}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
