import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Coins, Trophy, LogOut, Rocket, Heart, Zap, Flame, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logoutUser } from '@/utils/userStorage';
import { avatarOptions } from '@/types/user';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// 图标映射
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  rocket: Rocket,
  star: Star,
  heart: Heart,
  zap: Zap,
  flame: Flame,
  sparkles: Sparkles,
};

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  coins?: number;
  stars?: number;
  showAchievements?: boolean;
  showUser?: boolean;
}

export const Header = ({
  title,
  showBack = false,
  coins,
  stars,
  showAchievements = false,
  showUser = false,
}: HeaderProps) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/select-user', { replace: true });
  };

  const getAvatarIcon = (avatarId: string) => {
    const avatar = avatarOptions.find(a => a.id === avatarId);
    if (!avatar) return null;
    const IconComponent = iconMap[avatar.emoji];
    return IconComponent ? <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : null;
  };

  const getAvatarColor = (avatarId: string) => {
    const avatar = avatarOptions.find(a => a.id === avatarId);
    return avatar?.color || 'from-violet-500 to-purple-600';
  };

  return (
    <header className="sticky top-0 z-50 glass rounded-b-xl sm:rounded-b-2xl safe-top">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-secondary w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 touch-target"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          )}
          {title && (
            <h1 className="text-title sm:text-title-lg text-foreground font-semibold truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {stars !== undefined && (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-secondary/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-star fill-star" />
              <span className="text-tiny sm:text-caption font-bold text-foreground">{stars}</span>
            </div>
          )}

          {coins !== undefined && (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-coin" />
              <span className="text-tiny sm:text-caption font-bold text-coin">{coins}</span>
            </div>
          )}

          {showAchievements && (
            <Link to="/achievements" className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-secondary w-9 h-9 sm:w-10 sm:h-10"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </Button>
            </Link>
          )}

          {showUser && currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-br transition-transform active:scale-95 touch-target',
                  getAvatarColor(currentUser.avatar)
                )}>
                  {getAvatarIcon(currentUser.avatar)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-0 min-w-[180px] sm:min-w-[200px]">
                <div className="px-3 py-2">
                  <p className="text-body sm:text-title font-semibold">{currentUser.name}</p>
                  <p className="text-tiny sm:text-caption text-muted-foreground">数学小勇士</p>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="cursor-pointer touch-target">
                    <Shield className="w-4 h-4 mr-2" />
                    管理后台
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild>
                  <button onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }} className="w-full cursor-pointer text-destructive flex items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    退出
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
