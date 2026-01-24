# 常见问题排查

## 邮箱验证问题

### 问题描述

注册时提示："注册成功！请检查您的邮箱并点击验证链接，验证后即可登录"

### 原因

Supabase Auth 默认启用了邮箱验证功能。用户注册后需要先点击验证链接，否则无法登录。

### 解决方案

#### 方式一：禁用邮箱验证（推荐）

对于儿童学习应用，建议禁用邮箱验证以提供更好的用户体验。

**步骤**：

1. 访问 Supabase 控制台：https://app.supabase.com/project/YOUR_PROJECT_ID
2. 导航到 `Authentication` → `Providers` → `Email`
3. **取消勾选** "Confirm email" 选项
4. 点击 "Save" 保存

完成后，用户注册后即可直接登录。

#### 方式二：使用数据库触发器

执行以下 SQL 语句：

```sql
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm_email ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm_email
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_email();
```

#### 方式三：批量确认现有用户

如果有一些已经注册但未确认邮箱的用户：

```sql
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
```

### 推荐配置

对于本项目（儿童数学学习游戏）：

| 环境 | 推荐 |
|-----|------|
| 开发环境 | 禁用邮箱验证 |
| 生产环境 | 禁用邮箱验证（儿童应用，家庭监督） |

---

## 注册失败问题

### 问题描述

注册时提示错误，无法创建账号。

### 常见原因

1. **邮箱已被注册**
   - 错误信息：`User already registered`
   - 解决：使用其他邮箱或直接登录

2. **密码太短**
   - 错误信息：`Password should be at least 6 characters`
   - 解决：使用至少6个字符的密码

3. **数据库触发器未创建**
   - 错误信息：注册成功但无法登录
   - 解决：执行迁移文件 `009_auto_create_profile_trigger.sql`

### 解决步骤

1. 检查浏览器控制台的日志输出
2. 确认数据库迁移已执行
3. 检查 Supabase 控制台的 Auth 设置

---

## 登录失败问题

### 问题描述

输入正确的邮箱和密码，但仍无法登录。

### 常见原因

1. **邮箱未验证**
   - 错误信息：`Email not confirmed`
   - 解决：验证邮箱或禁用邮箱验证

2. **用户资料不存在**
   - 错误信息：`用户资料不存在，请联系管理员`
   - 解决：检查触发器是否正确创建

3. **密码错误**
   - 错误信息：`Invalid login credentials`
   - 解决：检查密码是否正确，或重置密码

### 解决步骤

1. 检查浏览器控制台的日志
2. 在 Supabase 控制台查看用户列表
3. 检查 profiles 表中是否有对应记录

---

## 管理员权限问题

### 问题描述

无法访问 `/admin` 页面。

### 原因

当前用户不是管理员（`is_admin = false`）。

### 解决方案

#### 方式一：在数据库中设置管理员

```sql
-- 将指定用户设置为管理员
UPDATE profiles SET is_admin = true WHERE email = 'admin@example.com';
```

#### 方式二：通过 Supabase 控制台

1. 访问 Supabase 控制台
2. 进入 Table Editor → `profiles`
3. 找到要设置为管理员的用户
4. 将 `is_admin` 字段设置为 `true`
5. 点击 Save

### 注意事项

- 管理员权限应谨慎分配
- 生产环境中应该通过审核流程分配管理员权限
- 建议使用专门的系统管理员账号

---

## 数据迁移问题

### 问题描述

数据库表结构不匹配或缺少字段。

### 解决方案

1. 按顺序执行所有迁移文件：

```bash
# 使用 Supabase CLI（推荐）
npx supabase db push

# 或在 Supabase 控制台手动执行
# 依次执行 database/migrations/ 目录下的 SQL 文件
```

2. 检查迁移文件列表：

| 文件 | 说明 |
|-----|------|
| `001_answer_records.sql` | 答题记录表 |
| `002_review_schedules.sql` | 复习计划表 |
| `003_feynman_explanations.sql` | 费曼解释表 |
| `004_ai_generation_cache.sql` | AI生成缓存表 |
| `005_knowledge_nodes.sql` | 知识节点表 |
| `006_user_knowledge_mastery.sql` | 用户知识掌握度表 |
| `007_questions.sql` | 题目表 |
| `008_question_templates.sql` | 题目模板表 |
| `009_auto_create_profile_trigger.sql` | 自动创建用户资料的触发器 |
| `010_add_admin_role.sql` | 添加管理员角色字段 |
| `011_disable_email_verification.sql` | 禁用邮箱验证（可选） |

---

## 性能问题

### 问题描述

页面加载缓慢或卡顿。

### 解决方案

1. **检查网络连接**
   - 确保网络稳定
   - 尝试刷新页面

2. **清除浏览器缓存**
   - 清除 localStorage 和 sessionStorage
   - 重新加载页面

3. **检查数据库查询**
   - 在浏览器控制台查看网络请求
   - 确认查询是否有延迟

4. **优化代码**
   - 使用 React.memo 优化组件渲染
   - 减少不必要的状态更新

---

## 其他问题

### 找不到对应问题的解决方案？

1. 查看 `SECURITY.md` 了解系统安全架构
2. 查看 `EMAIL_VERIFICATION_SETUP.md` 了解邮箱验证配置
3. 检查浏览器控制台的错误日志
4. 在 Supabase 控制台查看 Auth 和 Database 日志

### 需要帮助？

- 查看项目文档
- 检查 GitHub Issues
- 联系开发团队

---

**更新日期**: 2025-01-15
