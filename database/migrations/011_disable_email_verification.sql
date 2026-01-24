-- 禁用邮箱验证功能
-- 注意：这需要 Supabase Admin 权限，可能需要在 Supabase 控制台手动执行

-- 方式1：通过 SQL 修改（需要超级用户权限）
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- 方式2：禁用确认邮件（需要在 Supabase 控制台的 Authentication 设置中操作）
-- 步骤：
-- 1. 访问 https://app.supabase.com/project/YOUR_PROJECT_ID/auth/providers
-- 2. 找到 "Email Provider"
-- 3. 取消勾选 "Confirm email" 选项
-- 4. 点击 "Save"

-- 方式3：创建一个函数来自动确认邮箱（供开发环境使用）
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created_confirm_email ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm_email
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_email();
