/**
 * 五年级专用 Prompt 模板
 * 适合10-11岁学生，引入简单应用题，语言稍复杂
 */

/**
 * 题目生成模板
 */
export const GRADE5_QUESTION_TEMPLATES = {
  /**
   * 计算题生成
   */
  computation: (topic: string) => `你是五年级数学老师，请生成5道适合五年级学生的${topic}计算题。

要求：
1. 数字范围适合五年级（如小数运算、简单分数运算）
2. 包含必要的计算步骤提示
3. 每题要有"知识链接"，关联之前学过的知识
4. 可以有一些需要多步计算的题目

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
      "steps": ["步骤1", "步骤2"],
      "knowledgeLink": "这个知识点和之前学的XXX相关"
    }
  ]
}`,

  /**
   * 应用题生成
   */
  wordProblem: (topic: string) => `你是五年级数学老师，请生成4道适合五年级学生的${topic}应用题。

要求：
1. 题目更贴近实际生活场景（如购物打折、时间安排、面积计算等）
2. 需要多步计算才能解答
3. 题目中要有明确的数量关系
4. 提供分步解题思路
5. 可以有2-3个不同难度层次的题目

输出JSON格式：
{
  "questions": [
    {
      "id": "q1",
      "type": "应用题",
      "question": "题目内容",
      "difficulty": "easy/medium/hard",
      "context": "生活场景描述",
      "answer": "答案",
      "steps": [
        "第一步：理解题目，找出已知条件",
        "第二步：列出数量关系",
        "第三步：计算得出结果"
      ],
      "checkMethod": "检验方法"
    }
  ]
}`,

  /**
   * 综合题生成
   */
  comprehensive: (topic: string) => `你是五年级数学老师，请生成3道适合五年级学生的${topic}综合题。

要求：
1. 综合运用多个知识点（如计算+应用题+判断）
2. 题目有层次性，逐步深入
3. 可以有开放性思考题
4. 提供完整的解题方案

输出JSON格式：
{
  "questions": [
    {
      "id": "q1",
      "type": "综合题",
      "question": "题目内容",
      "subQuestions": [
        {
          "id": "q1-1",
          "question": "第1小题",
          "answer": "答案"
        },
        {
          "id": "q1-2",
          "question": "第2小题",
          "answer": "答案"
        }
      ],
      "answer": "最终答案",
      "explanation": "详细解析"
    }
  ]
}`,

  /**
   * 开放题生成
   */
  openEnded: (topic: string) => `你是五年级数学老师，请生成2道适合五年级学生的${topic}开放题。

要求：
1. 题目有多种解法
2. 鼓励学生思考和创新
3. 提供多种参考解法
4. 培养学生的思维能力

输出JSON格式：
{
  "questions": [
    {
      "id": "q1",
      "type": "开放题",
      "question": "题目内容",
      "solutions": [
        {
          "method": "解法1描述",
          "steps": ["步骤1", "步骤2"]
        },
        {
          "method": "解法2描述",
          "steps": ["步骤1", "步骤2"]
        }
      ]
    }
  ]
}`,
};

/**
 * 解析生成模板
 */
export const GRADE5_EXPLANATION_TEMPLATES = {
  /**
   * 错题解析
   */
  mistakeExplanation: (question: string, wrongAnswer: string, correctAnswer: string) => `你是五年级数学老师，一个学生做错了这道题：

题目：${question}
学生答案：${wrongAnswer}
正确答案：${correctAnswer}

请给出详细的解析：

1. 分析学生可能的错误原因
2. 用分步方式展示正确解法
3. 对比错误做法和正确做法
4. 提供类似的练习题建议
5. 给予鼓励和建议

输出格式：
{
  "diagnosis": "错误原因分析",
  "correctSolution": {
    "step1": "步骤1",
    "step2": "步骤2",
    "step3": "步骤3"
  },
  "commonMistakes": ["常见错误1", "常见错误2"],
  "similarProblems": ["类似题1", "类似题2"],
  "advice": "学习建议"
}`,

  /**
   * 知识点总结
   */
  knowledgeSummary: (topic: string) => `你是五年级数学老师，请总结${topic}的知识点。

要求：
1. 列出核心概念（3-5个）
2. 解释每个概念的含义
3. 说明概念之间的关系
4. 提供典型例题

输出格式：
{
  "topic": "${topic}",
  "coreConcepts": [
    {
      "name": "概念名称",
      "definition": "定义",
      "example": "例题"
    }
  ],
  "relationships": ["概念1和概念2的关系"],
  "commonErrors": ["常见错误"],
  "studyTips": ["学习建议"]
}`,
};

/**
 * 费曼讲解评分模板
 */
export const GRADE5_FEYNMAN_TEMPLATES = {
  /**
   * 讲解评分
   */
  evaluateExplanation: (question: string, explanation: string) => `你是五年级数学老师，请给学生的讲解评分：

题目：${question}
学生讲解：${explanation}

请从以下维度评分（每项0-20分）：
1. 概念完整性（是否提到所有关键概念）
2. 逻辑清晰度（步骤是否清晰）
3. 表达准确性（数学语言是否准确）
4. 举例能力（是否用恰当的例子）
5. 思考深度（是否有自己的理解）

输出格式：
{
  "totalScore": 0-100,
  "dimensions": {
    "completeness": 0-20,
    "logic": 0-20,
    "accuracy": 0-20,
    "example": 0-20,
    "depth": 0-20
  },
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["需要改进1", "需要改进2"],
  "feedback": "详细反馈",
  "nextStep": "下一步学习建议",
  "level": "入门/进阶/优秀/卓越"
}`,
};
