import { Question } from '@/types/game';
import { getBigNumbersQuestions } from './bigNumbers';
import { getAnglesQuestions } from './angles';
import { getMultiplyDivideQuestions } from './multiplyDivide';
import { getShapesQuestions } from './shapes';
import { getDecimalsQuestions } from './decimals';

// 获取指定星球和关卡的题目
export const getQuestions = (planetId: string, levelId: string): Question[] => {
  let questions: Question[] = [];

  switch (planetId) {
    case 'big-numbers':
      questions = getBigNumbersQuestions(levelId);
      break;
    case 'angles':
      questions = getAnglesQuestions(levelId);
      break;
    case 'multiply-divide':
      questions = getMultiplyDivideQuestions(levelId);
      break;
    case 'shapes':
      questions = getShapesQuestions(levelId);
      break;
    case 'decimals':
      questions = getDecimalsQuestions(levelId);
      break;
    default:
      questions = [];
  }

  // 随机打乱题目顺序
  return shuffleArray(questions);
};

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 别名导出，兼容旧代码
export const getQuestionsForLevel = getQuestions;

// 获取题目总数统计
export const getQuestionStats = () => {
  const stats = {
    'big-numbers': {
      'level-1': getBigNumbersQuestions('level-1').length,
      'level-2': getBigNumbersQuestions('level-2').length,
      'level-3': getBigNumbersQuestions('level-3').length,
    },
    angles: {
      'level-1': getAnglesQuestions('level-1').length,
      'level-2': getAnglesQuestions('level-2').length,
      'level-3': getAnglesQuestions('level-3').length,
    },
    'multiply-divide': {
      'level-1': getMultiplyDivideQuestions('level-1').length,
      'level-2': getMultiplyDivideQuestions('level-2').length,
      'level-3': getMultiplyDivideQuestions('level-3').length,
    },
    shapes: {
      'level-1': getShapesQuestions('level-1').length,
      'level-2': getShapesQuestions('level-2').length,
      'level-3': getShapesQuestions('level-3').length,
    },
    decimals: {
      'level-1': getDecimalsQuestions('level-1').length,
      'level-2': getDecimalsQuestions('level-2').length,
      'level-3': getDecimalsQuestions('level-3').length,
    },
  };

  return stats;
};
