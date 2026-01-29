-- 创建 knowledge_nodes 表
CREATE TABLE public.knowledge_nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  module TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  prerequisites JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_knowledge_nodes_grade ON public.knowledge_nodes(grade);
CREATE INDEX idx_knowledge_nodes_module ON public.knowledge_nodes(module);
CREATE INDEX idx_knowledge_nodes_difficulty ON public.knowledge_nodes(difficulty);

-- 添加表注释
COMMENT ON TABLE public.knowledge_nodes IS '知识图谱节点表，存储各个年级的知识点信息';
COMMENT ON COLUMN public.knowledge_nodes.id IS '知识点ID，格式为：g{年级}-n{序号}';
COMMENT ON COLUMN public.knowledge_nodes.name IS '知识点名称';
COMMENT ON COLUMN public.knowledge_nodes.grade IS '年级，如：4、5、6';
COMMENT ON COLUMN public.knowledge_nodes.module IS '模块名称，如：数与运算、数与代数';
COMMENT ON COLUMN public.knowledge_nodes.difficulty IS '难度级别，1-简单，2-中等，3-困难';
COMMENT ON COLUMN public.knowledge_nodes.prerequisites IS '前置知识点ID数组';
COMMENT ON COLUMN public.knowledge_nodes.metadata IS '额外元数据，包括技能维度、掌握水平等';
