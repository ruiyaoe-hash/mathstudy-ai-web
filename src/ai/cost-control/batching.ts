/**
 * AI 批处理器
 * 批量处理AI调用，减少API调用次数，降低成本
 */

/**
 * 批处理请求项
 */
export interface BatchRequest<T> {
  id: string;
  data: T;
  priority?: number; // 优先级，越高越先处理
}

/**
 * 批处理配置
 */
export interface BatchConfig {
  maxBatchSize?: number; // 最大批处理大小
  maxWaitTime?: number; // 最大等待时间（毫秒）
  minBatchSize?: number; // 最小批处理大小
}

/**
 * 批处理器
 */
export class AIBatchProcessor<TInput, TOutput> {
  private config: Required<BatchConfig>;
  private queue: Map<string, BatchRequest<TInput>> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private processor: (batch: Array<{ id: string; data: TInput }>) => Promise<Array<{ id: string; result: TOutput }>>,
    config: BatchConfig = {}
  ) {
    this.config = {
      maxBatchSize: 10, // 默认最多10个一批
      maxWaitTime: 5000, // 默认最多等待5秒
      minBatchSize: 3, // 默认至少3个才处理
      ...config,
    };
  }

  /**
   * 添加请求到队列
   */
  add(requestId: string, data: TInput, priority?: number): Promise<TOutput> {
    return new Promise((resolve, reject) => {
      this.queue.set(requestId, {
        id: requestId,
        data,
        priority: priority ?? 0,
      });

      // 保存Promise回调
      (request as any).resolve = resolve;
      (request as any).reject = reject;

      // 检查是否达到最大批处理大小
      if (this.queue.size >= this.config.maxBatchSize) {
        this.process();
        return;
      }

      // 设置定时器，如果超时则处理
      if (this.queue.size >= this.config.minBatchSize && !this.timer) {
        this.timer = setTimeout(() => {
          this.process();
        }, this.config.maxWaitTime);
      }
    });
  }

  /**
   * 处理队列中的请求
   */
  private async process(): Promise<void> {
    if (this.isProcessing || this.queue.size === 0) {
      return;
    }

    this.isProcessing = true;

    // 清除定时器
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    try {
      // 从队列中取出请求
      const requests = Array.from(this.queue.values());
      
      // 按优先级排序
      requests.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      // 清空队列
      this.queue.clear();

      // 调用批处理函数
      const results = await this.processor(
        requests.map(r => ({ id: r.id, data: r.data }))
      );

      // 返回结果
      const resultMap = new Map(results.map(r => [r.id, r.result]));

      for (const request of requests) {
        const result = resultMap.get(request.id);
        if (result) {
          (request as any).resolve(result);
        } else {
          (request as any).reject(new Error(`未找到请求 ${request.id} 的结果`));
        }
      }
    } catch (error) {
      console.error('批处理失败:', error);
      // 拒绝所有请求
      for (const request of this.queue.values()) {
        (request as any).reject(error);
      }
      this.queue.clear();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 获取队列大小
   */
  getQueueSize(): number {
    return this.queue.size;
  }

  /**
   * 清空队列
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue.clear();
  }

  /**
   * 强制处理当前队列
   */
  async flush(): Promise<void> {
    await this.process();
  }
}

/**
 * 批处理器工厂函数
 */
export function createBatchProcessor<TInput, TOutput>(
  processor: (batch: Array<{ id: string; data: TInput }>) => Promise<Array<{ id: string; result: TOutput }>>,
  config?: BatchConfig
): AIBatchProcessor<TInput, TOutput> {
  return new AIBatchProcessor(processor, config);
}

/**
 * 示例：批量生成题目
 */
export function createQuestionBatchProcessor(
  questionGenerator: (prompts: Array<{ id: string; prompt: string }>) => Promise<Array<{ id: string; question: any }>>
) {
  return createBatchProcessor(
    async (batch: Array<{ id: string; data: string }>) => {
      const prompts = batch.map(item => ({ id: item.id, prompt: item.data }));
      return await questionGenerator(prompts);
    },
    {
      maxBatchSize: 5,
      maxWaitTime: 3000,
      minBatchSize: 2,
    }
  );
}

/**
 * 示例：批量诊断知识点
 */
export function createDiagnosticBatchProcessor(
  diagnosticGenerator: (answers: Array<{ id: string; answerData: any }>) => Promise<Array<{ id: string; diagnosis: any }>>
) {
  return createBatchProcessor(
    async (batch: Array<{ id: string; data: any }>) => {
      const answers = batch.map(item => ({ id: item.id, answerData: item.data }));
      return await diagnosticGenerator(answers);
    },
    {
      maxBatchSize: 10,
      maxWaitTime: 5000,
      minBatchSize: 3,
    }
  );
}
