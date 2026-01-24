/**
 * 知识图谱数据初始化服务
 * 使用Supabase客户端直接插入示例数据
 */

import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeNodeData {
  id: string;
  name: string;
  grade: number;
  module: string;
  description: string;
  difficulty: number;
  prerequisites: string[];
  question_types: string[];
  metadata: Record<string, any>;
}

/**
 * 四年级示例数据
 */
const grade4Data: KnowledgeNodeData[] = [
  {
    id: 'g4-comp-01',
    name: '三位数加减法',
    grade: 4,
    module: 'computation',
    description: '掌握三位数的加减法运算，包括进位和退位',
    difficulty: 2,
    prerequisites: [],
    question_types: ['computation', 'wordProblem'],
    metadata: {
      keyConcepts: ['进位', '退位', '竖式计算', '验算'],
      learningObjectives: ['能够正确进行三位数加减法计算', '掌握进位和退位的方法'],
      commonMistakes: ['忘记进位或退位', '对齐错误'],
      is_core: true
    }
  },
  {
    id: 'g4-comp-02',
    name: '两位数乘法',
    grade: 4,
    module: 'computation',
    description: '掌握两位数乘两位数的乘法运算',
    difficulty: 3,
    prerequisites: ['g4-comp-01'],
    question_types: ['computation', 'wordProblem'],
    metadata: {
      keyConcepts: ['乘法口诀', '部分积', '进位乘法'],
      learningObjectives: ['理解两位数乘两位数的算理', '掌握竖式计算方法'],
      commonMistakes: ['忘记进位', '部分积位置错误'],
      is_core: true
    }
  },
  {
    id: 'g4-geo-01',
    name: '长方形和正方形的面积',
    grade: 4,
    module: 'geometry',
    description: '掌握长方形和正方形面积的计算方法',
    difficulty: 3,
    prerequisites: [],
    question_types: ['computation', 'wordProblem'],
    metadata: {
      keyConcepts: ['面积', '面积单位', '长×宽', '边长²'],
      learningObjectives: ['理解面积的意义', '掌握面积计算公式'],
      commonMistakes: ['混淆周长和面积', '单位错误'],
      is_core: true
    }
  }
];

/**
 * 五年级示例数据
 */
const grade5Data: KnowledgeNodeData[] = [
  {
    id: 'g5-comp-01',
    name: '小数的加减法',
    grade: 5,
    module: 'computation',
    description: '掌握小数加减法的计算方法',
    difficulty: 3,
    prerequisites: ['g4-comp-01'],
    question_types: ['computation', 'wordProblem'],
    metadata: {
      keyConcepts: ['小数点对齐', '进位', '退位'],
      learningObjectives: ['掌握小数加减法的计算方法', '理解小数点对齐的原理'],
      commonMistakes: ['小数点没有对齐', '忘记点小数点'],
      is_core: true
    }
  },
  {
    id: 'g5-comp-02',
    name: '小数乘法',
    grade: 5,
    module: 'computation',
    description: '掌握小数乘法的计算方法',
    difficulty: 4,
    prerequisites: ['g5-comp-01', 'g4-comp-02'],
    question_types: ['computation', 'wordProblem'],
    metadata: {
      keyConcepts: ['小数点', '积的小数位数', '近似数'],
      learningObjectives: ['掌握小数乘法的计算方法', '会求积的近似数'],
      commonMistakes: ['小数点位置错误', '忘记点小数点'],
      is_core: true
    }
  },
  {
    id: 'g5-geo-01',
    name: '三角形的面积',
    grade: 5,
    module: 'geometry',
    description: '掌握三角形面积的计算方法',
    difficulty: 3,
    prerequisites: ['g4-geo-01'],
    question_types: ['computation', 'wordProblem'],
    metadata: {
      keyConcepts: ['底', '高', '面积公式', '等底等高'],
      learningObjectives: ['掌握三角形面积公式', '理解推导过程'],
      commonMistakes: ['忘记除以2', '混淆底和高'],
      is_core: true
    }
  }
];

/**
 * 六年级示例数据
 */
const grade6Data: KnowledgeNodeData[] = [
  {
    id: 'g6-comp-01',
    name: '分数加减法',
    grade: 6,
    module: 'computation',
    description: '掌握分数加减法的计算方法',
    difficulty: 3,
    prerequisites: ['g5-comp-01'],
    question_types: ['computation', 'wordProblem'],
    metadata: {
      keyConcepts: ['通分', '异分母', '约分', '最简分数'],
      learningObjectives: ['掌握异分母分数加减法', '会化简结果'],
      commonMistakes: ['忘记通分', '结果没有化简'],
      is_core: true
    }
  },
  {
    id: 'g6-comp-02',
    name: '分数乘法',
    grade: 6,
    module: 'computation',
    description: '掌握分数乘法的计算方法',
    difficulty: 3,
    prerequisites: ['g6-comp-01', 'g5-comp-02'],
    question_types: ['computation', 'wordProblem'],
    metadata: {
      keyConcepts: ['分子乘分子', '分母乘分母', '约分', '倒数'],
      learningObjectives: ['掌握分数乘法', '理解倒数概念'],
      commonMistakes: ['分子分母分别相乘出错', '没有先约分'],
      is_core: true
    }
  },
  {
    id: 'g6-geo-01',
    name: '圆的周长',
    grade: 6,
    module: 'geometry',
    description: '掌握圆周长的计算方法',
    difficulty: 3,
    prerequisites: ['g5-geo-01'],
    question_types: ['computation', 'wordProblem'],
    metadata: {
      keyConcepts: ['周长', 'C=2πr', 'C=πd', '圆周率'],
      learningObjectives: ['掌握圆周长公式', '会计算圆周长'],
      commonMistakes: ['公式记错', 'π取值错误'],
      is_core: true
    }
  }
];

/**
 * 初始化知识图谱数据
 */
export async function initKnowledgeData(): Promise<{ success: boolean; message: string }> {
  try {
    // 检查是否已经有数据
    const { count } = await supabase
      .from('knowledge_nodes')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      return {
        success: false,
        message: `知识图谱已有 ${count} 条数据，跳过初始化`
      };
    }

    // 合并所有数据
    const allData = [...grade4Data, ...grade5Data, ...grade6Data];

    // 插入数据
    const { error } = await supabase
      .from('knowledge_nodes')
      .insert(allData);

    if (error) {
      console.error('插入知识图谱数据失败:', error);
      return {
        success: false,
        message: `插入失败: ${error.message}`
      };
    }

    return {
      success: true,
      message: `成功导入 ${allData.length} 条知识图谱数据`
    };
  } catch (error) {
    console.error('初始化知识图谱数据失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 清空知识图谱数据（慎用）
 */
export async function clearKnowledgeData(): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('knowledge_nodes')
      .delete()
      .neq('id', ''); // 删除所有记录

    if (error) {
      return {
        success: false,
        message: `清空失败: ${error.message}`
      };
    }

    return {
      success: true,
      message: '已清空所有知识图谱数据'
    };
  } catch (error) {
    console.error('清空知识图谱数据失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
}
