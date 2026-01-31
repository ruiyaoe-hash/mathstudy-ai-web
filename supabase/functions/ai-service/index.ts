import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

/**
 * 通用 JSON 解析函数
 */
async function parseJSONResponse(content: string): Promise<any> {
  try {
    // 清理响应内容，移除可能的前缀和后缀
    let cleanedContent = content.trim()
    
    // 移除可能的代码块标记
    cleanedContent = cleanedContent.replace(/^```json|```$/g, '')
    cleanedContent = cleanedContent.trim()
    
    // 尝试直接解析
    try {
      return JSON.parse(cleanedContent)
    } catch (directParseError) {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0])
        } catch (extractParseError) {
          throw new Error(`提取JSON后解析失败: ${extractParseError.message}`)
        }
      } else {
        throw new Error('无法找到JSON内容')
      }
    }
  } catch (parseError) {
    console.error('JSON解析失败，响应内容:', content)
    throw new Error(`JSON解析失败: ${parseError.message}`)
  }
}

/**
 * AI服务 Edge Function
 * 统一的AI服务入口，支持智谱AI和其他AI服务
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
    const provider = requestUrl.searchParams.get('provider') || 'zhipu' // 默认使用智谱AI

    // 健康检查
    if (method === 'GET' && action === 'health') {
      return handleHealthCheck(provider)
    }

    // 根据不同的动作和提供商处理请求
    switch (action) {
      case 'generate-questions':
        return handleGenerateQuestions(req, provider)
      case 'solve-question':
        return handleSolveQuestion(req, provider)
      case 'chat':
        return handleChat(req, provider)
      case 'explain-concept':
        return handleExplainConcept(req, provider)
      case 'analyze-mistake':
        return handleAnalyzeMistake(req, provider)
      case 'learning-tips':
        return handleLearningTips(req, provider)
      default:
        return new Response(
          JSON.stringify({ error: '不支持的动作' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

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
 * 处理健康检查
 */
