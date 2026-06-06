'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getInviteStats,
  getInviteHistory,
} from '@/lib/api';
import type { UserProfileResponse } from '@fileshift/shared-types';

interface InviteStats {
  inviteCode: string;
  inviteCount: number;
  totalEarned: number;
  rewardPerInvite: number;
}

interface Invitee {
  id: number;
  nickname: string | null;
  email: string | null;
  reward: number;
  registeredAt: string;
}

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

  const [inviteStats, setInviteStats] = useState<InviteStats | null>(null);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [copied, setCopied] = useState(false);

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
      // 加载邀请统计
      try {
        const stats = await getInviteStats();
        setInviteStats(stats);
        const history = await getInviteHistory(1, 10);
        setInvitees(history.list);
      } catch {
        // 邀请接口失败不影响主流程
      }
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

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/register?invite=${profile?.inviteCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
          {profile.role === 'admin' && (
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary">
              管理后台
            </Link>
          )}
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

      {/* 邀请好友 */}
      {inviteStats && (
        <div className="mt-6 rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">邀请好友赚积分</h2>
          <div className="mb-4 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-md bg-primary/5 p-3">
              <p className="text-2xl font-bold text-primary">{inviteStats.inviteCount}</p>
              <p className="text-xs text-muted-foreground">已邀请人数</p>
            </div>
            <div className="rounded-md bg-primary/5 p-3">
              <p className="text-2xl font-bold text-primary">{inviteStats.totalEarned}</p>
              <p className="text-xs text-muted-foreground">累计获得积分</p>
            </div>
            <div className="rounded-md bg-primary/5 p-3">
              <p className="text-2xl font-bold text-primary">{inviteStats.rewardPerInvite}</p>
              <p className="text-xs text-muted-foreground">每邀请一人奖励</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm">
              {typeof window !== 'undefined'
                ? `${window.location.origin}/register?invite=${inviteStats.inviteCode}`
                : inviteStats.inviteCode}
            </div>
            <button
              onClick={handleCopyInvite}
              className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              {copied ? '已复制' : '复制邀请链接'}
            </button>
          </div>
          {invitees.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">最近邀请记录</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2">昵称</th>
                    <th className="pb-2">邮箱</th>
                    <th className="pb-2">奖励</th>
                    <th className="pb-2">注册时间</th>
                  </tr>
                </thead>
                <tbody>
                  {invitees.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="py-2">{inv.nickname || '-'}</td>
                      <td className="py-2 text-muted-foreground">{inv.email || '-'}</td>
                      <td className="py-2 text-primary">+{inv.reward}</td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(inv.registeredAt).toLocaleDateString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
