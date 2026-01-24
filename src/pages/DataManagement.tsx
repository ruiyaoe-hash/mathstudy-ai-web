/**
 * 数据管理页面
 * 用于初始化和管理知识图谱数据
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { initKnowledgeData, clearKnowledgeData } from '@/services/initKnowledgeData';
import { Database, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

export default function DataManagement() {
  const [loading, setLoading] = useState(false);
  const [dataCount, setDataCount] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // 加载数据统计
  const loadDataCount = async () => {
    try {
      const { count } = await supabase
        .from('knowledge_nodes')
        .select('*', { count: 'exact', head: true });
      setDataCount(count || 0);
    } catch (error) {
      console.error('加载数据统计失败:', error);
    }
  };

  useEffect(() => {
    loadDataCount();
  }, []);

  // 初始化数据
  const handleInit = async () => {
    if (!confirm('确定要初始化知识图谱数据吗？')) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await initKnowledgeData();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadDataCount();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '初始化失败' 
      });
    } finally {
      setLoading(false);
    }
  };

  // 清空数据
  const handleClear = async () => {
    if (!confirm('确定要清空所有知识图谱数据吗？此操作不可恢复！')) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await clearKnowledgeData();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadDataCount();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : '清空失败' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 stars-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 spotlight pointer-events-none" />

      <main className="relative z-10 container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center mb-8">
          <Database className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold text-foreground mb-2">数据管理</h1>
          <p className="text-muted-foreground">初始化和管理知识图谱数据</p>
        </div>

        {/* 数据统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              当前数据状态
            </CardTitle>
            <CardDescription>知识图谱数据统计信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 py-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {dataCount ?? '-'}
                </div>
                <div className="text-muted-foreground">知识点数量</div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={loadDataCount}
              className="w-full"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新数据
            </Button>
          </CardContent>
        </Card>

        {/* 操作区域 */}
        <Card>
          <CardHeader>
            <CardTitle>数据操作</CardTitle>
            <CardDescription>初始化或清空知识图谱数据</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{message.type === 'success' ? '成功' : '错误'}</AlertTitle>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <Button
                onClick={handleInit}
                disabled={loading || (dataCount !== null && dataCount > 0)}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    初始化知识图谱数据
                  </>
                )}
              </Button>

              <Button
                onClick={handleClear}
                disabled={loading || (dataCount === null || dataCount === 0)}
                variant="destructive"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    清空中...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    清空所有数据
                  </>
                )}
              </Button>
            </div>

            {(dataCount === null || dataCount === 0) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>暂无数据</AlertTitle>
                <AlertDescription>
                  当前知识图谱为空，点击"初始化知识图谱数据"按钮来导入示例数据。
                </AlertDescription>
              </Alert>
            )}

            {dataCount !== null && dataCount > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>数据已就绪</AlertTitle>
                <AlertDescription>
                  当前已有 {dataCount} 条知识点数据，AI推荐功能可以使用。
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
              <p>点击"初始化知识图谱数据"按钮导入4-6年级数学知识点示例数据</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
              <p>数据导入后，在星球页面可以看到AI智能推荐</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
              <p>如需重新导入，先清空数据再初始化</p>
            </div>
          </CardContent>
        </Card>

        {/* 返回按钮 */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            返回上一页
          </Button>
        </div>
      </main>
    </div>
  );
}
