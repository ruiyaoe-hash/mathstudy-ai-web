import { createClient } from '@supabase/supabase-js'

// AI 服务配置
interface AIConfig {
  provider: 'supabase' | 'express'
  supabaseUrl?: string
  supabaseAnonKey?: string
  expressBaseUrl?: string
}

// 题目生成参数
interface GenerateQuestionsParams {
  knowledgeId: string
  grade?: number
  count?: number
  questionType?: string
}

// 解题参数
interface SolveQuestionParams {
  question: string
  knowledgeId?: string
  grade?: number
}

// 聊天参数
interface ChatParams {
  message: string
  knowledgeId?: string
  grade?: number
  conversationId?: string
}

// 概念解释参数
interface ExplainConceptParams {
  concept: string
  grade?: number
  examples?: boolean
}

// 错误分析参数
interface AnalyzeMistakeParams {
  question: string
  wrongAnswer: string
  correctAnswer: string
  knowledgeId?: string
  grade?: number
}

// 学习建议参数
interface LearningTipsParams {
  userId?: string
  grade?: number
  subject?: string
}

// AI 服务响应类型
interface AIResponse<T> {
  success: boolean
  data: T
  error: { message: string } | null
}

// 题目类型
interface Question {
  id: string
  type: string
  question: string
  options: {
    id: string
    text: string
  }[]
  answer: string
  explanation: string
  difficulty: number
  knowledgeId: string
}

// 解题步骤类型
interface SolutionStep {
  step: number
  description: string
  expression: string
  explanation: string
}

// 学习建议类型
interface LearningTip {
  id: string
  title: string
  content: string
  importance: string
  applicableSituation: string
}

// AI 服务类
class AIService {
  private config: AIConfig
  private supabase: any

  constructor(config: AIConfig) {
    this.config = config
    
    // 初始化 Supabase 客户端
    if (config.provider === 'supabase' && config.supabaseUrl && config.supabaseAnonKey) {
      this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
    }
  }

