/**
 * 豆包 AI Provider 实现
 * 基于 coze-coding-dev-sdk
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { AIProvider, AIProviderConfig, AICompletionRequest, AICompletionResponse, AIStreamChunk } from './base';

/**
 * 豆包模型配置
 */
export interface DoubaoConfig extends AIProviderConfig {
  model?:
    | 'doubao-seed-1-8-251228' // 默认多模态模型
    | 'doubao-seed-1-6-251015' // 平衡性能模型
    | 'doubao-seed-1-6-flash-250615' // 快速响应模型
    | 'doubao-seed-1-6-thinking-250715' // 思考模型
    | 'doubao-seed-1-6-vision-250815' // 视觉模型
    | 'doubao-seed-1-6-lite-251015'; // 轻量级模型
}

/**
 * 豆包 Provider 实现
 */
export class DoubaoProvider implements AIProvider {
  private client: LLMClient;
  private config: DoubaoConfig;

  constructor(config: DoubaoConfig) {
    this.config = config;

    // 初始化 LLM Client
    const sdkConfig = new Config({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
    });

    this.client = new LLMClient(sdkConfig);
  }

  async chat(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      // 转换消息格式
      const messages = request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // 调用豆包 API
      const response = await this.client.invoke(
        messages,
        {
          model: this.config.model || 'doubao-seed-1-8-251228',
          temperature: request.temperature ?? 0.7,
          streaming: false,
          thinking: 'disabled',
          caching: 'disabled',
        }
      );

      // 返回响应
      return {
        content: response.content,
        // TODO: 从响应中提取 token 使用情况（需要SDK支持）
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        model: this.config.model || 'doubao-seed-1-8-251228',
      };
    } catch (error) {
      console.error('Doubao chat error:', error);
      throw new Error(`Doubao API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async chatStream(
    request: AICompletionRequest,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<void> {
    try {
      // 转换消息格式
      const messages = request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // 调用豆包流式 API
      const stream = this.client.stream(
        messages,
        {
          model: this.config.model || 'doubao-seed-1-8-251228',
          temperature: request.temperature ?? 0.7,
          streaming: true,
          thinking: 'disabled',
          caching: 'disabled',
        }
      );

      // 处理流式响应
      for await (const chunk of stream) {
        if (chunk.content) {
          const content = chunk.content.toString();
          onChunk({
            content,
            done: false,
          });
        }
      }

      // 标记完成
      onChunk({
        content: '',
        done: true,
      });
    } catch (error) {
      console.error('Doubao chat stream error:', error);
      throw new Error(`Doubao stream error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chat({
        messages: [{ role: 'user', content: '测试连接' }],
      });
      return response.content.length > 0;
    } catch (error) {
      console.error('Doubao connection test failed:', error);
      return false;
    }
  }

  getName(): string {
    return 'Doubao';
  }

  getConfig(): AIProviderConfig {
    return this.config;
  }
}

/**
 * 创建豆包 Provider 的工厂函数
 */
export function createDoubaoProvider(config: DoubaoConfig): DoubaoProvider {
  return new DoubaoProvider(config);
}
