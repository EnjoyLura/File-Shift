'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile, changePassword, logout } from '@/lib/api';
import type { UserProfileResponse } from '@fileshift/shared-types';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 修改密码
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setNickname(data.nickname || '');
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await updateProfile({ nickname });
      setProfile(data);
      setEditing(false);
      setMessage('信息更新成功');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await changePassword(oldPwd, newPwd);
      setShowPwdForm(false);
      setOldPwd('');
      setNewPwd('');
      setMessage('密码修改成功');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '修改密码失败');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">个人中心</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            首页
          </Link>
          <Link href="/convert" className="text-sm text-muted-foreground hover:text-primary">
            转换中心
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          退出登录
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</div>
      )}
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-6 rounded-lg border p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">邮箱：</span>
            <span>{profile.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">角色：</span>
            <span>{profile.role === 'admin' ? '管理员' : '普通用户'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">邀请码：</span>
            <span className="font-mono">{profile.inviteCode}</span>
          </div>
          <div>
            <span className="text-muted-foreground">注册时间：</span>
            <span>{new Date(profile.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>

        <div className="rounded-md border border-dashed border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">积分余额</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {profile.credits?.balance ?? 0}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>累计获得: {profile.credits?.totalEarned ?? 0}</p>
              <p>累计消费: {profile.credits?.totalSpent ?? 0}</p>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={50}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                取消
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              <span className="text-muted-foreground">昵称：</span>
              {profile.nickname || '未设置'}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-primary hover:underline"
            >
              编辑
            </button>
          </div>
        )}

        <hr className="border-border" />

        {showPwdForm ? (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">原密码</label>
              <input
                type="password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">新密码</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                minLength={6}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              >
                确认修改
              </button>
              <button
                type="button"
                onClick={() => setShowPwdForm(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
              >
                取消
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowPwdForm(true)}
            className="text-sm text-primary hover:underline"
          >
            修改密码
          </button>
        )}
      </div>
    </div>
  );
}
