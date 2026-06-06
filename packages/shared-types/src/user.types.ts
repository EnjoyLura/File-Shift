export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'disabled' | 'deleted';

export interface UserProfile {
  id: number;
  email: string | null;
  phone: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  role: UserRole;
  inviteCode: string;
  createdAt: string;
}

export interface UserCredits {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
