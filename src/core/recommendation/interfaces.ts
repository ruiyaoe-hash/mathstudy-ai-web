/**
 * 推荐算法接口定义
 * 定义推荐引擎的核心抽象接口
 */

import { ExtendedKnowledgeNode, UserKnowledgeMastery } from '@/types/knowledge';

/**
 * 推荐结果
 */
export interface RecommendationResult {
  knowledgeNode: ExtendedKnowledgeNode;
  priority: number; // 优先级，越高越推荐
  reason: string; // 推荐理由
  expectedDifficulty: number; // 预期难度
}

/**
 * 贝叶斯知识追踪参数
 */
export interface BKTParameters {
  pInit: number; // 初始掌握概率 (0-1)
  pLearn: number; // 学习率 (0-1)
  pForget: number; // 遗忘率 (0-1)
  pSlip: number; // 已掌握但答错的概率 (0-1)
  pGuess: number; // 未掌握但答对的概率 (0-1)
}

/**
 * 贝叶斯知识追踪接口
 */
export interface BayesianKnowledgeTracker {
  /**
   * 更新掌握度
   * @param userId 用户ID
   * @param knowledgeId 知识点ID
   * @param isCorrect 是否答对
   * @param timeSpent 答题用时（毫秒）
   * @returns 更新后的掌握度
   */
  updateMastery(
    userId: string,
    knowledgeId: string,
    isCorrect: boolean,
    timeSpent: number
  ): Promise<UserKnowledgeMastery>;

  /**
   * 获取当前掌握度
   */
  getMastery(userId: string, knowledgeId: string): Promise<number>;

  /**
   * 获取所有知识点的掌握度
   */
  getAllMasteries(userId: string): Promise<Map<string, UserKnowledgeMastery>>;

  /**
   * 预测下一次答题正确率
   */
  predictCorrectness(userId: string, knowledgeId: string): Promise<number>;

  /**
   * 获取置信度区间
   */
  getConfidenceInterval(
    userId: string,
    knowledgeId: string,
    confidence: number
  ): Promise<[number, number]>;

  /**
   * 设置BKT参数（支持个性化参数）
   */
  setParameters(userId: string, params: Partial<BKTParameters>): void;
  
  /**
   * 获取BKT参数
   */
  getParameters(userId: string): BKTParameters;
}

/**
 * 推荐引擎接口
 */
export interface RecommendationEngine {
  /**
   * 获取个性化推荐列表
   * @param userId 用户ID
   * @param count 推荐数量
   * @returns 推荐结果列表（按优先级排序）
   */
  recommend(userId: string, count?: number): Promise<RecommendationResult[]>;

  /**
   * 获取推荐理由（用于前端展示）
   */
  getRecommendationReason(
    userId: string,
    knowledgeId: string
  ): Promise<string>;

  /**
   * 获取下一个推荐的知识点
   */
  getNextRecommendation(userId: string): Promise<ExtendedKnowledgeNode | null>;

  /**
   * 更新用户行为（答题、学习等）
   */
  recordUserAction(
    userId: string,
    action: 'answer' | 'learn' | 'review',
    knowledgeId: string,
    data: any
  ): Promise<void>;

  /**
   * 获取学习进度统计
   */
  getLearningProgress(userId: string): Promise<{
    totalKnowledge: number;
    masteredKnowledge: number;
    inProgress: number;
    notStarted: number;
    progressPercentage: number;
  }>;
}

/**
 * 难度自适应接口
 */
export interface DifficultyAdjuster {
  /**
   * 根据用户表现调整难度
   * @param userId 用户ID
   * @param knowledgeId 知识点ID
   * @param recentAnswers 最近答题记录
   * @returns 调整后的难度系数（1-5）
   */
  adjustDifficulty(
    userId: string,
    knowledgeId: string,
    recentAnswers: Array<{ isCorrect: boolean; timeSpent: number }>
  ): Promise<number>;

  /**
   * 获取适合当前水平的知识点
   */
  getAppropriateKnowledge(
    userId: string,
    knowledgeIds: string[]
  ): Promise<string>;

  /**
   * 检查难度是否合适（是否在最近发展区）
   */
  isAppropriateDifficulty(
    userId: string,
    knowledgeId: string
  ): Promise<boolean>;
}

/**
 * 学习调度器接口
 */
export interface LearningScheduler {
  /**
   * 安排今日学习任务
   */
  scheduleTodayLearning(userId: string): Promise<ExtendedKnowledgeNode[]>;

  /**
   * 获取建议的学习时长
   */
  getSuggestedDuration(userId: string): Promise<number>;

  /**
   * 获取学习建议
   */
  getLearningAdvice(userId: string): Promise<string[]>;
}
