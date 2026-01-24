/**
 * 火山引擎直接调用版本
 *
 * 使用说明：
 * 1. 访问 https://console.volcengine.com/iam 获取 AccessKey 和 SecretKey
 * 2. 在 Supabase Secrets 中配置：
 *    - VOLCENGINE_ACCESS_KEY
 *    - VOLCENGINE_SECRET_KEY
 * 3. 在 Edge Function 中替换 callCozeAPI 为 callVolcengineAPI
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

/**
 * 火山引擎 API 配置
 */
const VOLCENGINE_CONFIG = {
  endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  region: 'cn-beijing',
  service: 'ark',
  model: 'doubao-pro-32k'
}

/**
 * 生成火山引擎 API 签名（简化版，实际需要完整的 HmacSHA256 签名算法）
 */
function generateVolcengineSignature(
  accessKey: string,
  secretKey: string,
  method: string,
  path: string,
  body: string,
  timestamp: string
): string {
  // 注意：这是简化版本，实际实现需要完整的火山引擎签名算法
  // 参考：https://www.volcengine.com/docs/6291/1208142

  import { crypto } from 'https://deno.land/std/crypto/mod.ts'
  import { encodeHex } from 'https://deno.land/std/hex/mod.ts'

  const date = timestamp.split('T')[0]
  const canonicalRequest = [
    method,
    path,
    '',
    `content-type:application/json`,
    `host:${new URL(VOLCENGINE_CONFIG.endpoint).host}`,
    `x-date:${timestamp}`,
    '',
    'content-type;host;x-date',
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))
  ].join('\n')

  const hashedCanonicalRequest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalRequest)
  )

  const credentialScope = `${date}/${VOLCENGINE_CONFIG.region}/${VOLCENGINE_CONFIG.service}/request`
  const stringToSign = [
    'HMAC-SHA256',
    timestamp,
    credentialScope,
    encodeHex(hashedCanonicalRequest)
  ].join('\n')

  const signingKey = await hmacSha256(
    await hmacSha256(
      await hmacSha256(
        await hmacSha256(
          secretKey,
          date
        ),
        VOLCENGINE_CONFIG.region
      ),
      VOLCENGINE_CONFIG.service
    ),
    'request'
  )

  const signature = await hmacSha256(signingKey, stringToSign)
  const authorization = [
    `HMAC-SHA256`,
    `Credential=${accessKey}/${credentialScope}`,
    `SignedHeaders=content-type;host;x-date`,
    `Signature=${encodeHex(signature)}`
  ].join(',')

  return authorization
}

async function hmacSha256(key: string | ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? new TextEncoder().encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(data)
  )
}

/**
 * 调用火山引擎 API
 */
async function callVolcengineAPI(prompt: string): Promise<{
  success: boolean
  content: string
  error?: string
}> {
  try {
    const accessKey = Deno.env.get('VOLCENGINE_ACCESS_KEY')
    const secretKey = Deno.env.get('VOLCENGINE_SECRET_KEY')

    if (!accessKey || !secretKey) {
      return {
        success: false,
        content: '',
        error: '火山引擎 API Key 未配置'
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '')
    const body = JSON.stringify({
      model: VOLCENGINE_CONFIG.model,
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
      max_tokens: 2000
    })

    const authorization = await generateVolcengineSignature(
      accessKey,
      secretKey,
      'POST',
      '/api/v3/chat/completions',
      body,
      timestamp
    )

    const response = await fetch(VOLCENGINE_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
        'X-Date': timestamp,
        'Host': new URL(VOLCENGINE_CONFIG.endpoint).host
      },
      body
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('火山引擎 API 错误:', response.status, errorText)
      return {
        success: false,
        content: '',
        error: `火山引擎 API 错误: ${response.status}`
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    return {
      success: true,
      content
    }

  } catch (error) {
    console.error('调用火山引擎 API 失败:', error)
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * ⚠️ 重要提示：
 *
 * 火山引擎直接调用的签名算法非常复杂，上述代码是简化版本，
 * 实际使用需要参考官方文档完整实现。
 *
 * 推荐使用火山引擎官方 SDK：
 * - Node.js: @volcengine/openapi
 * - Python: volcengine-python-sdk
 *
 * 对于小白用户，我强烈建议继续使用 Coze 平台！
 */
