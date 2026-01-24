/**
 * 降级策略 Provider
 * 当主 Provider 失败时自动切换到备用 Provider
 */

import { AIProvider, AIProviderConfig, AICompletionRequest, AICompletionResponse, AIStreamChunk } from './base';

/**
 * 降级策略配置
 */
export interface FallbackConfig {
  primary: AIProvider;
  fallback: AIProvider[];
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * 降级 Provider 实现
 */
export class FallbackProvider implements AIProvider {
  private config: FallbackConfig;

  constructor(config: FallbackConfig) {
    this.config = {
      maxRetries: 2,
      retryDelay: 1000,
      ...config,
    };
  }

  async chat(request: AICompletionRequest): Promise<AICompletionResponse> {
    const providers = [this.config.primary, ...this.config.fallback];

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];

      for (let retry = 0; retry <= (this.config.maxRetries ?? 2); retry++) {
        try {
          console.log(`尝试使用 Provider ${provider.getName()} (尝试 ${retry + 1})`);
          const response = await provider.chat(request);
          console.log(`Provider ${provider.getName()} 成功`);
          return response;
        } catch (error) {
          console.error(`Provider ${provider.getName()} 失败:`, error);
          
          // 如果还有重试次数，等待后重试
          if (retry < (this.config.maxRetries ?? 2)) {
            await this.delay(this.config.retryDelay ?? 1000);
          }
        }
      }

      console.log(`Provider ${provider.getName()} 彻底失败，尝试下一个 Provider`);
    }

    throw new Error('所有 AI Provider 都失败了');
  }

  async chatStream(
    request: AICompletionRequest,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<void> {
    const providers = [this.config.primary, ...this.config.fallback];

    for (const provider of providers) {
      try {
        console.log(`尝试使用 Provider ${provider.getName()} 进行流式输出`);
        await provider.chatStream(request, onChunk);
        console.log(`Provider ${provider.getName()} 流式输出成功`);
        return;
      } catch (error) {
        console.error(`Provider ${provider.getName()} 流式输出失败:`, error);
      }
    }

    throw new Error('所有 AI Provider 流式输出都失败了');
  }

  async testConnection(): Promise<boolean> {
    // 测试所有 Provider，返回第一个可用的
    for (const provider of [this.config.primary, ...this.config.fallback]) {
      try {
        const isAvailable = await provider.testConnection();
        if (isAvailable) {
          console.log(`Provider ${provider.getName()} 可用`);
          return true;
        }
      } catch (error) {
        console.error(`Provider ${provider.getName()} 连接测试失败:`, error);
      }
    }

    return false;
  }

  getName(): string {
    return `Fallback(${this.config.primary.getName()} -> ${this.config.fallback.map(p => p.getName()).join(' -> ')})`;
  }

  getConfig(): AIProviderConfig {
    return this.config.primary.getConfig();
  }

  /**
   * 获取所有 Provider 的状态
   */
  async getProviderStatus(): Promise<Array<{ name: string; available: boolean }>> {
    const providers = [this.config.primary, ...this.config.fallback];
    const statuses = await Promise.all(
      providers.map(async (provider) => ({
        name: provider.getName(),
        available: await provider.testConnection(),
      }))
    );

    return statuses;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 创建降级 Provider 的工厂函数
 */
export function createFallbackProvider(config: FallbackConfig): FallbackProvider {
  return new FallbackProvider(config);
}
