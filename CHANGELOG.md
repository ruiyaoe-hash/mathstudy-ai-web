# 更新日志

本文档记录了项目的所有重要更改。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.1.0] - 2026-02-06

### 新增功能
- 添加API客户端库（`src/lib/apiClient.ts`）用于统一API调用
- 添加API日志数据库迁移（`supabase/migrations/20240204_create_api_logs.sql`）
- 添加健康检查Edge Function（`supabase/functions/health`）

### 修复
- 修复Supabase Edge Function环境变量名称问题（从`ZHIPU_API_KEY`改为`yaoruione`）
- 修复Edge Function中的乱码字符问题
- 修复Supabase Edge Function的认证问题，支持JWT预验证
- 修复Express后端和Edge Function的智谱AI模型版本不一致问题
- 更新ProtectedRoute组件的错误处理逻辑

### 改进
- 将智谱AI模型版本从`glm-4-flash`和`glm-4`统一更新为`glm-4.7`
- 更新AI服务配置，支持多种AI提供商（智谱AI、Coze）
- 优化Edge Function的错误处理和日志记录
- 改进.gitignore配置，忽略测试文件和临时文件

### 变更
- 更新Express后端智谱AI客户端实现
- 更新AI服务配置，支持环境变量配置
- 优化项目结构，清理临时文件和测试文件

## [1.0.0] - 2026-01-31

### 新增功能
- 完整的数学学习AI助手系统
- 用户认证和授权系统
- AI聊天功能
- AI题目生成功能
- AI概念解释功能
- AI错误分析功能
- AI学习建议功能
- 知识图谱系统
- 用户进度追踪
- 学习统计和报告

### 技术栈
- 前端：React 19 + TypeScript + Vite
- UI组件：Radix UI + Tailwind CSS
- 后端：Express + TypeScript
- 数据库：Supabase (PostgreSQL)
- AI服务：智谱AI GLM-4.7
- 认证：Supabase Auth
- 状态管理：TanStack Query

---

## 版本说明

### 版本号格式
- **主版本号（Major）**：不兼容的API修改
- **次版本号（Minor）**：向下兼容的功能性新增
- **修订号（Patch）**：向下兼容的问题修正

### 变更类型
- **新增**：新功能
- **修复**：bug修复
- **改进**：现有功能的改进
- **变更**：不兼容的API修改
- **弃用**：即将移除的功能
- **移除**：已移除的功能
- **安全**：安全相关的修复
