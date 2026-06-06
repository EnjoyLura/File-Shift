import type {
  ApiResponse,
  AuthResponse,
  UserProfileResponse,
  UploadResponse,
  CreateConversionResponse,
  ConversionTaskDetail,
  PaginatedData,
  ConversionTask,
} from '@fileshift/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new Error('网络连接失败，请检查网络后重试');
  }

  // 处理非 JSON 响应（如 502 网关错误返回 HTML）
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`服务器错误 (${res.status})，请稍后重试`);
  }

  const json: ApiResponse<T> = await res.json();

  // 处理 401 Token 过期（先读取 JSON 获取服务端实际错误消息）
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    throw new Error(json.message || '登录已过期，请重新登录');
  }

  if (json.code !== 0) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

/** 发送验证码 */
export async function sendCode(target: string, type: string) {
  return request<{ message: string; devCode?: string }>('/v1/auth/send-code', {
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

// ========== 文件上传 ==========

/** 上传文件 (multipart/form-data) */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const url = `${API_BASE}/v1/files/upload`;
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let res: Response;
  try {
    res = await fetch(url, { method: 'POST', headers, body: formData });
  } catch {
    throw new Error('网络连接失败，请检查网络后重试');
  }

  const json: ApiResponse<UploadResponse> = await res.json();
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    throw new Error(json.message || '登录已过期，请重新登录');
  }
  if (json.code !== 0) {
    throw new Error(json.message || '上传失败');
  }
  return json.data;
}

// ========== 转换任务 ==========

/** 创建转换任务 */
export async function createConversion(data: {
  fileId: string;
  type: string;
  options?: Record<string, unknown>;
}) {
  return request<CreateConversionResponse>('/v1/conversions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 查询任务状态 */
export async function getTaskStatus(taskNo: string) {
  return request<ConversionTaskDetail>(`/v1/conversions/${taskNo}`);
}

/** 获取任务列表 */
export async function getTaskList(page = 1, pageSize = 20) {
  return request<PaginatedData<ConversionTask>>(
    `/v1/conversions?page=${page}&pageSize=${pageSize}`,
  );
}

/** 获取下载 URL */
export function getDownloadUrl(taskNo: string): string {
  return `${API_BASE}/v1/files/download/${taskNo}`;
}
