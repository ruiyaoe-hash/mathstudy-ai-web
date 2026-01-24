/**
 * 推荐引擎实现
 * 基于知识图谱依赖关系和贝叶斯知识追踪(BKT)的个性化推荐
 */

import {
  RecommendationEngine,
  RecommendationResult,
  BayesianKnowledgeTracker,
  DifficultyAdjuster,
  LearningScheduler
} from './interfaces';
import { knowledgeGraphService, KnowledgeNode } from '@/services/knowledgeGraphService';
import { BayesianKnowledgeTrackerImpl } from './bayesian-tracker';

/**
 * 推荐优先级计算参数
 */
interface PriorityParams {
  masteryWeight: number;       // 掌握度权重
  difficultyWeight: number;    // 难度权重
  dependencyWeight: number;    // 依赖关系权重
  recencyWeight: number;       // 学习频率权重
}

const DEFAULT_PRIORITY_PARAMS: PriorityParams = {
  masteryWeight: 0.4,          // 掌握度权重40%
  difficultyWeight: 0.3,       // 难度权重30%
  dependencyWeight: 0.2,       // 依赖关系权重20%
  recencyWeight: 0.1,          // 学习频率权重10%
};

/**
 * 推荐引擎实现
 */
export class RecommendationEngineImpl implements RecommendationEngine {
  private bktTracker: BayesianKnowledgeTracker;
  private priorityParams: PriorityParams;
  private userGradeCache: Map<string, number> = new Map();
  private userLastStudyTime: Map<string, number> = new Map();

  constructor(bktTracker?: BayesianKnowledgeTracker) {
    this.bktTracker = bktTracker || new BayesianKnowledgeTrackerImpl();
    this.priorityParams = { ...DEFAULT_PRIORITY_PARAMS };
  }

  /**
   * 获取个性化推荐列表
   */
  async recommend(userId: string, count: number = 5): Promise<RecommendationResult[]> {
    // 获取用户年级
    const grade = await this.getUserGrade(userId);
    if (!grade) {
      return [];
    }

    // 获取学习路径（拓扑排序）
    const learningPath = await knowledgeGraphService.generateLearningPath(grade);

    // 过滤出候选知识点
    const candidates = await this.filterCandidates(userId, learningPath);

    // 计算每个候选知识点的优先级
    const scored = await Promise.all(
      candidates.map(async node => {
        const priority = await this.calculatePriority(userId, node);
        const reason = await this.getRecommendationReason(userId, node.id);
        const expectedDifficulty = await this.predictDifficulty(userId, node);

        return {
          knowledgeNode: node,
          priority,
          reason,
          expectedDifficulty
        };
      })
    );

    // 按优先级排序并返回前count个
    return scored
      .sort((a, b) => b.priority - a.priority)
      .slice(0, count);
  }

  /**
   * 获取推荐理由
   */
  async getRecommendationReason(
    userId: string,
    knowledgeId: string
  ): Promise<string> {
    const node = await knowledgeGraphService.getNodeById(knowledgeId);
    if (!node) {
      return '知识点不存在';
    }

    const mastery = await this.bktTracker.getMastery(userId, knowledgeId);
    const prerequisites = await knowledgeGraphService.getPrerequisites(knowledgeId);

    const reasons: string[] = [];

    // 判断掌握度
    if (mastery < 0.3) {
      reasons.push('该知识点需要加强学习');
    } else if (mastery < 0.7) {
      reasons.push('正在学习中，继续巩固');
    } else {
      reasons.push('即将掌握，最后冲刺');
    }

    // 判断前置依赖
    if (prerequisites.length > 0) {
      const metPrereqs = prerequisites.filter(p =>
        this.bktTracker.getMastery(userId, p.id) > 0.7
      );

      if (metPrereqs.length === prerequisites.length) {
        reasons.push('已满足所有前置条件');
      } else {
        reasons.push(`还需完成 ${prerequisites.length - metPrereqs.length} 个前置知识点`);
      }
    }

    // 判断难度
    if (node.difficulty <= 2) {
      reasons.push('适合作为入门内容');
    } else if (node.difficulty >= 4) {
      reasons.push('具有挑战性的内容');
    }

    return reasons.join('，');
  }

  /**
   * 获取下一个推荐的知识点
   */
  async getNextRecommendation(userId: string): Promise<KnowledgeNode | null> {
    const recommendations = await this.recommend(userId, 1);
    return recommendations.length > 0 ? recommendations[0].knowledgeNode : null;
  }

  /**
   * 记录用户行为
   */
  async recordUserAction(
    userId: string,
    action: 'answer' | 'learn' | 'review',
    knowledgeId: string,
    data: any
  ): Promise<void> {
    if (action === 'answer') {
      const { isCorrect, timeSpent } = data;
      await this.bktTracker.updateMastery(userId, knowledgeId, isCorrect, timeSpent);
    } else if (action === 'review') {
      // 复习行为增加掌握度
      await this.bktTracker.updateMastery(userId, knowledgeId, true, 0);
    }

    // 更新最后学习时间
    this.userLastStudyTime.set(userId, Date.now());
  }

