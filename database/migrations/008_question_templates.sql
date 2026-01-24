-- ============================================
-- 题目模板表
-- ============================================

CREATE TABLE IF NOT EXISTS question_templates (
  id TEXT PRIMARY KEY,
  knowledge_id TEXT NOT NULL,
  template_pattern TEXT NOT NULL, -- 模板字符串（如"{{num1}} + {{num2}} = ?"）
  constraints JSONB NOT NULL, -- 参数约束（范围、条件等）
  explanation_template TEXT, -- 解析模板
  grade INTEGER NOT NULL, -- 适用年级
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT fk_knowledge FOREIGN KEY (knowledge_id) REFERENCES knowledge_nodes(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_question_templates_knowledge_id ON question_templates(knowledge_id);
CREATE INDEX IF NOT EXISTS idx_question_templates_grade ON question_templates(grade);

-- 注释
COMMENT ON TABLE question_templates IS '题目模板表（低成本生成题目）';
COMMENT ON COLUMN question_templates.template_pattern IS '模板字符串，使用{{}}表示变量';
COMMENT ON COLUMN question_templates.constraints IS '参数约束（如{"num1": {"min": 10, "max": 100}}）';

-- 触发器：自动更新updated_at
CREATE OR REPLACE FUNCTION update_question_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_question_templates_updated_at
  BEFORE UPDATE ON question_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_question_templates_updated_at();
