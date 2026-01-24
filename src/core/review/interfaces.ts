/**
 * 复习算法接口定义
 * 基于艾宾浩斯遗忘曲线和间隔重复原理
 */

import { ExtendedKnowledgeNode, ReviewSchedule } from '@/types/knowledge';

/**
 * 艾宾浩斯复习阶段配置
 */
export interface EbbinghausStage {
  stage: number;
  intervalDays: number;
  expectedRetention: number; // 预期保留率
  description: string;
}

/**
 * 遗忘曲线参数
 */
export interface ForgettingCurveParams {
  // 标准艾宾浩斯间隔（天）
  reviewIntervals: number[];
  // 个性化调整因子（不同年级可能有差异）
  gradeFactor: number;
  // 用户记忆力因子（可以从历史数据学习）
  memoryFactor?: number;
}

/**
 * 复习调度器接口
 */
export interface ReviewScheduler {
  /**
   * 计算下次复习时间
   * @param userId 用户ID
   * @param knowledgeId 知识点ID
   * @param currentStage 当前复习阶段（0表示第一次学习）
   * @returns 下次复习时间
   */
  calculateNextReview(
    userId: string,
    knowledgeId: string,
    currentStage: number
  ): Promise<Date>;

  /**
   * 获取今日需要复习的知识点
   */
  getTodayReviews(userId: string): Promise<ExtendedKnowledgeNode[]>;

  /**
   * 创建复习计划
   */
  createReviewSchedule(
    userId: string,
    knowledgeId: string,
    stage: number
  ): Promise<ReviewSchedule>;

  /**
   * 完成复习
   */
  completeReview(
    userId: string,
    reviewId: string,
    performance: 'excellent' | 'good' | 'fair' | 'poor'
  ): Promise<void>;

  /**
   * 获取复习统计
   */
  getReviewStats(userId: string): Promise<{
    totalReviews: number;
    completedReviews: number;
    pendingReviews: number;
    overdueReviews: number;
    onTimeRate: number;
  }>;

  /**
   * 预测遗忘概率
   */
  predictForgettingProbability(
    userId: string,
    knowledgeId: string,
    daysSinceLastReview: number
  ): Promise<number>;

  /**
   * 获取复习提醒消息
   */
  getReviewReminder(userId: string): Promise<{
    message: string;
    urgency: 'low' | 'medium' | 'high';
    dueReviews: ExtendedKnowledgeNode[];
  }>;
}

/**
 * 间隔重复算法接口
 */
export interface SpacedRepetitionAlgorithm {
  /**
   * 计算最佳复习间隔
   * @param quality 复习质量（0-5，SM-2算法标准）
   * @param previousInterval 之前间隔
   * @param previousEaseFactor 之前易度因子
   * @returns 新的间隔和易度因子
   */
  calculateNextInterval(
    quality: number,
    previousInterval: number,
    previousEaseFactor: number
  ): {
    nextInterval: number;
    newEaseFactor: number;
  };

  /**
   * 批量计算复习间隔
   */
  calculateIntervals(
    reviews: Array<{
      quality: number;
      previousInterval: number;
      previousEaseFactor: number;
    }>
  ): Array<{
    nextInterval: number;
    newEaseFactor: number;
  }>;

  /**
   * 获取默认易度因子
   */
  getDefaultEaseFactor(): number;

  /**
   * 获取最小间隔（天）
   */
  getMinInterval(): number;

  /**
   * 获取最大间隔（天）
   */
  getMaxInterval(): number;
}

/**
 * 复习优先级计算器
 */
export interface ReviewPriorityCalculator {
  /**
   * 计算复习优先级
   * @param userId 用户ID
   * @param knowledgeId 知识点ID
   * @returns 优先级分数（0-100，越高越紧急）
   */
  calculatePriority(
    userId: string,
    knowledgeId: string
  ): Promise<number>;

  /**
   * 对复习任务排序
   */
  prioritizeReviews(
    userId: string,
    knowledgeIds: string[]
  ): Promise<Array<{ knowledgeId: string; priority: number }>>;

  /**
   * 获取高优先级复习任务（今日必须完成）
   */
  getHighPriorityReviews(userId: string): Promise<ExtendedKnowledgeNode[]>;

  /**
   * 获取即将到期的复习任务（未来3天内）
   */
  getUpcomingReviews(userId: string): Promise<{
    knowledgeNode: ExtendedKnowledgeNode;
    daysUntilDue: number;
  }[]>;
}

/**
 * 记忆保持跟踪器
 */
export interface MemoryRetentionTracker {
  /**
   * 记录记忆测试结果
   */
  recordRetentionTest(
    userId: string,
    knowledgeId: string,
    remembered: boolean,
    daysSinceLastReview: number
  ): Promise<void>;

  /**
   * 获取记忆保留曲线数据
   */
  getRetentionCurve(
    userId: string,
    knowledgeId: string
  ): Promise<Array<{ days: number; retentionRate: number }>>;

  /**
   * 计算平均保留率
   */
  getAverageRetentionRate(userId: string): Promise<number>;

  /**
   * 识别容易遗忘的知识点
   */
  identifyDifficultKnowledge(userId: string): Promise<Array<{
    knowledgeId: string;
    retentionRate: number;
    reviewCount: number;
  }>>;
}
