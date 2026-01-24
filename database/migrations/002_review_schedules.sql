-- ============================================
-- 复习计划表
-- ============================================

CREATE TABLE IF NOT EXISTS review_schedules (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  knowledge_id TEXT NOT NULL,
  review_stage INTEGER NOT NULL, -- 1-6，艾宾浩斯阶段
  scheduled_at TIMESTAMPTZ NOT NULL, -- 计划复习时间
  completed_at TIMESTAMPTZ, -- 实际完成时间
  retention_rate NUMERIC, -- 保留率（0-1）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_knowledge FOREIGN KEY (knowledge_id) REFERENCES knowledge_nodes(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_review_schedules_user_id ON review_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_review_schedules_knowledge_id ON review_schedules(knowledge_id);
CREATE INDEX IF NOT EXISTS idx_review_schedules_scheduled_at ON review_schedules(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_review_schedules_user_stage ON review_schedules(user_id, review_stage);

-- 注释
COMMENT ON TABLE review_schedules IS '复习计划表（艾宾浩斯间隔重复）';
COMMENT ON COLUMN review_schedules.review_stage IS '复习阶段（1-6）';
COMMENT ON COLUMN review_schedules.retention_rate IS '记忆保留率（0-1）';
