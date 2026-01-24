# AI功能使用示例

本文档提供AI功能在实际应用中的使用示例和代码片段。

## 1. 在Game页面中使用AI生成题目

### 基础用法

```typescript
import { generateAIQuestions, checkAIServiceHealth } from '@/services/aiQuestionService';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Game = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 检查AI服务并生成题目
  useEffect(() => {
    async function initQuestions() {
      const knowledgeId = 'your-knowledge-id'; // 知识点ID
      const grade = 5; // 年级

      // 1. 检查AI服务是否可用
      const isAvailable = await checkAIServiceHealth();
      if (!isAvailable) {
        setAiError('AI服务不可用，将使用预置题目');
        // 回退到预置题目
        const presetQuestions = getQuestionsForLevel(levelId);
        setQuestions(presetQuestions);
        return;
      }

      // 2. 生成AI题目
      try {
        setAiLoading(true);
        const aiQuestions = await generateAIQuestions(
          knowledgeId,
          grade,
          6, // 生成6道题
          '选择题' // 题目类型
        );

        if (aiQuestions.length > 0) {
          setQuestions(aiQuestions);
        } else {
          // AI生成失败，使用预置题目
          setAiError('AI生成题目失败，使用预置题目');
          const presetQuestions = getQuestionsForLevel(levelId);
          setQuestions(presetQuestions);
        }
      } catch (error) {
        console.error('AI题目生成失败:', error);
        setAiError('生成题目时出错，使用预置题目');
        const presetQuestions = getQuestionsForLevel(levelId);
        setQuestions(presetQuestions);
      } finally {
        setAiLoading(false);
      }
    }

    initQuestions();
  }, [levelId]);

  return (
    <div>
      {/* AI加载状态 */}
      {aiLoading && (
        <Alert>
          <Sparkles className="h-4 w-4 animate-pulse" />
          <AlertDescription>
            AI正在为您生成个性化题目...
          </AlertDescription>
        </Alert>
      )}

      {/* AI错误提示 */}
      {aiError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{aiError}</AlertDescription>
        </Alert>
      )}

      {/* 题目列表 */}
      {questions.length > 0 && (
        <QuestionCard
          question={questions[currentIndex]}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
};
```

### 高级用法：混合模式

结合预置题目和AI生成题目：

```typescript
async function initQuestions() {
  const knowledgeId = 'your-knowledge-id';
  const grade = 5;

  // 从预置题目中获取3道基础题
  const presetQuestions = getQuestionsForLevel(levelId).slice(0, 3);

  // 尝试生成3道AI题目
  let aiQuestions: Question[] = [];
  try {
    const isAvailable = await checkAIServiceHealth();
    if (isAvailable) {
      aiQuestions = await generateAIQuestions(knowledgeId, grade, 3, '选择题');
    }
  } catch (error) {
    console.error('AI题目生成失败:', error);
  }

  // 混合题目（3道预置 + 3道AI）
  const mixedQuestions = [
    ...presetQuestions,
    ...aiQuestions
  ];

  // 如果AI题目不足，补充预置题目
  while (mixedQuestions.length < 6) {
    mixedQuestions.push(...getQuestionsForLevel(levelId));
  }

  setQuestions(mixedQuestions.slice(0, 6));
}
```

## 2. 在Planet页面中使用智能推荐

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RecommendationItem {
  id: string;
  name: string;
  grade: number;
  difficulty: number;
  important: boolean;
  priority: number;
  recommendationReason: string;
}

