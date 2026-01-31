import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

/**
 * 智谱AI API调用 Edge Function
 * 使用智谱大语言模型生成个性化题目和辅导
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { method, url } = req
    const requestUrl = new URL(url)
    const action = requestUrl.searchParams.get('action')

    // 健康检查
    if (method === 'GET' && action === 'health') {
      const apiKey = Deno.env.get('ZHIPU_API_KEY')
      return new Response(
        JSON.stringify({
          status: 'ok',
          llm: apiKey ? 'enabled' : 'disabled',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // AI题目生成
    if (method === 'POST' && action === 'generate-questions') {
      return handleGenerateQuestions(req)
    }

    // 解题辅导
    if (method === 'POST' && action === 'solve-question') {
      return handleSolveQuestion(req)
    }

    // AI对话
    if (method === 'POST' && action === 'chat') {
      return handleChat(req)
    }

    return new Response(
      JSON.stringify({ error: '不支持的请求' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Edge Function错误:', error)
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
 * 处理题目生成请求
 */
async function handleGenerateQuestions(req: Request): Promise<Response> {
  const { knowledgeId, grade, count = 6, questionType = '选择题' } = await req.json()

  if (!knowledgeId) {
    return new Response(
      JSON.stringify({ error: '缺少 knowledgeId 参数' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // 检查API Key配置
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'AI服务未配置',
        message: '请在Supabase控制台配置 ZHIPU_API_KEY 环境变量'
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // 初始化Supabase客户端
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 获取知识点信息
  const { data: node, error } = await supabase
    .from('knowledge_nodes')
    .select('*')
    .eq('id', knowledgeId)
    .single()

  if (error || !node) {
    return new Response(
      JSON.stringify({ error: '知识点不存在' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const topic = node.name
  const targetGrade = grade || node.grade

  // 构建Prompt
  const prompt = `请为${targetGrade}年级学生生成${count}道关于"${topic}"的数学题目。

要求：
1. 题目类型：${questionType}
2. 难度适中，适合${targetGrade}年级学生
3. 包含题目、选项、正确答案和详细解析
4. 返回JSON格式，包含questions数组

返回格式（必须是有效的JSON）：
{
  "questions": [
    {
      "id": "唯一ID（使用uuid或时间戳）",
      "type": "${questionType}",
      "question": "题目内容",
      "options": [
        {"id": "A", "text": "选项A"},
        {"id": "B", "text": "选项B"},
        {"id": "C", "text": "选项C"},
        {"id": "D", "text": "选项D"}
      ],
      "answer": "正确答案（如A）",
      "explanation": "详细解析，解释为什么是这个答案",
      "difficulty": 0.7,
      "knowledgeId": "${knowledgeId}"
    }
  ]
}

请只返回JSON，不要包含其他文字说明。`

  // 调用智谱AI API
  const aiResponse = await callZhiPuAIAPI(apiKey, prompt, {
    model: 'glm-4',
    temperature: 0.7,
    max_tokens: 2000
  })

  if (!aiResponse.success) {
    return new Response(
      JSON.stringify({
        error: 'AI生成失败',
        message: aiResponse.error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // 解析AI响应
  let result
  try {
    // 尝试从响应中提取JSON
    const content = aiResponse.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('无法解析JSON')
    }
  } catch (parseError) {
    console.error('AI响应解析失败:', parseError)
    return new Response(
      JSON.stringify({
        questions: [],
        metadata: {
          knowledgeId,
          knowledgeName: node.name,
          grade: targetGrade,
          error: 'AI响应解析失败',
          rawResponse: aiResponse.content
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({
      questions: result.questions || [],
      metadata: {
        knowledgeId,
        knowledgeName: node.name,
        grade: targetGrade,
        questionType,
        generatedAt: new Date().toISOString(),
        aiProvider: 'zhipu',
        model: 'glm-4'
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * 处理解题辅导请求
 */
async function handleSolveQuestion(req: Request): Promise<Response> {
  const { question, knowledgeId, grade } = await req.json()

  if (!question) {
    return new Response(
      JSON.stringify({ error: '缺少 question 参数' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // 检查API Key配置
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'AI服务未配置',
        message: '请在Supabase控制台配置 ZHIPU_API_KEY 环境变量'
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const targetGrade = grade || 5

  // 构建Prompt
  const prompt = `请为学生提供关于以下数学题目的详细解题指导：

题目：${question}

要求：
1. 提供步骤式的解题过程
2. 每一步都要有详细的解释
3. 适合${targetGrade}年级学生的理解水平
4. 如果有多种解法，请提供最适合学生的一种
5. 最后提供一个总结，帮助学生理解解题思路

返回格式：
{
  "steps": [
    {
      "step": 1,
      "description": "步骤描述",
      "expression": "数学表达式",
      "explanation": "详细解释"
    }
  ],
  "finalAnswer": "最终答案",
  "teachingHint": "教学提示"
}

请只返回JSON，不要包含其他文字说明。`

  // 调用智谱AI API
  const aiResponse = await callZhiPuAIAPI(apiKey, prompt, {
    model: 'glm-4',
    temperature: 0.7,
    max_tokens: 2000
  })

  if (!aiResponse.success) {
    return new Response(
      JSON.stringify({
        error: 'AI生成失败',
        message: aiResponse.error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // 解析AI响应
  let result
  try {
    const content = aiResponse.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('无法解析JSON')
    }
  } catch (parseError) {
    console.error('AI响应解析失败:', parseError)
    return new Response(
      JSON.stringify({
        steps: [],
        finalAnswer: '',
        teachingHint: '',
        metadata: {
          error: 'AI响应解析失败',
          rawResponse: aiResponse.content
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({
      steps: result.steps || [],
      finalAnswer: result.finalAnswer || '',
      teachingHint: result.teachingHint || '',
      metadata: {
        generatedAt: new Date().toISOString(),
        aiProvider: 'zhipu',
        model: 'glm-4'
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * 处理AI对话请求
 */
async function handleChat(req: Request): Promise<Response> {
  const { message, knowledgeId, grade, conversationId } = await req.json()

  if (!message) {
    return new Response(
      JSON.stringify({ error: '缺少 message 参数' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // 检查API Key配置
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'AI服务未配置',
        message: '请在Supabase控制台配置 ZHIPU_API_KEY 环境变量'
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const targetGrade = grade || 5

  // 构建系统提示
  const systemPrompt = `你是一个专业的数学AI助手，擅长：
1. 解释数学概念和公式
2. 解答数学问题
3. 提供学习建议
4. 用简单易懂的语言讲解复杂概念
5. 适合${targetGrade}年级学生的理解水平

请保持回答友好、专业，并确保数学知识的准确性。`

  // 构建用户提示
  let userPrompt = message

  // 调用智谱AI API
  const aiResponse = await callZhiPuAIAPI(apiKey, userPrompt, {
    model: 'glm-4',
    temperature: 0.7,
    max_tokens: 2000,
    systemPrompt
  })

  if (!aiResponse.success) {
    return new Response(
      JSON.stringify({
        error: 'AI生成失败',
        message: aiResponse.error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        response: aiResponse.content || '',
        conversationId: conversationId || `conv_${Date.now()}`,
        aiProvider: 'zhipu',
        model: 'glm-4',
        confidence: 0.95,
        generatedAt: new Date().toISOString()
      },
      error: null
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * 调用智谱AI API
 */
async function callZhiPuAIAPI(apiKey: string, prompt: string, options: any): Promise<{
  success: boolean
  content: string
  error?: string
}> {
  try {
    const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    
    // 构建请求消息
    const messages = []
    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      })
    }
    messages.push({
      role: 'user',
      content: prompt
    })

    // 构建请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'glm-4',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('智谱AI API错误:', response.status, errorText)
      return {
        success: false,
        content: '',
        error: `智谱AI API错误: ${response.status}`
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    return {
      success: true,
      content
    }

  } catch (error) {
    console.error('调用智谱AI API失败:', error)
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}
