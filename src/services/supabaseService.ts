import { supabase } from '@/integrations/supabase/client';
import { GameProgress, MistakeItem } from '@/types/game';

// Profile 类型
export interface Profile {
  id: string;
  name: string;
  avatar: string;
  created_at: string;
  last_active_at: string;
}

// 排行榜条目类型
export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  total_stars: number;
  coins: number;
  total_correct: number;
  total_questions: number;
  best_streak: number;
  achievement_count: number;
  accuracy: number;
  last_active_at: string;
}

// ============ Profile 相关 ============

// 创建新用户
export const createProfile = async (name: string, avatar: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ name, avatar })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  // 同时创建空的游戏进度
  if (data) {
    await supabase
      .from('game_progress')
      .insert({ profile_id: data.id });
  }

  return data;
};

// 获取所有用户
export const getAllProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_active_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return data || [];
};

// 更新用户最后活跃时间
export const updateProfileLastActive = async (profileId: string): Promise<void> => {
  await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', profileId);
};

// 删除用户
export const deleteProfile = async (profileId: string): Promise<void> => {
  await supabase.from('profiles').delete().eq('id', profileId);
};

// ============ Game Progress 相关 ============

// 获取游戏进度
export const getGameProgress = async (profileId: string): Promise<GameProgress | null> => {
  const { data, error } = await supabase
    .from('game_progress')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching game progress:', error);
    return null;
  }

  // 转换数据格式
  return {
    planets: (data.planets_data as Record<string, unknown>) || {},
    coins: data.coins,
    totalStars: data.total_stars,
    achievements: data.achievements || [],
    mistakes: (data.mistakes as MistakeItem[]) || [],
    totalCorrect: data.total_correct,
    totalQuestions: data.total_questions,
    currentStreak: data.current_streak,
    bestStreak: data.best_streak,
  } as GameProgress;
};

// 保存游戏进度
export const saveGameProgress = async (profileId: string, progress: GameProgress): Promise<void> => {
  const { error } = await supabase
    .from('game_progress')
    .upsert({
      profile_id: profileId,
      coins: progress.coins,
      total_stars: progress.totalStars,
      total_correct: progress.totalCorrect,
      total_questions: progress.totalQuestions,
      current_streak: progress.currentStreak,
      best_streak: progress.bestStreak,
      planets_data: progress.planets,
      achievements: progress.achievements,
      mistakes: progress.mistakes,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_id' });

  if (error) {
    console.error('Error saving game progress:', error);
  }
};

// ============ 排行榜相关 ============

// 获取排行榜
export const getLeaderboard = async (limit: number = 50): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return (data || []) as LeaderboardEntry[];
};

// 获取用户排名
export const getUserRank = async (profileId: string): Promise<number | null> => {
  const leaderboard = await getLeaderboard(1000);
  const index = leaderboard.findIndex(entry => entry.id === profileId);
  return index >= 0 ? index + 1 : null;
};