const Planet = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const response = await fetch(
          `http://localhost:3001/api/ai/recommendations/${userId}`
        );

        if (!response.ok) {
          throw new Error('获取推荐失败');
        }

        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [userId]);

  return (
    <div className="space-y-6">
      {/* 推荐标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI智能推荐</h2>
        <Badge variant="secondary">个性化学习路径</Badge>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">正在分析您的学习数据...</p>
        </div>
      )}

      {/* 推荐列表 */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((item, index) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {index + 1}. {item.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{item.grade}年级</Badge>
                      <Badge variant="outline">
                        难度：{Math.round(item.difficulty * 100)}%
                      </Badge>
                      {item.important && (
                        <Badge className="bg-blue-500 text-white">重点</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(item.priority * 100)}
                    </div>
                    <div className="text-sm text-muted-foreground">推荐度</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  <Target className="h-4 w-4 inline mr-1" />
                  {item.recommendationReason}
                </p>
                <Button className="w-full" onClick={() => startLearning(item.id)}>
                  开始学习
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && !error && recommendations.length === 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            暂时没有推荐内容，继续学习后会有更精准的推荐！
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
```

## 3. 题目详情页面显示AI生成的解析

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Lightbulb, CheckCircle } from 'lucide-react';

const QuestionDetail = ({ question }: { question: Question }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>题目解析</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 正确答案 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-semibold">正确答案</span>
          </div>
          <p className="text-lg font-medium">{question.answer}</p>
        </div>

        <Separator />

        {/* 详细解析 */}
        {question.explanation && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">详细解析</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* 教学提示 */}
        {question.teachingHint && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold">教学提示</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {question.teachingHint}
              </p>
            </div>
          </>
        )}

        {/* AI生成标识 */}
        <div className="pt-4">
          <Badge variant="secondary" className="text-xs">
            ✨ AI智能生成
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
```

## 4. 批量生成题目（管理员功能）

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, AlertCircle } from 'lucide-react';

const BatchQuestionGenerator = () => {
  const [knowledgeId, setKnowledgeId] = useState('');
  const [grade, setGrade] = useState('5');
  const [questionType, setQuestionType] = useState('选择题');
  const [count, setCount] = useState('10');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      setResult(null);

      const questions = await generateAIQuestions(
        knowledgeId,
        parseInt(grade),
        parseInt(count),
        questionType
      );

      if (questions.length === 0) {
        setError('生成失败，请检查配置和知识图谱数据');
        return;
      }

      setResult(questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = () => {
    if (!result) return;

    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions-${knowledgeId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>批量生成题目</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 表单 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="knowledge">知识点ID</Label>
            <Input
              id="knowledge"
              value={knowledgeId}
              onChange={(e) => setKnowledgeId(e.target.value)}
              placeholder="输入知识点ID"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">年级</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger id="grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4年级</SelectItem>
                  <SelectItem value="5">5年级</SelectItem>
                  <SelectItem value="6">6年级</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="count">题目数量</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type">题目类型</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="选择题">选择题</SelectItem>
                <SelectItem value="填空题">填空题</SelectItem>
                <SelectItem value="判断题">判断题</SelectItem>
                <SelectItem value="应用题">应用题</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={generating || !knowledgeId}
            className="flex-1"
          >
            {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            生成题目
          </Button>

          {result && (
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出JSON
            </Button>
          )}
        </div>

        {/* 结果展示 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <AlertDescription>
              ✅ 成功生成 {result.length} 道题目
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
```

## 5. 实时健康检查组件

```typescript
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AIServiceStatus = () => {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isAvailable = await checkAIServiceHealth();
        setStatus(isAvailable ? 'online' : 'offline');
      } catch (error) {
        setStatus('offline');
      }
      setLastCheck(new Date());
    };

    // 立即检查一次
    checkHealth();

    // 每30秒检查一次
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {status === 'loading' && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {status === 'online' && (
        <CheckCircle className="h-4 w-4 text-green-600" />
      )}
      {status === 'offline' && (
        <XCircle className="h-4 w-4 text-red-600" />
      )}
      <Badge variant={status === 'online' ? 'default' : 'secondary'}>
        AI服务 {status === 'online' ? '正常' : '不可用'}
      </Badge>
      {lastCheck && (
        <span className="text-xs text-muted-foreground">
          上次检查：{lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
```

## 最佳实践

### 1. 错误处理

始终提供降级方案，确保在没有AI功能时系统仍然可用：

```typescript
try {
  // 尝试使用AI
  const aiQuestions = await generateAIQuestions(knowledgeId, grade);
  if (aiQuestions.length > 0) {
    setQuestions(aiQuestions);
  } else {
    // 降级到预置题目
    setQuestions(getPresetQuestions());
  }
} catch (error) {
  console.error('AI失败，使用预置题目');
  setQuestions(getPresetQuestions());
}
```

### 2. 加载状态

为用户提供明确的加载反馈：

```typescript
{aiLoading && (
  <Alert>
    <Sparkles className="h-4 w-4 animate-pulse" />
    <AlertDescription>
      AI正在为您生成个性化题目，请稍候...
    </AlertDescription>
  </Alert>
)}
```

### 3. 成本控制

合理控制生成题目数量，避免浪费API额度：

```typescript
// 限制单次生成数量
const MAX_QUESTIONS_PER_REQUEST = 10;
const count = Math.min(requestedCount, MAX_QUESTONS_PER_REQUEST);

// 使用缓存
const cacheKey = `questions:${knowledgeId}:${grade}:${count}`;
const cached = localStorage.getItem(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
```

### 4. 用户体验

在UI中明确标识AI生成的内容：

```typescript
<Badge variant="secondary" className="text-xs">
  ✨ AI智能生成
</Badge>
```

## 相关文档

- [AI配置指南](AI_CONFIG_GUIDE.md) - 详细的配置和使用说明
- [AI实现总结](AI_IMPLEMENTATION_SUMMARY.md) - 系统架构和实现细节
- [API接口文档](#api-接口文档) - 后端API详细说明
