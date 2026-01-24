# 知识图谱数据设置指南

## 概述

本应用已经完成了AI功能的前端集成，包括：
- ✅ 推荐引擎（BKT算法）
- ✅ 题目生成服务
- ✅ 知识图谱服务
- ✅ AI推荐UI（星球页面）

要启用这些功能，需要先导入知识图谱数据。

## 快速开始

### 方法1：通过数据管理页面（推荐）

1. 访问 http://localhost:5000
2. 登录后，以管理员身份访问 http://localhost:5000/data-management
3. 点击"初始化知识图谱数据"按钮
4. 等待数据导入完成

**注意事项：**
- 需要管理员权限
- 如果已有数据，会提示跳过
- 首次初始化会导入9个示例知识点（4-6年级各3个）

### 方法2：通过Supabase控制台

1. 登录 [Supabase控制台](https://supabase.com/dashboard)
2. 进入你的项目
3. 打开 SQL Editor
4. 复制 `database/migrations/012_insert_knowledge_data.sql` 的内容
5. 点击执行

**完整SQL文件位置：** `demo1/database/migrations/012_insert_knowledge_data.sql`

## 数据结构

### 知识节点（knowledge_nodes）

每个知识点包含以下信息：
- `id`: 唯一标识符
- `name`: 知识点名称
- `grade`: 年级（4/5/6）
- `module`: 模块（computation/geometry/algebra/statistics）
- `difficulty`: 难度（1-5）
- `prerequisites`: 前置知识点ID数组
- `question_types`: 支持的题型
- `metadata`: 扩展字段（JSONB）

### 示例知识点

**四年级（3个）：**
- 三位数加减法
- 两位数乘法
- 长方形和正方形的面积

**五年级（3个）：**
- 小数的加减法
- 小数乘法
- 三角形的面积

**六年级（3个）：**
- 分数加减法
- 分数乘法
- 圆的周长

## 验证数据导入

### 1. 检查数据管理页面
访问 /data-management 页面，查看知识点数量

### 2. 查看AI推荐
访问任何星球页面，应该能看到"AI 智能推荐"区域，显示推荐的3个知识点

### 3. 查看知识图谱
访问 /knowledge-graph 页面，查看完整的知识图谱可视化

## 自定义数据

### 添加自定义知识点

你可以通过以下方式添加自定义知识点：

**方式1：使用Supabase控制台**
```sql
INSERT INTO knowledge_nodes (id, name, grade, module, description, difficulty, prerequisites, question_types, metadata)
VALUES (
  'custom-01',
  '自定义知识点',
  5,
  'computation',
  '知识点描述',
  3,
  '["g5-comp-01"]',
  '["computation", "wordProblem"]',
  '{
    "keyConcepts": ["概念1", "概念2"],
    "learningObjectives": ["目标1", "目标2"],
    "is_core": true
  }'::jsonb
);
```

**方式2：通过API（需要开发后端接口）**
- 创建后端API接口
- 使用Supabase客户端插入数据

### 扩展知识图谱

要添加更多知识点，参考以下格式：

```typescript
{
  id: 'g5-comp-03',
  name: '小数除法',
  grade: 5,
  module: 'computation',
  description: '掌握小数除法的计算方法',
  difficulty: 4,
  prerequisites: ['g5-comp-02'],
  question_types: ['computation', 'wordProblem'],
  metadata: {
    keyConcepts: ['小数点移动', '循环小数'],
    learningObjectives: ['掌握小数除法'],
    commonMistakes: ['小数点位置错误'],
    is_core: true
  }
}
```

## 常见问题

### Q: 点击初始化没有反应？
A: 检查是否有管理员权限，刷新页面重试

### Q: AI推荐区域不显示？
A: 确保知识图谱数据已导入成功，刷新星球页面

### Q: 想重新导入数据？
A: 先点击"清空所有数据"，再点击"初始化知识图谱数据"

### Q: 题目生成功能如何使用？
A: 题目生成需要后端API支持，当前UI已完成，等待后端服务配置

## 下一步

1. **配置大语言模型API**
   - 在Supabase中配置环境变量
   - 或部署独立的后端服务

2. **测试AI功能**
   - 在星球页面查看AI推荐
   - 验证推荐的准确性和合理性

3. **扩展知识图谱**
   - 根据实际需求添加更多知识点
   - 完善知识点之间的关系

## 技术支持

如有问题，请查看：
- `SECURITY.md` - 安全架构说明
- `docs/EMAIL_VERIFICATION_SETUP.md` - 邮箱验证设置
- `docs/TROUBLESHOOTING.md` - 常见问题排查
