'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  User,
  CreditCard,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  Pencil,
  Lock,
  Copy,
  CheckCircle2,
  Mail,
  Calendar,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/shared/page-transition';
import { AnimatedCounter } from '@/components/shared/animated-counter';
import { useAuth } from '@/components/hooks/use-auth';
import { useClipboard } from '@/components/hooks/use-clipboard';
import { useToast } from '@/components/ui/toast';
import { getProfile, updateProfile, changePassword } from '@/lib/api';
import { stagger, fadeUp } from '@/components/shared/animations';

interface Profile {
  email: string;
  nickname: string;
  role: string;
  status: string;
  credits: number;
  inviteCode: string;
  inviteCount: number;
  createdAt: string;
  totalCreditsEarned?: number;
  totalCreditsSpent?: number;
}

export default function DesignProfilePage() {
  const { isLoggedIn, loading: authLoading, logout } = useAuth(true);
  const { toast } = useToast();
  const { copy, copied } = useClipboard();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const p = (await getProfile()) as unknown as Profile;
        setProfile(p);
        setNickname(p.nickname || '');
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn]);

  const handleSaveNickname = async () => {
    try {
      setSaving(true);
      await updateProfile({ nickname });
      setProfile((prev) => (prev ? { ...prev, nickname } : prev));
      setEditing(false);
      toast({ title: '昵称已更新', variant: 'success' });
    } catch (err: unknown) {
      toast({
        title: '更新失败',
        description: err instanceof Error ? err.message : '',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    try {
      setSaving(true);
      await changePassword(currentPassword, newPassword);
      setShowPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      toast({ title: '密码已修改', variant: 'success' });
    } catch (err: unknown) {
      toast({
        title: '修改失败',
        description: err instanceof Error ? err.message : '',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isLoggedIn) return null;

  const inviteLink = `https://fileshift.com/register?ref=${profile?.inviteCode || ''}`;

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">个人中心</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-64 md:col-span-2 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 md:col-span-3 rounded-2xl" />
          </div>
        ) : profile ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* User Info Card */}
            <motion.div variants={fadeUp} className="md:col-span-2">
              <Card className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar size="lg">
                      <AvatarFallback className="text-xl">
                        {(profile.nickname || 'U').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-bold">{profile.nickname || 'FileShift 用户'}</h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> {profile.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant={profile.status === 'active' ? 'success' : 'destructive'}>
                    {profile.status === 'active' ? '正常' : '已禁用'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    {
                      icon: Shield,
                      label: '角色',
                      value: profile.role === 'admin' ? '管理员' : '普通用户',
                    },
                    {
                      icon: Calendar,
                      label: '注册时间',
                      value: new Date(profile.createdAt).toLocaleDateString('zh-CN'),
                    },
                    { icon: Copy, label: '邀请码', value: profile.inviteCode, mono: true },
                    { icon: Users, label: '已邀请', value: `${profile.inviteCount} 人` },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-xl bg-muted/50 p-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Icon className="h-3 w-3" /> {item.label}
                        </div>
                        <p className={`font-medium mt-0.5 ${item.mono ? 'font-mono' : ''}`}>
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                    <Pencil className="h-3.5 w-3.5" /> {editing ? '取消编辑' : '编辑昵称'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Lock className="h-3.5 w-3.5" /> {showPassword ? '收起' : '修改密码'}
                  </Button>
                </div>

                <AnimatePresence>
                  {editing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-3">
                        <Input
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="新昵称"
                        />
                        <Button onClick={handleSaveNickname} disabled={saving} className="shrink-0">
                          {saving ? '保存中...' : '保存'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  {showPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      <div>
                        <Label className="text-xs">当前密码</Label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">新密码</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleChangePassword}
                        disabled={saving || !currentPassword || !newPassword}
                      >
                        {saving ? '提交中...' : '确认修改'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Credits Card */}
            <motion.div variants={fadeUp}>
              <Card className="p-6 space-y-4 h-full">
                <p className="text-sm font-semibold text-muted-foreground">积分余额</p>
                <p className="text-5xl font-extrabold gradient-text">
                  <AnimatedCounter target={profile.credits} />
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">累计获得</span>
                    <span className="font-medium">{profile.totalCreditsEarned ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">累计消费</span>
                    <span className="font-medium">{profile.totalCreditsSpent ?? '—'}</span>
                  </div>
                </div>
                <Button variant="brand" className="w-full" size="lg">
                  充值积分
                </Button>
              </Card>
            </motion.div>

            {/* Invite Card */}
            <motion.div variants={fadeUp} className="md:col-span-3">
              <Card className="p-6 space-y-5">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> 邀请好友
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: profile.inviteCount, label: '已邀请人数' },
                    { value: (profile.inviteCount || 0) * 20, label: '累计获得积分' },
                    { value: profile.inviteCode, label: '你的邀请码' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl gradient-brand-subtle p-4 text-center"
                    >
                      <p className="text-2xl font-bold text-primary">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input readOnly value={inviteLink} className="flex-1 text-muted-foreground" />
                  <Button variant="outline" onClick={() => copy(inviteLink)}>
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> 复制
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeUp} className="md:col-span-3">
              <Card className="p-1">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  {[
                    {
                      icon: ClipboardList,
                      label: '转换历史',
                      desc: '查看所有转换记录',
                      href: '/tasks',
                      color: 'text-blue-500 bg-blue-500/10',
                    },
                    {
                      icon: Settings,
                      label: '管理后台',
                      desc: '系统管理与统计',
                      href: '/admin',
                      color: 'text-purple-500 bg-purple-500/10',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-accent group"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </Link>
                    );
                  })}
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/5 w-full text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-rose-600 dark:text-rose-400">
                        退出登录
                      </p>
                      <p className="text-xs text-muted-foreground">退出当前账户</p>
                    </div>
                  </button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        ) : null}
      </div>
    </PageTransition>
  );
}
