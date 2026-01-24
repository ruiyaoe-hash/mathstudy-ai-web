/**
 * 贝叶斯知识追踪框架实现
 * 基于BKT算法，用于估计学生对知识点的掌握程度
 */

import { BayesianKnowledgeTracker, BKTParameters } from './interfaces';
import { UserKnowledgeMastery } from '@/types/knowledge';

/**
 * 默认BKT参数（根据年级可调）
 */
const DEFAULT_PARAMETERS: BKTParameters = {
  pInit: 0.5,    // 初始掌握概率50%
  pLearn: 0.3,   // 学习率30%
  pForget: 0.1,  // 遗忘率10%
  pSlip: 0.1,    // 已掌握但答错10%
  pGuess: 0.2,   // 未掌握但答对20%
};

/**
 * 不同年级的BKT参数建议
 */
const GRADE_PARAMETERS: Record<number, BKTParameters> = {
  4: { ...DEFAULT_PARAMETERS, pLearn: 0.25, pGuess: 0.25 }, // 四年级：学习较慢，猜测较多
  5: { ...DEFAULT_PARAMETERS, pLearn: 0.3, pGuess: 0.2 },   // 五年级：标准参数
  6: { ...DEFAULT_PARAMETERS, pLearn: 0.35, pGuess: 0.15 }, // 六年级：学习较快，猜测较少
};

/**
 * 贝叶斯知识追踪实现
 * 注意：这是一个框架实现，实际的数据访问需要等待知识图谱确认后完善
 */
export class BayesianKnowledgeTrackerImpl implements BayesianKnowledgeTracker {
  private userParameters: Map<string, BKTParameters> = new Map();
  private masteryCache: Map<string, UserKnowledgeMastery> = new Map();

  /**
   * 初始化用户参数（根据年级）
   */
  private initializeUserParameters(userId: string, grade: number): void {
    if (!this.userParameters.has(userId)) {
      const params = GRADE_PARAMETERS[grade] || DEFAULT_PARAMETERS;
      this.userParameters.set(userId, { ...params });
    }
  }

