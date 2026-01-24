# 邮箱验证配置说明

## 问题描述

当前注册时会提示："注册成功！请检查您的邮箱并点击验证链接，验证后即可登录"

这是因为 Supabase Auth 默认启用了邮箱验证功能。

## 解决方案

对于儿童学习应用，建议**禁用邮箱验证**，让用户注册后直接登录。有两种方式：

### 方式一：在 Supabase 控制台禁用（推荐）

1. 访问 Supabase 控制台：https://app.supabase.com/project/YOUR_PROJECT_ID/auth/providers
2. 找到 "Email Provider" 部分
3. **取消勾选** "Confirm email" 选项
4. 点击 "Save"

完成后，用户注册后即可直接登录，无需验证邮箱。

### 方式二：使用数据库触发器自动确认邮箱

执行以下 SQL：

```sql
-- 创建自动确认邮箱的函数
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
```

这个触发器会在用户注册时自动确认邮箱。

### 方式三：批量确认现有用户的邮箱

如果你有一些已经注册但未确认邮箱的用户，可以执行：

```sql
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
```

## 生产环境建议

- **开发环境**：禁用邮箱验证，方便测试
- **生产环境**：
  - 如果是儿童应用且家长可控：可以考虑禁用
  - 如果需要严格的安全控制：启用邮箱验证

## 当前应用特点

本应用是**儿童数学学习游戏**，特点：
- 目标用户：4-6年级学生
- 使用场景：家庭学习，家长监督
- 风险评估：较低，游戏性质应用

**建议**：禁用邮箱验证，提供更好的用户体验。

---

**更新日期**: 2025-01-15
