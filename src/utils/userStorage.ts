import { User } from '@/types/user';
import * as api from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

// 获取当前用户（从 Supabase Session）
export const getCurrentUser = (): User | null => {
  const cached = sessionStorage.getItem('current-user-data');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }
  return null;
};

// 设置当前用户缓存
export const setCurrentUserCache = (user: User | null): void => {
  if (user) {
    sessionStorage.setItem('current-user-data', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('current-user-data');
  }
};

// 获取所有用户（管理员功能）
export const getAllUsers = async (): Promise<User[]> => {
  const profiles = await api.getAllProfiles();
  return profiles.map(profile => ({
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    createdAt: new Date(profile.created_at).getTime(),
    lastActiveAt: new Date(profile.last_active_at).getTime(),
  }));
};

// 选择用户（仅供管理员切换用户使用）
export const selectUser = async (userId: string): Promise<void> => {
  // 这个功能现在主要用于管理员切换用户
  // 普通用户通过 Supabase 认证登录
  const profiles = await api.getAllProfiles();
  const profile = profiles.find(p => p.id === userId);
  if (profile) {
    const user = {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      createdAt: new Date(profile.created_at).getTime(),
      lastActiveAt: new Date(profile.last_active_at).getTime(),
    };
    setCurrentUserCache(user);
  }
};

// 删除用户（管理员功能）
export const deleteUser = async (userId: string): Promise<void> => {
  await api.deleteProfile(userId);
  const currentId = getCurrentUser()?.id;
  if (currentId === userId) {
    await logoutUser();
  }
};

// 退出登录
export const logoutUser = async (): Promise<void> => {
  // 清除 Supabase Session
  await supabase.auth.signOut();
  // 清除本地缓存
  setCurrentUserCache(null);
};

// 检查并加载当前用户
export const loadCurrentUser = async (): Promise<User | null> => {
  // 从 Supabase Session 获取
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  // 检查本地缓存
  const cached = getCurrentUser();
  if (cached && cached.id === session.user.id) {
    return cached;
  }

  // 只查询当前用户的资料（安全优化）
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    // 用户不存在，清除 Session
    await supabase.auth.signOut();
    return null;
  }

  const user = {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    createdAt: new Date(profile.created_at).getTime(),
    lastActiveAt: new Date(profile.last_active_at).getTime(),
  };
  setCurrentUserCache(user);
  return user;
};

// 兼容性：获取用户数据（同步版本，用于快速检查）
export const getUsersData = () => {
  const cachedUser = getCurrentUser();
  return {
    users: cachedUser ? [cachedUser] : [],
    currentUserId: cachedUser?.id || null,
  };
};

// 更新用户信息
export const updateUser = async (userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    throw error;
  }

  // 更新本地缓存
  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    setCurrentUserCache({
      ...currentUser,
      ...updates,
    });
  }
};

// 检查用户是否已登录
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await loadCurrentUser();
  return user !== null;
};
