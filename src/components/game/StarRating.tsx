import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const StarRating = ({
  stars,
  maxStars = 3,
  size = 'md',
  animated = false,
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'w-5 h-5 sm:w-6 sm:h-6',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-10 h-10 sm:w-14 sm:h-14',
  };

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5 sm:gap-2',
    lg: 'gap-2 sm:gap-4',
  };

  return (
    <div className={cn('flex items-center justify-center', gapClasses[size])}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const isFilled = index < stars;

        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              'transition-all duration-300',
              isFilled
                ? 'text-star fill-star drop-shadow-lg'
                : 'text-muted-foreground/30',
              animated && isFilled && 'animate-star-reveal',
            )}
            style={animated && isFilled ? { animationDelay: `${index * 0.2}s` } : undefined}
          />
        );
      })}
    </div>
  );
};
