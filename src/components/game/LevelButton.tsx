import { Link } from 'react-router-dom';
import { Lock, Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Level, LevelProgress } from '@/types/game';

interface LevelButtonProps {
  planetId: string;
  planetColor: number;
  level: Level;
  progress?: LevelProgress;
  unlocked: boolean;
  index: number;
}

const gradientClasses: Record<number, string> = {
  1: 'planet-gradient-1',
  2: 'planet-gradient-2',
  3: 'planet-gradient-3',
  4: 'planet-gradient-4',
  5: 'planet-gradient-5',
};

export const LevelButton = ({
  planetId,
  planetColor,
  level,
  progress,
  unlocked,
  index,
}: LevelButtonProps) => {
  const stars = progress?.stars ?? 0;
  const completed = progress?.completed ?? false;

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-secondary/50 flex items-center justify-center opacity-50">
          <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
        </div>
        <span className="text-tiny sm:text-caption text-muted-foreground">{level.name}</span>
        <div className="flex gap-0.5 sm:gap-1">
          {[1, 2, 3].map((i) => (
            <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link to={`/game/${planetId}/${level.id}`}>
      <div className="flex flex-col items-center gap-2 sm:gap-3 group touch-target">
        <div
          className={cn(
            'relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center',
            'transition-all duration-300',
            'group-hover:scale-110 group-hover:shadow-glow',
            'group-active:scale-95',
            completed ? 'bg-success' : gradientClasses[planetColor]
          )}
        >
          {completed ? (
            <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          ) : (
            <span className="text-headline-lg sm:text-display text-white">{index + 1}</span>
          )}

          {/* Shine Effect */}
          {!completed && (
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        <span className="text-tiny sm:text-caption font-medium text-foreground">{level.name}</span>

        <div className="flex gap-0.5 sm:gap-1">
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              className={cn(
                'w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300',
                i <= stars
                  ? 'text-star fill-star scale-100'
                  : 'text-muted-foreground/30 scale-90'
              )}
            />
          ))}
        </div>
      </div>
    </Link>
  );
};
