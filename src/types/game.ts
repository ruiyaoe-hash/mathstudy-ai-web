// 题目类型
export type QuestionType = 'choice' | 'fill';

// 单道题目
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // 选择题选项
  answer: string | number; // 填空题答案或选择题正确选项索引
  explanation: string;
  difficulty: 1 | 2 | 3; // 1-简单 2-中等 3-困难
}

// 关卡配置
export interface Level {
  id: string;
  name: string;
  description: string;
  questionCount: number; // 本关题目数量
  timeLimit: number; // 时间限制(秒)，0表示无限制
  passingScore: number; // 通关所需正确题数
}

// 星球配置
export interface Planet {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  color: 1 | 2 | 3 | 4 | 5; // 对应 planet-1 到 planet-5
  levels: Level[];
  knowledgePoints: string[]; // 知识点列表
}

// 单关卡进度
export interface LevelProgress {
  stars: 0 | 1 | 2 | 3;
  bestTime: number; // 最佳用时(秒)
  bestScore: number; // 最佳正确数
  completed: boolean;
  attempts: number; // 尝试次数
}

// 星球进度
export interface PlanetProgress {
  unlocked: boolean;
  levels: Record<string, LevelProgress>;
}

// 错题记录
export interface MistakeItem {
  id: string;
  planetId: string;
  levelId: string;
  question: Question;
  userAnswer: string;
  timestamp: number;
  reviewed: boolean;
}

// 成就定义
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string; // 获取条件描述
  unlocked: boolean;
  unlockedAt?: number;
}

// 游戏总进度
export interface GameProgress {
  planets: Record<string, PlanetProgress>;
  coins: number;
  totalStars: number;
  achievements: string[]; // 已解锁成就ID
  mistakes: MistakeItem[];
  totalCorrect: number;
  totalQuestions: number;
  currentStreak: number; // 当前连胜
  bestStreak: number; // 最佳连胜
}

// 游戏状态
export interface GameState {
  currentPlanetId: string;
  currentLevelId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: (string | number | null)[];
  correctCount: number;
  startTime: number;
  isFinished: boolean;
}

// 结算结果
export interface GameResult {
  stars: 0 | 1 | 2 | 3;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  coinsEarned: number;
  isNewRecord: boolean;
  accuracy: number;
}
