import { apiClient } from '@/lib/apiClient';

interface AIConfig {
  provider: 'supabase' | 'express';
  supabaseUrl?: string;
  expressBaseUrl?: string;
}

interface GenerateQuestionsParams {
  knowledgeId: string;
  grade?: number;
  count?: number;
  questionType?: string;
}

interface SolveQuestionParams {
  question: string;
  knowledgeId?: string;
  grade?: number;
}

interface ChatParams {
  message: string;
  knowledgeId?: string;
  grade?: number;
  conversationId?: string;
}

interface ExplainConceptParams {
  concept: string;
  grade?: number;
  examples?: boolean;
}

interface AnalyzeMistakeParams {
  question: string;
  wrongAnswer: string;
  correctAnswer: string;
  knowledgeId?: string;
  grade?: number;
}

interface LearningTipsParams {
  userId?: string;
  grade?: number;
  subject?: string;
}

interface AIResponse<T> {
  success: boolean;
  data: T;
  error: { message: string } | null;
}

interface Question {
  id: string;
  type: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  answer: string;
  explanation: string;
  difficulty: number;
  knowledgeId: string;
}

interface SolutionStep {
  step: number;
  description: string;
  expression: string;
  explanation: string;
}

interface LearningTip {
  id: string;
  title: string;
  content: string;
  importance: string;
  applicableSituation: string;
}

