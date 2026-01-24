-- ============================================
-- 答题记录表
-- ============================================

CREATE TABLE IF NOT EXISTS answer_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  knowledge_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  time_spent INTEGER NOT NULL, -- 毫秒
  difficulty NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_knowledge FOREIGN KEY (knowledge_id) REFERENCES knowledge_nodes(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_answer_records_user_id ON answer_records(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_records_knowledge_id ON answer_records(knowledge_id);
CREATE INDEX IF NOT EXISTS idx_answer_records_created_at ON answer_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answer_records_user_knowledge ON answer_records(user_id, knowledge_id);

-- 注释
COMMENT ON TABLE answer_records IS '答题记录表';
COMMENT ON COLUMN answer_records.time_spent IS '答题用时（毫秒）';
COMMENT ON COLUMN answer_records.difficulty IS '题目难度（1-5）';
