/**
 * AI Token 成本监控器
 * 实时监控 Token 消耗和成本
 */

/**
 * Token 价格配置（元/1K tokens）
 * 价格基于实际市场行情，可调整
 */
const TOKEN_PRICES = {
  doubao: {
    'doubao-seed-1-8-251228': { input: 0.0004, output: 0.0004 },
    'doubao-seed-1-6-251015': { input: 0.0003, output: 0.0003 },
    'doubao-seed-1-6-flash-250615': { input: 0.0002, output: 0.0002 },
    'doubao-seed-1-6-thinking-250715': { input: 0.0005, output: 0.0005 },
    'doubao-seed-1-6-vision-250815': { input: 0.0004, output: 0.0004 },
    'doubao-seed-1-6-lite-251015': { input: 0.0001, output: 0.0001 },
  },
  deepseek: {
    'deepseek-v3-2-251201': { input: 0.0004, output: 0.0004 },
    'deepseek-r1-250528': { input: 0.0005, output: 0.0005 },
  },
};

/**
 * 成本记录
 */
export interface CostRecord {
  id: string;
  timestamp: Date;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  operation: 'chat' | 'stream' | 'generation' | 'analysis';
  userId?: string;
  knowledgeId?: string;
}

/**
 * 成本配置
 */
export interface CostMonitorConfig {
  budget?: number; // 月度预算（元）
  alertThreshold?: number; // 告警阈值（预算的百分比）
  enablePersistence?: boolean; // 是否持久化到数据库
}

/**
 * AI 成本监控器
 */
export class CostMonitor {
  private records: CostRecord[] = [];
  private config: Required<CostMonitorConfig>;
  private monthlyCost = 0;
  private dailyCost = 0;
  private lastResetDate = new Date();

  constructor(config: CostMonitorConfig = {}) {
    this.config = {
      budget: 1000, // 默认月预算1000元
      alertThreshold: 0.8, // 默认80%告警
      enablePersistence: false,
      ...config,
    };

    // 每天重置日成本
    this.scheduleDailyReset();
  }

