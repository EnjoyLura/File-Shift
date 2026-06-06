'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import {
  getProfile,
  getAdminStats,
  getAdminUsers,
  getAdminTasks,
  updateAdminUserStatus,
  updateAdminUserCredits,
} from '@/lib/api';

interface Stats {
  totalUsers: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  queuedTasks: number;
  todayUsers: number;
  todayTasks: number;
  totalCreditsSpent: number;
}

interface AdminUser {
  id: number;
  email: string | null;
  nickname: string | null;
  role: string;
  status: string;
  inviteCode: string;
  creditsBalance: number;
  creditsTotalEarned: number;
  creditsTotalSpent: number;
  lastLoginAt: string | null;
  createdAt: string;
}

interface AdminTask {
  id: number;
  taskNo: string;
  userId: number;
  type: string;
  status: string;
  inputFileName: string | null;
  creditsCost: number;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [tasksPage, setTasksPage] = useState(1);
  const [adjustUserId, setAdjustUserId] = useState<number | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    getProfile()
      .then((p) => {
        if (p.role !== 'admin') {
          alert('需要管理员权限');
          router.push('/');
          return;
        }
        setIsAdmin(true);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const loadStats = useCallback(async () => {
    try {
      const s = await getAdminStats();
      setStats(s);
    } catch {
      // ignore
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const result = await getAdminUsers(usersPage, 20, userSearch || undefined);
      setUsers(result.list);
      setUsersTotal(result.total);
    } catch {
      // ignore
    }
  }, [usersPage, userSearch]);

  const loadTasks = useCallback(async () => {
    try {
      const result = await getAdminTasks(tasksPage, 20);
      setTasks(result.list);
      setTasksTotal(result.total);
    } catch {
      // ignore
    }
  }, [tasksPage]);

  useEffect(() => {
    if (!isAdmin) return;
    setIsLoaded(true);
    if (activeTab === 'overview') loadStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'tasks') loadTasks();
  }, [isAdmin, activeTab, loadStats, loadUsers, loadTasks]);

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    if (!confirm(`确定要${newStatus === 'active' ? '启用' : '禁用'}该用户吗？`)) return;
    try {
      await updateAdminUserStatus(userId, newStatus);
      await loadUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleAdjustCredits = async (userId: number) => {
    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount === 0) {
      alert('请输入有效的积分数量');
      return;
    }
    try {
      const result = await updateAdminUserCredits(userId, amount, adjustReason || undefined);
      alert(result.message);
      setAdjustUserId(null);
      setAdjustAmount('');
      setAdjustReason('');
      await loadUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '操作失败');
    }
  };

  if (!isLoaded || !isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">管理后台</h1>

        {/* Tab 切换 */}
        <div className="mb-6 flex gap-1 rounded-lg border p-1">
          {(['overview', 'users', 'tasks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              {tab === 'overview' ? '系统总览' : tab === 'users' ? '用户管理' : '任务记录'}
            </button>
          ))}
        </div>

        {/* 系统总览 */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: '总用户数', value: stats.totalUsers, color: 'text-blue-600' },
                { label: '今日新增用户', value: stats.todayUsers, color: 'text-green-600' },
                { label: '总任务数', value: stats.totalTasks, color: 'text-purple-600' },
                { label: '今日任务数', value: stats.todayTasks, color: 'text-orange-600' },
                { label: '已完成任务', value: stats.completedTasks, color: 'text-green-600' },
                { label: '失败任务', value: stats.failedTasks, color: 'text-destructive' },
                { label: '队列中任务', value: stats.queuedTasks, color: 'text-yellow-600' },
                { label: '总积分消费', value: stats.totalCreditsSpent, color: 'text-primary' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 用户管理 */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="搜索邮箱或昵称..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUsersPage(1);
                }}
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">ID</th>
                    <th className="pb-2 pr-4">邮箱</th>
                    <th className="pb-2 pr-4">昵称</th>
                    <th className="pb-2 pr-4">角色</th>
                    <th className="pb-2 pr-4">状态</th>
                    <th className="pb-2 pr-4">积分</th>
                    <th className="pb-2 pr-4">注册时间</th>
                    <th className="pb-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{u.id}</td>
                      <td className="py-2 pr-4 text-xs">{u.email || '-'}</td>
                      <td className="py-2 pr-4">{u.nickname || '-'}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {u.status === 'active' ? '正常' : '禁用'}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs">{u.creditsBalance}</td>
                      <td className="py-2 pr-4 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleStatus(u.id, u.status)}
                              className={`rounded px-2 py-1 text-xs ${
                                u.status === 'active'
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                            >
                              {u.status === 'active' ? '禁用' : '启用'}
                            </button>
                          )}
                          <button
                            onClick={() => setAdjustUserId(u.id)}
                            className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                          >
                            调积分
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 积分调整弹窗 */}
            {adjustUserId !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-80 rounded-lg bg-background p-6 shadow-lg">
                  <h3 className="mb-4 font-semibold">调整积分 - 用户 #{adjustUserId}</h3>
                  <div className="mb-3">
                    <label className="mb-1 block text-xs text-muted-foreground">积分数量</label>
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="正数增加，负数扣减"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-1 block text-xs text-muted-foreground">原因</label>
                    <input
                      type="text"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="可选"
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdjustCredits(adjustUserId)}
                      className="flex-1 rounded-md bg-primary py-2 text-sm text-primary-foreground hover:bg-primary/90"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => {
                        setAdjustUserId(null);
                        setAdjustAmount('');
                        setAdjustReason('');
                      }}
                      className="flex-1 rounded-md border py-2 text-sm hover:bg-accent"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 分页 */}
            {usersTotal > 20 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  disabled={usersPage <= 1}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="text-sm text-muted-foreground">
                  {usersPage} / {Math.ceil(usersTotal / 20)}
                </span>
                <button
                  onClick={() => setUsersPage((p) => p + 1)}
                  disabled={usersPage >= Math.ceil(usersTotal / 20)}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}

        {/* 任务记录 */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">任务号</th>
                    <th className="pb-2 pr-4">用户ID</th>
                    <th className="pb-2 pr-4">类型</th>
                    <th className="pb-2 pr-4">状态</th>
                    <th className="pb-2 pr-4">文件名</th>
                    <th className="pb-2 pr-4">积分</th>
                    <th className="pb-2">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.taskNo} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs">{t.taskNo}</td>
                      <td className="py-2 pr-4">{t.userId}</td>
                      <td className="py-2 pr-4 text-xs">{t.type}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            t.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : t.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate py-2 pr-4 text-xs">
                        {t.inputFileName || '-'}
                      </td>
                      <td className="py-2 pr-4 text-xs">{t.creditsCost}</td>
                      <td className="py-2 text-xs">
                        {new Date(t.createdAt).toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {tasksTotal > 20 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setTasksPage((p) => Math.max(1, p - 1))}
                  disabled={tasksPage <= 1}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="text-sm text-muted-foreground">
                  {tasksPage} / {Math.ceil(tasksTotal / 20)}
                </span>
                <button
                  onClick={() => setTasksPage((p) => p + 1)}
                  disabled={tasksPage >= Math.ceil(tasksTotal / 20)}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
