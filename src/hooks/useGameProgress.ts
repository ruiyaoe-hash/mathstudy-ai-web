import { useState, useEffect, useRef } from 'react';
import { GameProgress, MistakeItem } from '@/types/game';
import * as storage from '@/utils/storage';
import * as api from '@/services/supabaseService';

// 默认星球配置
const DEFAULT_PLANETS = [
  { id: 'big-numbers', levels: ['level-1', 'level-2', 'level-3'] },
  { id: 'angles', levels: ['level-1', 'level-2', 'level-3'] },
  { id: 'multiply-divide', levels: ['level-1', 'level-2', 'level-3'] },
  { id: 'shapes', levels: ['level-1', 'level-2', 'level-3'] },
  { id: 'decimals', levels: ['level-1', 'level-2', 'level-3'] },
];

// 初始化游戏进度
const createInitialProgress = (): GameProgress => {
  const planetsProgress: GameProgress['planets'] = {};

  DEFAULT_PLANETS.forEach((planet, planetIndex) => {
    const levelsProgress: Record<string, { stars: 0; bestTime: number; bestScore: number; completed: boolean; attempts: number }> = {};

    planet.levels.forEach((levelId) => {
      levelsProgress[levelId] = {
        stars: 0,
        bestTime: 0,
        bestScore: 0,
        completed: false,
        attempts: 0,
      };
    });

    planetsProgress[planet.id] = {
      unlocked: planetIndex === 0,
      levels: levelsProgress,
    };
  });

  return {
    planets: planetsProgress,
    coins: 0,
    totalStars: 0,
    achievements: [],
    mistakes: [],
    totalCorrect: 0,
    totalQuestions: 0,
    currentStreak: 0,
    bestStreak: 0,
  };
};

// 合并进度数据
const mergeProgress = (initial: GameProgress, loaded: GameProgress): GameProgress => {
  const merged = { ...initial, ...loaded };
  
  DEFAULT_PLANETS.forEach((planet, index) => {
    if (!merged.planets[planet.id]) {
      merged.planets[planet.id] = {
        unlocked: index === 0,
        levels: {},
      };
    }
    
    planet.levels.forEach(levelId => {
      if (!merged.planets[planet.id].levels[levelId]) {
        merged.planets[planet.id].levels[levelId] = {
          stars: 0,
          bestTime: 0,
          bestScore: 0,
          completed: false,
          attempts: 0,
        };
      }
    });
  });
  
  return merged;
};

// 从 sessionStorage 获取用户ID
const getUserId = (): string | null => {
  try {
    const cached = sessionStorage.getItem('current-user-data');
    if (cached) {
      const user = JSON.parse(cached);
      return user?.id || null;
    }
  } catch {
    // ignore
  }
  return null;
};

// 检查关卡是否解锁的纯函数
export const checkLevelUnlocked = (planets: GameProgress['planets'], planetId: string, levelId: string): boolean => {
  const planetConfig = DEFAULT_PLANETS.find((p) => p.id === planetId);
  if (!planetConfig) return false;

  const planetProgress = planets[planetId];
  if (!planetProgress?.unlocked) return false;

  const levelIndex = planetConfig.levels.findIndex((l) => l === levelId);
  if (levelIndex === 0) return true;

  const prevLevelId = planetConfig.levels[levelIndex - 1];
  const prevLevelProgress = planetProgress.levels[prevLevelId];
  return prevLevelProgress?.completed ?? false;
};

export const useGameProgress = () => {
  const [progress, setProgress] = useState<GameProgress>(createInitialProgress);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const loadedRef = useRef(false);
  const userIdRef = useRef(getUserId());
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 只在挂载时加载一次
  useEffect(() => {
    mountedRef.current = true;
    
    if (loadedRef.current) return;
    loadedRef.current = true;
    
    const load = async () => {
      const userId = userIdRef.current;
      
      if (!userId) {
        if (mountedRef.current) {
          setProgress(createInitialProgress());
          setIsLoading(false);
        }
        return;
      }

      try {
        const serverProgress = await api.getGameProgress(userId);
        if (!mountedRef.current) return;
        
        if (serverProgress && Object.keys(serverProgress.planets).length > 0) {
          setProgress(mergeProgress(createInitialProgress(), serverProgress));
        } else {
          const localProgress = storage.loadProgress();
          setProgress(localProgress);
          api.saveGameProgress(userId, localProgress);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
        if (mountedRef.current) {
          setProgress(storage.loadProgress());
        }
      }
      
      if (mountedRef.current) {
        setIsLoading(false);
      }
    };

    load();
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 保存进度的辅助函数
  const saveProgress = (newProgress: GameProgress) => {
    storage.saveProgress(newProgress);
    
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    const userId = userIdRef.current;
    if (userId) {
      saveTimerRef.current = setTimeout(() => {
        api.saveGameProgress(userId, newProgress);
      }, 1000);
    }
  };

  // 简化的更新函数，使用函数式更新避免闭包问题
  const updateLevelProgress = (planetId: string, levelId: string, stars: 0 | 1 | 2 | 3, time: number, score: number) => {
    setProgress(prev => {
      const updated = storage.updateLevelProgress(prev, planetId, levelId, stars, time, score);
      saveProgress(updated);
      return updated;
    });
  };

  const addCoins = (amount: number) => {
    setProgress(prev => {
      const updated = storage.addCoins(prev, amount);
      saveProgress(updated);
      return updated;
    });
  };

  const addMistake = (mistake: Omit<MistakeItem, 'timestamp' | 'reviewed'>) => {
    setProgress(prev => {
      const updated = storage.addMistake(prev, mistake);
      saveProgress(updated);
      return updated;
    });
  };

  const removeMistake = (questionId: string) => {
    setProgress(prev => {
      const updated = storage.removeMistake(prev, questionId);
      saveProgress(updated);
      return updated;
    });
  };

  const updateStreak = (correct: boolean) => {
    setProgress(prev => {
      const updated = storage.updateStreak(prev, correct);
      saveProgress(updated);
      return updated;
    });
  };

  const unlockAchievement = (achievementId: string) => {
    setProgress(prev => {
      const updated = storage.unlockAchievement(prev, achievementId);
      saveProgress(updated);
      return updated;
    });
  };

  const isLevelUnlocked = (planetId: string, levelId: string): boolean => {
    return checkLevelUnlocked(progress.planets, planetId, levelId);
  };

  return {
    progress,
    isLoading,
    updateLevelProgress,
    addCoins,
    addMistake,
    removeMistake,
    updateStreak,
    unlockAchievement,
    isLevelUnlocked,
  };
};
