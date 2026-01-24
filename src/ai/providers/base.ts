/**
 * AI Provider基础接口
 * 定义统一的AI调用接口，支持多种大模型
 */

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  jsonMode?: boolean; // 是否强制返回JSON
}

export interface AICompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

/**
 * AI Provider基础接口
 */
export interface AIProvider {
  /**
   * 发送聊天请求
   */
  chat(request: AICompletionRequest): Promise<AICompletionResponse>;

  /**
   * 发送流式聊天请求
   */
  chatStream(
    request: AICompletionRequest,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<void>;

  /**
   * 测试连接
   */
  testConnection(): Promise<boolean>;

  /**
   * 获取Provider名称
   */
  getName(): string;

  /**
   * 获取当前配置
   */
  getConfig(): AIProviderConfig;
}
