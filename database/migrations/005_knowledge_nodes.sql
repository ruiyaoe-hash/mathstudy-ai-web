-- ============================================
-- 知识图谱表（待完善）
-- ============================================
-- 注意：此表结构需要等待用户提供知识图谱后最终确定
-- 当前使用JSONB字段存储灵活数据

CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL, -- 4/5/6
  module TEXT NOT NULL, -- 计算模块/几何模块/代数模块/统计模块
  description TEXT,
  
  -- 核心字段
  difficulty NUMERIC, -- 难度系数（1-5）
  prerequisites JSONB DEFAULT '[]'::jsonb, -- 前置知识点ID数组
  question_types JSONB DEFAULT '[]'::jsonb, -- 支持的题型数组
  
  -- 扩展字段（所有ChatGPT可能生成的字段都用JSONB）
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_grade ON knowledge_nodes(grade);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_module ON knowledge_nodes(module);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_difficulty ON knowledge_nodes(difficulty);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_prerequisites ON knowledge_nodes USING GIN(prerequisites);

-- 注释
COMMENT ON TABLE knowledge_nodes IS '知识图谱表（4-6年级）';
COMMENT ON COLUMN knowledge_nodes.prerequisites IS '前置知识点ID数组（JSONB）';
COMMENT ON COLUMN knowledge_nodes.metadata IS '扩展字段（keyConcepts, learningObjectives, commonMistakes, examples等）';

-- 触发器：自动更新updated_at
CREATE OR REPLACE FUNCTION update_knowledge_nodes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_knowledge_nodes_updated_at
  BEFORE UPDATE ON knowledge_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_nodes_updated_at();
