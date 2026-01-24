import { Question } from '@/types/game';

export const multiplyDivideQuestions: Question[] = [
  // Level 1 - 乘法初探
  {
    id: 'md-1-1',
    type: 'fill',
    question: '计算：123 × 45 = ______',
    answer: '5535',
    explanation: '123×45 = 123×40 + 123×5 = 4920 + 615 = 5535',
    difficulty: 1,
  },
  {
    id: 'md-1-2',
    type: 'choice',
    question: '245 × 36 的结果是：',
    options: ['8820', '8720', '8920', '8620'],
    answer: 0,
    explanation: '245×36 = 245×30 + 245×6 = 7350 + 1470 = 8820',
    difficulty: 1,
  },
  {
    id: 'md-1-3',
    type: 'fill',
    question: '计算：108 × 25 = ______',
    answer: '2700',
    explanation: '108×25 = 108×100÷4 = 10800÷4 = 2700，或直接竖式计算',
    difficulty: 1,
  },
  {
    id: 'md-1-4',
    type: 'choice',
    question: '320 × 40 = ？',
    options: ['12800', '1280', '128000', '128'],
    answer: 0,
    explanation: '320×40 = 32×4×100 = 128×100 = 12800',
    difficulty: 1,
  },
  {
    id: 'md-1-5',
    type: 'fill',
    question: '计算：205 × 32 = ______',
    answer: '6560',
    explanation: '205×32 = 200×32 + 5×32 = 6400 + 160 = 6560',
    difficulty: 2,
  },
  {
    id: 'md-1-6',
    type: 'choice',
    question: '一本书有186页，学校图书馆买了45本这样的书，一共有多少页？',
    options: ['8370页', '8270页', '8470页', '8170页'],
    answer: 0,
    explanation: '186×45 = 186×40 + 186×5 = 7440 + 930 = 8370页',
    difficulty: 2,
  },
  {
    id: 'md-1-7',
    type: 'fill',
    question: '计算：250 × 24 = ______',
    answer: '6000',
    explanation: '250×24 = 250×4×6 = 1000×6 = 6000',
    difficulty: 1,
  },
  {
    id: 'md-1-8',
    type: 'choice',
    question: '305 × 18 = ？',
    options: ['5490', '5590', '5390', '5290'],
    answer: 0,
    explanation: '305×18 = 305×20 - 305×2 = 6100 - 610 = 5490',
    difficulty: 2,
  },
  // Level 2 - 除法挑战
  {
    id: 'md-2-1',
    type: 'fill',
    question: '计算：936 ÷ 24 = ______',
    answer: '39',
    explanation: '936÷24，先试商：93÷24≈3，24×3=72，93-72=21，再看216÷24=9，所以商39',
    difficulty: 1,
  },
  {
    id: 'md-2-2',
    type: 'choice',
    question: '784 ÷ 28 = ？',
    options: ['26', '27', '28', '29'],
    answer: 2,
    explanation: '784÷28 = 28×28÷28 = 28，或竖式计算验证',
    difficulty: 1,
  },
  {
    id: 'md-2-3',
    type: 'fill',
    question: '计算：1050 ÷ 35 = ______',
    answer: '30',
    explanation: '1050÷35 = 1050÷35，105÷35=3，0÷35=0，所以商30',
    difficulty: 1,
  },
  {
    id: 'md-2-4',
    type: 'choice',
    question: '有858本书，每个书架放26本，需要多少个书架？',
    options: ['32个', '33个', '34个', '35个'],
    answer: 1,
    explanation: '858÷26=33，刚好除尽，需要33个书架',
    difficulty: 2,
  },
  {
    id: 'md-2-5',
    type: 'fill',
    question: '计算：2016 ÷ 42 = ______',
    answer: '48',
    explanation: '2016÷42，201÷42≈4，42×4=168，201-168=33，336÷42=8，商48',
    difficulty: 2,
  },
  {
    id: 'md-2-6',
    type: 'choice',
    question: '720 ÷ 15 = ？',
    options: ['46', '47', '48', '49'],
    answer: 2,
    explanation: '720÷15 = 720÷15，72÷15=4余12，120÷15=8，商48',
    difficulty: 1,
  },
  {
    id: 'md-2-7',
    type: 'fill',
    question: '计算：1824 ÷ 32 = ______',
    answer: '57',
    explanation: '1824÷32，182÷32≈5，32×5=160，182-160=22，224÷32=7，商57',
    difficulty: 2,
  },
  {
    id: 'md-2-8',
    type: 'choice',
    question: '一共有1260个苹果，装在45个箱子里，平均每个箱子装多少个？',
    options: ['26个', '27个', '28个', '29个'],
    answer: 2,
    explanation: '1260÷45 = 28个',
    difficulty: 2,
  },
  // Level 3 - 混合运算
  {
    id: 'md-3-1',
    type: 'fill',
    question: '计算：125 × 8 ÷ 25 = ______',
    answer: '40',
    explanation: '125×8 = 1000，1000÷25 = 40',
    difficulty: 1,
  },
  {
    id: 'md-3-2',
    type: 'choice',
    question: '240 ÷ 30 × 15 = ？',
    options: ['110', '115', '120', '125'],
    answer: 2,
    explanation: '240÷30=8，8×15=120',
    difficulty: 1,
  },
  {
    id: 'md-3-3',
    type: 'fill',
    question: '计算：432 ÷ 18 × 25 = ______',
    answer: '600',
    explanation: '432÷18=24，24×25=600',
    difficulty: 2,
  },
  {
    id: 'md-3-4',
    type: 'choice',
    question: '小明买了8本笔记本，每本12元，付给售货员100元，应找回多少元？',
    options: ['2元', '4元', '6元', '8元'],
    answer: 1,
    explanation: '8×12=96元，100-96=4元',
    difficulty: 1,
  },
  {
    id: 'md-3-5',
    type: 'fill',
    question: '计算：600 ÷ 25 ÷ 8 = ______',
    answer: '3',
    explanation: '600÷25=24，24÷8=3',
    difficulty: 2,
  },
  {
    id: 'md-3-6',
    type: 'choice',
    question: '某工厂生产1800个零件，用了15天，平均每天生产多少个？每5个装一盒，每天能装多少盒？',
    options: ['120个，24盒', '120个，25盒', '130个，26盒', '110个，22盒'],
    answer: 0,
    explanation: '1800÷15=120个/天，120÷5=24盒/天',
    difficulty: 2,
  },
  {
    id: 'md-3-7',
    type: 'fill',
    question: '计算：36 × 25 ÷ 45 = ______',
    answer: '20',
    explanation: '36×25=900，900÷45=20',
    difficulty: 2,
  },
  {
    id: 'md-3-8',
    type: 'choice',
    question: '把84平均分成12份，每份再平均分成7份，每小份是多少？',
    options: ['1', '2', '3', '4'],
    answer: 0,
    explanation: '84÷12=7，7÷7=1',
    difficulty: 2,
  },
];

export const getMultiplyDivideQuestions = (levelId: string): Question[] => {
  if (levelId === 'level-1') {
    return multiplyDivideQuestions.filter((q) => q.id.startsWith('md-1'));
  }
  if (levelId === 'level-2') {
    return multiplyDivideQuestions.filter((q) => q.id.startsWith('md-2'));
  }
  if (levelId === 'level-3') {
    return multiplyDivideQuestions.filter((q) => q.id.startsWith('md-3'));
  }
  return [];
};
