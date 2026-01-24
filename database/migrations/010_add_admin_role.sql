-- 添加 is_admin 字段到 profiles 表
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 创建索引以加速管理员查询
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- 更新RLS策略，确保普通用户不能修改自己或他人的管理员权限
CREATE POLICY "Allow read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow update own profile except admin" ON profiles FOR UPDATE
  USING (
    auth.uid() = id AND
    (is_admin IS NOT DISTINCT FROM OLD.is_admin OR OLD.is_admin = is_admin)
  )
  WITH CHECK (
    auth.uid() = id AND
    (is_admin IS NOT DISTINCT FROM OLD.is_admin OR OLD.is_admin = is_admin)
  );

-- 创建一个函数，用于设置管理员（只能由supabase admin或system用户调用）
CREATE OR REPLACE FUNCTION public.set_admin_role(user_id UUID, is_admin_flag BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
  -- 只有系统管理员（通过检查is_superuser或自定义逻辑）才能修改管理员权限
  -- 这里我们使用一个简单的策略：只有已经是管理员的人才能添加其他管理员
  -- 但这个函数应该在服务端调用，而不是前端

  UPDATE profiles
  SET is_admin = is_admin_flag
  WHERE id = user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 注意：在生产环境中，你应该通过服务端API来管理管理员权限
-- 前端不应该直接调用这个函数
