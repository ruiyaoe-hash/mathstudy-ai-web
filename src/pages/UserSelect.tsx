import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Mail, Lock, User, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { avatarOptions } from '@/types/user';
import { setCurrentUserCache } from '@/utils/userStorage';
import { cn } from '@/lib/utils';

const UserSelect = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 登录表单
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 注册表单
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('1');
  const [showEmailHelp, setShowEmailHelp] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 检查当前登录状态
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // 获取用户资料
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const user = {
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar,
            createdAt: new Date(profile.created_at).getTime(),
            lastActiveAt: new Date(profile.last_active_at).getTime(),
          };
          setCurrentUserCache(user);
          navigate('/', { replace: true });
          return;
        }
      }
      setIsLoading(false);
    };

    init();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim() || !loginPassword.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log('[Login] 开始登录流程:', { email: loginEmail.trim() });

      // 使用 Supabase 认证
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword.trim(),
      });

      if (error) {
        console.error('[Login] 认证失败:', error);
        throw error;
      }

      console.log('[Login] 认证成功:', data);

      if (data.user) {
        // 获取用户资料
        console.log('[Login] 获取用户资料:', data.user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          console.error('[Login] 获取用户资料失败:', profileError);
          throw new Error('用户资料不存在，请联系管理员');
        }

        console.log('[Login] 用户资料获取成功:', profile);

        const user = {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          createdAt: new Date(profile.created_at).getTime(),
          lastActiveAt: new Date(profile.last_active_at).getTime(),
        };
        setCurrentUserCache(user);

        // 更新最后活跃时间
        await supabase
          .from('profiles')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', data.user.id);

        console.log('[Login] 登录完成，跳转到首页');
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      console.error('[Login] 登录过程发生错误:', err);
      let errorMsg = '登录失败，请检查邮箱和密码';

      // 提供更友好的错误提示
      if (err.message) {
        if (err.message.includes('Invalid login credentials')) {
          errorMsg = '邮箱或密码错误';
        } else if (err.message.includes('Email not confirmed')) {
          errorMsg = '请先验证您的邮箱';
        } else if (err.message.includes('用户资料不存在')) {
          errorMsg = err.message;
        } else {
          errorMsg = err.message;
        }
      }

      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log('[Register] 开始注册流程:', { email: registerEmail.trim() });

      // 1. 使用 Supabase 注册用户（密码自动哈希加密）
      // 传递元数据，触发器会自动创建 profiles 和 game_progress 记录
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail.trim(),
        password: registerPassword.trim(),
        options: {
          data: {
            name: registerName.trim(),
            avatar: selectedAvatar,
          },
          emailRedirectTo: `${window.location.origin}/user-select`,
        },
      });

      if (error) {
        console.error('[Register] 认证失败:', error);
        throw error;
      }

      console.log('[Register] 认证响应:', { user: data.user, session: data.session });

      if (data.user) {
        // 如果有session，说明不需要邮箱验证，直接登录
        if (data.session) {
          console.log('[Register] 无需邮箱验证，直接登录');

          // 等待一小段时间，让触发器完成profiles和game_progress的创建
          await new Promise(resolve => setTimeout(resolve, 500));

          // 获取用户资料
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            const user = {
              id: profile.id,
              name: profile.name,
              avatar: profile.avatar,
              createdAt: new Date(profile.created_at).getTime(),
              lastActiveAt: new Date(profile.last_active_at).getTime(),
            };
            setCurrentUserCache(user);
            console.log('[Register] 注册完成，跳转到首页');
            navigate('/', { replace: true });
          } else {
            console.error('[Register] 未能获取用户资料');
            setError('注册成功但创建资料失败，请稍后登录');
          }
        } else {
          // 需要邮箱验证
          console.warn('[Register] 需要邮箱验证');
          setError('注册成功！请检查您的邮箱并点击验证链接。提示：管理员可以在 Supabase 控制台禁用邮箱验证，让用户直接登录。');
        }
      }
    } catch (err: any) {
      console.error('[Register] 注册过程发生错误:', err);
      let errorMsg = '注册失败，请重试';

      // 提供更友好的错误提示
      if (err.message) {
        if (err.message.includes('already registered') || err.message.includes('duplicate')) {
          errorMsg = '该邮箱已被注册，请使用其他邮箱或直接登录';
        } else if (err.message.includes('password')) {
          errorMsg = '密码格式不符合要求（至少6个字符）';
        } else if (err.message.includes('email')) {
          errorMsg = '邮箱格式不正确';
        } else {
          errorMsg = err.message;
        }
      }

      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 stars-bg opacity-20 pointer-events-none" />
      <div className="absolute inset-0 spotlight pointer-events-none" />
      <div className="absolute inset-0 gradient-mesh" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-slide-up">
          {/* Logo & Title */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl gradient-primary glow-primary mb-4 sm:mb-6">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-headline-lg sm:text-display-lg text-foreground mb-2">
              数学小勇士
            </h1>
            <p className="text-body sm:text-body-lg text-muted-foreground">
              开启你的数学冒险之旅
            </p>
          </div>

          {/* Auth Card */}
          <Card className="glass border-0 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-title-lg sm:text-headline text-center">
                欢迎回来
              </CardTitle>
              <CardDescription className="text-center text-tiny sm:text-caption">
                登录或注册以继续学习
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="text-sm">登录</TabsTrigger>
                  <TabsTrigger value="register" className="text-sm">注册</TabsTrigger>
                </TabsList>

                {/* 登录表单 */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm">邮箱</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm">密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10"
                          disabled={isSubmitting}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                        {error}
                        {error.includes('邮箱验证') && (
                          <button
                            type="button"
                            onClick={() => setShowEmailHelp(!showEmailHelp)}
                            className="mt-2 text-destructive hover:underline text-xs flex items-center gap-1"
                          >
                            {showEmailHelp ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                收起帮助
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                如何跳过邮箱验证？
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {showEmailHelp && (
                      <div className="text-sm bg-secondary/30 p-3 rounded-lg space-y-2">
                        <p className="text-foreground font-medium flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          如何禁用邮箱验证？
                        </p>
                        <ol className="text-muted-foreground text-xs space-y-1 list-decimal list-inside">
                          <li>访问 Supabase 控制台</li>
                          <li>进入 Authentication → Providers → Email</li>
                          <li>取消勾选 "Confirm email" 选项</li>
                          <li>点击 Save 保存</li>
                        </ol>
                        <p className="text-muted-foreground text-xs">
                          禁用后，用户注册后可直接登录，无需验证邮箱。
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full touch-target"
                      disabled={isSubmitting || !loginEmail.trim() || !loginPassword.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          登录中...
                        </>
                      ) : (
                        <>
                          登录
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* 注册表单 */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-sm">用户名</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="你的昵称"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="pl-10"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm">邮箱</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-10"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-sm">密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="至少6个字符"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pl-10"
                          disabled={isSubmitting}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">选择头像</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {avatarOptions.map((avatar) => (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar.id)}
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                              selectedAvatar === avatar.id
                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                                : 'opacity-60 hover:opacity-100',
                              `bg-gradient-to-br ${avatar.color}`
                            )}
                          >
                            <span className="text-2xl">{avatar.emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                        {error}
                        {error.includes('邮箱验证') && (
                          <button
                            type="button"
                            onClick={() => setShowEmailHelp(!showEmailHelp)}
                            className="mt-2 text-destructive hover:underline text-xs flex items-center gap-1"
                          >
                            {showEmailHelp ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                收起帮助
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                如何跳过邮箱验证？
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {showEmailHelp && (
                      <div className="text-sm bg-secondary/30 p-3 rounded-lg space-y-2">
                        <p className="text-foreground font-medium flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          如何禁用邮箱验证？
                        </p>
                        <ol className="text-muted-foreground text-xs space-y-1 list-decimal list-inside">
                          <li>访问 Supabase 控制台</li>
                          <li>进入 Authentication → Providers → Email</li>
                          <li>取消勾选 "Confirm email" 选项</li>
                          <li>点击 Save 保存</li>
                        </ol>
                        <p className="text-muted-foreground text-xs">
                          禁用后，用户注册后可直接登录，无需验证邮箱。
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full touch-target"
                      disabled={isSubmitting || !registerName.trim() || !registerEmail.trim() || !registerPassword.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          注册中...
                        </>
                      ) : (
                        <>
                          创建账号
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserSelect;
