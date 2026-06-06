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
export async function getTaskList(
  page = 1,
  pageSize = 20,
  status?: string,
  type?: string,
  category?: string,
) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) params.set('status', status);
  if (type) params.set('type', type);
  if (category) params.set('category', category);
  return request<PaginatedData<ConversionTask>>(`/v1/conversions?${params.toString()}`);
}

/** 获取下载 URL */
export function getDownloadUrl(taskNo: string): string {
  return `${API_BASE}/v1/files/download/${taskNo}`;
}

/** 带认证的文件下载 (fetch + blob) */
export async function authenticatedDownload(taskNo: string, fileName?: string): Promise<void> {
  const url = `${API_BASE}/v1/files/download/${taskNo}`;
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('登录已过期，请重新登录');
    }
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || `下载失败 (${res.status})`);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition');
  // 优先匹配 RFC 5987 的 filename*=UTF-8''... (支持中文等非 ASCII 文件名)
  const utf8Match = disposition?.match(/filename\*=UTF-8''([^;\n]+)/i);
  const basicMatch = disposition?.match(/filename="([^"]+)"/);
  let decodedName: string;
  if (utf8Match) {
    decodedName = decodeURIComponent(utf8Match[1].trim());
  } else if (basicMatch) {
    decodedName = basicMatch[1];
  } else {
    decodedName = fileName || `${taskNo}.file`;
  }

  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = decodedName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

/** 创建 PDF 合并任务 (多文件) */
export async function createMergeTask(data: {
  fileIds: string[];
  type?: string;
  options?: Record<string, unknown>;
}) {
  return request<CreateConversionResponse>('/v1/conversions/merge', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 批量创建转换任务 */
export async function batchCreateConversion(data: {
  fileIds: string[];
  type: string;
  options?: Record<string, unknown>;
}) {
  return request<{
    tasks: Array<{ fileId: string; success: boolean; taskNo?: string; error?: string }>;
    total: number;
    succeeded: number;
    failed: number;
  }>('/v1/conversions/batch', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 获取批量下载 URL */
export function getBatchDownloadUrl(taskNos: string[]): string {
  return `${API_BASE}/v1/conversions/batch-download?taskNos=${taskNos.join(',')}`;
}

/** 删除任务 */
export async function deleteTask(taskNo: string) {
  return request<void>(`/v1/conversions/${taskNo}`, { method: 'DELETE' });
}

// ========== 邀请系统 ==========

/** 获取邀请统计 */
export async function getInviteStats() {
  return request<{
    inviteCode: string;
    inviteCount: number;
    totalEarned: number;
    rewardPerInvite: number;
  }>('/v1/user/invite-stats');
}

/** 获取邀请历史 */
export async function getInviteHistory(page = 1, pageSize = 20) {
  return request<
    PaginatedData<{
      id: number;
      nickname: string | null;
      email: string | null;
      reward: number;
      registeredAt: string;
    }>
  >(`/v1/user/invite-history?page=${page}&pageSize=${pageSize}`);
}

// ========== 管理后台 ==========

/** 获取系统统计 */
export async function getAdminStats() {
  return request<{
    totalUsers: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    queuedTasks: number;
    todayUsers: number;
    todayTasks: number;
    totalCreditsSpent: number;
  }>('/v1/admin/stats');
}

/** 获取用户列表(管理) */
export async function getAdminUsers(page = 1, pageSize = 20, search?: string, status?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  return request<
    PaginatedData<{
      id: number;
      email: string | null;
      nickname: string | null;
      role: string;
      status: string;
      inviteCode: string;
      invitedBy: number | null;
      creditsBalance: number;
      creditsTotalEarned: number;
      creditsTotalSpent: number;
      lastLoginAt: string | null;
      createdAt: string;
    }>
  >(`/v1/admin/users?${params.toString()}`);
}

/** 修改用户状态 */
export async function updateAdminUserStatus(userId: number, status: 'active' | 'disabled') {
  return request<{ message: string }>(`/v1/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/** 调整用户积分 */
export async function updateAdminUserCredits(userId: number, amount: number, reason?: string) {
  return request<{ message: string; newBalance: number }>(`/v1/admin/users/${userId}/credits`, {
    method: 'PATCH',
    body: JSON.stringify({ amount, reason }),
  });
}

/** 获取最近任务(管理) */
export async function getAdminTasks(page = 1, pageSize = 20) {
  return request<
    PaginatedData<{
      id: number;
      taskNo: string;
      userId: number;
      type: string;
      status: string;
      inputFileName: string | null;
      creditsCost: number;
      createdAt: string;
    }>
  >(`/v1/admin/tasks?page=${page}&pageSize=${pageSize}`);
}
