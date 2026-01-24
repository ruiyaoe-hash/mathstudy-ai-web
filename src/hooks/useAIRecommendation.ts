/**
 * AI推荐 Hook
 * 获取个性化学习推荐
 */

import { useState, useEffect } from 'react';
import { recommendationEngine } from '@/core/recommendation/engine';
import { getCurrentUser } from '@/utils/userStorage';

interface RecommendationItem {
  knowledgeId: string;
  priority: number;
  reason: string;
  expectedDifficulty: number;
  knowledgeName?: string;
}

export const useAIRecommendation = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const user = getCurrentUser();
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        // 获取推荐结果
        const results = await recommendationEngine.recommend(user.id, 3);

        // 转换为推荐项
        const items: RecommendationItem[] = results.map(result => ({
          knowledgeId: result.knowledgeNode.id,
          priority: result.priority,
          reason: result.reason,
          expectedDifficulty: result.expectedDifficulty,
          knowledgeName: result.knowledgeNode.name,
        }));

        setRecommendations(items);
      } catch (err) {
        console.error('获取推荐失败:', err);
        setError(err instanceof Error ? err.message : '获取推荐失败');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return {
    recommendations,
    loading,
    error,
  };
};
