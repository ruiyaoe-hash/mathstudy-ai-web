/**
 * 题目生成服务
 * 使用AI生成个性化题目和解析
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { createPromptManager } from '@/ai/templates';
import { knowledgeGraphService, KnowledgeNode } from '@/services/knowledgeGraphService';
import { aiCache } from '@/ai/cost-control/cache';
import { costMonitor } from '@/ai/cost-control/monitor';

/**
 * 题目类型
 */
export type QuestionType =
  | 'computation'
  | 'wordProblem'
  | 'trueFalse'
  | 'fillBlank'
  | 'comprehensive'
  | 'openEnded'
  | 'complexWordProblem'
  | 'reasoningProblem'
  | 'inquiryProblem';

/**
 * 题目选项
 */
export interface QuestionOption {
  id: string;
  text: string;
}

/**
 * 单个题目
 */
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: QuestionOption[];
  answer: string;
  explanation: string;
  teachingHint?: string;
  diagramHint?: string;
  context?: string;
  difficulty: number;
  knowledgeId: string;
}

/**
 * 生成题目请求
 */
export interface GenerateQuestionsRequest {
  knowledgeId: string;
  questionType: QuestionType;
  count: number;
  grade?: number;
  difficultyRange?: [number, number];
}

/**
 * 生成题目响应
 */
export interface GenerateQuestionsResponse {
  questions: Question[];
  metadata: {
    knowledgeId: string;
    knowledgeName: string;
    grade: number;
    questionType: QuestionType;
    generatedAt: string;
    aiProvider: string;
    model: string;
  };
}

/**
 * 解析生成请求
 */
export interface GenerateExplanationRequest {
  question: string;
  wrongAnswer?: string;
  correctAnswer: string;
  knowledgeId: string;
  explanationType: 'mistakeExplanation' | 'teacherHint' | 'knowledgeSummary' | 'knowledgeSystem';
  grade?: number;
}

/**
 * 题目生成服务
 */
export class QuestionGenerationService {
  private llmClient: LLMClient;
  private promptManagers: Map<number, ReturnType<typeof createPromptManager>> = new Map();

  constructor() {
    this.llmClient = new LLMClient(new Config());
  }

