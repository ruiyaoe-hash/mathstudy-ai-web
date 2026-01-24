import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/game/Header';
import { knowledgeGraphService, KnowledgeNode } from '@/services/knowledgeGraphService';
import { loadCurrentUser } from '@/utils/userStorage';
import { 
  Network, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Lock, 
  Unlock, 
  CheckCircle2,
  ArrowRight,
  Star,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MasteryLevel {
  nodeId: string;
  mastery: number;
}

const KnowledgeGraph = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<number>(4);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [masteries, setMasteries] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 模拟的掌握度数据（实际应从后端获取）
  const mockMasteries: Record<string, number> = {
    'g4-n1': 0.9,
    'g4-n2': 0.8,
    'g4-n3': 0.6,
    'g4-n4': 0.4,
    'g4-n5': 0.2,
    'g5-n1': 0.7,
    'g5-n2': 0.5,
    'g5-n3': 0.3,
    'g5-n4': 0.2,
    'g5-n5': 0.1,
    'g5-n6': 0.0,
    'g6-n1': 0.4,
    'g6-n2': 0.3,
    'g6-n3': 0.2,
    'g6-n4': 0.1,
    'g6-n5': 0.1,
    'g6-n6': 0.0,
  };

  useEffect(() => {
    const init = async () => {
      const user = await loadCurrentUser();
      if (!user) {
        navigate('/select-user', { replace: true });
        return;
      }
      setCurrentUser(user);
      setIsInitializing(false);
    };
    init();
  }, [navigate]);

  useEffect(() => {
    loadKnowledgeGraph();
  }, [selectedGrade]);

  const loadKnowledgeGraph = async () => {
    setIsLoading(true);
    try {
      const data = await knowledgeGraphService.getNodesByGrade(selectedGrade);
      setNodes(data);
      setMasteries(mockMasteries); // 使用模拟数据
    } catch (error) {
      console.error('加载知识图谱失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNodeStatus = (node: KnowledgeNode) => {
    const mastery = masteries[node.id] || 0;
    const prerequisitesMet = node.prerequisites.every(prereqId => 
      (masteries[prereqId] || 0) >= 0.7
    );

    if (mastery >= 0.9) return 'mastered';
    if (prerequisitesMet) return 'available';
    return 'locked';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-success text-success-foreground';
      case 'available': return 'bg-primary text-primary-foreground';
      case 'locked': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle2 className="w-4 h-4" />;
      case 'available': return <Unlock className="w-4 h-4" />;
      case 'locked': return <Lock className="w-4 h-4" />;
      default: return null;
    }
  };

  const calculateProgress = () => {
    const total = nodes.length;
    if (total === 0) return 0;
    const mastered = nodes.filter(n => (masteries[n.id] || 0) >= 0.9).length;
    return Math.round((mastered / total) * 100);
  };

  const getDifficultyBadge = (difficulty: number) => {
    const colors = {
      1: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
      2: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      3: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      4: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
      5: 'bg-red-500/20 text-red-600 border-red-500/30',
    };
    return colors[difficulty as keyof typeof colors] || colors[3];
  };

  if (isInitializing || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="fixed inset-0 stars-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 spotlight pointer-events-none" />
      
      <Header
        coins={0}
        stars={0}
      />

      <main className="relative z-10 container max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-8 safe-bottom">
        {/* Page Header */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl gradient-mesh p-5 sm:p-8 animate-slide-up">
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Network className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-tiny sm:text-caption text-primary font-semibold uppercase tracking-wide">知识图谱</span>
            </div>
            <h1 className="text-headline-lg sm:text-display text-foreground mb-2">
              {selectedGrade}年级数学知识体系
            </h1>
            <p className="text-body sm:text-body-lg text-muted-foreground max-w-md">
              探索知识点之间的联系，循序渐进地掌握每个概念
            </p>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 animate-slide-up stagger-1">
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <p className="text-title-lg sm:text-headline text-foreground">{nodes.length}</p>
            <p className="text-tiny sm:text-caption text-muted-foreground">知识点</p>
          </div>
          
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            </div>
            <p className="text-title-lg sm:text-headline text-foreground">{progress}%</p>
            <p className="text-tiny sm:text-caption text-muted-foreground">掌握进度</p>
          </div>
          
          <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <p className="text-title-lg sm:text-headline text-foreground">
              {nodes.filter(n => (masteries[n.id] || 0) >= 0.9).length}
            </p>
            <p className="text-tiny sm:text-caption text-muted-foreground">已掌握</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body font-semibold text-foreground">总体进度</span>
            <span className="text-body text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 sm:h-3" />
        </div>

        {/* Grade Tabs */}
        <Tabs 
          defaultValue="4" 
          value={selectedGrade.toString()}
          onValueChange={(value) => setSelectedGrade(parseInt(value))}
          className="animate-slide-up stagger-3"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="4">四年级</TabsTrigger>
            <TabsTrigger value="5">五年级</TabsTrigger>
            <TabsTrigger value="6">六年级</TabsTrigger>
          </TabsList>

          {['4', '5', '6'].map((grade) => (
            <TabsContent key={grade} value={grade} className="mt-4 sm:mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {nodes.map((node, index) => {
                    const status = getNodeStatus(node);
                    const mastery = masteries[node.id] || 0;
                    
                    return (
                      <Card
                        key={node.id}
                        className={cn(
                          'p-4 sm:p-5 transition-all duration-300 hover:shadow-lg cursor-pointer',
                          'animate-slide-up',
                          status === 'available' && 'border-primary/50 hover:border-primary',
                          status === 'locked' && 'opacity-50'
                        )}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge 
                                variant="outline" 
                                className={cn('text-xs', getDifficultyBadge(node.difficulty))}
                              >
                                难度 {node.difficulty}
                              </Badge>
                              <Badge 
                                className={cn('text-xs', getStatusColor(status))}
                              >
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(status)}
                                  {status === 'mastered' ? '已掌握' : status === 'available' ? '可学习' : '未解锁'}
                                </span>
                              </Badge>
                            </div>

                            {/* Title */}
                            <h3 className="text-body-lg sm:text-headline text-foreground mb-2 font-medium">
                              {node.name}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {node.metadata.keyConcepts?.join('、') || '暂无描述'}
                            </p>

                            {/* Mastery Progress */}
                            {status !== 'locked' && (
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-muted-foreground">掌握度:</span>
                                <Progress value={mastery * 100} className="flex-1 h-1.5" />
                                <span className="text-xs text-primary font-medium">{Math.round(mastery * 100)}%</span>
                              </div>
                            )}

                            {/* Prerequisites */}
                            {node.prerequisites.length > 0 && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ArrowRight className="w-3 h-3" />
                                <span>前置: {node.prerequisites.length} 个知识点</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          {status !== 'locked' && (
                            <Button
                              size="sm"
                              className={cn(
                                'shrink-0',
                                status === 'available' && 'bg-primary hover:bg-primary/90'
                              )}
                            >
                              {status === 'mastered' ? '复习' : '开始学习'}
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}

                  {nodes.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>暂无知识点数据</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Back Button */}
        <div className="flex justify-center pt-4 animate-slide-up stagger-4">
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto">
              返回首页
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default KnowledgeGraph;
