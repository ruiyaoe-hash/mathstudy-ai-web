import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { aiService } from '@/services/aiService';

const AIHelper = () => {
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  // 聊天状态
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 问题生成状态
  const [questionDifficulty, setQuestionDifficulty] = useState('medium');
  const [questionSubject, setQuestionSubject] = useState('arithmetic');
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // 解题状态
  const [problemInput, setProblemInput] = useState('');
  const [solution, setSolution] = useState('');
  const [isSolving, setIsSolving] = useState(false);

  // 学习路径状态
  const [learningPath, setLearningPath] = useState('');
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);

  // 概念解释状态
  const [conceptInput, setConceptInput] = useState('');
  const [conceptExplanation, setConceptExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  // 滚动到聊天底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 发送聊天消息
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await aiService.chat({ message: chatInput });
      if (response.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
      } else {
        throw new Error(response.error?.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to get AI response' });
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process your request. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 生成题目
  const generateQuestions = async () => {
    setIsGeneratingQuestions(true);

    try {
      // 使用默认的 knowledgeId 进行题目生成
      const response = await aiService.generateQuestions({
        knowledgeId: 'default',
        grade: 5,
        count: 5,
        questionType: '选择题'
      });
      
      // 提取题目内容
      const questions = response.questions.map((q: any) => q.question);
      setGeneratedQuestions(questions);
      toast({ title: 'Success', description: 'Questions generated successfully' });
    } catch (error) {
      console.error('Question generation error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate questions' });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // 解题
  const solveProblem = async () => {
    if (!problemInput.trim()) return;

    setIsSolving(true);

    try {
      const response = await aiService.solveQuestion({ question: problemInput });
      
      // 构建解题步骤的文本表示
      const solutionText = response.steps
        .map((step: any, index: number) => {
          return `${index + 1}. ${step.description}\n${step.expression ? `   ${step.expression}\n` : ''}   ${step.explanation}`;
        })
        .join('\n\n') + `\n\n最终答案: ${response.finalAnswer}`;
      
      setSolution(solutionText);
      toast({ title: 'Success', description: 'Problem solved successfully' });
    } catch (error) {
      console.error('Problem solving error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to solve problem' });
    } finally {
      setIsSolving(false);
    }
  };

  // 生成学习路径
  const generateLearningPath = async () => {
    setIsGeneratingPath(true);

    try {
      const response = await aiService.getLearningTips({
        grade: 5,
        subject: 'math'
      });
      
      if (response.success) {
        // 构建学习路径的文本表示
        const pathText = response.data.tips
          .map((tip: any) => {
            return `${tip.id}. ${tip.title}\n   ${tip.content}\n   重要性: ${tip.importance}/5\n   适用场景: ${tip.applicableSituation}`;
          })
          .join('\n\n');
        
        setLearningPath(pathText);
        toast({ title: 'Success', description: 'Learning path generated successfully' });
      } else {
        throw new Error(response.error?.message || 'Failed to generate learning path');
      }
    } catch (error) {
      console.error('Learning path generation error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate learning path' });
    } finally {
      setIsGeneratingPath(false);
    }
  };

  // 解释概念
  const explainConcept = async () => {
    if (!conceptInput.trim()) return;

    setIsExplaining(true);

    try {
      const response = await aiService.explainConcept({ concept: conceptInput });
      
      if (response.success) {
        // 构建概念解释的文本表示
        const explanationText = `概念解释:\n${response.data.explanation}\n\n` +
          (response.data.examples.length > 0 ? `例子:\n${response.data.examples.join('\n')}\n\n` : '') +
          `应用场景:\n${response.data.applications}\n\n` +
          `相关概念:\n${response.data.relatedConcepts}\n\n` +
          `难度等级:\n${response.data.difficulty}`;
        
        setConceptExplanation(explanationText);
        toast({ title: 'Success', description: 'Concept explained successfully' });
      } else {
        throw new Error(response.error?.message || 'Failed to explain concept');
      }
    } catch (error) {
      console.error('Concept explanation error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to explain concept' });
    } finally {
      setIsExplaining(false);
    }
  };

  // 退出函数
  const handleExit = () => {
    // 检查是否有未保存的数据
    const hasUnsavedData = chatInput || problemInput || conceptInput;
    
    if (hasUnsavedData) {
      setShowExitDialog(true);
    } else {
      navigate('/');
    }
  };

  // 确认退出
  const confirmExit = () => {
    setShowExitDialog(false);
    navigate('/');
  };

  // 取消退出
  const cancelExit = () => {
    setShowExitDialog(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="outline"
          onClick={handleExit}
          className="flex items-center gap-2 border-gray-600 text-white hover:bg-gray-800"
        >
          <X className="w-4 h-4" />
          退出
        </Button>
        <h1 className="text-3xl font-bold text-white">AI 数学助手</h1>
        <div className="w-24"></div> {/* 占位元素，保持标题居中 */}
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="text-white">AI 聊天</TabsTrigger>
          <TabsTrigger value="questions" className="text-white">题目生成</TabsTrigger>
          <TabsTrigger value="solve" className="text-white">解题辅导</TabsTrigger>
          <TabsTrigger value="learning" className="text-white">学习路径</TabsTrigger>
        </TabsList>

        {/* AI 聊天 */}
        <TabsContent value="chat" className="mt-4">
          <Card className="p-4">
            <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4" id="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-900 text-white' : 'bg-gray-800 text-white'}`}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-white p-3 rounded-lg flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>AI 正在思考...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex space-x-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="输入你的数学问题..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <Button onClick={sendChatMessage} disabled={isChatLoading}>
                发送
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* 题目生成 */}
        <TabsContent value="questions" className="mt-4">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">难度</label>
                <select
                  value={questionDifficulty}
                  onChange={(e) => setQuestionDifficulty(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                >
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">科目</label>
                <select
                  value={questionSubject}
                  onChange={(e) => setQuestionSubject(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
                >
                  <option value="arithmetic">算术</option>
                  <option value="algebra">代数</option>
                  <option value="geometry">几何</option>
                  <option value="calculus">微积分</option>
                </select>
              </div>
            </div>
            <Button onClick={generateQuestions} disabled={isGeneratingQuestions} className="w-full mb-4">
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  生成中...
                </>
              ) : (
                '生成题目'
              )}
            </Button>
            {generatedQuestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">生成的题目：</h3>
                <div className="space-y-2">
                  {generatedQuestions.map((q, index) => (
                    <div key={index} className="p-3 border border-gray-600 rounded-md bg-gray-800 text-white">
                      <p>{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* 解题辅导 */}
        <TabsContent value="solve" className="mt-4">
          <Card className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-white">输入数学问题</label>
              <Textarea
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                placeholder="例如：计算 123 × 456"
                className="w-full min-h-[100px] border-gray-600 bg-gray-800 text-white placeholder-gray-400"
              />
            </div>
            <Button onClick={solveProblem} disabled={isSolving} className="w-full mb-4">
              {isSolving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  解题中...
                </>
              ) : (
                '解题'
              )}
            </Button>
            {solution && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">解题步骤：</h3>
                <div className="p-4 border border-gray-600 rounded-md bg-gray-800 text-white whitespace-pre-wrap">
                  {solution}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* 学习路径 */}
        <TabsContent value="learning" className="mt-4">
          <Card className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-white">选择科目</label>
              <select
                value={questionSubject}
                onChange={(e) => setQuestionSubject(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white"
              >
                <option value="arithmetic">算术</option>
                <option value="algebra">代数</option>
                <option value="geometry">几何</option>
                <option value="calculus">微积分</option>
              </select>
            </div>
            <Button onClick={generateLearningPath} disabled={isGeneratingPath} className="w-full mb-4">
              {isGeneratingPath ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  生成中...
                </>
              ) : (
                '生成学习路径'
              )}
            </Button>
            {learningPath && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">学习路径：</h3>
                <div className="p-4 border border-gray-600 rounded-md bg-gray-800 text-white whitespace-pre-wrap">
                  {learningPath}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* 退出确认对话框 */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">确认退出</DialogTitle>
            <DialogDescription className="text-gray-400">
              您确定要退出AI数学助手吗？未保存的内容将会丢失。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelExit}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmExit}
              className="bg-red-600 hover:bg-red-700"
            >
              确认退出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIHelper;