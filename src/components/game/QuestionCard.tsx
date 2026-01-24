import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Question } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Lightbulb } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string | number, isCorrect: boolean) => void;
  showFeedback: boolean;
}

export const QuestionCard = ({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  showFeedback,
}: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 重置状态当题目变化时
  useEffect(() => {
    setSelectedOption(null);
    setFillAnswer('');
    setHasSubmitted(false);
    setIsCorrect(false);
  }, [question.id]);

  const handleOptionClick = (index: number) => {
    if (hasSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (hasSubmitted) return;

    let userAnswer: string | number;
    let correct = false;

    if (question.type === 'choice') {
      if (selectedOption === null) return;
      userAnswer = selectedOption;
      correct = selectedOption === question.answer;
    } else {
      if (!fillAnswer.trim()) return;
      userAnswer = fillAnswer.trim();
      correct = fillAnswer.trim().toLowerCase() === String(question.answer).toLowerCase();
    }

    setHasSubmitted(true);
    setIsCorrect(correct);
    onAnswer(userAnswer, correct);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Question Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-tiny font-semibold text-primary bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
            第 {questionIndex + 1} / {totalQuestions} 题
          </span>
          <span
            className={cn(
              'text-tiny font-medium px-1.5 sm:px-2 py-0.5 rounded-full',
              question.difficulty === 1 && 'bg-success/10 text-success',
              question.difficulty === 2 && 'bg-amber-500/10 text-amber-500',
              question.difficulty === 3 && 'bg-destructive/10 text-destructive'
            )}
          >
            {question.difficulty === 1 ? '简单' : question.difficulty === 2 ? '中等' : '困难'}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <p className="text-title sm:text-headline text-foreground leading-relaxed">{question.question}</p>

      {/* Options or Fill Input */}
      {question.type === 'choice' && question.options ? (
        <div className="space-y-2 sm:space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isAnswer = index === question.answer;
            const showCorrect = hasSubmitted && showFeedback && isAnswer;
            const showWrong = hasSubmitted && showFeedback && isSelected && !isAnswer;

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={hasSubmitted}
                className={cn(
                  'relative w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-300',
                  'flex items-center gap-3 sm:gap-4 group no-select touch-target',
                  !hasSubmitted && !isSelected && 'bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/30 active:scale-[0.98]',
                  !hasSubmitted && isSelected && 'bg-primary/20 border-2 border-primary',
                  showCorrect && 'bg-success/20 border-2 border-success animate-bounce-in',
                  showWrong && 'bg-destructive/20 border-2 border-destructive animate-shake'
                )}
              >
                {/* Option Label */}
                <span
                  className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-body sm:text-body-lg font-bold transition-all flex-shrink-0',
                    !hasSubmitted && !isSelected && 'bg-secondary text-muted-foreground',
                    !hasSubmitted && isSelected && 'bg-primary text-primary-foreground',
                    showCorrect && 'bg-success text-white',
                    showWrong && 'bg-destructive text-white'
                  )}
                >
                  {hasSubmitted && showCorrect ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : hasSubmitted && showWrong ? (
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    optionLabels[index]
                  )}
                </span>

                {/* Option Text */}
                <span className="text-body sm:text-body-lg text-foreground flex-1">{option}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <Input
            type="text"
            value={fillAnswer}
            onChange={(e) => setFillAnswer(e.target.value)}
            placeholder="输入你的答案..."
            disabled={hasSubmitted}
            className={cn(
              'h-12 sm:h-14 text-body-lg sm:text-title text-center rounded-xl sm:rounded-2xl bg-secondary/50 border-2 transition-all',
              !hasSubmitted && 'border-transparent focus:border-primary',
              hasSubmitted && isCorrect && 'border-success bg-success/10',
              hasSubmitted && !isCorrect && 'border-destructive bg-destructive/10'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
        </div>
      )}

      {/* Explanation */}
      {hasSubmitted && showFeedback && (
        <div
          className={cn(
            'p-3 sm:p-4 rounded-xl sm:rounded-2xl animate-slide-up',
            isCorrect ? 'bg-success/10 border border-success/30' : 'bg-destructive/10 border border-destructive/30'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                </div>
                <span className="text-body-lg sm:text-title font-semibold text-success">回答正确！</span>
              </>
            ) : (
              <>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
                </div>
                <span className="text-body-lg sm:text-title font-semibold text-destructive">答错了，继续加油！</span>
              </>
            )}
          </div>
          {!isCorrect && (
            <p className="text-caption sm:text-body text-foreground mb-2">
              <strong>正确答案：</strong>
              {question.type === 'choice' && question.options
                ? question.options[question.answer as number]
                : question.answer}
            </p>
          )}
          <div className="flex items-start gap-2 text-caption sm:text-body text-muted-foreground">
            <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 text-amber-500" />
            <p>{question.explanation}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!hasSubmitted && (
        <Button
          onClick={handleSubmit}
          disabled={question.type === 'choice' ? selectedOption === null : !fillAnswer.trim()}
          className="w-full h-12 sm:h-14 text-body-lg sm:text-title rounded-xl sm:rounded-2xl gradient-primary text-white font-semibold hover-lift disabled:opacity-50 touch-target"
        >
          确认答案
        </Button>
      )}
    </div>
  );
};
