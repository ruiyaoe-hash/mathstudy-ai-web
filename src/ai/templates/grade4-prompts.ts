/**
 * 四年级专用 Prompt 模板
 * 适合9-10岁学生，语言简单，多图形提示
 */

/**
 * 题目生成模板
 */
export const GRADE4_QUESTION_TEMPLATES = {
  /**
   * 计算题生成
   */
  computation: (topic: string) => `你是四年级数学老师，请生成5道适合四年级学生的${topic}计算题。

要求：
1. 数字范围适合四年级（如两位数加减、简单乘除）
2. 必须包含详细步骤解析
3. 每题最后要有"小老师"提示词，方便学生给同学讲解

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
      "teachingHint": "如果给同学讲解，可以这样说：..."
    }
  ]
}`,

  /**
   * 应用题生成
   */
  wordProblem: (topic: string) => `你是四年级数学老师，请生成3道适合四年级学生的${topic}应用题。

要求：
1. 题目要贴近生活（如购物、游戏、日常活动）
2. 语言简单易懂，适合9-10岁孩子理解
3. 题目中要有数字，需要学生计算
4. 提供详细解题步骤
5. 可以用简单的图示描述（用文字描述图示）

输出JSON格式：
{
  "questions": [
    {
      "id": "q1",
      "type": "应用题",
      "question": "题目内容",
      "context": "生活场景描述",
      "answer": "答案",
      "explanation": "详细解析步骤",
      "diagramHint": "可以画图表示：..."
    }
  ]
}`,

  /**
   * 判断题生成
   */
  trueFalse: (topic: string) => `你是四年级数学老师，请生成5道适合四年级学生的${topic}判断题。

要求：
1. 题目简单明确，适合快速判断
2. 涵盖常见错误和易混淆点
3. 每道题要有简洁的正确理由

输出JSON格式：
{
  "questions": [
    {
      "id": "q1",
      "type": "判断题",
      "question": "题目内容",
      "answer": true/false,
      "reason": "正确理由"
    }
  ]
}`,

  /**
   * 填空题生成
   */
  fillBlank: (topic: string) => `你是四年级数学老师，请生成5道适合四年级学生的${topic}填空题。

要求：
1. 每题空格不超过2个
2. 题目要有足够的提示信息
3. 答案简洁明确

输出JSON格式：
{
  "questions": [
    {
      "id": "q1",
      "type": "填空题",
      "question": "题目内容（用___表示空格）",
      "answer": "答案",
      "hint": "提示信息"
    }
  ]
}`,
};

/**
 * 解析生成模板
 */
export const GRADE4_EXPLANATION_TEMPLATES = {
  /**
   * 错题解析
   */
  mistakeExplanation: (question: string, wrongAnswer: string, correctAnswer: string) => `你是四年级数学老师，一个学生做错了这道题：

题目：${question}
学生答案：${wrongAnswer}
正确答案：${correctAnswer}

请给出友好的解析，帮助学生理解：

1. 告诉学生哪一步错了
2. 用简单的比喻或例子解释正确的做法
3. 给学生鼓励和信心

输出格式：
{
  "diagnosis": "错误诊断",
  "explanation": "详细解析（用学生能懂的语言）",
  "analogy": "用生活中的例子比喻",
  "encouragement": "鼓励的话"
}`,

  /**
   * 小老师讲解提示
   */
  teacherHint: (question: string) => `你是四年级数学老师，请为这道题设计"小老师"讲解提示：

题目：${question}

请设计3个问题，引导学生给同学讲解：
1. "第一步你应该怎么想？"
2. "如果你给同学讲，你会怎么说？"
3. "可以用什么例子来帮助理解？"

输出格式：
{
  "guidingQuestions": ["问题1", "问题2", "问题3"],
  "keyConcepts": ["核心概念1", "核心概念2"],
  "example": "可以用这个例子：..."
}`,
};

/**
 * 费曼讲解评分模板
 */
export const GRADE4_FEYNMAN_TEMPLATES = {
  /**
   * 讲解评分
   */
  evaluateExplanation: (question: string, explanation: string) => `你是四年级数学老师，请给学生的讲解评分：

题目：${question}
学生讲解：${explanation}

请从以下维度评分（每项0-20分）：
1. 核心概念是否提到（如"进位"、"余数"等）
2. 逻辑是否清晰
3. 语言是否简单易懂
4. 是否用例子帮助理解
5. 是否有错别字

输出格式：
{
  "totalScore": 0-100,
  "dimensions": {
    "concept": 0-20,
    "logic": 0-20,
    "language": 0-20,
    "example": 0-20,
    "accuracy": 0-20
  },
  "feedback": "具体反馈",
  "suggestion": "改进建议",
  "stars": "★/★★/★★★/★★★★/★★★★★"
}`,
};