  /**
   * 获取学习进度统计
   */
  async getLearningProgress(userId: string): Promise<{
    totalKnowledge: number;
    masteredKnowledge: number;
    inProgress: number;
    notStarted: number;
    progressPercentage: number;
  }> {
    const grade = await this.getUserGrade(userId);
    if (!grade) {
      return {
        totalKnowledge: 0,
        masteredKnowledge: 0,
        inProgress: 0,
        notStarted: 0,
        progressPercentage: 0
      };
    }

    const allNodes = await knowledgeGraphService.getNodesByGrade(grade);
    const totalKnowledge = allNodes.length;

    let mastered = 0;
    let inProgress = 0;

    for (const node of allNodes) {
      const mastery = await this.bktTracker.getMastery(userId, node.id);
      if (mastery >= 0.8) {
        mastered++;
      } else if (mastery > 0) {
        inProgress++;
      }
    }

    const notStarted = totalKnowledge - mastered - inProgress;
    const progressPercentage = totalKnowledge > 0
      ? Math.round((mastered / totalKnowledge) * 100)
      : 0;

    return {
      totalKnowledge,
      masteredKnowledge: mastered,
      inProgress,
      notStarted,
      progressPercentage
    };
  }

  /**
   * 过滤候选知识点
   * 返回满足前置依赖且未完全掌握的知识点
   */
  private async filterCandidates(
    userId: string,
    nodes: KnowledgeNode[]
  ): Promise<KnowledgeNode[]> {
    const candidates: KnowledgeNode[] = [];

    for (const node of nodes) {
      const mastery = await this.bktTracker.getMastery(userId, node.id);

      // 跳过已掌握的知识点
      if (mastery >= 0.9) {
        continue;
      }

      // 检查前置依赖
      const prerequisites = await knowledgeGraphService.getPrerequisites(node.id);
      const allPrerequisitesMet = prerequisites.every(prereq =>
        this.bktTracker.getMastery(userId, prereq.id) >= 0.7
      );

      // 如果所有前置依赖都满足，或者没有前置依赖
      if (allPrerequisitesMet) {
        candidates.push(node);
      }
    }

    return candidates;
  }

  /**
   * 计算推荐优先级
   * 分数范围：0-100
   */
  private async calculatePriority(
    userId: string,
    node: KnowledgeNode
  ): Promise<number> {
    const params = this.priorityParams;
    let score = 0;

    // 1. 掌握度得分（掌握度越低，优先级越高）
    const mastery = await this.bktTracker.getMastery(userId, node.id);
    const masteryScore = (1 - mastery) * 100 * params.masteryWeight;
    score += masteryScore;

    // 2. 难度得分（难度适中，在最近发展区的优先级高）
    const userAbility = await this.estimateUserAbility(userId);
    const difficultyGap = Math.abs(node.difficulty - userAbility);
    const difficultyScore = (5 - difficultyGap) * 20 * params.difficultyWeight;
    score += difficultyScore;

    // 3. 依赖关系得分（核心知识点优先级高）
    const dependents = await knowledgeGraphService.getDependents(node.id);
    const dependencyScore = Math.min(dependents.length * 10, 100) * params.dependencyWeight;
    score += dependencyScore;

    // 4. 学习频率得分（最近学过的知识点优先级略低）
    const lastStudyTime = this.userLastStudyTime.get(userId) || 0;
    const timeSinceStudy = Date.now() - lastStudyTime;
    const recencyScore = Math.min(timeSinceStudy / (24 * 60 * 60 * 1000), 1) * 100 * params.recencyWeight;
    score += recencyScore;

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * 预测知识点难度（基于用户能力调整）
   */
  private async predictDifficulty(
    userId: string,
    node: KnowledgeNode
  ): Promise<number> {
    const userAbility = await this.estimateUserAbility(userId);
    const mastery = await this.bktTracker.getMastery(userId, node.id);

    // 预测难度 = 原始难度 + (用户能力 - 知识点难度) * (1 - 掌握度)
    const adjustedDifficulty =
      node.difficulty + (userAbility - node.difficulty) * (1 - mastery);

    return Math.max(1, Math.min(5, adjustedDifficulty));
  }

  /**
   * 估算用户当前能力水平（1-5）
   */
  private async estimateUserAbility(userId: string): Promise<number> {
    const grade = await this.getUserGrade(userId);
    if (!grade) {
      return 3;
    }

    // 获取所有知识点及其掌握度
    const allNodes = await knowledgeGraphService.getNodesByGrade(grade);
    if (allNodes.length === 0) {
      return 3;
    }

    let totalWeightedDifficulty = 0;
    let totalMastery = 0;

    for (const node of allNodes) {
      const mastery = await this.bktTracker.getMastery(userId, node.id);
      totalWeightedDifficulty += node.difficulty * mastery;
      totalMastery += mastery;
    }

    if (totalMastery === 0) {
      return 3; // 默认中等难度
    }

    const ability = totalWeightedDifficulty / totalMastery;
    return Math.max(1, Math.min(5, ability));
  }

  /**
   * 获取用户年级
   */
  private async getUserGrade(userId: string): Promise<number | null> {
    if (this.userGradeCache.has(userId)) {
      return this.userGradeCache.get(userId)!;
    }

    // TODO: 从profiles表或user表获取用户年级
    // 目前返回默认值4（四年级）
    const grade = 4;
    this.userGradeCache.set(userId, grade);
    return grade;
  }

  /**
   * 设置用户年级
   */
  setUserGrade(userId: string, grade: number): void {
    this.userGradeCache.set(userId, grade);
  }

  /**
   * 设置优先级参数
   */
  setPriorityParams(params: Partial<PriorityParams>): void {
    this.priorityParams = { ...this.priorityParams, ...params };
  }
}

/**
 * 难度自适应器实现
 */
export class DifficultyAdjusterImpl implements DifficultyAdjuster {
  private bktTracker: BayesianKnowledgeTracker;

