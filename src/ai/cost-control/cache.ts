/**
 * AI 调用缓存管理器
 * 用于缓存 AI 响应，降低 Token 消耗
 */

import crypto from 'crypto';

/**
 * 缓存项
 */
interface CacheItem<T> {
  data: T;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
  tokens?: number;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  ttl?: number; // 生存时间（毫秒）
  maxSize?: number; // 最大缓存项数
  enablePersistence?: boolean; // 是否持久化到数据库
}

/**
 * AI 调用缓存管理器
 */
export class AICacheManager<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private config: Required<CacheConfig>;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: 24 * 60 * 60 * 1000, // 默认24小时
      maxSize: 1000, // 默认最多1000项
      enablePersistence: false, // 默认不持久化
      ...config,
    };
  }

  /**
   * 生成缓存键
   */
  generateKey(prompt: string, model: string, temperature: number): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${prompt}|${model}|${temperature}`)
      .digest('hex');
    return hash;
  }

  /**
   * 设置缓存
   */
  set(key: string, data: T, tokens?: number): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.ttl);

    const item: CacheItem<T> = {
      data,
      createdAt: now,
      expiresAt,
      hitCount: 0,
      tokens,
    };

    // 检查缓存大小，必要时清理
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, item);

    // TODO: 如果启用持久化，保存到数据库
    // if (this.config.enablePersistence) {
    //   await this.saveToDatabase(key, item);
    // }
  }

  /**
   * 获取缓存
   */
  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (new Date() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // 更新命中次数
    item.hitCount++;
    this.stats.hits++;

    return item.data;
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }
    // 检查是否过期
    if (new Date() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evictions = 0;
  }

  /**
   * 清理过期缓存
   */
  cleanup(): number {
    const now = new Date();
    let count = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * 淘汰最旧的缓存项
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.createdAt.getTime() < oldestTime) {
        oldestTime = item.createdAt.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? this.stats.hits / (this.stats.hits + this.stats.misses)
      : 0;

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 预热缓存（批量加载常用数据）
   */
  async warmup(entries: Array<{ key: string; data: T; tokens?: number }>): Promise<void> {
    for (const entry of entries) {
      this.set(entry.key, entry.data, entry.tokens);
    }
  }
}

/**
 * 导出单例实例
 */
export const aiCache = new AICacheManager({
  ttl: 24 * 60 * 60 * 1000,
  maxSize: 1000,
});
