/**
 * 知识图谱类型定义
 * 使用泛型和接口设计，支持不同的知识图谱数据结构
 */

// 年级类型（4-6年级）
export type Grade = 4 | 5 | 6;

// 知识模块类型
export type KnowledgeModule = 'computation' | 'geometry' | 'algebra' | 'statistics' | 'integrated';

// 题型类型
export type QuestionType = '计算题' | '应用题' | '填空题' | '选择题' | '判断题';

/**
 * 基础知识节点接口（固定字段）
 */
export interface BaseKnowledgeNode {
  id: string;
  name: string;
  grade: Grade;
  module: KnowledgeModule;
  description?: string;
}

/**
 * 扩展知识节点接口（预留字段，支持ChatGPT生成的各种字段）
 * 这些字段会在知识图谱确认后正式定义
 */
export interface ExtendedKnowledgeNode extends BaseKnowledgeNode {
  // 这些字段先不定义具体类型，等待知识图谱确认
  // 示例：可能包含以下字段
  // difficulty?: number;
  // prerequisites?: string[];
  // questionTypes?: QuestionType[];
  // keyConcepts?: string[];
  // learningObjectives?: string[];
  // commonMistakes?: string[];
  // examples?: Example[];
  [key: string]: any; // 允许任意扩展字段
}

/**
 * 知识图谱适配器接口
 * 用于隔离数据结构，算法通过适配器访问数据
 */
export interface KnowledgeGraphAdapter {
  // 获取节点基本信息
  getNode(id: string): Promise<ExtendedKnowledgeNode | null>;
  
  // 获取前置知识节点
  getPrerequisites(nodeId: string): Promise<ExtendedKnowledgeNode[]>;
  
  // 获取所有可达节点（解锁状态）
  getAccessibleNodes(userId: string): Promise<ExtendedKnowledgeNode[]>;
  
  // 获取难度
  getDifficulty(nodeId: string): Promise<number>;
  
  // 获取支持的题型
  getQuestionTypes(nodeId: string): Promise<QuestionType[]>;
  
  // 获取元数据（灵活访问任意字段）
  getMetadata(nodeId: string, key: string): Promise<any>;
  
  // 检查依赖关系
  checkPrerequisites(nodeId: string): Promise<boolean>;
  
  // 获取学习路径
  getLearningPath(startNodeId?: string): Promise<ExtendedKnowledgeNode[]>;
}

/**
 * 用户知识掌握度
 */
export interface UserKnowledgeMastery {
  id: string;
  userId: string;
  knowledgeId: string;
  mastery: number; // 0-1，掌握概率
  attempts: number; // 尝试次数
  correct: number; // 正确次数
  lastAttemptAt: Date;
  lastReviewAt: Date;
  reviewCount: number;
  nextReviewAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 答题记录
 */
export interface AnswerRecord {
  id: string;
  userId: string;
  questionId: string;
  knowledgeId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  timeSpent: number; // 毫秒
  difficulty: number;
  createdAt: Date;
}

/**
 * 复习计划
 */
export interface ReviewSchedule {
  id: string;
  userId: string;
  knowledgeId: string;
  reviewStage: number; // 1-6，艾宾浩斯阶段
  scheduledAt: Date; // 计划复习时间
  completedAt?: Date; // 实际完成时间
  retentionRate?: number; // 保留率
  createdAt: Date;
}

/**
 * 费曼讲解记录
 */
export interface FeynmanExplanation {
  id: string;
  userId: string;
  questionId: string;
  knowledgeId: string;
  explanationText: string;
  audioUrl?: string;
  aiScore: number; // 0-100
  aiFeedback: string;
  createdAt: Date;
}
