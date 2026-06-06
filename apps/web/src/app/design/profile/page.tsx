'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{count}</>;
}

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const inviteHistory = [
  { email: 'user***@gmail.com', date: '2024-12-01', credits: 20 },
  { email: 'test***@qq.com', date: '2024-11-15', credits: 20 },
];

export default function DesignProfilePage() {
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState('FileShift 用户');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold tracking-tight mb-8"
      >
        个人中心
      </motion.h1>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* 用户信息卡 */}
        <motion.div
          variants={fadeUp}
          className="md:col-span-2 rounded-2xl border border-border p-6 space-y-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white text-xl font-bold">
                {nickname.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold">{nickname}</h2>
                <p className="text-sm text-muted-foreground">user@example.com</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-medium">
              正常
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-muted-foreground text-xs">角色</p>
              <p className="font-medium mt-0.5">普通用户</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-muted-foreground text-xs">注册时间</p>
              <p className="font-medium mt-0.5">2024-10-15</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-muted-foreground text-xs">邀请码</p>
              <p className="font-medium mt-0.5 font-mono">ABC123</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-muted-foreground text-xs">已邀请</p>
              <p className="font-medium mt-0.5">2 人</p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-accent"
            >
              {editing ? '取消编辑' : '编辑昵称'}
            </button>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-accent"
            >
              {showPassword ? '收起' : '修改密码'}
            </button>
          </div>

          {/* 编辑昵称 */}
          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-3">
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    onClick={() => setEditing(false)}
                    className="gradient-brand text-white rounded-xl px-5 py-2.5 text-sm font-medium"
                  >
                    保存
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 修改密码 */}
          <AnimatePresence>
            {showPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-3"
              >
                <input
                  type="password"
                  placeholder="当前密码"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  type="password"
                  placeholder="新密码"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  onClick={() => setShowPassword(false)}
                  className="gradient-brand text-white rounded-xl px-5 py-2.5 text-sm font-medium"
                >
                  确认修改
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 积分余额卡 */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">积分余额</h3>
          <p className="text-5xl font-extrabold gradient-text">
            <AnimatedCounter target={49} />
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">累计获得</span>
              <span className="font-medium">70</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">累计消费</span>
              <span className="font-medium">21</span>
            </div>
          </div>
          <button className="w-full gradient-brand text-white rounded-xl py-2.5 text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/25">
            充值积分
          </button>
        </motion.div>

        {/* 邀请好友卡 */}
        <motion.div
          variants={fadeUp}
          className="md:col-span-3 rounded-2xl border border-border p-6 space-y-5"
        >
          <h3 className="text-lg font-bold">邀请好友</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl gradient-brand-subtle dark:bg-primary/5 p-4 text-center">
              <p className="text-2xl font-bold text-primary">2</p>
              <p className="text-xs text-muted-foreground mt-1">已邀请人数</p>
            </div>
            <div className="rounded-xl gradient-brand-subtle dark:bg-primary/5 p-4 text-center">
              <p className="text-2xl font-bold text-primary">40</p>
              <p className="text-xs text-muted-foreground mt-1">累计获得积分</p>
            </div>
            <div className="rounded-xl gradient-brand-subtle dark:bg-primary/5 p-4 text-center">
              <p className="text-2xl font-bold text-primary">ABC123</p>
              <p className="text-xs text-muted-foreground mt-1">你的邀请码</p>
            </div>
          </div>

          {/* 邀请链接 */}
          <div className="flex gap-2">
            <input
              readOnly
              value="https://fileshift.com/register?ref=ABC123"
              className="flex-1 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground"
            />
            <button className="gradient-brand text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90">
              复制
            </button>
          </div>

          {/* 邀请记录 */}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                    被邀请人
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                    注册日期
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">
                    获得积分
                  </th>
                </tr>
              </thead>
              <tbody>
                {inviteHistory.map((inv, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2.5">{inv.email}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{inv.date}</td>
                    <td className="px-4 py-2.5 text-right text-primary font-medium">
                      +{inv.credits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 操作列表 */}
        <motion.div
          variants={fadeUp}
          className="md:col-span-3 rounded-2xl border border-border p-1"
        >
          <div className="grid grid-cols-1 md:grid-cols-3">
            <Link
              href="/design/tasks"
              className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-accent group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">转换历史</p>
                <p className="text-xs text-muted-foreground">查看所有转换记录</p>
              </div>
              <svg
                className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="/design/admin"
              className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-accent group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">管理后台</p>
                <p className="text-xs text-muted-foreground">系统管理与统计</p>
              </div>
              <svg
                className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <button className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/5 group w-full text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-rose-600 dark:text-rose-400">退出登录</p>
                <p className="text-xs text-muted-foreground">退出当前账户</p>
              </div>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
