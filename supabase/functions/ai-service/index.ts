import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

/**
 * AI题目生成 Edge Function
 * 使用豆包大语言模型生成个性化题目
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { method } = req

    // 健康检查
    if (method === 'GET' && new URL(req.url).searchParams.get('action') === 'health') {
      const apiKey = Deno.env.get('COZE_API_KEY')
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
    if (method === 'POST') {
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
      const apiKey = Deno.env.get('COZE_API_KEY')
      if (!apiKey) {
        return new Response(
          JSON.stringify({
            error: 'AI服务未配置',
            message: '请在Supabase控制台配置 COZE_API_KEY 环境变量'
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

      // 调用豆包AI API
      const aiResponse = await callCozeAPI(apiKey, prompt)

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
            aiProvider: 'doubao',
            model: 'doubao-seed-1-8-251228'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: '不支持的请求方法' }),
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
 * 调用豆包AI API
 */
async function callCozeAPI(apiKey: string, prompt: string): Promise<{
  success: boolean
  content: string
  error?: string
}> {
  try {
    const baseUrl = Deno.env.get('COZE_BASE_URL') || 'https://api.coze.com'
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
            content: '你是一个专业的数学老师，擅长生成适合学生的练习题。请确保返回的内容是有效的JSON格式。'
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
