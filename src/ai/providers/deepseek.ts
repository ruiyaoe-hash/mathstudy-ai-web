/**
 * DeepSeek AI Provider 实现
 * 基于 coze-coding-dev-sdk 的 DeepSeek 模型
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { AIProvider, AIProviderConfig, AICompletionRequest, AICompletionResponse, AIStreamChunk } from './base';

/**
 * DeepSeek 模型配置
 */
export interface DeepSeekConfig extends AIProviderConfig {
  model?:
    | 'deepseek-v3-2-251201' // DeepSeek V3.2 - 高级推理
    | 'deepseek-r1-250528'; // DeepSeek R1 - 研究分析
}

/**
 * DeepSeek Provider 实现
 */
export class DeepSeekProvider implements AIProvider {
  private client: LLMClient;
  private config: DeepSeekConfig;

  constructor(config: DeepSeekConfig) {
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

      // 调用 DeepSeek API
      const response = await this.client.invoke(
        messages,
        {
          model: this.config.model || 'deepseek-v3-2-251201',
          temperature: request.temperature ?? 0.7,
          streaming: false,
          thinking: 'disabled',
          caching: 'disabled',
        }
      );

      // 返回响应
      return {
        content: response.content,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        model: this.config.model || 'deepseek-v3-2-251201',
      };
    } catch (error) {
      console.error('DeepSeek chat error:', error);
      throw new Error(`DeepSeek API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      // 调用 DeepSeek 流式 API
      const stream = this.client.stream(
        messages,
        {
          model: this.config.model || 'deepseek-v3-2-251201',
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
      console.error('DeepSeek chat stream error:', error);
      throw new Error(`DeepSeek stream error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chat({
        messages: [{ role: 'user', content: '测试连接' }],
      });
      return response.content.length > 0;
    } catch (error) {
      console.error('DeepSeek connection test failed:', error);
      return false;
    }
  }

  getName(): string {
    return 'DeepSeek';
  }

  getConfig(): AIProviderConfig {
    return this.config;
  }
}

/**
 * 创建 DeepSeek Provider 的工厂函数
 */
export function createDeepSeekProvider(config: DeepSeekConfig): DeepSeekProvider {
  return new DeepSeekProvider(config);
}
