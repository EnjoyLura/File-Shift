'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DesignRegisterPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = () => {
    if (!email) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setCountdown(60);
      setCode('123456');
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex">
      {/* 左侧品牌区 */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-hero items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
            style={{ animation: 'float 8s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-20 left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"
            style={{ animation: 'float 6s ease-in-out infinite 2s' }}
          />
        </div>

        <div className="relative text-center text-white space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold">加入 FileShift</h2>
          <p className="text-blue-100/80 text-lg">开启高效文件处理之旅</p>
          <div className="flex items-center justify-center gap-6 text-sm text-blue-200/70">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              注册送50积分
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              34+专业工具
            </div>
          </div>
        </div>
      </div>

      {/* 右侧表单区 */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="lg:hidden text-center mb-4">
            <span className="text-2xl font-bold gradient-text">FileShift</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">创建账户</h1>
            <p className="text-muted-foreground">注册即送 50 积分，立即体验</p>
          </div>

          {/* 开发模式提示 */}
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            开发模式：验证码将自动填入
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            {/* 邮箱 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">邮箱地址</label>
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* 验证码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">邮箱验证码</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6位验证码"
                    maxLength={6}
                    className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || !email || sending}
                  className="whitespace-nowrap rounded-xl border border-primary text-primary px-4 py-3 text-sm font-medium transition-all hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground"
                >
                  {sending ? '发送中...' : countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">设置密码</label>
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6位密码"
                  className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* 邀请码 - 可折叠 */}
            <div className="space-y-2">
              {!showInvite ? (
                <button
                  type="button"
                  onClick={() => setShowInvite(true)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  有邀请码？点击填写
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="text-sm font-medium">邀请码（可选）</label>
                  <div className="relative mt-2">
                    <svg
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="输入邀请码"
                      className="w-full rounded-xl border border-border bg-background pl-11 pr-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              className="w-full gradient-brand text-white rounded-xl py-3 text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
            >
              注册 — 获得 50 积分
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            已有账号？{' '}
            <Link href="/design/auth/login" className="text-primary font-medium hover:underline">
              立即登录
            </Link>
          </p>

          <div className="text-center">
            <Link
              href="/design/home"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
