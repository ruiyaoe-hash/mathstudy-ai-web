/**
 * AI题目生成 API 服务
 * 支持 Supabase Edge Functions 和 Express 后端两种模式
 */

import { Question } from '@/types/game';
import { supabase } from '@/lib/supabase';

// API模式：'edge-function' | 'express'
const API_MODE = import.meta.env.VITE_API_MODE || 'edge-function';

// Edge Function URL
const EDGE_FUNCTION_BASE_URL = import.meta.env.VITE_EDGE_FUNCTION_URL ||
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

// Express 后端 URL
const EXPRESS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * 题目生成响应
 */
export interface AIQuestionResponse {
  questions: Question[];
  metadata: {
    knowledgeId: string;
    knowledgeName: string;
    grade: number;
    questionType: string;
    generatedAt: string;
    aiProvider: string;
    model: string;
  };
}

/**
 * 推荐项
 */
export interface RecommendationItem {
  id: string;
  name: string;
  grade: number;
  difficulty: number;
  important: boolean;
  priority: number;
  recommendationReason: string;
  learningStatus: string;
}

/**
 * 推荐响应
 */
export interface RecommendationsResponse {
  userId: string;
  recommendations: RecommendationItem[];
  generatedAt: string;
  totalKnowledgePoints: number;
  learnedCount: number;
}

/**
 * 获取API基础URL（根据模式）
 */
function getApiBaseURL(): string {
  if (API_MODE === 'edge-function') {
    return EDGE_FUNCTION_BASE_URL;
  }
  return EXPRESS_API_BASE_URL;
}

/**
 * 获取请求headers
 */
async function getHeaders(): Promise<HeadersInit> {
  if (API_MODE === 'edge-function') {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * 生成题目
 */
export async function generateAIQuestions(
  knowledgeId: string,
  grade: number,
  count: number = 6,
  questionType?: string
): Promise<Question[]> {
  try {
    const baseURL = getApiBaseURL();
    const headers = await getHeaders();

    // 根据模式构建不同的请求
    const endpoint = API_MODE === 'edge-function'
      ? `${baseURL}/ai-service`
      : `${baseURL}/api/ai/generate-questions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        knowledgeId,
        grade,
        count,
        questionType
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('AI题目生成失败:', error);
      return [];
    }

    const data: AIQuestionResponse = await response.json();
    return data.questions;
  } catch (error) {
    console.error('生成AI题目失败:', error);
    return [];
  }
}

/**
 * 检查是否启用AI题目生成
 */
export function isAIGenerationEnabled(): boolean {
  // Edge Function模式：检查Supabase配置
  if (API_MODE === 'edge-function') {
    return !!import.meta.env.VITE_SUPABASE_URL;
  }
  // Express模式：检查后端URL配置
  return !!import.meta.env.VITE_API_BASE_URL;
}

/**
 * 检查AI服务健康状态
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const baseURL = getApiBaseURL();
    const headers = await getHeaders();

    // 根据模式构建不同的健康检查端点
    const endpoint = API_MODE === 'edge-function'
      ? `${baseURL}/ai-service?action=health`
      : `${baseURL}/health`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(3000), // 3秒超时
    });
    const data = await response.json();
    return data.status === 'ok' && data.llm === 'enabled';
  } catch (error) {
    console.error('AI服务健康检查失败:', error);
    return false;
  }
}

/**
 * 获取智能推荐
 */
export async function getRecommendations(userId: string): Promise<RecommendationItem[]> {
  try {
    const baseURL = getApiBaseURL();
    const headers = await getHeaders();

    // Edge Function和Express有不同的端点
    const endpoint = API_MODE === 'edge-function'
      ? `${baseURL}/recommendations/${userId}`
      : `${baseURL}/api/ai/recommendations/${userId}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('获取推荐失败:', error);
      return [];
    }

    const data: RecommendationsResponse = await response.json();
    return data.recommendations || [];
  } catch (error) {
    console.error('获取推荐失败:', error);
    return [];
  }
}

/**
 * 获取当前API模式
 */
export function getApiMode(): string {
  return API_MODE;
}

/**
 * 检查是否使用Edge Function模式
 */
export function isEdgeFunctionMode(): boolean {
  return API_MODE === 'edge-function';
}