  /**
   * 生成题目（流式）
   */
  async *generateQuestionsStream(
    request: GenerateQuestionsRequest
  ): AsyncGenerator<string, GenerateQuestionsResponse> {
    // 1. 获取知识点信息
    const node = await knowledgeGraphService.getNodeById(request.knowledgeId);
    if (!node) {
      throw new Error(`知识点不存在: ${request.knowledgeId}`);
    }

    const grade = request.grade ?? node.grade;
    const topic = node.name;

    // 2. 检查缓存
    const cacheKey = this.getCacheKey(request);
    const cached = await aiCache.get(cacheKey);
    if (cached) {
      const response = JSON.parse(cached);
      yield "正在加载缓存的题目...";
      return response;
    }

    // 3. 获取Prompt模板
    const promptManager = this.getPromptManager(grade);
    const prompt = promptManager.getQuestionTemplate(request.questionType, topic);

    // 4. 构建消息
    const messages = [
      { role: 'system', content: '你是一个专业的数学老师，擅长生成适合学生的练习题。' },
      { role: 'user', content: prompt }
    ];

    // 5. 调用AI（流式）
    yield "正在生成题目...";
    let fullContent = '';

    try {
      const stream = this.llmClient.stream(messages, {
        model: 'doubao-seed-1-8-251228',
        temperature: 0.7,
        thinking: 'disabled',
        caching: 'enabled',
      });

      for await (const chunk of stream) {
        if (chunk.content) {
          const text = chunk.content.toString();
          fullContent += text;
          yield text;
        }
      }

      // 6. 解析AI响应
      const response = this.parseQuestionsResponse(fullContent, request, node);

      // 7. 缓存结果
      await aiCache.set(cacheKey, JSON.stringify(response));

      // 8. 记录成本
      await costMonitor.recordUsage('question_generation', {
        tokens: fullContent.length, // 简化估算
        provider: 'doubao',
        model: 'doubao-seed-1-8-251228'
      });

      return response;
    } catch (error) {
      console.error('生成题目失败:', error);
      throw new Error(`AI生成题目失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 生成题目（非流式）
   */
  async generateQuestions(request: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
    // 使用非流式方式直接调用
    const node = await knowledgeGraphService.getNodeById(request.knowledgeId);
    if (!node) {
      throw new Error(`知识点不存在: ${request.knowledgeId}`);
    }

    const grade = request.grade ?? node.grade;
    const topic = node.name;

    const cacheKey = this.getCacheKey(request);
    const cached = await aiCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const promptManager = this.getPromptManager(grade);
    const prompt = promptManager.getQuestionTemplate(request.questionType, topic);

    const messages = [
      { role: 'system', content: '你是一个专业的数学老师，擅长生成适合学生的练习题。' },
      { role: 'user', content: prompt }
    ];

    const response = await this.llmClient.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
      thinking: 'disabled',
      caching: 'enabled',
    });

    const result = this.parseQuestionsResponse(response.content, request, node);
    await aiCache.set(cacheKey, JSON.stringify(result));

    await costMonitor.recordUsage('question_generation', {
      tokens: response.content.length,
      provider: 'doubao',
      model: 'doubao-seed-1-8-251228'
    });

    return result;
  }

  /**
   * 生成解析
   */
  async generateExplanation(
    request: GenerateExplanationRequest
  ): Promise<string> {
    const node = await knowledgeGraphService.getNodeById(request.knowledgeId);
    if (!node) {
      throw new Error(`知识点不存在: ${request.knowledgeId}`);
    }

    const grade = request.grade ?? node.grade;
    const promptManager = this.getPromptManager(grade);

    let prompt: string;
    if (request.explanationType === 'mistakeExplanation' && request.wrongAnswer) {
      prompt = promptManager.getExplanationTemplate('mistakeExplanation', [
        request.question,
        request.wrongAnswer,
        request.correctAnswer
      ]);
    } else if (request.explanationType === 'teacherHint') {
      prompt = promptManager.getExplanationTemplate('teacherHint', [request.question]);
    } else if (request.explanationType === 'knowledgeSummary') {
      prompt = promptManager.getExplanationTemplate('knowledgeSummary', [node.name]);
    } else {
      prompt = promptManager.getExplanationTemplate('knowledgeSystem', [node.name]);
    }

    const messages = [
      { role: 'system', content: '你是一个专业的数学老师，擅长用简单易懂的语言解释数学概念。' },
      { role: 'user', content: prompt }
    ];

    const response = await this.llmClient.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
      thinking: 'disabled',
      caching: 'enabled',
    });

    return response.content;
  }

  /**
   * 获取支持的知识点
   */
  async getSupportedKnowledgeIds(grade?: number): Promise<string[]> {
    const nodes = grade
      ? await knowledgeGraphService.getNodesByGrade(grade)
      : await knowledgeGraphService.getAllNodes();
    return nodes.map(n => n.id);
  }

  /**
   * 获取支持的题型
   */
  getSupportedQuestionTypes(grade: number): QuestionType[] {
    const promptManager = this.getPromptManager(grade);
    const features = promptManager.getSupportedFeatures();
    return features.questionTypes as QuestionType[];
  }

  /**
   * 解析题目响应
   */
  private parseQuestionsResponse(
    content: string,
    request: GenerateQuestionsRequest,
    node: KnowledgeNode
  ): GenerateQuestionsResponse {
    try {
      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI响应中未找到JSON格式');
      }

      const jsonStr = jsonMatch[0];
      const data = JSON.parse(jsonStr);

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('AI响应格式错误：缺少questions数组');
      }

      // 转换为标准格式
      const questions: Question[] = data.questions.map((q: any, index: number) => ({
        id: q.id || `${request.knowledgeId}-${Date.now()}-${index}`,
        type: request.questionType,
        question: q.question,
        options: q.options ? q.options.map((opt: any, i: number) => ({
          id: String.fromCharCode(65 + i),
          text: opt
        })) : undefined,
        answer: q.answer,
        explanation: q.explanation,
        teachingHint: q.teachingHint,
        diagramHint: q.diagramHint,
        context: q.context,
        difficulty: node.difficulty,
        knowledgeId: request.knowledgeId
      }));

      return {
        questions,
        metadata: {
          knowledgeId: request.knowledgeId,
          knowledgeName: node.name,
          grade: node.grade,
          questionType: request.questionType,
          generatedAt: new Date().toISOString(),
          aiProvider: 'doubao',
          model: 'doubao-seed-1-8-251228'
        }
      };
    } catch (error) {
      console.error('解析题目响应失败:', error);
      // 返回一个默认的响应
      return {
        questions: [],
        metadata: {
          knowledgeId: request.knowledgeId,
          knowledgeName: node.name,
          grade: node.grade,
          questionType: request.questionType,
          generatedAt: new Date().toISOString(),
          aiProvider: 'doubao',
          model: 'doubao-seed-1-8-251228'
        }
      };
    }
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(request: GenerateQuestionsRequest): string {
    return `question:${request.knowledgeId}:${request.questionType}:${request.count}`;
  }

  /**
   * 获取Prompt管理器
   */
  private getPromptManager(grade: number) {
    if (!this.promptManagers.has(grade)) {
      this.promptManagers.set(grade, createPromptManager(grade as any));
    }
    return this.promptManagers.get(grade)!;
  }
}

// 导出单例实例
export const questionGenerationService = new QuestionGenerationService();