  // 健康检查
  async healthCheck(): Promise<{ status: string; llm: string; timestamp: string }> {
    try {
      if (this.config.provider === 'supabase') {
        // 调用 Supabase Edge Function 健康检查
        const response = await fetch(
          `${this.config.supabaseUrl}/functions/v1/ai-service?action=health&provider=zhipu`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.config.supabaseAnonKey}`
            }
          }
        )
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      } else {
        // 调用 Express 后端健康检查
        const response = await fetch(`${this.config.expressBaseUrl}/health`)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      }
    } catch (error) {
      console.error('健康检查失败:', error)
      return {
        status: 'error',
        llm: 'disabled',
        timestamp: new Date().toISOString()
      }
    }
  }

  // 生成题目
  async generateQuestions(params: GenerateQuestionsParams): Promise<{
    questions: Question[]
    metadata: any
  }> {
    try {
      if (this.config.provider === 'supabase') {
        // 调用 Supabase Edge Function
        const response = await fetch(
          `${this.config.supabaseUrl}/functions/v1/ai-service?action=generate-questions&provider=zhipu`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.supabaseAnonKey}`
            },
            body: JSON.stringify(params)
          }
        )
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      } else {
        // 调用 Express 后端
        const response = await fetch(`${this.config.expressBaseUrl}/api/ai/generate-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      }
    } catch (error) {
      console.error('生成题目失败:', error)
      return {
        questions: [],
        metadata: {
          error: '生成题目失败',
          message: error instanceof Error ? error.message : '未知错误'
        }
      }
    }
  }

  // 解题辅导
  async solveQuestion(params: SolveQuestionParams): Promise<{
    steps: SolutionStep[]
    finalAnswer: string
    teachingHint: string
    metadata: any
  }> {
    try {
      if (this.config.provider === 'supabase') {
        // 调用 Supabase Edge Function
        const response = await fetch(
          `${this.config.supabaseUrl}/functions/v1/ai-service?action=solve-question&provider=zhipu`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.supabaseAnonKey}`
            },
            body: JSON.stringify(params)
          }
        )
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      } else {
        // 调用 Express 后端
        const response = await fetch(`${this.config.expressBaseUrl}/api/ai/solve-question`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      }
    } catch (error) {
      console.error('解题失败:', error)
      return {
        steps: [],
        finalAnswer: '',
        teachingHint: '',
        metadata: {
          error: '解题失败',
          message: error instanceof Error ? error.message : '未知错误'
        }
      }
    }
  }

  // AI 对话
  async chat(params: ChatParams): Promise<AIResponse<{
    response: string
    conversationId: string
    aiProvider: string
    model: string
    confidence: number
    generatedAt: string
  }>> {
    try {
      if (this.config.provider === 'supabase') {
        // 调用 Supabase Edge Function
        const response = await fetch(
          `${this.config.supabaseUrl}/functions/v1/ai-service?action=chat&provider=zhipu`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.supabaseAnonKey}`
            },
            body: JSON.stringify(params)
          }
        )
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      } else {
        // 调用 Express 后端
        const response = await fetch(`${this.config.expressBaseUrl}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      }
    } catch (error) {
      console.error('聊天失败:', error)
      return {
        success: false,
        data: {
          response: '',
          conversationId: `conv_${Date.now()}`,
          aiProvider: 'local',
          model: 'local-simulator',
          confidence: 0.8,
          generatedAt: new Date().toISOString()
        },
        error: {
          message: error instanceof Error ? error.message : '未知错误'
        }
      }
    }
  }

  // 概念解释
  async explainConcept(params: ExplainConceptParams): Promise<AIResponse<{
    explanation: string
    examples: string[]
    applications: string
    relatedConcepts: string
    difficulty: string
    aiProvider: string
    model: string
    generatedAt: string
  }>> {
    try {
      if (this.config.provider === 'supabase') {
        // 调用 Supabase Edge Function
        const response = await fetch(
          `${this.config.supabaseUrl}/functions/v1/ai-service?action=explain-concept&provider=zhipu`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.supabaseAnonKey}`
            },
            body: JSON.stringify(params)
          }
        )
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      } else {
        // 调用 Express 后端
        const response = await fetch(`${this.config.expressBaseUrl}/api/ai/explain-concept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      }
    } catch (error) {
      console.error('概念解释失败:', error)
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
          generatedAt: new Date().toISOString()
        },
        error: {
          message: error instanceof Error ? error.message : '未知错误'
        }
      }
    }
  }

  // 错误分析
  async analyzeMistake(params: AnalyzeMistakeParams): Promise<{
    errorAnalysis: string
    correctSolution: string
    learningAdvice: string
    difficulty: string
    metadata: any
  }> {
    try {
      if (this.config.provider === 'supabase') {
        // 调用 Supabase Edge Function
        const response = await fetch(
          `${this.config.supabaseUrl}/functions/v1/ai-service?action=analyze-mistake&provider=zhipu`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.supabaseAnonKey}`
            },
            body: JSON.stringify(params)
          }
        )
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      } else {
        // 调用 Express 后端
        const response = await fetch(`${this.config.expressBaseUrl}/api/ai/analyze-mistake`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      }
    } catch (error) {
      console.error('错误分析失败:', error)
      return {
        errorAnalysis: '',
        correctSolution: '',
        learningAdvice: '',
        difficulty: '中等',
        metadata: {
          error: '错误分析失败',
          message: error instanceof Error ? error.message : '未知错误'
        }
      }
    }
  }

  // 学习建议
  async getLearningTips(params: LearningTipsParams): Promise<AIResponse<{
    tips: LearningTip[]
    grade: number
    subject: string
    aiProvider: string
    model: string
    generatedAt: string
  }>> {
    try {
      if (this.config.provider === 'supabase') {
        // 调用 Supabase Edge Function
        const response = await fetch(
          `${this.config.supabaseUrl}/functions/v1/ai-service?action=learning-tips&provider=zhipu`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.supabaseAnonKey}`
            },
            body: JSON.stringify(params)
          }
        )
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      } else {
        // 调用 Express 后端
        const queryParams = new URLSearchParams()
        if (params.userId) queryParams.append('userId', params.userId)
        if (params.grade) queryParams.append('grade', params.grade.toString())
        if (params.subject) queryParams.append('subject', params.subject)
        
        const response = await fetch(
          `${this.config.expressBaseUrl}/api/ai/learning-tips?${queryParams.toString()}`
        )
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return await response.json()
      }
    } catch (error) {
      console.error('获取学习建议失败:', error)
      return {
        success: false,
        data: {
          tips: [],
          grade: params.grade || 5,
          subject: params.subject || 'math',
          aiProvider: 'local',
          model: 'local-simulator',
          generatedAt: new Date().toISOString()
        },
        error: {
          message: error instanceof Error ? error.message : '未知错误'
        }
      }
    }
  }

  // 切换 AI 服务提供商
  updateConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config }
    
    // 重新初始化 Supabase 客户端
    if (config.provider === 'supabase' && config.supabaseUrl && config.supabaseAnonKey) {
      this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
    }
  }

  // 获取当前配置
  getConfig(): AIConfig {
    return this.config
  }
}

// 创建默认的 AI 服务实例
const createAIService = (config: AIConfig): AIService => {
  return new AIService(config)
}

// 导出
const aiService = createAIService({
  provider: (import.meta.env.VITE_AI_PROVIDER as 'supabase' | 'express') || 'supabase',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  expressBaseUrl: import.meta.env.VITE_EXPRESS_BASE_URL || 'http://localhost:3001'
})

export { aiService, createAIService }
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
  LearningTip
}
