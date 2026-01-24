import { GameProgress, MistakeItem } from '@/types/game';
import { getCurrentUser } from './userStorage';

// 获取当前用户的存储 key
const getStorageKey = (): string => {
  const user = getCurrentUser();
  if (!user) return 'math-hero-progress-guest';
  return `math-hero-progress-${user.id}`;
};

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

// 读取进度
export const loadProgress = (): GameProgress => {
  try {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      const initial = createInitialProgress();
      return {
        ...initial,
        ...parsed,
        planets: {
          ...initial.planets,
          ...parsed.planets,
        },
      };
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  return createInitialProgress();
};

// 保存进度
export const saveProgress = (progress: GameProgress): void => {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
};

// 更新关卡进度
export const updateLevelProgress = (
  progress: GameProgress,
  planetId: string,
  levelId: string,
  stars: 0 | 1 | 2 | 3,
  time: number,
  score: number
): GameProgress => {
  const currentLevel = progress.planets[planetId]?.levels[levelId];
  if (!currentLevel) return progress;

  const updatedLevel = {
    ...currentLevel,
    stars: Math.max(currentLevel.stars, stars) as 0 | 1 | 2 | 3,
    bestTime: currentLevel.bestTime === 0 ? time : Math.min(currentLevel.bestTime, time),
    bestScore: Math.max(currentLevel.bestScore, score),
    completed: true,
    attempts: currentLevel.attempts + 1,
  };

  const planetConfig = DEFAULT_PLANETS.find((p) => p.id === planetId);
  const levelIndex = planetConfig?.levels.findIndex((l) => l === levelId) ?? -1;
  const isLastLevel = levelIndex === (planetConfig?.levels.length ?? 0) - 1;

  let updatedPlanets = {
    ...progress.planets,
    [planetId]: {
      ...progress.planets[planetId],
      levels: {
        ...progress.planets[planetId].levels,
        [levelId]: updatedLevel,
      },
    },
  };

  if (isLastLevel && stars >= 1) {
    const planetIndex = DEFAULT_PLANETS.findIndex((p) => p.id === planetId);
    if (planetIndex < DEFAULT_PLANETS.length - 1) {
      const nextPlanetId = DEFAULT_PLANETS[planetIndex + 1].id;
      updatedPlanets = {
        ...updatedPlanets,
        [nextPlanetId]: {
          ...updatedPlanets[nextPlanetId],
          unlocked: true,
        },
      };
    }
  }

  let totalStars = 0;
  Object.values(updatedPlanets).forEach((planetProgress) => {
    Object.values(planetProgress.levels).forEach((levelProgress) => {
      totalStars += levelProgress.stars;
    });
  });

  return {
    ...progress,
    planets: updatedPlanets,
    totalStars,
  };
};

// 添加金币
export const addCoins = (progress: GameProgress, amount: number): GameProgress => {
  return {
    ...progress,
    coins: progress.coins + amount,
  };
};

// 添加错题
export const addMistake = (progress: GameProgress, mistake: Omit<MistakeItem, 'timestamp' | 'reviewed'>): GameProgress => {
  const exists = progress.mistakes.some((m) => m.id === mistake.id);
  if (exists) {
    return {
      ...progress,
      mistakes: progress.mistakes.map((m) =>
        m.id === mistake.id ? { ...m, userAnswer: mistake.userAnswer, timestamp: Date.now(), reviewed: false } : m
      ),
    };
  }

  return {
    ...progress,
    mistakes: [
      ...progress.mistakes,
      {
        ...mistake,
        timestamp: Date.now(),
        reviewed: false,
      },
    ],
  };
};

// 删除错题
export const removeMistake = (progress: GameProgress, questionId: string): GameProgress => {
  return {
    ...progress,
    mistakes: progress.mistakes.filter((m) => m.id !== questionId),
  };
};

// 更新连胜记录
export const updateStreak = (progress: GameProgress, correct: boolean): GameProgress => {
  if (correct) {
    const newStreak = progress.currentStreak + 1;
    return {
      ...progress,
      currentStreak: newStreak,
      bestStreak: Math.max(progress.bestStreak, newStreak),
    };
  }
  return {
    ...progress,
    currentStreak: 0,
  };
};

// 添加成就
export const unlockAchievement = (progress: GameProgress, achievementId: string): GameProgress => {
  if (progress.achievements.includes(achievementId)) {
    return progress;
  }
  return {
    ...progress,
    achievements: [...progress.achievements, achievementId],
  };
};

// 重置进度
export const resetProgress = (): void => {
  const key = getStorageKey();
  localStorage.removeItem(key);
};
