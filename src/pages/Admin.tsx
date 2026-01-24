import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Activity, Target, Trophy, BookOpen, TrendingUp, AlertCircle, Shield, Database, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllProfiles, LeaderboardEntry, getLeaderboard } from '@/services/supabaseService';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Admin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    accuracy: 0,
    totalStars: 0,
    totalMistakes: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profiles, leaderboardData] = await Promise.all([
          getAllProfiles(),
          getLeaderboard(100),
        ]);

        // 计算统计数据
        const totalUsers = profiles.length;
        const activeUsers = profiles.filter((p) => {
          const lastActive = new Date(p.last_active_at).getTime();
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          return lastActive > weekAgo;
        }).length;

        const totalQuestions = leaderboardData.reduce((sum, u) => sum + u.total_questions, 0);
        const totalCorrect = leaderboardData.reduce((sum, u) => sum + u.total_correct, 0);
        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        const totalStars = leaderboardData.reduce((sum, u) => sum + u.total_stars, 0);

        // 从 profiles 中获取 mistakes 数据（需要扩展）
        const totalMistakes = 0; // 需要从实际数据中获取

        setStats({
          totalUsers,
          activeUsers,
          totalQuestions,
          totalCorrect,
          accuracy,
          totalStars,
          totalMistakes,
        });

        setLeaderboard(leaderboardData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load admin data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-body sm:text-body-lg text-muted-foreground">加载数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass border-b sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <h1 className="text-title-lg sm:text-headline text-foreground">
              管理后台
            </h1>
            <div className="w-16" /> {/* 占位，保持标题居中 */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* 安全警告 */}
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Shield className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">管理员权限区域</AlertTitle>
          <AlertDescription className="text-amber-600">
            此页面仅管理员可访问。所有操作将被记录，请谨慎操作。
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Card 
            className="glass border-0 cursor-pointer hover:border-primary/50 transition-all hover-lift"
            onClick={() => navigate('/data-management')}
          >
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-caption sm:text-tiny text-muted-foreground flex items-center gap-2">
                <Database className="w-4 h-4" />
                数据管理
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2">
              <p className="text-body sm:text-body text-foreground mb-1">管理知识图谱</p>
              <p className="text-tiny text-muted-foreground">初始化/清空知识图谱数据</p>
            </CardContent>
          </Card>

          <Card className="glass border-0">
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-caption sm:text-tiny text-muted-foreground flex items-center gap-2">
                <Settings className="w-4 h-4" />
                系统设置
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2">
              <p className="text-body sm:text-body text-foreground mb-1">功能开发中</p>
              <p className="text-tiny text-muted-foreground">更多管理功能即将上线</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="glass border-0">
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-caption sm:text-tiny text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                总用户数
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2">
              <p className="text-headline sm:text-display-lg text-foreground">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="glass border-0">
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-caption sm:text-tiny text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                活跃用户
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2">
              <p className="text-headline sm:text-display-lg text-success">{stats.activeUsers}</p>
            </CardContent>
          </Card>

          <Card className="glass border-0">
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-caption sm:text-tiny text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                总答题数
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2">
              <p className="text-headline sm:text-display-lg text-primary">{stats.totalQuestions}</p>
            </CardContent>
          </Card>

          <Card className="glass border-0">
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-caption sm:text-tiny text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                正确率
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2">
              <p className="text-headline sm:text-display-lg text-accent">{stats.accuracy}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Card className="glass border-0">
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-caption sm:text-tiny text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                总获得星数
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2">
              <p className="text-headline sm:text-headline-lg text-amber-500">{stats.totalStars}</p>
            </CardContent>
          </Card>

          <Card className="glass border-0">
            <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
              <CardTitle className="text-caption sm:text-tiny text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                总错题数
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2">
              <p className="text-headline sm:text-headline-lg text-destructive">{stats.totalMistakes}</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management - 仅显示排名和统计，不显示用户列表 */}
        <Card className="glass border-0">
          <CardHeader className="p-4 sm:p-5">
            <CardTitle className="text-title-lg sm:text-headline">排行榜概览</CardTitle>
            <p className="text-caption sm:text-tiny text-muted-foreground mt-1">
              仅显示前 100 名用户的学习数据统计
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-caption sm:text-tiny">排名</TableHead>
                    <TableHead className="text-caption sm:text-tiny">用户</TableHead>
                    <TableHead className="text-caption sm:text-tiny text-right">星数</TableHead>
                    <TableHead className="text-caption sm:text-tiny text-right">金币</TableHead>
                    <TableHead className="text-caption sm:text-tiny text-right">答题</TableHead>
                    <TableHead className="text-caption sm:text-tiny text-right">正确率</TableHead>
                    <TableHead className="text-caption sm:text-tiny text-right">连胜</TableHead>
                    <TableHead className="text-caption sm:text-tiny text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-body">暂无用户数据</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaderboard.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-body sm:text-tiny">
                          {index < 3 ? (
                            <span className={cn(
                              'inline-flex items-center justify-center w-6 h-6 rounded-full text-tiny font-bold',
                              index === 0 && 'bg-amber-500 text-white',
                              index === 1 && 'bg-gray-400 text-white',
                              index === 2 && 'bg-amber-700 text-white',
                            )}>
                              {index + 1}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-caption sm:text-tiny font-bold flex-shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-body sm:text-tiny text-foreground truncate font-medium">{user.name}</p>
                              <p className="text-tiny text-muted-foreground hidden sm:block">
                                {user.achievement_count} 成就
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-body sm:text-tiny text-right">
                          <span className="text-amber-500 font-semibold">{user.total_stars}</span>
                        </TableCell>
                        <TableCell className="text-body sm:text-tiny text-right">{user.coins}</TableCell>
                        <TableCell className="text-body sm:text-tiny text-right">
                          {user.total_questions}
                        </TableCell>
                        <TableCell className="text-body sm:text-tiny text-right">
                          <span className={cn(
                            'font-medium',
                            user.accuracy >= 80 ? 'text-success' : user.accuracy >= 60 ? 'text-amber-500' : 'text-destructive'
                          )}>
                            {user.accuracy}%
                          </span>
                        </TableCell>
                        <TableCell className="text-body sm:text-tiny text-right">{user.best_streak}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Admin Info */}
        <Card className="glass border-0 bg-secondary/30">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-body sm:text-body text-foreground font-medium">
                  管理员权限说明
                </p>
                <p className="text-caption sm:text-tiny text-muted-foreground">
                  此页面仅供管理员查看系统整体数据和用户情况。删除用户操作会永久清除该用户的所有学习记录，请谨慎操作。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