async function handleHealthCheck(provider: string): Promise<Response> {
  let apiKey: string | undefined
  let status = 'disabled'
  
  switch (provider) {
    case 'zhipu':
      apiKey = Deno.env.get('ZHIPU_API_KEY')
      break
    case 'coze':
      apiKey = Deno.env.get('COZE_API_KEY')
      break
    default:
      apiKey = Deno.env.get('ZHIPU_API_KEY')
  }
  
  if (apiKey) {
    status = 'enabled'
  }
  
  return new Response(
    JSON.stringify({
      status: 'ok',
      provider,
      llm: status,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

/**
 * 处理题目生成请求
 */
async function handleGenerateQuestions(req: Request, provider: string): Promise<Response> {
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

  // 初始化Supabase客户端
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
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

  // 尝试使用指定的提供商
  let result
  try {
    switch (provider) {
      case 'zhipu':
        result = await generateQuestionsWithZhiPu(topic, targetGrade, count, questionType, knowledgeId)
        break
      case 'coze':
        result = await generateQuestionsWithCoze(topic, targetGrade, count, questionType, knowledgeId)
        break
      default:
        result = await generateQuestionsWithZhiPu(topic, targetGrade, count, questionType, knowledgeId)
    }
  } catch (providerError) {
    console.error(`${provider} AI生成失败，尝试使用备用方案:`, providerError)
    // 故障转移到智谱AI
    try {
      result = await generateQuestionsWithZhiPu(topic, targetGrade, count, questionType, knowledgeId)
    } catch (fallbackError) {
      console.error('备用方案也失败:', fallbackError)
      return new Response(
        JSON.stringify({
          questions: [],
          metadata: {
            knowledgeId,
            knowledgeName: node.name,
            grade: targetGrade,
            error: '所有AI服务都失败',
            message: '请检查网络连接和API配置'
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return new Response(
    JSON.stringify({
      questions: result.questions || [],
      metadata: {
        ...result.metadata,
        knowledgeId,
        knowledgeName: node.name,
        grade: targetGrade,
        questionType,
        generatedAt: new Date().toISOString()
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * 使用智谱AI生成题目
 */
async function generateQuestionsWithZhiPu(topic: string, grade: number, count: number, questionType: string, knowledgeId: string): Promise<any> {
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    throw new Error('智谱AI API Key未配置')
  }

  // 构建Prompt
  const prompt = `请为${grade}年级学生生成${count}道关于"${topic}"的数学题目。

要求：
1. 题目类型：${questionType}
2. 难度适中，适合${grade}年级学生
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

  const response = await callZhiPuAIAPI(apiKey, prompt, {
    model: 'glm-4',
    temperature: 0.7,
    max_tokens: 2000
  })

  if (!response.success) {
    throw new Error(response.error || '智谱AI调用失败')
  }

  // 解析响应
  const result = await parseJSONResponse(response.content)

  return {
    questions: result.questions || [],
    metadata: {
      aiProvider: 'zhipu',
      model: 'glm-4',
      rawResponse: response.content
    }
  }
}

/**
 * 使用Coze生成题目
 */
async function generateQuestionsWithCoze(topic: string, grade: number, count: number, questionType: string, knowledgeId: string): Promise<any> {
  const apiKey = Deno.env.get('COZE_API_KEY')
  if (!apiKey) {
    throw new Error('Coze API Key未配置')
  }

  // 构建Prompt
  const prompt = `请为${grade}年级学生生成${count}道关于"${topic}"的数学题目。

要求：
1. 题目类型：${questionType}
2. 难度适中，适合${grade}年级学生
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

  const response = await callCozeAPI(apiKey, prompt)

  if (!response.success) {
    throw new Error(response.error || 'Coze调用失败')
  }

  // 解析响应
  const result = await parseJSONResponse(response.content)

  return {
    questions: result.questions || [],
    metadata: {
      aiProvider: 'coze',
      model: 'doubao-seed-1-8-251228',
      rawResponse: response.content
    }
  }
}

/**
 * 处理解题辅导请求
 */
async function handleSolveQuestion(req: Request, provider: string): Promise<Response> {
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

  const targetGrade = grade || 5

  // 尝试使用指定的提供商
  let result
  try {
    switch (provider) {
      case 'zhipu':
        result = await solveQuestionWithZhiPu(question, targetGrade)
        break
      case 'coze':
        result = await solveQuestionWithCoze(question, targetGrade)
        break
      default:
        result = await solveQuestionWithZhiPu(question, targetGrade)
    }
  } catch (providerError) {
    console.error(`${provider} 解题失败，尝试使用备用方案:`, providerError)
    // 故障转移到智谱AI
    try {
      result = await solveQuestionWithZhiPu(question, targetGrade)
    } catch (fallbackError) {
      console.error('备用方案也失败:', fallbackError)
      return new Response(
        JSON.stringify({
          steps: [],
          finalAnswer: '',
          teachingHint: '',
          metadata: {
            error: '所有AI服务都失败',
            message: '请检查网络连接和API配置'
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return new Response(
    JSON.stringify({
      steps: result.steps || [],
      finalAnswer: result.finalAnswer || '',
      teachingHint: result.teachingHint || '',
      metadata: {
        ...result.metadata,
        generatedAt: new Date().toISOString()
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * 使用智谱AI解题
 */
async function solveQuestionWithZhiPu(question: string, grade: number): Promise<any> {
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    throw new Error('智谱AI API Key未配置')
  }

  // 构建Prompt
  const prompt = `请为学生提供关于以下数学题目的详细解题指导：

题目：${question}

要求：
1. 提供步骤式的解题过程
2. 每一步都要有详细的解释
3. 适合${grade}年级学生的理解水平
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

  const response = await callZhiPuAIAPI(apiKey, prompt, {
    model: 'glm-4',
    temperature: 0.7,
    max_tokens: 2000
  })

  if (!response.success) {
    throw new Error(response.error || '智谱AI调用失败')
  }

  // 解析响应
  const result = await parseJSONResponse(response.content)

  return {
    steps: result.steps || [],
    finalAnswer: result.finalAnswer || '',
    teachingHint: result.teachingHint || '',
    metadata: {
      aiProvider: 'zhipu',
      model: 'glm-4'
    }
  }
}

/**
 * 使用Coze解题
 */
async function solveQuestionWithCoze(question: string, grade: number): Promise<any> {
  const apiKey = Deno.env.get('COZE_API_KEY')
  if (!apiKey) {
    throw new Error('Coze API Key未配置')
  }

  // 构建Prompt
  const prompt = `请为学生提供关于以下数学题目的详细解题指导：

题目：${question}

要求：
1. 提供步骤式的解题过程
2. 每一步都要有详细的解释
3. 适合${grade}年级学生的理解水平
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

  const response = await callCozeAPI(apiKey, prompt)

  if (!response.success) {
    throw new Error(response.error || 'Coze调用失败')
  }

  // 解析响应
  const result = await parseJSONResponse(response.content)

  return {
    steps: result.steps || [],
    finalAnswer: result.finalAnswer || '',
    teachingHint: result.teachingHint || '',
    metadata: {
      aiProvider: 'coze',
      model: 'doubao-seed-1-8-251228'
    }
  }
}

/**
 * 处理AI对话请求
 */
async function handleChat(req: Request, provider: string): Promise<Response> {
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

  const targetGrade = grade || 5

  // 尝试使用指定的提供商
  let result
  try {
    switch (provider) {
      case 'zhipu':
        result = await chatWithZhiPu(message, targetGrade, knowledgeId)
        break
      case 'coze':
        result = await chatWithCoze(message, targetGrade, knowledgeId)
        break
      default:
        result = await chatWithZhiPu(message, targetGrade, knowledgeId)
    }
  } catch (providerError) {
    console.error(`${provider} 对话失败，尝试使用备用方案:`, providerError)
    // 故障转移到智谱AI
    try {
      result = await chatWithZhiPu(message, targetGrade, knowledgeId)
    } catch (fallbackError) {
      console.error('备用方案也失败:', fallbackError)
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: {
            message: '所有AI服务都失败，请检查网络连接和API配置'
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        ...result.data,
        conversationId: conversationId || `conv_${Date.now()}`
      },
      error: null
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * 使用智谱AI聊天
 */
async function chatWithZhiPu(message: string, grade: number, knowledgeId?: string): Promise<any> {
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    throw new Error('智谱AI API Key未配置')
  }

  // 构建系统提示
  const systemPrompt = `你是一个专业的数学AI助手，擅长：
1. 解释数学概念和公式
2. 解答数学问题
3. 提供学习建议
4. 用简单易懂的语言讲解复杂概念
5. 适合${grade}年级学生的理解水平

请保持回答友好、专业，并确保数学知识的准确性。`

  const response = await callZhiPuAIAPI(apiKey, message, {
    model: 'glm-4',
    temperature: 0.7,
    max_tokens: 2000,
    systemPrompt
  })

  if (!response.success) {
    throw new Error(response.error || '智谱AI调用失败')
  }

  return {
    data: {
      response: response.content || '',
      aiProvider: 'zhipu',
      model: 'glm-4',
      confidence: 0.95,
      generatedAt: new Date().toISOString()
    }
  }
}

/**
 * 使用Coze聊天
 */
async function chatWithCoze(message: string, grade: number, knowledgeId?: string): Promise<any> {
  const apiKey = Deno.env.get('COZE_API_KEY')
  if (!apiKey) {
    throw new Error('Coze API Key未配置')
  }

  // 构建系统提示
  const systemPrompt = `你是一个专业的数学AI助手，擅长：
1. 解释数学概念和公式
2. 解答数学问题
3. 提供学习建议
4. 用简单易懂的语言讲解复杂概念
5. 适合${grade}年级学生的理解水平

请保持回答友好、专业，并确保数学知识的准确性。`

  const prompt = `${systemPrompt}\n\n用户问题：${message}`
  const response = await callCozeAPI(apiKey, prompt)

  if (!response.success) {
    throw new Error(response.error || 'Coze调用失败')
  }

  return {
    data: {
      response: response.content || '',
      aiProvider: 'coze',
      model: 'doubao-seed-1-8-251228',
      confidence: 0.95,
      generatedAt: new Date().toISOString()
    }
  }
}

/**
 * 处理概念解释请求
 */
async function handleExplainConcept(req: Request, provider: string): Promise<Response> {
  const { concept, grade, examples = true } = await req.json()

  if (!concept) {
    return new Response(
      JSON.stringify({ error: '缺少 concept 参数' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const targetGrade = grade || 5

  // 尝试使用指定的提供商
  let result
  try {
    switch (provider) {
      case 'zhipu':
        result = await explainConceptWithZhiPu(concept, targetGrade, examples)
        break
      case 'coze':
        result = await explainConceptWithCoze(concept, targetGrade, examples)
        break
      default:
        result = await explainConceptWithZhiPu(concept, targetGrade, examples)
    }
  } catch (providerError) {
    console.error(`${provider} 概念解释失败，尝试使用备用方案:`, providerError)
    // 故障转移到智谱AI
    try {
      result = await explainConceptWithZhiPu(concept, targetGrade, examples)
    } catch (fallbackError) {
      console.error('备用方案也失败:', fallbackError)
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: {
            message: '所有AI服务都失败，请检查网络连接和API配置'
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        ...result.data,
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
 * 使用智谱AI解释概念
 */
async function explainConceptWithZhiPu(concept: string, grade: number, examples: boolean): Promise<any> {
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    throw new Error('智谱AI API Key未配置')
  }

  // 构建Prompt
  const prompt = `请为${grade}年级学生解释数学概念"${concept}"。

要求：
1. 用简单易懂的语言解释
2. ${examples ? '提供2-3个具体例子' : ''}
3. 说明该概念的应用场景
4. 与相关概念的联系
5. 适合${grade}年级学生的理解水平

返回格式：
{
  "explanation": "概念解释",
  "examples": ["例子1", "例子2"],
  "applications": "应用场景",
  "relatedConcepts": "相关概念",
  "difficulty": "难度等级"
}

请只返回JSON，不要包含其他文字说明。`

  const response = await callZhiPuAIAPI(apiKey, prompt, {
    model: 'glm-4',
    temperature: 0.7,
    max_tokens: 2000
  })

  if (!response.success) {
    throw new Error(response.error || '智谱AI调用失败')
  }

  // 解析响应
  const result = await parseJSONResponse(response.content)

  return {
    data: {
      ...result,
      aiProvider: 'zhipu',
      model: 'glm-4'
    }
  }
}

/**
 * 使用Coze解释概念
 */
async function explainConceptWithCoze(concept: string, grade: number, examples: boolean): Promise<any> {
  const apiKey = Deno.env.get('COZE_API_KEY')
  if (!apiKey) {
    throw new Error('Coze API Key未配置')
  }

  // 构建Prompt
  const prompt = `请为${grade}年级学生解释数学概念"${concept}"。

要求：
1. 用简单易懂的语言解释
2. ${examples ? '提供2-3个具体例子' : ''}
3. 说明该概念的应用场景
4. 与相关概念的联系
5. 适合${grade}年级学生的理解水平

返回格式：
{
  "explanation": "概念解释",
  "examples": ["例子1", "例子2"],
  "applications": "应用场景",
  "relatedConcepts": "相关概念",
  "difficulty": "难度等级"
}

请只返回JSON，不要包含其他文字说明。`

  const response = await callCozeAPI(apiKey, prompt)

  if (!response.success) {
    throw new Error(response.error || 'Coze调用失败')
  }

  // 解析响应
  const result = await parseJSONResponse(response.content)

  return {
    data: {
      ...result,
      aiProvider: 'coze',
      model: 'doubao-seed-1-8-251228'
    }
  }
}

/**
 * 处理错误分析请求
 */
async function handleAnalyzeMistake(req: Request, provider: string): Promise<Response> {
  const { question, wrongAnswer, correctAnswer, knowledgeId, grade } = await req.json()

  if (!question || !wrongAnswer || !correctAnswer) {
    return new Response(
      JSON.stringify({ error: '缺少必要参数' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const targetGrade = grade || 5

  // 尝试使用指定的提供商
  let result
  try {
    switch (provider) {
      case 'zhipu':
        result = await analyzeMistakeWithZhiPu(question, wrongAnswer, correctAnswer, targetGrade)
        break
      case 'coze':
        result = await analyzeMistakeWithCoze(question, wrongAnswer, correctAnswer, targetGrade)
        break
      default:
        result = await analyzeMistakeWithZhiPu(question, wrongAnswer, correctAnswer, targetGrade)
    }
  } catch (providerError) {
    console.error(`${provider} 错误分析失败，尝试使用备用方案:`, providerError)
    // 故障转移到智谱AI
    try {
      result = await analyzeMistakeWithZhiPu(question, wrongAnswer, correctAnswer, targetGrade)
    } catch (fallbackError) {
      console.error('备用方案也失败:', fallbackError)
      return new Response(
        JSON.stringify({
          errorAnalysis: '',
          correctSolution: '',
          learningAdvice: '',
          difficulty: '中等',
          metadata: {
            error: '所有AI服务都失败',
            message: '请检查网络连接和API配置'
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return new Response(
    JSON.stringify({
      errorAnalysis: result.errorAnalysis || '',
      correctSolution: result.correctSolution || '',
      learningAdvice: result.learningAdvice || '',
      difficulty: result.difficulty || '中等',
      metadata: {
        ...result.metadata,
        generatedAt: new Date().toISOString()
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

/**
 * 使用智谱AI分析错误
 */
async function analyzeMistakeWithZhiPu(question: string, wrongAnswer: string, correctAnswer: string, grade: number): Promise<any> {
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    throw new Error('智谱AI API Key未配置')
  }

  // 构建Prompt
  const prompt = `请分析学生在以下数学题目中的错误：

题目：${question}

学生答案：${wrongAnswer}
正确答案：${correctAnswer}

要求：
1. 分析学生可能的错误原因
2. 提供正确的解题思路
3. 给出针对性的学习建议
4. 适合${grade}年级学生的理解水平

返回格式：
{
  "errorAnalysis": "错误分析",
  "correctSolution": "正确解法",
  "learningAdvice": "学习建议",
  "difficulty": "题目难度"
}

请只返回JSON，不要包含其他文字说明。`

  const response = await callZhiPuAIAPI(apiKey, prompt, {
    model: 'glm-4',
    temperature: 0.7,
    max_tokens: 2000
  })

  if (!response.success) {
    throw new Error(response.error || '智谱AI调用失败')
  }

  // 解析响应
  const result = await parseJSONResponse(response.content)

  return {
    errorAnalysis: result.errorAnalysis || '',
    correctSolution: result.correctSolution || '',
    learningAdvice: result.learningAdvice || '',
    difficulty: result.difficulty || '中等',
    metadata: {
      aiProvider: 'zhipu',
      model: 'glm-4'
    }
  }
}

/**
 * 使用Coze分析错误
 */
async function analyzeMistakeWithCoze(question: string, wrongAnswer: string, correctAnswer: string, grade: number): Promise<any> {
  const apiKey = Deno.env.get('COZE_API_KEY')
  if (!apiKey) {
    throw new Error('Coze API Key未配置')
  }

  // 构建Prompt
  const prompt = `请分析学生在以下数学题目中的错误：

题目：${question}

学生答案：${wrongAnswer}
正确答案：${correctAnswer}

要求：
1. 分析学生可能的错误原因
2. 提供正确的解题思路
3. 给出针对性的学习建议
4. 适合${grade}年级学生的理解水平

返回格式：
{
  "errorAnalysis": "错误分析",
  "correctSolution": "正确解法",
  "learningAdvice": "学习建议",
  "difficulty": "题目难度"
}

请只返回JSON，不要包含其他文字说明。`

  const response = await callCozeAPI(apiKey, prompt)

  if (!response.success) {
    throw new Error(response.error || 'Coze调用失败')
  }

  // 解析响应
  let result
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('无法解析JSON')
    }
  } catch (parseError) {
    throw new Error(`JSON解析失败: ${parseError.message}`)
  }

  return {
    errorAnalysis: result.errorAnalysis || '',
    correctSolution: result.correctSolution || '',
    learningAdvice: result.learningAdvice || '',
    difficulty: result.difficulty || '中等',
    metadata: {
      aiProvider: 'coze',
      model: 'doubao-seed-1-8-251228'
    }
  }
}

/**
 * 处理学习建议请求
 */
async function handleLearningTips(req: Request, provider: string): Promise<Response> {
  const { userId, grade, subject = 'math' } = await req.json()

  const targetGrade = grade || 5

  // 尝试使用指定的提供商
  let result
  try {
    switch (provider) {
      case 'zhipu':
        result = await getLearningTipsWithZhiPu(targetGrade, subject)
        break
      case 'coze':
        result = await getLearningTipsWithCoze(targetGrade, subject)
        break
      default:
        result = await getLearningTipsWithZhiPu(targetGrade, subject)
    }
  } catch (providerError) {
    console.error(`${provider} 学习建议失败，尝试使用备用方案:`, providerError)
    // 故障转移到智谱AI
    try {
      result = await getLearningTipsWithZhiPu(targetGrade, subject)
    } catch (fallbackError) {
      console.error('备用方案也失败:', fallbackError)
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: {
            message: '所有AI服务都失败，请检查网络连接和API配置'
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        ...result.data,
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
 * 使用智谱AI获取学习建议
 */
async function getLearningTipsWithZhiPu(grade: number, subject: string): Promise<any> {
  const apiKey = Deno.env.get('ZHIPU_API_KEY')
  if (!apiKey) {
    throw new Error('智谱AI API Key未配置')
  }

  // 构建Prompt
  const prompt = `请为${grade}年级学生提供${subject === 'math' ? '数学' : '全科'}学习建议。

要求：
1. 提供5-8条具体的学习建议
2. 针对${grade}年级学生的认知水平
3. 包含学习方法、时间管理、复习策略等方面
4. 建议要实用可行
5. 语言要鼓励性和建设性

返回格式：
{
  "tips": [
    {
      "id": "1",
      "title": "建议标题",
      "content": "建议内容",
      "importance": "重要性（1-5）",
      "applicableSituation": "适用场景"
    }
  ],
  "grade": ${grade},
  "subject": "${subject}"
}

请只返回JSON，不要包含其他文字说明。`

  const response = await callZhiPuAIAPI(apiKey, prompt, {
    model: 'glm-4',
    temperature: 0.7,
    max_tokens: 2000
  })

  if (!response.success) {
    throw new Error(response.error || '智谱AI调用失败')
  }

  // 解析响应
  let result
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('无法解析JSON')
    }
  } catch (parseError) {
    throw new Error(`JSON解析失败: ${parseError.message}`)
  }

  return {
    data: {
      ...result,
      aiProvider: 'zhipu',
      model: 'glm-4'
    }
  }
}

/**
 * 使用Coze获取学习建议
 */
async function getLearningTipsWithCoze(grade: number, subject: string): Promise<any> {
  const apiKey = Deno.env.get('COZE_API_KEY')
  if (!apiKey) {
    throw new Error('Coze API Key未配置')
  }

  // 构建Prompt
  const prompt = `请为${grade}年级学生提供${subject === 'math' ? '数学' : '全科'}学习建议。

要求：
1. 提供5-8条具体的学习建议
2. 针对${grade}年级学生的认知水平
3. 包含学习方法、时间管理、复习策略等方面
4. 建议要实用可行
5. 语言要鼓励性和建设性

返回格式：
{
  "tips": [
    {
      "id": "1",
      "title": "建议标题",
      "content": "建议内容",
      "importance": "重要性（1-5）",
      "applicableSituation": "适用场景"
    }
  ],
  "grade": ${grade},
  "subject": "${subject}"
}

请只返回JSON，不要包含其他文字说明。`

  const response = await callCozeAPI(apiKey, prompt)

  if (!response.success) {
    throw new Error(response.error || 'Coze调用失败')
  }

  // 解析响应
  let result
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('无法解析JSON')
    }
  } catch (parseError) {
    throw new Error(`JSON解析失败: ${parseError.message}`)
  }

  return {
    data: {
      ...result,
      aiProvider: 'coze',
      model: 'doubao-seed-1-8-251228'
    }
  }
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

/**
 * 调用Coze API
 */
async function callCozeAPI(apiKey: string, prompt: string): Promise<{
  success: boolean
  content: string
  error?: string
}> {
  try {
    const modelBaseUrl = Deno.env.get('COZE_MODEL_BASE_URL') || 'https://model.coze.com'

    // 构建请求
    const response = await fetch(`${modelBaseUrl}/v3/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'doubao-seed-1-8-251228',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的数学老师，擅长为学生提供数学教育内容。请确保返回的内容是有效的JSON格式。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Coze API错误:', response.status, errorText)
      return {
        success: false,
        content: '',
        error: `Coze API错误: ${response.status}`
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    return {
      success: true,
      content
    }

  } catch (error) {
    console.error('调用Coze API失败:', error)
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}
