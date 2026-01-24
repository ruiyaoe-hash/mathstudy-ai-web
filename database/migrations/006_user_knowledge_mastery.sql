-- ============================================
-- 用户知识掌握度表
-- ============================================

CREATE TABLE IF NOT EXISTS user_knowledge_mastery (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  knowledge_id TEXT NOT NULL,
  mastery NUMERIC NOT NULL, -- 掌握概率（0-1）
  attempts INTEGER NOT NULL DEFAULT 0, -- 尝试次数
  correct INTEGER NOT NULL DEFAULT 0, -- 正确次数
  last_attempt_at TIMESTAMPTZ,
  last_review_at TIMESTAMPTZ,
  review_count INTEGER NOT NULL DEFAULT 0,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_knowledge FOREIGN KEY (knowledge_id) REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_knowledge UNIQUE (user_id, knowledge_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_knowledge_mastery_user_id ON user_knowledge_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_user_knowledge_mastery_knowledge_id ON user_knowledge_mastery(knowledge_id);
CREATE INDEX IF NOT EXISTS idx_user_knowledge_mastery_mastery ON user_knowledge_mastery(mastery DESC);
CREATE INDEX IF NOT EXISTS idx_user_knowledge_mastery_next_review ON user_knowledge_mastery(user_id, next_review_at);

-- 注释
COMMENT ON TABLE user_knowledge_mastery IS '用户知识掌握度表（贝叶斯知识追踪）';
COMMENT ON COLUMN user_knowledge_mastery.mastery IS '掌握概率（0-1）';
COMMENT ON COLUMN user_knowledge_mastery.next_review_at IS '下次复习时间（艾宾浩斯）';

-- 触发器：自动更新updated_at
CREATE OR REPLACE FUNCTION update_user_knowledge_mastery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_knowledge_mastery_updated_at
  BEFORE UPDATE ON user_knowledge_mastery
  FOR EACH ROW
  EXECUTE FUNCTION update_user_knowledge_mastery_updated_at();
