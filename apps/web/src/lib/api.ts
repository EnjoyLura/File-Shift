import type { ApiResponse, AuthResponse, UserProfileResponse } from '@fileshift/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) || {}),
  };

  // 自动添加 token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...options, headers });
  const json: ApiResponse<T> = await res.json();

  if (json.code !== 0) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

/** 发送验证码 */
export async function sendCode(target: string, type: string) {
  return request<{ message: string }>('/v1/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ target, type }),
  });
}

/** 注册 */
export async function register(data: {
  email: string;
  password: string;
  code: string;
  inviteCode?: string;
}) {
  return request<AuthResponse>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 登录 */
export async function login(email: string, password: string) {
  return request<AuthResponse>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** 刷新 Token */
export async function refreshToken(refreshToken: string) {
  return request<AuthResponse>('/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

/** 退出登录 */
export async function logout() {
  return request<{ message: string }>('/v1/auth/logout', { method: 'POST' });
}

/** 获取用户信息 */
export async function getProfile() {
  return request<UserProfileResponse>('/v1/user/profile');
}

/** 更新用户信息 */
export async function updateProfile(data: { nickname?: string; avatarUrl?: string }) {
  return request<UserProfileResponse>('/v1/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** 修改密码 */
export async function changePassword(oldPassword: string, newPassword: string) {
  return request<{ message: string }>('/v1/user/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}
