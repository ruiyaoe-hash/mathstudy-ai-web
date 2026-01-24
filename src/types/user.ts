export interface User {
  id: string;
  name: string;
  avatar: string; // avatar index (1-6)
  createdAt: number;
  lastActiveAt: number;
}

export interface UsersData {
  users: User[];
  currentUserId: string | null;
}

// 可选头像列表
export const avatarOptions = [
  { id: '1', emoji: '🚀', color: 'from-violet-500 to-purple-600' },
  { id: '2', emoji: '⭐', color: 'from-amber-500 to-orange-600' },
  { id: '3', emoji: '❤️', color: 'from-pink-500 to-rose-600' },
  { id: '4', emoji: '⚡', color: 'from-cyan-500 to-blue-600' },
  { id: '5', emoji: '🔥', color: 'from-orange-500 to-red-600' },
  { id: '6', emoji: '✨', color: 'from-emerald-500 to-teal-600' },
];