  /**
   * 记录成本
   */
  record(record: Omit<CostRecord, 'id' | 'timestamp' | 'cost'>): CostRecord {
    const costRecord: CostRecord = {
      id: `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      cost: this.calculateCost(
        record.provider,
        record.model,
        record.promptTokens,
        record.completionTokens
      ),
      ...record,
    };

    this.records.push(costRecord);
    this.monthlyCost += costRecord.cost;
    this.dailyCost += costRecord.cost;

    // 检查是否超出预算
    this.checkBudget();

    // TODO: 如果启用持久化，保存到数据库
    // if (this.config.enablePersistence) {
    //   await this.saveToDatabase(costRecord);
    // }

    return costRecord;
  }

  /**
   * 计算成本
   */
  private calculateCost(
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    const prices = TOKEN_PRICES[provider as keyof typeof TOKEN_PRICES];
    if (!prices) {
      console.warn(`未找到 ${provider} 的价格配置`);
      return 0;
    }

    const modelPrice = prices[model as keyof typeof prices];
    if (!modelPrice) {
      console.warn(`未找到 ${provider}/${model} 的价格配置`);
      return 0;
    }

    const inputCost = (promptTokens / 1000) * modelPrice.input;
    const outputCost = (completionTokens / 1000) * modelPrice.output;

    return inputCost + outputCost;
  }

  /**
   * 检查预算
   */
  private checkBudget(): void {
    const threshold = this.config.budget * this.config.alertThreshold;
    const usage = this.getMonthlyCost();

    if (usage >= this.config.budget) {
      console.error(`❌ 已超出月度预算！已使用：¥${usage.toFixed(2)}，预算：¥${this.config.budget.toFixed(2)}`);
      // TODO: 发送告警通知
      // await this.sendAlert('budget_exceeded', { usage, budget: this.config.budget });
    } else if (usage >= threshold) {
      console.warn(`⚠️ 即将超出预算！已使用：¥${usage.toFixed(2)} (${(usage / this.config.budget * 100).toFixed(1)}%)`);
      // TODO: 发送告警通知
      // await this.sendAlert('budget_warning', { usage, threshold });
    }
  }

  /**
   * 获取月度成本
   */
  getMonthlyCost(): number {
    return this.monthlyCost;
  }

  /**
   * 获取日成本
   */
  getDailyCost(): number {
    return this.dailyCost;
  }

  /**
   * 获取总成本（所有时间）
   */
  getTotalCost(): number {
    return this.records.reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * 获取成本统计
   */
  getStats() {
    const stats = {
      totalRecords: this.records.length,
      monthlyCost: this.getMonthlyCost(),
      dailyCost: this.getDailyCost(),
      totalCost: this.getTotalCost(),
      budget: this.config.budget,
      budgetUsage: this.getMonthlyCost() / this.config.budget,
      byProvider: {} as Record<string, { totalTokens: number; totalCost: number }>,
      byModel: {} as Record<string, { totalTokens: number; totalCost: number }>,
      byOperation: {} as Record<string, { count: number; totalCost: number }>,
    };

    for (const record of this.records) {
      // 按提供商统计
      if (!stats.byProvider[record.provider]) {
        stats.byProvider[record.provider] = { totalTokens: 0, totalCost: 0 };
      }
      stats.byProvider[record.provider].totalTokens += record.totalTokens;
      stats.byProvider[record.provider].totalCost += record.cost;

      // 按模型统计
      const modelKey = `${record.provider}/${record.model}`;
      if (!stats.byModel[modelKey]) {
        stats.byModel[modelKey] = { totalTokens: 0, totalCost: 0 };
      }
      stats.byModel[modelKey].totalTokens += record.totalTokens;
      stats.byModel[modelKey].totalCost += record.cost;

      // 按操作统计
      if (!stats.byOperation[record.operation]) {
        stats.byOperation[record.operation] = { count: 0, totalCost: 0 };
      }
      stats.byOperation[record.operation].count++;
      stats.byOperation[record.operation].totalCost += record.cost;
    }

    return stats;
  }

  /**
   * 获取成本趋势（最近N天）
   */
  getCostTrend(days: number = 7): Array<{ date: string; cost: number }> {
    const trend: Array<{ date: string; cost: number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dailyRecords = this.records.filter(
        r => r.timestamp >= date && r.timestamp < nextDate
      );

      const dailyCost = dailyRecords.reduce((sum, r) => sum + r.cost, 0);

      trend.push({
        date: date.toISOString().split('T')[0],
        cost: dailyCost,
      });
    }

    return trend;
  }

  /**
   * 获取用户成本
   */
  getUserCost(userId: string): number {
    return this.records
      .filter(r => r.userId === userId)
      .reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * 获取知识点的成本
   */
  getKnowledgeCost(knowledgeId: string): number {
    return this.records
      .filter(r => r.knowledgeId === knowledgeId)
      .reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * 重置日成本
   */
  private scheduleDailyReset(): void {
    setInterval(() => {
      const now = new Date();
      const lastDate = this.lastResetDate;

      // 如果是新的一天，重置日成本
      if (
        now.getDate() !== lastDate.getDate() ||
        now.getMonth() !== lastDate.getMonth() ||
        now.getFullYear() !== lastDate.getFullYear()
      ) {
        this.dailyCost = 0;
        this.lastResetDate = new Date();
        console.log('✅ 日成本已重置');
      }
    }, 60 * 1000); // 每分钟检查一次
  }

  /**
   * 导出成本报告
   */
  exportReport(): string {
    const stats = this.getStats();

    return `
=== AI 成本报告 ===

月度成本：¥${stats.monthlyCost.toFixed(2)}
日成本：¥${stats.dailyCost.toFixed(2)}
总成本：¥${stats.totalCost.toFixed(2)}
预算使用率：${(stats.budgetUsage * 100).toFixed(1)}%
预算：¥${stats.budget.toFixed(2)}

按提供商统计：
${Object.entries(stats.byProvider)
  .map(([provider, data]) => `  ${provider}: ${data.totalTokens} tokens, ¥${data.totalCost.toFixed(2)}`)
  .join('\n')}

按模型统计：
${Object.entries(stats.byModel)
  .map(([model, data]) => `  ${model}: ${data.totalTokens} tokens, ¥${data.totalCost.toFixed(2)}`)
  .join('\n')}

按操作统计：
${Object.entries(stats.byOperation)
  .map(([op, data]) => `  ${op}: ${data.count}次, ¥${data.totalCost.toFixed(2)}`)
  .join('\n')}
`.trim();
  }
}

/**
 * 导出单例实例
 */
export const costMonitor = new CostMonitor({
  budget: 1000,
  alertThreshold: 0.8,
});
