import { Achievement, GameProgress } from '@/types/game';

// 默认星球配置 - 避免循环依赖
const DEFAULT_PLANETS = [
  { id: 'big-numbers', levels: ['level-1', 'level-2', 'level-3'] },
  { id: 'angles', levels: ['level-1', 'level-2', 'level-3'] },
  { id: 'multiply-divide', levels: ['level-1', 'level-2', 'level-3'] },
  { id: 'shapes', levels: ['level-1', 'level-2', 'level-3'] },
  { id: 'decimals', levels: ['level-1', 'level-2', 'level-3'] },
];

export const achievements: Achievement[] = [
  {
    id: 'first-step',
    name: '第一步',
    description: '完成第一个关卡',
    icon: 'Footprints',
    condition: '完成任意一个关卡',
    unlocked: false,
  },
  {
    id: 'big-number-master',
    name: '大数高手',
    description: '完成大数王国所有关卡',
    icon: 'Castle',
    condition: '完成大数王国全部关卡',
    unlocked: false,
  },
  {
    id: 'angle-expert',
    name: '角度专家',
    description: '完成角度世界所有关卡',
    icon: 'Compass',
    condition: '完成角度世界全部关卡',
    unlocked: false,
  },
  {
    id: 'calc-wizard',
    name: '计算达人',
    description: '完成乘除乐园所有关卡',
    icon: 'Calculator',
    condition: '完成乘除乐园全部关卡',
    unlocked: false,
  },
  {
    id: 'shape-builder',
    name: '图形建筑师',
    description: '完成图形城堡所有关卡',
    icon: 'Hexagon',
    condition: '完成图形城堡全部关卡',
    unlocked: false,
  },
  {
    id: 'decimal-diver',
    name: '小数潜水员',
    description: '完成小数海洋所有关卡',
    icon: 'Waves',
    condition: '完成小数海洋全部关卡',
    unlocked: false,
  },
  {
    id: 'star-collector-10',
    name: '星星收集者',
    description: '累计获得10颗星星',
    icon: 'Star',
    condition: '累计获得10颗星星',
    unlocked: false,
  },
  {
    id: 'star-collector-30',
    name: '星星猎人',
    description: '累计获得30颗星星',
    icon: 'Stars',
    condition: '累计获得30颗星星',
    unlocked: false,
  },
  {
    id: 'perfect-level',
    name: '完美通关',
    description: '任意关卡获得3星',
    icon: 'Award',
    condition: '任意关卡获得满分3星',
    unlocked: false,
  },
  {
    id: 'all-three-stars',
    name: '全星达人',
    description: '所有关卡获得3星',
    icon: 'Trophy',
    condition: '所有关卡都获得3星',
    unlocked: false,
  },
  {
    id: 'streak-5',
    name: '连胜新秀',
    description: '连续答对5道题',
    icon: 'Flame',
    condition: '连续答对5道题目',
    unlocked: false,
  },
  {
    id: 'streak-10',
    name: '连胜高手',
    description: '连续答对10道题',
    icon: 'Zap',
    condition: '连续答对10道题目',
    unlocked: false,
  },
  {
    id: 'streak-20',
    name: '连胜王者',
    description: '连续答对20道题',
    icon: 'Crown',
    condition: '连续答对20道题目',
    unlocked: false,
  },
  {
    id: 'mistake-clearer',
    name: '错题终结者',
    description: '清空错题本',
    icon: 'CheckCircle',
    condition: '把错题本里的题目全部掌握',
    unlocked: false,
  },
  {
    id: 'coin-saver-100',
    name: '小小储蓄家',
    description: '累计获得100金币',
    icon: 'Coins',
    condition: '累计获得100金币',
    unlocked: false,
  },
  {
    id: 'coin-saver-500',
    name: '金币大亨',
    description: '累计获得500金币',
    icon: 'PiggyBank',
    condition: '累计获得500金币',
    unlocked: false,
  },
];

// 检查成就是否达成
export const checkAchievements = (progress: GameProgress): string[] => {
  const newAchievements: string[] = [];

  // 第一步 - 完成任意关卡
  if (!progress.achievements.includes('first-step')) {
    const hasCompleted = Object.values(progress.planets).some((p) =>
      Object.values(p.levels).some((l) => l.completed)
    );
    if (hasCompleted) newAchievements.push('first-step');
  }

  // 完成各星球
  const planetAchievementMap: Record<string, string> = {
    'big-numbers': 'big-number-master',
    angles: 'angle-expert',
    'multiply-divide': 'calc-wizard',
    shapes: 'shape-builder',
    decimals: 'decimal-diver',
  };

  DEFAULT_PLANETS.forEach((planet) => {
    const achievementId = planetAchievementMap[planet.id];
    if (achievementId && !progress.achievements.includes(achievementId)) {
      const allCompleted = planet.levels.every(
        (levelId) => progress.planets[planet.id]?.levels[levelId]?.completed
      );
      if (allCompleted) newAchievements.push(achievementId);
    }
  });

  // 星星收集
  if (!progress.achievements.includes('star-collector-10') && progress.totalStars >= 10) {
    newAchievements.push('star-collector-10');
  }
  if (!progress.achievements.includes('star-collector-30') && progress.totalStars >= 30) {
    newAchievements.push('star-collector-30');
  }

  // 完美通关
  if (!progress.achievements.includes('perfect-level')) {
    const hasPerfect = Object.values(progress.planets).some((p) =>
      Object.values(p.levels).some((l) => l.stars === 3)
    );
    if (hasPerfect) newAchievements.push('perfect-level');
  }

  // 全星达人
  if (!progress.achievements.includes('all-three-stars')) {
    let allThreeStars = true;
    DEFAULT_PLANETS.forEach((planet) => {
      planet.levels.forEach((levelId) => {
        if (progress.planets[planet.id]?.levels[levelId]?.stars !== 3) {
          allThreeStars = false;
        }
      });
    });
    if (allThreeStars) newAchievements.push('all-three-stars');
  }

  // 连胜成就
  if (!progress.achievements.includes('streak-5') && progress.bestStreak >= 5) {
    newAchievements.push('streak-5');
  }
  if (!progress.achievements.includes('streak-10') && progress.bestStreak >= 10) {
    newAchievements.push('streak-10');
  }
  if (!progress.achievements.includes('streak-20') && progress.bestStreak >= 20) {
    newAchievements.push('streak-20');
  }

  // 错题终结者
  if (!progress.achievements.includes('mistake-clearer') && progress.mistakes.length === 0 && progress.totalQuestions > 0) {
    newAchievements.push('mistake-clearer');
  }

  // 金币成就
  if (!progress.achievements.includes('coin-saver-100') && progress.coins >= 100) {
    newAchievements.push('coin-saver-100');
  }
  if (!progress.achievements.includes('coin-saver-500') && progress.coins >= 500) {
    newAchievements.push('coin-saver-500');
  }

  return newAchievements;
};

// 获取成就详情
export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find((a) => a.id === id);
};