  constructor(bktTracker?: BayesianKnowledgeTracker) {
    this.bktTracker = bktTracker || new BayesianKnowledgeTrackerImpl();
  }

  async adjustDifficulty(
    userId: string,
    knowledgeId: string,
    recentAnswers: Array<{ isCorrect: boolean; timeSpent: number }>
  ): Promise<number> {
    const correctCount = recentAnswers.filter(a => a.isCorrect).length;
    const accuracy = correctCount / recentAnswers.length;

    if (accuracy > 0.8) {
      return Math.min(5, await this.predictNextDifficulty(userId, knowledgeId, 0.5));
    } else if (accuracy < 0.5) {
      return Math.max(1, await this.predictNextDifficulty(userId, knowledgeId, -0.5));
    }

    return await this.predictNextDifficulty(userId, knowledgeId, 0);
  }

  async getAppropriateKnowledge(
    userId: string,
    knowledgeIds: string[]
  ): Promise<string> {
    let bestId = knowledgeIds[0];
    let bestScore = -1;

    for (const id of knowledgeIds) {
      const mastery = await this.bktTracker.getMastery(userId, id);
      // 最佳掌握度范围：0.3-0.7
      const score = 1 - Math.abs(mastery - 0.5);
      if (score > bestScore) {
        bestScore = score;
        bestId = id;
      }
    }

    return bestId;
  }

  async isAppropriateDifficulty(
    userId: string,
    knowledgeId: string
  ): Promise<boolean> {
    const mastery = await this.bktTracker.getMastery(userId, knowledgeId);
    // 掌握度在0.2-0.8之间认为难度合适
    return mastery >= 0.2 && mastery <= 0.8;
  }

  private async predictNextDifficulty(
    userId: string,
    knowledgeId: string,
    delta: number
  ): Promise<number> {
    const node = await knowledgeGraphService.getNodeById(knowledgeId);
    return node ? Math.max(1, Math.min(5, node.difficulty + delta)) : 3;
  }
}

/**
 * 学习调度器实现
 */
export class LearningSchedulerImpl implements LearningScheduler {
  private recommendationEngine: RecommendationEngine;

  constructor(engine: RecommendationEngine) {
    this.recommendationEngine = engine;
  }

  async scheduleTodayLearning(userId: string): Promise<KnowledgeNode[]> {
    const recommendations = await this.recommendEngine.recommend(userId, 3);
    return recommendations.map(r => r.knowledgeNode);
  }

  async getSuggestedDuration(userId: string): Promise<number> {
    const progress = await this.recommendationEngine.getLearningProgress(userId);
    const notStarted = progress.notStarted;

    // 根据未开始的知识点数量建议学习时长（分钟）
    // 每个知识点建议15-20分钟
    return Math.min(60, Math.max(20, notStarted * 20));
  }

  async getLearningAdvice(userId: string): Promise<string[]> {
    const advice: string[] = [];
    const progress = await this.recommendationEngine.getLearningProgress(userId);

    if (progress.progressPercentage < 20) {
      advice.push('建议从基础知识点开始学习');
    } else if (progress.progressPercentage < 50) {
      advice.push('保持学习节奏，逐步提升难度');
    } else if (progress.progressPercentage < 80) {
      advice.push('即将完成本阶段学习，加油！');
    } else {
      advice.push('恭喜你即将完成本年级所有内容！');
    }

    if (progress.inProgress > 3) {
      advice.push('有多个知识点正在学习中，建议集中精力完成一两个');
    }

    return advice;
  }
}

// 导出单例实例
export const recommendationEngine = new RecommendationEngineImpl();
export const difficultyAdjuster = new DifficultyAdjusterImpl();
export const learningScheduler = new LearningSchedulerImpl(recommendationEngine);
