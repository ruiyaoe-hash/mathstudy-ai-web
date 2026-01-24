# 数据库迁移说明

## 应用迁移到 Supabase

### 方法一：使用 Supabase CLI（推荐）

```bash
cd demo1
npx supabase db push
```

### 方法二：在 Supabase 控制台手动执行

1. 访问 Supabase 控制台：https://app.supabase.com
2. 选择你的项目
3. 进入 SQL Editor
4. 创建一个新的查询
5. 粘贴以下 SQL 并执行：

```sql
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
```

## 迁移内容

### 009_auto_create_profile_trigger.sql

此迁移解决了注册流程中的问题：

1. **自动创建 profiles 记录**：当用户注册时，触发器会自动从认证用户元数据中提取 name 和 avatar，创建对应的 profiles 记录
2. **自动创建 game_progress 记录**：同时创建空的游戏进度记录
3. **避免竞态条件**：使用数据库触发器确保数据一致性，避免客户端插入时的竞态条件

## 验证迁移是否成功

在 SQL Editor 中运行以下查询：

```sql
-- 检查触发器是否存在
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 检查函数是否存在
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

## 注意事项

- 此迁移与注册流程中的元数据传递配合使用
- 注册时会将 name 和 avatar 作为 user metadata 传递
- 触发器会自动从 metadata 中提取这些字段并创建记录
- 如需关闭邮箱验证，可以在 Supabase 控制台的 Authentication -> Providers -> Email 中关闭 "Confirm email"
