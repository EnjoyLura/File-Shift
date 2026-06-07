'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  FileCheck2,
  Clock,
  UserPlus,
  CreditCard,
  Activity,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { PageTransition } from '@/components/shared/page-transition';
import { useAuth } from '@/components/hooks/use-auth';
import { useDebounce } from '@/components/hooks/use-debounce';
import { useToast } from '@/components/ui/toast';
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

export default function DesignAdminPage() {
  const { isLoggedIn, loading: authLoading } = useAuth(true);
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [taskTotal, setTaskTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery);
  const [creditsDialog, setCreditsDialog] = useState<{ open: boolean; user: AdminUser | null }>({
    open: false,
    user: null,
  });
  const [creditsAmount, setCreditsAmount] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const p = await getProfile();
        if ((p as { role: string }).role !== 'admin') return;
        setIsAdmin(true);
        const s = await getAdminStats();
        setStats(s as Stats);
      } catch {
        /* not admin */
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn]);

  const loadUsers = useCallback(async () => {
    try {
      const r = await getAdminUsers(userPage, 20, debouncedSearch || undefined);
      setUsers(r.list as AdminUser[]);
      setUserTotal(r.total);
    } catch {
      /* ignore */
    }
  }, [userPage, debouncedSearch]);

  const loadTasks = useCallback(async () => {
    try {
      const r = await getAdminTasks(taskPage, 20);
      setTasks(r.list as AdminTask[]);
      setTaskTotal(r.total);
    } catch {
      /* ignore */
    }
  }, [taskPage]);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin, loadUsers]);
  useEffect(() => {
    if (isAdmin) loadTasks();
  }, [isAdmin, loadTasks]);

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await updateAdminUserStatus(user.id, user.status === 'active' ? 'disabled' : 'active');
      toast({ title: `已${user.status === 'active' ? '禁用' : '启用'}用户`, variant: 'success' });
      loadUsers();
    } catch (err: unknown) {
      toast({
        title: '操作失败',
        description: err instanceof Error ? err.message : '',
        variant: 'error',
      });
    }
  };

  const handleUpdateCredits = async () => {
    if (!creditsDialog.user || !creditsAmount) return;
    try {
      await updateAdminUserCredits(creditsDialog.user.id, Number(creditsAmount));
      toast({ title: '积分已更新', variant: 'success' });
      setCreditsDialog({ open: false, user: null });
      setCreditsAmount('');
      loadUsers();
    } catch (err: unknown) {
      toast({
        title: '操作失败',
        description: err instanceof Error ? err.message : '',
        variant: 'error',
      });
    }
  };

  if (authLoading || !isLoggedIn) return null;
  if (!loading && !isAdmin)
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">无权访问</h1>
          <p className="mt-2 text-muted-foreground">此页面仅管理员可访问</p>
        </div>
      </PageTransition>
    );

  const statCards = stats
    ? [
        {
          icon: Users,
          label: '总用户',
          value: stats.totalUsers,
          color: 'from-blue-500 to-indigo-500',
        },
        {
          icon: UserPlus,
          label: '今日新增',
          value: stats.todayUsers,
          color: 'from-emerald-500 to-green-500',
        },
        {
          icon: FileCheck2,
          label: '总任务',
          value: stats.totalTasks,
          color: 'from-violet-500 to-purple-500',
        },
        {
          icon: Clock,
          label: '今日任务',
          value: stats.todayTasks,
          color: 'from-amber-500 to-orange-500',
        },
        {
          icon: CreditCard,
          label: '总积分消耗',
          value: stats.totalCreditsSpent,
          color: 'from-pink-500 to-rose-500',
        },
        {
          icon: Activity,
          label: '排队中',
          value: stats.queuedTasks,
          color: 'from-cyan-500 to-teal-500',
        },
      ]
    : [];

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList variant="underline" className="mb-6">
              <TabsTrigger value="overview" variant="underline">
                系统总览
              </TabsTrigger>
              <TabsTrigger value="users" variant="underline">
                用户管理
              </TabsTrigger>
              <TabsTrigger value="tasks" variant="underline">
                任务记录
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Card key={card.label} className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm text-muted-foreground">{card.label}</span>
                      </div>
                      <p className="text-3xl font-bold">
                        <AnimatedCounter target={card.value} duration={1200} />
                      </p>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索用户..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setUserPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          ID
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          邮箱
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          角色
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          状态
                        </th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                          积分
                        </th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3 text-muted-foreground">{user.id}</td>
                          <td className="px-4 py-3">{user.email || '—'}</td>
                          <td className="px-4 py-3">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                              {user.status === 'active' ? '正常' : '禁用'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {user.creditsBalance}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setCreditsDialog({ open: true, user })}
                              >
                                <CreditCard className="h-3.5 w-3.5" /> 积分
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleToggleStatus(user)}
                              >
                                {user.status === 'active' ? (
                                  <Ban className="h-3.5 w-3.5 text-destructive" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              {userTotal > 20 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {userPage} / {Math.ceil(userTotal / 20)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={userPage >= Math.ceil(userTotal / 20)}
                    onClick={() => setUserPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          任务号
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          用户
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          类型
                        </th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                          状态
                        </th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                          积分
                        </th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                          时间
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs">
                            {task.taskNo.slice(0, 8)}...
                          </td>
                          <td className="px-4 py-3">#{task.userId}</td>
                          <td className="px-4 py-3">{task.type}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                task.status === 'completed'
                                  ? 'success'
                                  : task.status === 'failed'
                                    ? 'destructive'
                                    : task.status === 'processing'
                                      ? 'default'
                                      : 'secondary'
                              }
                            >
                              {task.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">{task.creditsCost}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                            {new Date(task.createdAt).toLocaleString('zh-CN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              {taskTotal > 20 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={taskPage <= 1}
                    onClick={() => setTaskPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {taskPage} / {Math.ceil(taskTotal / 20)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={taskPage >= Math.ceil(taskTotal / 20)}
                    onClick={() => setTaskPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Credits Dialog */}
        <Dialog
          open={creditsDialog.open}
          onOpenChange={(open) =>
            setCreditsDialog({ open, user: open ? creditsDialog.user : null })
          }
        >
          <DialogContent onClose={() => setCreditsDialog({ open: false, user: null })}>
            <DialogHeader>
              <DialogTitle>调整积分</DialogTitle>
              <DialogDescription>为用户 {creditsDialog.user?.email} 调整积分余额</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 mt-4">
              <Label>积分变动量 (正数增加，负数减少)</Label>
              <Input
                type="number"
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(e.target.value)}
                placeholder="例如: 10 或 -5"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreditsDialog({ open: false, user: null })}
              >
                取消
              </Button>
              <Button onClick={handleUpdateCredits} disabled={!creditsAmount}>
                确认
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
