-- ============================================
-- AI生成缓存表
-- ============================================

CREATE TABLE IF NOT EXISTS ai_generation_cache (
  id TEXT PRIMARY KEY,
  prompt_hash TEXT NOT NULL UNIQUE, -- prompt的hash值
  knowledge_id TEXT, -- 关联的知识点ID（可选）
  response JSONB NOT NULL, -- AI响应内容
  tokens_used INTEGER NOT NULL, -- 使用的token数
  model TEXT NOT NULL, -- 使用的模型
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- 过期时间
  
  -- 索引
  CONSTRAINT fk_knowledge FOREIGN KEY (knowledge_id) REFERENCES knowledge_nodes(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_cache_prompt_hash ON ai_generation_cache(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_knowledge_id ON ai_generation_cache(knowledge_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires_at ON ai_generation_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_model ON ai_generation_cache(model);

-- 注释
COMMENT ON TABLE ai_generation_cache IS 'AI生成缓存表（成本控制）';
COMMENT ON COLUMN ai_generation_cache.prompt_hash IS 'prompt的SHA256哈希值';
COMMENT ON COLUMN ai_generation_cache.response IS 'AI响应的JSON数据';
COMMENT ON COLUMN ai_generation_cache.expires_at IS '缓存过期时间';

-- 自动清理过期缓存的函数
CREATE OR REPLACE FUNCTION cleanup_expired_ai_cache()
RETURNS INTEGER AS $$
BEGIN
  DELETE FROM ai_generation_cache
  WHERE expires_at < NOW();
  
  RETURN ROW_COUNT;
END;
$$ LANGUAGE plpgsql;

-- 创建定时清理任务（需要pg_cron扩展）
-- SELECT cron.schedule('cleanup-ai-cache', '0 */6 * * *', 'SELECT cleanup_expired_ai_cache()');
