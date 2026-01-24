-- ============================================
-- 费曼讲解记录表
-- ============================================

CREATE TABLE IF NOT EXISTS feynman_explanations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  knowledge_id TEXT NOT NULL,
  explanation_text TEXT NOT NULL,
  audio_url TEXT, -- 语音文件URL（存储在对象存储）
  ai_score NUMERIC NOT NULL, -- AI评分（0-100）
  ai_feedback TEXT NOT NULL, -- AI反馈
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_knowledge FOREIGN KEY (knowledge_id) REFERENCES knowledge_nodes(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_feynman_explanations_user_id ON feynman_explanations(user_id);
CREATE INDEX IF NOT EXISTS idx_feynman_explanations_knowledge_id ON feynman_explanations(knowledge_id);
CREATE INDEX IF NOT EXISTS idx_feynman_explanations_ai_score ON feynman_explanations(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_feynman_explanations_created_at ON feynman_explanations(created_at DESC);

-- 注释
COMMENT ON TABLE feynman_explanations IS '费曼讲解记录表';
COMMENT ON COLUMN feynman_explanations.ai_score IS 'AI讲解评分（0-100）';
COMMENT ON COLUMN feynman_explanations.audio_url IS '语音讲解文件URL';
