import type { UserRole, UserStatus } from './user.types';

/** 注册请求 */
export interface RegisterRequest {
  email: string;
  password: string;
  code: string;
  inviteCode?: string;
}

/** 登录请求 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 发送验证码请求 */
export interface SendCodeRequest {
  target: string;
  type: 'register' | 'login' | 'reset_password' | 'bind';
}

/** 刷新 Token 请求 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** 登录/注册响应数据 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    email: string | null;
    nickname: string | null;
  };
}

/** 用户 Profile 响应 */
export interface UserProfileResponse {
  id: number;
  email: string | null;
  phone: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  inviteCode: string;
  inviteCount: number;
  createdAt: string;
  credits: number;
  totalCreditsEarned: number;
  totalCreditsSpent: number;
}

/** 修改密码请求 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/** 更新 Profile 请求 */
export interface UpdateProfileRequest {
  nickname?: string;
  avatarUrl?: string;
}
