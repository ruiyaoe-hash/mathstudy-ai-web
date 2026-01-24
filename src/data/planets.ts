import { Planet } from '@/types/game';

export const planets: Planet[] = [
  {
    id: 'big-numbers',
    name: '大数王国',
    description: '探索亿以内大数的奥秘',
    icon: 'Castle',
    color: 1,
    knowledgePoints: ['亿以内数的认识', '数的读写', '数的比较', '改写与近似数'],
    levels: [
      {
        id: 'level-1',
        name: '认识大数',
        description: '学习亿以内数的读写',
        questionCount: 6,
        timeLimit: 0,
        passingScore: 4,
      },
      {
        id: 'level-2',
        name: '数位挑战',
        description: '掌握数位和计数单位',
        questionCount: 6,
        timeLimit: 0,
        passingScore: 4,
      },
      {
        id: 'level-3',
        name: '比较大小',
        description: '比较大数的大小',
        questionCount: 6,
        timeLimit: 120,
        passingScore: 4,
      },
    ],
  },
  {
    id: 'angles',
    name: '角度世界',
    description: '探索角的测量与分类',
    icon: 'Compass',
    color: 2,
    knowledgePoints: ['角的认识', '角的分类', '量角器的使用', '画指定角度'],
    levels: [
      {
        id: 'level-1',
        name: '认识角',
        description: '学习角的基本概念',
        questionCount: 6,
        timeLimit: 0,
        passingScore: 4,
      },
      {
        id: 'level-2',
        name: '角的分类',
        description: '认识锐角、直角、钝角、平角、周角',
        questionCount: 6,
        timeLimit: 0,
        passingScore: 4,
      },
      {
        id: 'level-3',
        name: '角度计算',
        description: '计算角度相关问题',
        questionCount: 6,
        timeLimit: 120,
        passingScore: 4,
      },
    ],
  },
  {
    id: 'multiply-divide',
    name: '乘除乐园',
    description: '挑战三位数乘除法',
    icon: 'Calculator',
    color: 3,
    knowledgePoints: ['三位数乘两位数', '除数是两位数的除法', '验算方法', '估算'],
    levels: [
      {
        id: 'level-1',
        name: '乘法初探',
        description: '三位数乘两位数计算',
        questionCount: 6,
        timeLimit: 0,
        passingScore: 4,
      },
      {
        id: 'level-2',
        name: '除法挑战',
        description: '除数是两位数的除法',
        questionCount: 6,
        timeLimit: 0,
        passingScore: 4,
      },
      {
        id: 'level-3',
        name: '混合运算',
        description: '乘除混合计算',
        questionCount: 6,
        timeLimit: 180,
        passingScore: 4,
      },
    ],
  },
  {
    id: 'shapes',
    name: '图形城堡',
    description: '认识平行四边形和梯形',
    icon: 'Hexagon',
    color: 4,
    knowledgePoints: ['平行四边形', '梯形', '图形的高', '图形分类'],
    levels: [
      {
        id: 'level-1',
        name: '四边形认识',
        description: '认识各类四边形',
        questionCount: 6,
        timeLimit: 0,
        passingScore: 4,
      },
      {
        id: 'level-2',
        name: '图形特征',
        description: '掌握图形的特征',
        questionCount: 6,
        timeLimit: 0,
        passingScore: 4,
      },
      {
        id: 'level-3',
        name: '图形计算',
        description: '图形相关计算题',
        questionCount: 6,
        timeLimit: 120,
        passingScore: 4,
      },
    ],
  },
  {
    id: 'decimals',
    name: '小数海洋',
    description: '畅游小数的世界',
    icon: 'Waves',
    color: 5,
    knowledgePoints: ['小数的意义', '小数的读写', '小数的性质', '小数加减法'],
    levels: [
      {
        id: 'level-1',
        name: '小数初识',
        description: '学习小数的意义和读写',
        questionCount: 6,
        timeLimit: 0,
        passingScore: 4,
      },
      {
        id: 'level-2',
        name: '小数比较',
        description: '比较小数的大小',
        questionCount: 6,
        timeLimit: 0,
        passingScore: 4,
      },
      {
        id: 'level-3',
        name: '小数运算',
        description: '小数的加减计算',
        questionCount: 6,
        timeLimit: 150,
        passingScore: 4,
      },
    ],
  },
];

export const getPlanetById = (id: string): Planet | undefined => {
  return planets.find((p) => p.id === id);
};

export const getLevelById = (planetId: string, levelId: string) => {
  const planet = getPlanetById(planetId);
  return planet?.levels.find((l) => l.id === levelId);
};
