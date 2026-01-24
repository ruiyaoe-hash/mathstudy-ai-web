/**
 * Prompt 模板管理器
 * 根据年级自动选择合适的Prompt模板
 */

import { GRADE4_QUESTION_TEMPLATES, GRADE4_EXPLANATION_TEMPLATES, GRADE4_FEYNMAN_TEMPLATES } from './grade4-prompts';
import { GRADE5_QUESTION_TEMPLATES, GRADE5_EXPLANATION_TEMPLATES, GRADE5_FEYNMAN_TEMPLATES } from './grade5-prompts';
import { GRADE6_QUESTION_TEMPLATES, GRADE6_EXPLANATION_TEMPLATES, GRADE6_FEYNMAN_TEMPLATES } from './grade6-prompts';

export type Grade = 4 | 5 | 6;

/**
 * Prompt 管理器
 */
export class PromptManager {
  private grade: Grade;

  constructor(grade: Grade = 5) {
    this.grade = grade;
  }

  /**
   * 设置年级
   */
  setGrade(grade: Grade): void {
    this.grade = grade;
  }

  /**
   * 获取题目生成模板
   */
  getQuestionTemplate(type: 'computation' | 'wordProblem' | 'trueFalse' | 'fillBlank' | 'comprehensive' | 'openEnded' | 'complexWordProblem' | 'reasoningProblem' | 'inquiryProblem', topic: string): string {
    switch (this.grade) {
      case 4:
        if (type in GRADE4_QUESTION_TEMPLATES) {
          return (GRADE4_QUESTION_TEMPLATES as any)[type](topic);
        }
        throw new Error(`四年级暂不支持题型: ${type}`);
      
      case 5:
        if (type in GRADE5_QUESTION_TEMPLATES) {
          return (GRADE5_QUESTION_TEMPLATES as any)[type](topic);
        }
        throw new Error(`五年级暂不支持题型: ${type}`);
      
      case 6:
        if (type in GRADE6_QUESTION_TEMPLATES) {
          return (GRADE6_QUESTION_TEMPLATES as any)[type](topic);
        }
        throw new Error(`六年级暂不支持题型: ${type}`);
      
      default:
        throw new Error(`不支持的年级: ${this.grade}`);
    }
  }

  /**
   * 获取解析模板
   */
  getExplanationTemplate(type: 'mistakeExplanation' | 'teacherHint' | 'knowledgeSummary' | 'knowledgeSystem', params: any): string {
    switch (this.grade) {
      case 4:
        if (type in GRADE4_EXPLANATION_TEMPLATES) {
          return (GRADE4_EXPLANATION_TEMPLATES as any)[type](...params);
        }
        throw new Error(`四年级暂不支持解析类型: ${type}`);
      
      case 5:
        if (type in GRADE5_EXPLANATION_TEMPLATES) {
          return (GRADE5_EXPLANATION_TEMPLATES as any)[type](...params);
        }
        throw new Error(`五年级暂不支持解析类型: ${type}`);
      
      case 6:
        if (type in GRADE6_EXPLANATION_TEMPLATES) {
          return (GRADE6_EXPLANATION_TEMPLATES as any)[type](...params);
        }
        throw new Error(`六年级暂不支持解析类型: ${type}`);
      
      default:
        throw new Error(`不支持的年级: ${this.grade}`);
    }
  }

  /**
   * 获取费曼讲解评分模板
   */
  getFeynmanTemplate(type: 'evaluateExplanation' | 'evaluateDeepExplanation', params: any): string {
    switch (this.grade) {
      case 4:
        if (type in GRADE4_FEYNMAN_TEMPLATES) {
          return (GRADE4_FEYNMAN_TEMPLATES as any)[type](...params);
        }
        throw new Error(`四年级暂不支持费曼模板类型: ${type}`);
      
      case 5:
        if (type in GRADE5_FEYNMAN_TEMPLATES) {
          return (GRADE5_FEYNMAN_TEMPLATES as any)[type](...params);
        }
        throw new Error(`五年级暂不支持费曼模板类型: ${type}`);
      
      case 6:
        if (type in GRADE6_FEYNMAN_TEMPLATES) {
          return (GRADE6_FEYNMAN_TEMPLATES as any)[type](...params);
        }
        throw new Error(`六年级暂不支持费曼模板类型: ${type}`);
      
      default:
        throw new Error(`不支持的年级: ${this.grade}`);
    }
  }

  /**
   * 获取支持的功能列表
   */
  getSupportedFeatures(): {
    questionTypes: string[];
    explanationTypes: string[];
    feynmanTypes: string[];
  } {
    const questionTypes: string[] = [];
    const explanationTypes: string[] = [];
    const feynmanTypes: string[] = [];

    switch (this.grade) {
      case 4:
        questionTypes.push('computation', 'wordProblem', 'trueFalse', 'fillBlank');
        explanationTypes.push('mistakeExplanation', 'teacherHint');
        feynmanTypes.push('evaluateExplanation');
        break;
      
      case 5:
        questionTypes.push('computation', 'wordProblem', 'comprehensive', 'openEnded');
        explanationTypes.push('mistakeExplanation', 'knowledgeSummary');
        feynmanTypes.push('evaluateExplanation');
        break;
      
      case 6:
        questionTypes.push('computation', 'complexWordProblem', 'reasoningProblem', 'inquiryProblem');
        explanationTypes.push('deepMistakeExplanation', 'knowledgeSystem');
        feynmanTypes.push('evaluateDeepExplanation');
        break;
    }

    return { questionTypes, explanationTypes, feynmanTypes };
  }
}

/**
 * 导出单例实例
 */
export const promptManager = new PromptManager();

/**
 * 根据年级创建Prompt管理器
 */
export function createPromptManager(grade: Grade): PromptManager {
  return new PromptManager(grade);
}
