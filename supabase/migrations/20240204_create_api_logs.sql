-- 创建 API 日志表
CREATE TABLE IF NOT EXISTS public.api_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON public.api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON public.api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_action ON public.api_logs(action);

-- 创建 RLS (Row Level Security) 策略
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- 允许用户查看自己的日志
CREATE POLICY "Users can view their own logs"
  ON public.api_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- 允许服务角色插入日志
CREATE POLICY "Service role can insert logs"
  ON public.api_logs
  FOR INSERT
  WITH CHECK (true);

-- 允许管理员查看所有日志
CREATE POLICY "Admins can view all logs"
  ON public.api_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- 添加注释
COMMENT ON TABLE public.api_logs IS 'API 调用日志表，用于记录所有 Edge Function 的调用';
COMMENT ON COLUMN public.api_logs.user_id IS '用户 ID，关联到 auth.users 表';
COMMENT ON COLUMN public.api_logs.action IS '操作类型，如 chat, generate-questions 等';
COMMENT ON COLUMN public.api_logs.details IS '操作详情，JSON 格式';
COMMENT ON COLUMN public.api_logs.success IS '操作是否成功';
COMMENT ON COLUMN public.api_logs.created_at IS '创建时间';
COMMENT ON COLUMN public.api_logs.ip_address IS '客户端 IP 地址';
COMMENT ON COLUMN public.api_logs.user_agent IS '客户端 User-Agent';
