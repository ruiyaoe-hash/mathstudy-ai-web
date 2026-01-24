-- ============================================
-- 题目表
-- ============================================

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'static' | 'template' | 'dynamic'
  knowledge_id TEXT NOT NULL,
  template_id TEXT, -- 模板ID（如果是template类型）
  content JSONB NOT NULL, -- 题目内容（题干、选项、答案、解析）
  difficulty NUMERIC NOT NULL, -- 难度（1-5）
  usage_count INTEGER NOT NULL DEFAULT 0, -- 使用次数
  average_correctness NUMERIC, -- 平均正确率
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT fk_knowledge FOREIGN KEY (knowledge_id) REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  CONSTRAINT fk_template FOREIGN KEY (template_id) REFERENCES question_templates(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_questions_knowledge_id ON questions(knowledge_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_template_id ON questions(template_id);
CREATE INDEX IF NOT EXISTS idx_questions_usage_count ON questions(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_questions_content ON questions USING GIN(content);

-- 注释
COMMENT ON TABLE questions IS '题目表（混合架构：静态/模板/动态）';
COMMENT ON COLUMN questions.type IS '题目类型：static（静态）| template（模板）| dynamic（动态）';
COMMENT ON COLUMN questions.usage_count IS '使用次数（用于评估题目质量）';

-- 触发器：自动更新updated_at
CREATE OR REPLACE FUNCTION update_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_questions_updated_at();