  async updateMastery(
    userId: string,
    knowledgeId: string,
    isCorrect: boolean,
    timeSpent: number
  ): Promise<UserKnowledgeMastery> {
    const params = this.userParameters.get(userId) || DEFAULT_PARAMETERS;
    const cacheKey = `${userId}-${knowledgeId}`;
    const existing = this.masteryCache.get(cacheKey);

    let mastery: number;
    let attempts: number;
    let correct: number;

    if (existing) {
      // 更新现有记录
      mastery = this.updateMasteryProbability(existing.mastery, isCorrect, params);
      attempts = existing.attempts + 1;
      correct = existing.correct + (isCorrect ? 1 : 0);
    } else {
      // 创建新记录
      mastery = this.updateMasteryProbability(params.pInit, isCorrect, params);
      attempts = 1;
      correct = isCorrect ? 1 : 0;
    }

    const updated: UserKnowledgeMastery = {
      id: cacheKey,
      userId,
      knowledgeId,
      mastery,
      attempts,
      correct,
      lastAttemptAt: new Date(),
      lastReviewAt: new Date(),
      reviewCount: existing ? existing.reviewCount + 1 : 0,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 默认24小时后复习
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    this.masteryCache.set(cacheKey, updated);

    // TODO: 持久化到数据库（等待Supabase表创建）
    // await this.persistenceService.saveMastery(updated);

    return updated;
  }

  async getMastery(userId: string, knowledgeId: string): Promise<number> {
    const cacheKey = `${userId}-${knowledgeId}`;
    const record = this.masteryCache.get(cacheKey);

    if (record) {
      return record.mastery;
    }

    // TODO: 从数据库加载（等待Supabase表创建）
    // const dbRecord = await this.persistenceService.getMastery(userId, knowledgeId);
    // if (dbRecord) {
    //   this.masteryCache.set(cacheKey, dbRecord);
    //   return dbRecord.mastery;
    // }

    // 返回默认值
    return 0.5;
  }

  async getAllMasteries(userId: string): Promise<Map<string, UserKnowledgeMastery>> {
    const result = new Map<string, UserKnowledgeMastery>();

    // 从缓存中获取
    for (const [key, value] of this.masteryCache.entries()) {
      if (key.startsWith(`${userId}-`)) {
        result.set(value.knowledgeId, value);
      }
    }

    // TODO: 从数据库加载（等待Supabase表创建）
    // const dbRecords = await this.persistenceService.getAllMasteries(userId);
    // for (const record of dbRecords) {
    //   result.set(record.knowledgeId, record);
    //   this.masteryCache.set(`${userId}-${record.knowledgeId}`, record);
    // }

    return result;
  }

  async predictCorrectness(userId: string, knowledgeId: string): Promise<number> {
    const mastery = await this.getMastery(userId, knowledgeId);
    const params = this.userParameters.get(userId) || DEFAULT_PARAMETERS;

    // 预测公式：P(正确) = P(掌握) * (1 - P(滑过)) + P(未掌握) * P(猜测)
    const predictedCorrectness =
      mastery * (1 - params.pSlip) + (1 - mastery) * params.pGuess;

    return predictedCorrectness;
  }

  async getConfidenceInterval(
    userId: string,
    knowledgeId: string,
    confidence: number
  ): Promise<[number, number]> {
    // TODO: 实现置信区间计算
    // 简化实现：使用尝试次数来估计置信度
    const cacheKey = `${userId}-${knowledgeId}`;
    const record = this.masteryCache.get(cacheKey);

    if (!record || record.attempts < 3) {
      // 样本不足，返回宽区间
      return [0, 1];
    }

    // 使用标准差估计（简化版）
    const margin = Math.sqrt(record.mastery * (1 - record.mastery) / record.attempts);
    const zScore = confidence === 0.95 ? 1.96 : confidence === 0.9 ? 1.645 : 1;
    
    const lower = Math.max(0, record.mastery - zScore * margin);
    const upper = Math.min(1, record.mastery + zScore * margin);

    return [lower, upper];
  }

  setParameters(userId: string, params: Partial<BKTParameters>): void {
    const existing = this.userParameters.get(userId) || DEFAULT_PARAMETERS;
    this.userParameters.set(userId, { ...existing, ...params });
  }

  getParameters(userId: string): BKTParameters {
    return this.userParameters.get(userId) || DEFAULT_PARAMETERS;
  }

  /**
   * BKT核心算法：更新掌握概率
   * 公式：P(t+1) = P(t) + (1 - P(t)) * P(Learn) 如果正确
   *      P(t+1) = P(t) - P(t) * P(Forget) 如果错误
   */
  private updateMasteryProbability(
    currentMastery: number,
    isCorrect: boolean,
    params: BKTParameters
  ): number {
    if (isCorrect) {
      // 答对了，掌握度上升
      return currentMastery + (1 - currentMastery) * params.pLearn;
    } else {
      // 答错了，掌握度下降
      return currentMastery - currentMastery * params.pForget;
    }
  }

  /**
   * 考虑答题用时的掌握度调整
   * 用时过短可能猜测，用时过长可能困难
   */
  private adjustMasteryByTime(mastery: number, timeSpent: number): number {
    // TODO: 根据题目类型和年级调整
    const normalTime = 30000; // 30秒为正常用时
    if (timeSpent < normalTime * 0.3) {
      // 用时过短，可能猜测，降低掌握度
      return mastery * 0.9;
    } else if (timeSpent > normalTime * 3) {
      // 用时过长，较困难，略微降低掌握度
      return mastery * 0.95;
    }
    return mastery;
  }
}

/**
 * 导出单例实例
 */
export const bayesianTracker = new BayesianKnowledgeTrackerImpl();
