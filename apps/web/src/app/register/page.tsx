'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { register, sendCode } from '@/lib/api';
import { fadeIn } from '@/components/shared/animations';

const highlights = ['34+ 种文件处理工具', '注册即送 50 积分', '秒级转换速度', '邀请好友再送积分'];

function getPasswordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const labels = ['极弱', '弱', '一般', '较强', '强', '非常强'];
  return { score: Math.min(score, 5), label: labels[Math.min(score, 5)] };
}

export default function DesignRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devCode, setDevCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSendCode = useCallback(async () => {
    if (!email || countdown > 0) return;
    try {
      setError('');
      const result = await sendCode(email, 'register');
      setCodeSent(true);
      if (result.devCode) {
        setDevCode(result.devCode);
        setCode(result.devCode);
      }
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发送验证码失败');
    }
  }, [email, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register({ email, password, code, inviteCode: inviteCode || undefined });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      router.push('/profile');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left Brand Panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-[45%] gradient-hero relative overflow-hidden flex-col justify-between p-12 text-white"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"
            style={{ animation: 'float 8s ease-in-out infinite' }}
          />
          <div
            className="absolute bottom-20 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"
            style={{ animation: 'float 6s ease-in-out infinite 2s' }}
          />
        </div>
        <div className="relative">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">FileShift</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            加入 FileShift
            <br />
            <span className="text-blue-200">开启高效文件处理之旅</span>
          </h2>
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2 text-blue-100/90">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-blue-200/60">© 2024 FileShift. All rights reserved.</p>
      </motion.div>

      {/* Right Form */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center p-6"
      >
        <Card className="w-full max-w-md border-0 shadow-none md:border md:shadow-sm">
          <CardHeader className="text-center space-y-2">
            <Link href="/" className="flex items-center justify-center gap-2 mb-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">FileShift</span>
            </Link>
            <CardTitle className="text-2xl">创建账号</CardTitle>
            <CardDescription>注册即可获得 50 积分</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>验证码</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="请输入验证码"
                      value={code}
                      maxLength={6}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={!email || countdown > 0}
                  >
                    {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '发送验证码'}
                  </Button>
                </div>
                {devCode && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20 p-2.5 text-xs text-amber-700 dark:text-amber-400">
                    [开发模式] 验证码已自动填入:{' '}
                    <span className="font-mono font-bold">{devCode}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="至少6位，含字母和数字"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="space-y-1">
                    <Progress
                      value={strength.score}
                      max={5}
                      variant={strength.score >= 3 ? 'success' : 'default'}
                    />
                    <p className="text-xs text-muted-foreground">密码强度: {strength.label}</p>
                  </div>
                )}
              </div>

              {/* Invite Code - collapsible */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowInvite(!showInvite)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showInvite ? '收起邀请码' : '有邀请码？'}
                </button>
                {showInvite && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-2 space-y-2"
                  >
                    <Input
                      placeholder="请输入邀请码"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />
                  </motion.div>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> 注册中...
                  </>
                ) : (
                  <>
                    注册 <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              已有账号？{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                立即登录
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
