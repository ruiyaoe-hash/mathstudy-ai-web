-- 创建触发器函数：在认证用户创建时自动创建 profiles 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', '用户'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '1')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- 同时创建空的游戏进度
  INSERT INTO public.game_progress (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 启用邮箱自动确认（可选，用于开发环境）
-- 注意：生产环境中应该启用邮箱验证
-- ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT now();
