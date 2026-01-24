import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { loadCurrentUser } from '@/utils/userStorage';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * 受保护的路由组件
 * - 检查用户是否已登录
 * - 如果 requireAdmin 为 true，检查用户是否是管理员
 */
export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await loadCurrentUser();
      setIsAuthenticated(!!user);

      // 如果需要管理员权限，检查是否是管理员
      if (requireAdmin && user) {
        // TODO: 从用户资料中获取 is_admin 字段
        // 目前暂时允许所有用户访问（临时方案）
        // setIsAdmin(user.isAdmin || false);
        setIsAdmin(true);
      }
    };

    checkAuth();
  }, [requireAdmin]);

  // 正在验证中
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-body text-muted-foreground">验证身份中...</p>
        </div>
      </div>
    );
  }

  // 未登录，跳转到登录页
  if (!isAuthenticated) {
    return <Navigate to="/select-user" state={{ from: location }} replace />;
  }

  // 需要管理员权限但用户不是管理员
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * 仅验证登录状态的路由（用于普通用户页面）
 */
export const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

/**
 * 验证登录和管理员权限的路由（用于管理员页面）
 */
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
};
