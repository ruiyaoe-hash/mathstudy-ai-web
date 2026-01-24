import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/game/Header';
import { useGameProgress } from '@/hooks/useGameProgress';
import { getCurrentUser } from '@/utils/userStorage';
import { Button } from '@/components/ui/button';
import { getPlanetById } from '@/data/planets';
import { Check, X, ChevronDown, ChevronUp, BookOpen, Lightbulb, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MistakeItem } from '@/types/game';

const Mistakes = () => {
  const navigate = useNavigate();
  const { progress, removeMistake } = useGameProgress();
  const currentUser = getCurrentUser();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentUser) {
      navigate('/select-user', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleAnswer = (id: string) => {
    setShowAnswer((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMastered = (questionId: string) => {
    removeMistake(questionId);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  const renderMistakeItem = (mistake: MistakeItem, index: number) => {
    const planet = getPlanetById(mistake.planetId);
    const isExpanded = expandedId === mistake.id;
    const isShowingAnswer = showAnswer[mistake.id];
    const question = mistake.question;

    return (
      <div 
        key={mistake.id} 
        className="glass rounded-xl sm:rounded-2xl overflow-hidden animate-slide-up"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Header */}
        <button
          onClick={() => toggleExpand(mistake.id)}
          className="w-full p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-left hover:bg-secondary/50 transition-colors touch-target"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body sm:text-body-lg text-foreground truncate">
              {question.question}
            </p>
            <p className="text-tiny sm:text-caption text-muted-foreground">
              {planet?.name} · {new Date(mistake.timestamp).toLocaleDateString()}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4 border-t border-border/50 animate-slide-up">
            {/* Question */}
            <div className="pt-3 sm:pt-4">
              <p className="text-title sm:text-title-lg text-foreground mb-3 sm:mb-4">{question.question}</p>

              {/* Options */}
              {question.type === 'choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, idx) => {
                    const isUserAnswer = String(idx) === mistake.userAnswer || idx === Number(mistake.userAnswer);
                    const isCorrectAnswer = idx === question.answer;

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'p-2.5 sm:p-3 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 transition-all',
                          isShowingAnswer && isCorrectAnswer && 'bg-success/20 border border-success/30',
                          isShowingAnswer && isUserAnswer && !isCorrectAnswer && 'bg-destructive/20 border border-destructive/30',
                          !isShowingAnswer && 'bg-secondary/50'
                        )}
                      >
                        <span
                          className={cn(
                            'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-tiny sm:text-caption font-bold flex-shrink-0',
                            isShowingAnswer && isCorrectAnswer && 'bg-success text-white',
                            isShowingAnswer && isUserAnswer && !isCorrectAnswer && 'bg-destructive text-white',
                            !isShowingAnswer && 'bg-secondary text-muted-foreground'
                          )}
                        >
                          {isShowingAnswer && isCorrectAnswer ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : isShowingAnswer && isUserAnswer && !isCorrectAnswer ? (
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            optionLabels[idx]
                          )}
                        </span>
                        <span className="text-caption sm:text-body text-foreground">{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Fill Question */}
              {question.type === 'fill' && (
                <div className="space-y-2">
                  <p className="text-caption sm:text-body text-muted-foreground">
                    你的答案：
                    <span className="text-destructive font-semibold ml-2">{mistake.userAnswer}</span>
                  </p>
                  {isShowingAnswer && (
                    <p className="text-caption sm:text-body text-muted-foreground">
                      正确答案：
                      <span className="text-success font-semibold ml-2">{String(question.answer)}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Explanation */}
            {isShowingAnswer && (
              <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 animate-slide-up">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-caption sm:text-body text-foreground">{question.explanation}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => toggleAnswer(mistake.id)}
                className="flex-1 h-10 sm:h-11 rounded-lg sm:rounded-xl touch-target"
              >
                <BookOpen className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="text-caption sm:text-body">{isShowingAnswer ? '隐藏' : '答案'}</span>
              </Button>
              <Button
                onClick={() => handleMastered(mistake.id)}
                className="flex-1 h-10 sm:h-11 rounded-lg sm:rounded-xl bg-success hover:bg-success/90 text-white touch-target"
              >
                <Check className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="text-caption sm:text-body">已掌握</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 spotlight pointer-events-none" />
      
      <Header
        title="错题本"
        showBack
        coins={progress.coins}
        stars={progress.totalStars}
      />

      <main className="relative z-10 container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 safe-bottom">
        {/* Stats */}
        <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between animate-slide-up">
          <div>
            <h2 className="text-title sm:text-title-lg text-foreground">待复习错题</h2>
            <p className="text-tiny sm:text-caption text-muted-foreground">
              点击题目查看详情
            </p>
          </div>
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <span className="text-title-lg sm:text-headline text-destructive">
              {progress.mistakes.length}
            </span>
          </div>
        </div>

        {/* Mistakes List */}
        {progress.mistakes.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {progress.mistakes.map((mistake, index) => renderMistakeItem(mistake, index))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 animate-slide-up">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <PartyPopper className="w-10 h-10 sm:w-12 sm:h-12 text-success" />
            </div>
            <h3 className="text-title-lg sm:text-headline text-foreground mb-2">太棒了！</h3>
            <p className="text-body sm:text-body-lg text-muted-foreground">
              你已经掌握了所有的错题，继续保持！
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Mistakes;
