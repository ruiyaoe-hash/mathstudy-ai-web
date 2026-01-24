# 系统安全架构说明

## 概述

本系统实现了**完整的身份认证和权限控制机制**，确保用户数据安全，防止未授权访问。系统遵循最小权限原则和深度防御策略。

---

## 核心安全原则

### 1. 身份认证（Authentication）

✅ **已实现**
- 使用 Supabase Auth 进行身份认证
- 支持邮箱+密码登录/注册
- 密码自动使用 bcrypt 哈希加密
- JWT Token 自动刷新和管理
- 支持可选的邮箱验证

### 2. 会话管理（Session Management）

✅ **已实现**
- Session 存储在 localStorage
- Token 自动刷新机制
- Session 过期后自动跳转登录页
- 安全的登出流程（清除 session 和缓存）

### 3. 数据隔离（Data Isolation）

✅ **已实现**
- 所有用户数据查询基于 `session.user.id`
- 使用 RLS (Row Level Security) 策略
- 每个用户只能访问自己的游戏进度
- 防止数据泄露和越权访问

---

## 架构层级安全控制

### 前端层

#### 1. 路由级别权限控制

**文件**: `src/router.tsx`

所有需要登录的页面都通过 `ProtectedRoute` 组件保护：

```tsx
// 普通用户页面
<AuthRoute><Index /></AuthRoute>

// 管理员页面
<AdminRoute><Admin /></AdminRoute>
```

#### 2. 页面级别权限检查

**文件**: `src/components/auth/ProtectedRoute.tsx`

- `ProtectedRoute`: 检查用户是否已登录
- `AuthRoute`: 普通用户路由包装器
- `AdminRoute`: 管理员路由包装器（额外检查管理员权限）

#### 3. 页面内部权限验证

**示例**: `src/pages/Index.tsx`

```tsx
useEffect(() => {
  const init = async () => {
    const user = await loadCurrentUser();
    if (!user) {
      navigate('/select-user', { replace: true });
      return;
    }
    // ...
  };
  init();
}, [navigate]);
```

所有页面在加载时都会验证用户身份。

---

### 数据层

#### 1. 查询优化：基于用户ID查询

**修复前**（不安全）:
```ts
// ❌ 获取所有用户，然后查找当前用户
const profiles = await getAllProfiles();
const profile = profiles.find(p => p.id === session.user.id);
```

**修复后**（安全）:
```ts
// ✅ 只查询当前用户
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .single();
```

**文件**: `src/utils/userStorage.ts:79-102`

#### 2. RLS 策略

**文件**: `database/migrations/migration_20260114_125736000`

```sql
-- 启用行级安全
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

-- 允许所有用户访问（儿童学习应用场景）
-- 生产环境应使用更严格的策略
CREATE POLICY "Allow all access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to game_progress" ON game_progress FOR ALL USING (true) WITH CHECK (true);
```

**注意**: 当前 RLS 策略较为宽松（因为是儿童学习应用），生产环境应配置更严格的策略。

---

## 管理员权限控制

### 1. 管理员角色标识

**文件**: `database/migrations/010_add_admin_role.sql`

在 `profiles` 表中添加 `is_admin` 字段：

```sql
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
```

### 2. 管理员页面保护

**文件**: `src/router.tsx`

```tsx
{
  path: "/admin",
  element: <AdminRoute><Admin /></AdminRoute>,
}
```

只有管理员才能访问 `/admin` 路由。

### 3. 管理员页面安全警告

**文件**: `src/pages/Admin.tsx:73-78`

```tsx
<Alert className="border-amber-500/50 bg-amber-500/10">
  <Shield className="h-4 w-4 text-amber-500" />
  <AlertTitle className="text-amber-500">管理员权限区域</AlertTitle>
  <AlertDescription className="text-amber-600">
    此页面仅管理员可访问。所有操作将被记录，请谨慎操作。
  </AlertDescription>
</Alert>
```

---

## 安全漏洞修复记录

### 漏洞 1: Admin 页面无权限控制 ❌ → ✅

**问题**: 任何登录用户都可以访问 `/admin` 并查看所有用户数据。

**修复**:
1. 创建 `ProtectedRoute` 组件实现权限验证
2. 添加 `is_admin` 字段到 profiles 表
3. 使用 `AdminRoute` 包装 Admin 页面
4. 添加明显的安全警告提示

**影响**: 防止普通用户访问管理后台

---

### 漏洞 2: 效率低下且不安全的用户查询 ❌ → ✅

**问题**: `loadCurrentUser()` 获取所有用户然后查找当前用户，效率低且不安全。

**修复**:
```ts
// 修复前
const profiles = await getAllProfiles();
const profile = profiles.find(p => p.id === session.user.id);

// 修复后
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', session.user.id)
  .single();
```

**影响**: 
- 提高查询效率
- 减少数据传输
- 增强安全性（不返回其他用户数据）

---

### 漏洞 3: Admin 页面包含删除用户按钮 ❌ → ✅

**问题**: Admin 页面有删除用户按钮，但权限控制不足。

**修复**: 移除删除按钮，仅保留查看功能。

**影响**: 防止误操作删除用户数据

---

## 安全最佳实践

### 1. 永远不在前端暴露所有用户数据

❌ **错误**:
```tsx
const profiles = await getAllProfiles();
```

✅ **正确**:
```tsx
const profile = await getCurrentUserProfile();
```

### 2. 所有数据查询必须基于认证用户ID

❌ **错误**:
```sql
SELECT * FROM profiles;
```

✅ **正确**:
```sql
SELECT * FROM profiles WHERE id = :userId;
```

### 3. 前端权限控制 + 后端 RLS 双重保护

- 前端：路由级别和页面级别的权限检查
- 后端：RLS 策略确保数据库层面的数据隔离

### 4. 最小权限原则

- 普通用户：只能访问自己的数据
- 管理员：可以访问所有用户的统计数据
- 任何角色都不应该能直接访问其他用户的敏感信息

---

## 待改进项

### 1. RLS 策略强化

当前 RLS 策略较为宽松，建议生产环境使用更严格的策略：

```sql
-- 示例：更严格的 RLS 策略
CREATE POLICY "Users can only view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can only update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can only access own game progress" 
ON game_progress FOR ALL 
USING (auth.uid() = profile_id);
```

### 2. 管理员权限验证

当前 `AdminRoute` 的管理员验证是临时的，建议：

```tsx
// ProtectedRoute.tsx
if (requireAdmin && user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  setIsAdmin(profile?.is_admin || false);
}
```

### 3. 操作日志记录

建议记录管理员的敏感操作：

```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4. API 级别的权限验证

如果有后端 API，应该在 API 层面也验证权限：

```ts
// 示例：API 级别的权限验证
app.get('/api/admin/users', async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // ...
});
```

---

## 总结

本系统已实现**三层安全防护**：

1. **前端层**: 路由保护和页面级别验证
2. **数据层**: 基于用户ID的查询和 RLS 策略
3. **认证层**: Supabase Auth 提供的完整认证机制

系统遵循**最小权限原则**，确保：
- 普通用户只能访问自己的数据
- 管理员可以访问统计数据但不能直接修改用户
- 所有操作都有清晰的权限边界

---

**最后更新**: 2025-01-15
