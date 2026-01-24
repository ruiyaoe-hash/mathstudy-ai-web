/**
 * 艾宾浩斯遗忘曲线与间隔重复算法框架
 * 实现标准的艾宾浩斯复习间隔和SM-2算法
 */

import {
  ReviewScheduler,
  SpacedRepetitionAlgorithm,
  ForgettingCurveParams,
} from '../review/interfaces';
import { ExtendedKnowledgeNode, ReviewSchedule } from '@/types/knowledge';

/**
 * 标准艾宾浩斯复习间隔（天）
 */
const STANDARD_EBBINGHAUS_INTERVALS = [1, 3, 7, 14, 30, 90];

/**
 * 不同年级的间隔调整因子
 */
const GRADE_INTERVAL_FACTORS: Record<number, number> = {
  4: 0.8, // 四年级：更频繁复习
  5: 1.0, // 五年级：标准间隔
  6: 1.2, // 六年级：更长间隔
};

/**
 * 艾宾浩斯复习阶段配置
 */
export const EBBINGHAUS_STAGES: Array<{
  stage: number;
  intervalDays: number;
  expectedRetention: number;
  description: string;
}> = [
  { stage: 1, intervalDays: 1, expectedRetention: 0.85, description: '首次复习' },
  { stage: 2, intervalDays: 3, expectedRetention: 0.75, description: '短期记忆巩固' },
  { stage: 3, intervalDays: 7, expectedRetention: 0.65, description: '中期记忆巩固' },
  { stage: 4, intervalDays: 14, expectedRetention: 0.55, description: '长期记忆形成' },
  { stage: 5, intervalDays: 30, expectedRetention: 0.45, description: '长期记忆强化' },
  { stage: 6, intervalDays: 90, expectedRetention: 0.35, description: '永久记忆巩固' },
];

/**
 * SM-2 间隔重复算法实现
 * 基于SuperMemo 2算法
 */
export class SM2Algorithm implements SpacedRepetitionAlgorithm {
  private readonly DEFAULT_EASE_FACTOR = 2.5;
  private readonly MIN_INTERVAL = 1; // 最小1天
  private readonly MAX_INTERVAL = 365; // 最大365天

  calculateNextInterval(
    quality: number,
    previousInterval: number,
    previousEaseFactor: number
  ): { nextInterval: number; newEaseFactor: number } {
    let newEaseFactor: number;
    let nextInterval: number;

    if (quality >= 3) {
      // 答对了
      if (previousInterval === 0) {
        nextInterval = 1;
      } else if (previousInterval === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(previousInterval * previousEaseFactor);
      }
      
      // 更新易度因子
      newEaseFactor =
        previousEaseFactor +
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      
      // 易度因子不低于1.3
      newEaseFactor = Math.max(1.3, newEaseFactor);
    } else {
      // 答错了
      nextInterval = 1;
      newEaseFactor = previousEaseFactor;
    }

    // 确保间隔在合理范围内
    nextInterval = Math.max(
      this.MIN_INTERVAL,
      Math.min(this.MAX_INTERVAL, nextInterval)
    );

    return { nextInterval, newEaseFactor };
  }

  calculateIntervals(
    reviews: Array<{
      quality: number;
      previousInterval: number;
      previousEaseFactor: number;
    }>
  ): Array<{ nextInterval: number; newEaseFactor: number }> {
    return reviews.map(review =>
      this.calculateNextInterval(
        review.quality,
        review.previousInterval,
        review.previousEaseFactor
      )
    );
  }

  getDefaultEaseFactor(): number {
    return this.DEFAULT_EASE_FACTOR;
  }

  getMinInterval(): number {
    return this.MIN_INTERVAL;
  }

  getMaxInterval(): number {
    return this.MAX_INTERVAL;
  }
}

/**
 * 艾宾浩斯复习调度器实现
 * 框架实现，等待知识图谱和数据库表创建后完善
 */
export class EbbinghausScheduler implements ReviewScheduler {
  private sm2: SM2Algorithm;
  private grade: number = 5; // 默认五年级
  private params: ForgettingCurveParams;

  constructor(grade: number = 5) {
    this.sm2 = new SM2Algorithm();
    this.grade = grade;
    this.params = {
      reviewIntervals: STANDARD_EBBINGHAUS_INTERVALS,
      gradeFactor: GRADE_INTERVAL_FACTORS[grade] || 1.0,
    };
  }

  setGrade(grade: number): void {
    this.grade = grade;
    this.params.gradeFactor = GRADE_INTERVAL_FACTORS[grade] || 1.0;
  }

