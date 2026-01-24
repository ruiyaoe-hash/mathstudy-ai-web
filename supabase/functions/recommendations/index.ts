import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

/**
 * 智能推荐 Edge Function
 * 基于用户学习历史推荐学习内容
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { method } = req
    const url = new URL(req.url)

    // 必须是GET请求
    if (method !== 'GET') {
      return new Response(
        JSON.stringify({ error: '只支持GET请求' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 获取userId
    const userId = url.pathname.split('/').pop()
    if (!userId || userId === 'recommendations') {
      return new Response(
        JSON.stringify({ error: '缺少userId参数' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 初始化Supabase客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 获取用户学习记录
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('knowledge_id, mastery_level, last_practiced_at, correct_count, total_count')
      .eq('user_id', userId)

    if (progressError) {
      console.error('获取学习进度失败:', progressError)
      // 继续执行，使用空进度
    }

    // 获取所有知识点
    const { data: nodes, error: nodesError } = await supabase
      .from('knowledge_nodes')
      .select('*')
      .order('grade', { ascending: true })

    if (nodesError || !nodes) {
      return new Response(
        JSON.stringify({ error: '获取知识点失败' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 构建知识点进度映射
    const progressMap = new Map()
    progress?.forEach(p => {
      progressMap.set(p.knowledge_id, p)
    })

    // 推荐算法 - 多维度评分
    const recommendations = nodes.map(node => {
      const nodeProgress = progressMap.get(node.id)
      const mastery = nodeProgress?.mastery_level || 0
      const correctRate = nodeProgress?.total_count > 0
        ? (nodeProgress.correct_count / nodeProgress.total_count)
        : 0
      const lastPracticed = nodeProgress?.last_practiced_at
        ? new Date(nodeProgress.last_practiced_at)
        : null
      const daysSincePractice = lastPracticed
        ? (Date.now() - lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
        : 365 // 未学习视为很久没练

      // 计算推荐分数
      // 1. 掌握度权重 (40%) - 掌握度低的优先
      const masteryScore = (1 - mastery) * 0.4

      // 2. 难度权重 (25%) - 难度适中且略高于当前水平的优先
      const difficultyScore = (1 - Math.abs(node.difficulty - (mastery + 0.2))) * 0.25

      // 3. 学习状态权重 (20%) - 未学习或很久没练的优先
      const practiceScore = Math.min(daysSincePractice / 30, 1) * 0.2

      // 4. 重要程度权重 (15%) - 重要知识点优先
      const importanceScore = (node.important ? 1 : 0.5) * 0.15

      const priority = masteryScore + difficultyScore + practiceScore + importanceScore

      return {
        ...node,
        priority,
        recommendationReason: getRecommendationReason(mastery, correctRate, daysSincePractice, node),
        learningStatus: getLearningStatus(mastery, daysSincePractice)
      }
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 10) // 取前10个推荐

    return new Response(
      JSON.stringify({
        userId,
        recommendations,
        generatedAt: new Date().toISOString(),
        totalKnowledgePoints: nodes.length,
        learnedCount: progress?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('推荐服务错误:', error)
    return new Response(
      JSON.stringify({
        error: '服务器错误',
        message: error instanceof Error ? error.message : '未知错误'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * 获取推荐理由
 */
function getRecommendationReason(
  mastery: number,
  correctRate: number,
  daysSincePractice: number,
  node: any
): string {
  if (mastery === 0) {
    return `尚未学习"${node.name}"，建议从基础开始`
  } else if (mastery < 0.4) {
    return `"${node.name}"掌握度较低（${Math.round(mastery * 100)}%），建议加强基础练习`
  } else if (mastery < 0.7) {
    if (correctRate < 0.6) {
      return `"${node.name}"正确率较低（${Math.round(correctRate * 100)}%），需要多做练习`
    } else {
      return `"${node.name}"有进步空间，可以继续巩固`
    }
  } else if (mastery < 0.9) {
    if (daysSincePractice > 7) {
      return `"${node.name}"已${Math.round(daysSincePractice)}天未练习，建议复习`
    } else {
      return `"${node.name}"掌握较好，可适当提升难度`
    }
  } else {
    if (daysSincePractice > 14) {
      return `"${node.name}"需要复习巩固，避免遗忘`
    } else {
      return `"${node.name}"已熟练掌握，可挑战更高难度内容`
    }
  }
}

/**
 * 获取学习状态
 */
function getLearningStatus(mastery: number, daysSincePractice: number): string {
  if (mastery === 0) return 'not_started'
  if (mastery < 0.4) return 'learning'
  if (mastery < 0.7) return 'improving'
  if (mastery < 0.9) return 'mastered'
  if (daysSincePractice > 14) return 'needs_review'
  return 'excellent'
}
