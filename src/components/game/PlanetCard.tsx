import { Link } from 'react-router-dom';
import { Lock, Star, Castle, Compass, Calculator, Hexagon, Waves, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Planet } from '@/types/game';

interface PlanetCardProps {
  planet: Planet;
  unlocked: boolean;
  completedLevels: number;
  totalStars: number;
  maxStars: number;
}

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

export const PlanetCard = ({
  planet,
  unlocked,
  completedLevels,
  totalStars,
  maxStars,
}: PlanetCardProps) => {
  const IconComponent = iconMap[planet.icon];
  const progress = (completedLevels / planet.levels.length) * 100;

  if (!unlocked) {
    return (
      <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5 opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-title sm:text-title-lg text-muted-foreground truncate">{planet.name}</h3>
            <p className="text-tiny sm:text-caption text-muted-foreground/60 truncate">{planet.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/planet/${planet.id}`}>
      <div className={cn(
        'glass rounded-xl sm:rounded-2xl p-3 sm:p-5 card-hover group touch-target',
        'border border-transparent hover:border-primary/30 active:scale-[0.98]'
      )}>
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Icon */}
          <div className={cn(
            'w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0',
            'transition-transform duration-300 group-hover:scale-110',
            gradientClasses[planet.color]
          )}>
            {IconComponent && <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-white" />}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
              <h3 className="text-title sm:text-title-lg text-foreground truncate">{planet.name}</h3>
              {completedLevels === planet.levels.length && (
                <span className="text-tiny bg-success/20 text-success px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">完成</span>
              )}
            </div>
            <p className="text-tiny sm:text-caption text-muted-foreground mb-1.5 sm:mb-2 truncate">{planet.description}</p>
            
            {/* Progress */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 h-1 sm:h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full transition-all duration-500', gradientClasses[planet.color])}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-star fill-star" />
                <span className="text-tiny sm:text-caption font-semibold text-foreground">
                  {totalStars}/{maxStars}
                </span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
};