  async calculateNextReview(
    userId: string,
    knowledgeId: string,
    currentStage: number
  ): Promise<Date> {
    // 获取标准间隔
    const standardInterval = this.params.reviewIntervals[currentStage] || 90;

    // 根据年级调整
    const adjustedInterval = Math.round(standardInterval * this.params.gradeFactor);

    // 如果有个性化记忆因子，进一步调整
    const finalInterval = this.params.memoryFactor
      ? Math.round(adjustedInterval * this.params.memoryFactor)
      : adjustedInterval;

    // 计算下次复习时间
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + finalInterval);

    return nextReviewDate;
  }

  async getTodayReviews(userId: string): Promise<ExtendedKnowledgeNode[]> {
    // TODO: 实现逻辑
    // 1. 从数据库查询今日需要复习的知识点
    // 2. 过滤出复习时间在今天的
    // 3. 返回知识点列表

    return [];
  }

  async createReviewSchedule(
    userId: string,
    knowledgeId: string,
    stage: number
  ): Promise<ReviewSchedule> {
    const scheduledAt = await this.calculateNextReview(userId, knowledgeId, stage);

    const schedule: ReviewSchedule = {
      id: `${userId}-${knowledgeId}-${Date.now()}`,
      userId,
      knowledgeId,
      reviewStage: stage,
      scheduledAt,
      createdAt: new Date(),
    };

    // TODO: 持久化到数据库
    // await this.persistenceService.saveSchedule(schedule);

    return schedule;
  }

  async completeReview(
    userId: string,
    reviewId: string,
    performance: 'excellent' | 'good' | 'fair' | 'poor'
  ): Promise<void> {
    // 将性能评级映射到质量分数（SM-2标准）
    const qualityMap = {
      excellent: 5,
      good: 4,
      fair: 3,
      poor: 1,
    };

    const quality = qualityMap[performance];

    // TODO: 获取复习记录
    // const review = await this.persistenceService.getReview(reviewId);
    // const { previousInterval, previousEaseFactor } = review;

    // 计算新间隔
    // const { nextInterval, newEaseFactor } = this.sm2.calculateNextInterval(
    //   quality,
    //   previousInterval,
    //   previousEaseFactor
    // );

    // TODO: 创建下一次复习计划
    // const nextReview = await this.createReviewSchedule(
    //   userId,
    //   review.knowledgeId,
    //   review.reviewStage + 1
    // );

    // TODO: 更新复习记录
    // await this.persistenceService.updateReview(reviewId, {
    //   completedAt: new Date(),
    //   performance,
    // });
  }

  async getReviewStats(userId: string): Promise<{
    totalReviews: number;
    completedReviews: number;
    pendingReviews: number;
    overdueReviews: number;
    onTimeRate: number;
  }> {
    // TODO: 从数据库统计

    return {
      totalReviews: 0,
      completedReviews: 0,
      pendingReviews: 0,
      overdueReviews: 0,
      onTimeRate: 0,
    };
  }

  async predictForgettingProbability(
    userId: string,
    knowledgeId: string,
    daysSinceLastReview: number
  ): Promise<number> {
    // 简化的遗忘曲线公式：R = e^(-t/S)
    // R = 保留率，t = 时间，S = 记忆强度
    const memoryStrength = 30; // 假设记忆强度为30天
    const retentionRate = Math.exp(-daysSinceLastReview / memoryStrength);

    // 返回遗忘概率 = 1 - 保留率
    return 1 - retentionRate;
  }

  async getReviewReminder(userId: string): Promise<{
    message: string;
    urgency: 'low' | 'medium' | 'high';
    dueReviews: ExtendedKnowledgeNode[];
  }> {
    const dueReviews = await this.getTodayReviews(userId);
    const count = dueReviews.length;

    let urgency: 'low' | 'medium' | 'high';
    let message: string;

    if (count === 0) {
      urgency = 'low';
      message = '今天没有需要复习的内容，继续加油学习新知识吧！';
    } else if (count <= 3) {
      urgency = 'low';
      message = `今天有${count}个知识点需要复习，抽空完成吧！`;
    } else if (count <= 7) {
      urgency = 'medium';
      message = `今天有${count}个知识点需要复习，建议安排时间完成。`;
    } else {
      urgency = 'high';
      message = `今天有${count}个知识点需要复习，请务必完成，防止遗忘！`;
    }

    return {
      message,
      urgency,
      dueReviews,
    };
  }

  /**
   * 设置个性化记忆因子
   * 从用户历史数据学习
   */
  setMemoryFactor(factor: number): void {
    this.params.memoryFactor = factor;
  }

  /**
   * 获取艾宾浩斯阶段配置
   */
  static getStageConfig(stage: number) {
    return EBBINGHAUS_STAGES.find(s => s.stage === stage) || EBBINGHAUS_STAGES[0];
  }
}

/**
 * 导出单例实例
 */
export const ebbinghausScheduler = new EbbinghausScheduler();