class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  private getEdgeFunctionUrl(action: string, provider: string = 'zhipu'): string {
    return `/functions/v1/ai-service?action=${action}&provider=${provider}`;
  }

  async healthCheck(): Promise<{ status: string; llm: string; timestamp: string }> {
    try {
      if (this.config.provider === 'supabase') {
        return await apiClient.get<{ status: string; llm: string; timestamp: string }>(
          this.getEdgeFunctionUrl('health'),
          { requireAuth: false }
        );
      } else {
        const response = await fetch(`${this.config.expressBaseUrl}/health`);
        if (!response.ok) throw new Error('Health check failed');
        return await response.json();
      }
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        llm: 'disabled',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async generateQuestions(params: GenerateQuestionsParams): Promise<{
    questions: Question[];
    metadata: any;
  }> {
    try {
      if (this.config.provider === 'supabase') {
        return await apiClient.post<{ questions: Question[]; metadata: any }>(
          this.getEdgeFunctionUrl('generate-questions'),
          params
        );
      } else {
        const response = await fetch(`${this.config.expressBaseUrl}/api/ai/generate-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!response.ok) throw new Error('Generate questions failed');
        return await response.json();
      }
    } catch (error) {
      console.error('Generate questions failed:', error);
      return {
        questions: [],
        metadata: {
          error: '生成题目失败',
          message: error instanceof Error ? error.message : '未知错误',
        },
      };
    }
  }

  async solveQuestion(params: SolveQuestionParams): Promise<{
    steps: SolutionStep[];
    finalAnswer: string;
    teachingHint: string;
    metadata: any;
  }> {
    try {
      if (this.config.provider === 'supabase') {
        return await apiClient.post<{
          steps: SolutionStep[];
          finalAnswer: string;
          teachingHint: string;
          metadata: any;
        }>(this.getEdgeFunctionUrl('solve-question'), params);
      } else {
        const response = await fetch(`${this.config.expressBaseUrl}/api/ai/solve-question`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!response.ok) throw new Error('Solve question failed');
        return await response.json();
      }
    } catch (error) {
      console.error('Solve question failed:', error);
      return {
        steps: [],
        finalAnswer: '',
        teachingHint: '',
        metadata: {
          error: '解题失败',
          message: error instanceof Error ? error.message : '未知错误',
        },
      };
    }
  }

  async chat(params: ChatParams): Promise<AIResponse<{
    response: string;
    conversationId: string;
    aiProvider: string;
    model: string;
    confidence: number;
    generatedAt: string;
  }>> {
    try {
      if (this.config.provider === 'supabase') {
        return await apiClient.post<AIResponse<{
          response: string;
          conversationId: string;
          aiProvider: string;
          model: string;
          confidence: number;
          generatedAt: string;
        }>>(this.getEdgeFunctionUrl('chat'), params);
      } else {
        const response = await fetch(`${this.config.expressBaseUrl}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!response.ok) throw new Error('Chat failed');
        return await response.json();
      }
    } catch (error) {
      console.error('Chat failed:', error);
      return {
        success: false,
        data: {
          response: '',
          conversationId: `conv_${Date.now()}`,
          aiProvider: 'local',
          model: 'local-simulator',
          confidence: 0.8,
          generatedAt: new Date().toISOString(),
        },
        error: {
          message: error instanceof Error ? error.message : '未知错误',
        },
      };
    }
  }

  async explainConcept(params: ExplainConceptParams): Promise<AIResponse<{
    explanation: string;
    examples: string[];
    applications: string;
    relatedConcepts: string;
    difficulty: string;
    aiProvider: string;
    model: string;
    generatedAt: string;
  }>> {
    try {
      if (this.config.provider === 'supabase') {
        return await apiClient.post<AIResponse<{
          explanation: string;
          examples: string[];
          applications: string;
          relatedConcepts: string;
          difficulty: string;
          aiProvider: string;
          model: string;
          generatedAt: string;
        }>>(this.getEdgeFunctionUrl('explain-concept'), params);
      } else {
        const response = await fetch(`${this.config.expressBaseUrl}/api/ai/explain-concept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!response.ok) throw new Error('Explain concept failed');
        return await response.json();
      }
    } catch (error) {
      console.error('Explain concept failed:', error);
      return {
        success: false,
        data: {
          explanation: '',
          examples: [],
          applications: '',
          relatedConcepts: '',
          difficulty: '中等',
          aiProvider: 'local',
          model: 'local-simulator',
          generatedAt: new Date().toISOString(),
        },
        error: {
          message: error instanceof Error ? error.message : '未知错误',
        },
      };
    }
  }

  async analyzeMistake(params: AnalyzeMistakeParams): Promise<{
    errorAnalysis: string;
    correctSolution: string;
    learningAdvice: string;
    difficulty: string;
    metadata: any;
  }> {
    try {
      if (this.config.provider === 'supabase') {
        return await apiClient.post<{
          errorAnalysis: string;
          correctSolution: string;
          learningAdvice: string;
          difficulty: string;
          metadata: any;
        }>(this.getEdgeFunctionUrl('analyze-mistake'), params);
      } else {
        const response = await fetch(`${this.config.expressBaseUrl}/api/ai/analyze-mistake`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (!response.ok) throw new Error('Analyze mistake failed');
        return await response.json();
      }
    } catch (error) {
      console.error('Analyze mistake failed:', error);
      return {
        errorAnalysis: '',
        correctSolution: '',
        learningAdvice: '',
        difficulty: '中等',
        metadata: {
          error: '错误分析失败',
          message: error instanceof Error ? error.message : '未知错误',
        },
      };
    }
  }

  async getLearningTips(params: LearningTipsParams): Promise<AIResponse<{
    tips: LearningTip[];
    grade: number;
    subject: string;
    aiProvider: string;
    model: string;
    generatedAt: string;
  }>> {
    try {
      if (this.config.provider === 'supabase') {
        return await apiClient.post<AIResponse<{
          tips: LearningTip[];
          grade: number;
          subject: string;
          aiProvider: string;
          model: string;
          generatedAt: string;
        }>>(this.getEdgeFunctionUrl('learning-tips'), params);
      } else {
        const queryParams = new URLSearchParams();
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.grade) queryParams.append('grade', params.grade.toString());
        if (params.subject) queryParams.append('subject', params.subject);

        const response = await fetch(
          `${this.config.expressBaseUrl}/api/ai/learning-tips?${queryParams.toString()}`
        );
        if (!response.ok) throw new Error('Get learning tips failed');
        return await response.json();
      }
    } catch (error) {
      console.error('Get learning tips failed:', error);
      return {
        success: false,
        data: {
          tips: [],
          grade: params.grade || 5,
          subject: params.subject || 'math',
          aiProvider: 'local',
          model: 'local-simulator',
          generatedAt: new Date().toISOString(),
        },
        error: {
          message: error instanceof Error ? error.message : '未知错误',
        },
      };
    }
  }

  updateConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AIConfig {
    return this.config;
  }
}

const aiService = new AIService({
  provider: (import.meta.env.VITE_AI_PROVIDER as 'supabase' | 'express') || 'supabase',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  expressBaseUrl: import.meta.env.VITE_EXPRESS_BASE_URL || 'http://localhost:3001',
});

export { aiService, AIService };
export type {
  AIConfig,
  GenerateQuestionsParams,
  SolveQuestionParams,
  ChatParams,
  ExplainConceptParams,
  AnalyzeMistakeParams,
  LearningTipsParams,
  AIResponse,
  Question,
  SolutionStep,
  LearningTip,
};
