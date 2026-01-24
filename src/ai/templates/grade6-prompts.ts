/**
 * 六年级专用 Prompt 模板
 * 适合11-12岁学生，复杂应用题，推理题目
 */

/**
 * 题目生成模板
 */
export const GRADE6_QUESTION_TEMPLATES = {
  /**
   * 计算题生成
   */
  computation: (topic: string) => `你是六年级数学老师，请生成5道适合六年级学生的${topic}计算题。

要求：
1. 数字范围适合六年级（如复杂分数运算、百分数、比例）
2. 包含多种计算方法和技巧
3. 鼓励使用简便算法
4. 可以有一些需要灵活计算的题目

输出JSON格式：
{
  "questions": [
    {
      "id": "q1",
      "type": "计算题",
      "question": "题目内容",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "详细解析",
      "quickMethod": "简便算法",
      "multipleMethods": ["方法1", "方法2"]
    }
  ]
}`,

  /**
   * 复杂应用题生成
   */
  complexWordProblem: (topic: string) => `你是六年级数学老师，请生成4道适合六年级学生的${topic}复杂应用题。

要求：
1. 题目需要多步分析和计算
2. 涉及实际生活中的复杂场景（如投资收益、工作效率、工程问题等）
3. 需要建立数学模型
4. 提供完整的解题思路和多种解法
5. 可以有需要讨论和思考的问题

输出JSON格式：
{
  "questions": [
    {
      "id": "q1",
      "type": "复杂应用题",
      "question": "题目内容",
      "difficulty": "medium/hard",
      "context": "实际场景描述",
      "analysis": "题目分析",
      "solutions": [
        {
          "method": "解法1",
          "steps": ["步骤1", "步骤2", "步骤3"],
          "answer": "答案"
        },
        {
          "method": "解法2",
          "steps": ["步骤1", "步骤2"],
          "answer": "答案"
        }
      ],
      "discussion": "可以思考的问题"
    }
  ]
}`,

  /**
   * 推理题生成
   */
  reasoningProblem: (topic: string) => `你是六年级数学老师，请生成3道适合六年级学生的${topic}推理题。

要求：
1. 需要逻辑推理才能解答
2. 可以有多个条件，需要综合分析
3. 培养学生的逻辑思维能力
4. 提供推理过程

输出JSON格式：
{
  "questions": [
    {
      "id": "q1",
      "type": "推理题",
      "question": "题目内容",
      "conditions": ["条件1", "条件2", "条件3"],
      "reasoningProcess": "推理过程",
      "answer": "答案",
      "alternativeAnswer": "另一种可能的答案（如果有）"
    }
  ]
}`,

  /**
   * 探究题生成
   */
  inquiryProblem: (topic: string) => `你是六年级数学老师，请生成2道适合六年级学生的${topic}探究题。

要求：
1. 题目鼓励学生自主探索
2. 可以有多个可能的答案
3. 培养学生的探究能力和创新思维
4. 提供探究思路和方法

输出JSON格式：
{
  "questions": [
    {
      "id": "q1",
      "type": "探究题",
      "question": "题目内容",
      "inquiryGoals": ["探究目标1", "探究目标2"],
      "explorationMethods": ["探究方法1", "探究方法2"],
      "possibleFindings": ["可能发现1", "可能发现2"],
      "extendedQuestions": ["延伸问题1", "延伸问题2"]
    }
  ]
}`,
};

/**
 * 解析生成模板
 */
export const GRADE6_EXPLANATION_TEMPLATES = {
  /**
   * 深度错题解析
   */
  deepMistakeExplanation: (question: string, wrongAnswer: string, correctAnswer: string) => `你是六年级数学老师，一个学生做错了这道题：

题目：${question}
学生答案：${wrongAnswer}
正确答案：${correctAnswer}

请给出深度解析：

1. 分析学生的思维路径和错误根源
2. 用数学思维分析错误本质
3. 提供多种解法，对比优劣
4. 总结通用的解题策略
5. 设计变式训练题

输出格式：
{
  "diagnosis": "深度错误分析",
  "rootCause": "错误根源（思维层面）",
  "mathematicalAnalysis": "数学分析",
  "solutions": [
    {
      "method": "解法1",
      "steps": ["步骤1", "步骤2"],
      "pros": "优点",
      "cons": "缺点"
    },
    {
      "method": "解法2",
      "steps": ["步骤1", "步骤2"],
      "pros": "优点",
      "cons": "缺点"
    }
  ],
  "strategy": "通用解题策略",
  "variantProblems": ["变式题1", "变式题2"],
  "extension": "知识延伸"
}`,

  /**
   * 知识体系总结
   */
  knowledgeSystem: (topic: string) => `你是六年级数学老师，请总结${topic}的知识体系。

要求：
1. 构建知识网络图（用文字描述）
2. 说明知识点之间的联系
3. 总结常见的题型和解题方法
4. 指出重点和难点
5. 提供学习路径建议

输出格式：
{
  "topic": "${topic}",
  "knowledgeNetwork": "知识网络描述",
  "keyPoints": [
    {
      "name": "重点1",
      "importance": "高/中/低",
      "difficulty": "高/中/低",
      "connection": "与其他知识点的联系"
    }
  ],
  "commonProblemTypes": [
    {
      "type": "题型1",
      "methods": ["解法1", "解法2"],
      "skills": ["技能1", "技能2"]
    }
  ],
  "learningPath": "学习路径建议",
  "reviewPoints": ["复习要点"]
}`,
};

/**
 * 费曼讲解评分模板
 */
export const GRADE6_FEYNMAN_TEMPLATES = {
  /**
   * 深度讲解评分
   */
  evaluateDeepExplanation: (question: string, explanation: string) => `你是六年级数学老师，请给学生的讲解进行深度评分：

题目：${question}
学生讲解：${explanation}

请从以下维度评分（每项0-20分）：
1. 数学准确性（概念、公式、推理是否准确）
2. 逻辑严谨性（推理过程是否严密）
3. 表达清晰度（是否清晰易懂）
4. 思考深度（是否有自己的理解和创新）
5. 教学能力（是否能有效帮助他人理解）

输出格式：
{
  "totalScore": 0-100,
  "dimensions": {
    "accuracy": 0-20,
    "rigor": 0-20,
    "clarity": 0-20,
    "depth": 0-20,
    "teaching": 0-20
  },
  "highlights": ["亮点1", "亮点2"],
  "improvements": ["可以改进1", "可以改进2"],
  "mathematicalInsights": "数学层面的点评",
  "teachingSuggestions": "教学建议",
  "advancedFeedback": "进阶反馈",
  "level": "标准/优秀/卓越/大师"
}`,
};
