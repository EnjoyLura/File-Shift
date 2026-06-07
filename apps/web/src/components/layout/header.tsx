'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Menu,
  X,
  LayoutGrid,
  History,
  User,
  LogOut,
  ChevronRight,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/convert', label: '转换中心', icon: LayoutGrid },
  { href: '/tasks', label: '转换历史', icon: History },
];

export function DesignHeader() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState('U');
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
    // 尝试从缓存获取昵称首字母
    const cached = localStorage.getItem('userNickname');
    if (cached) setUserInitial(cached.charAt(0).toUpperCase());
    // 尝试从缓存获取积分
    const cachedCredits = localStorage.getItem('userCredits');
    if (cachedCredits) setUserCredits(Number(cachedCredits));
    // 如果已登录，获取最新积分
    if (token) {
      fetch('/api/v1/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.credits !== undefined) {
            setUserCredits(data.credits);
            localStorage.setItem('userCredits', String(data.credits));
          }
          if (data?.nickname) {
            setUserInitial(data.nickname.charAt(0).toUpperCase());
            localStorage.setItem('userNickname', data.nickname);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-border/60 bg-background/80 backdrop-blur-md shadow-sm'
            : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">FileShift</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isLoggedIn ? (
              <DropdownMenu
                trigger={
                  <button className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-accent">
                    <Avatar size="sm">
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                  </button>
                }
              >
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                {userCredits !== null && (
                  <div className="px-3 py-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary fill-primary" />
                    <span className="font-medium">{userCredits}</span>
                    <span>积分</span>
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => (window.location.href = '/profile')}>
                  <User className="mr-2 h-4 w-4" /> 个人中心
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => (window.location.href = '/tasks')}>
                  <History className="mr-2 h-4 w-4" /> 转换历史
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (window.location.href = '/profile?action=changePassword')}
                >
                  <Lock className="mr-2 h-4 w-4" /> 修改密码
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/';
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> 退出登录
                </DropdownMenuItem>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">登录</Link>
                </Button>
                <Button variant="brand" size="sm" asChild>
                  <Link href="/register">免费注册</Link>
                </Button>
              </div>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 z-50 h-full w-72 border-l border-border bg-background p-6 md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold gradient-text">FileShift</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="space-y-1">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-primary bg-primary/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Link>
                  );
                })}
                {isLoggedIn && (
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <User className="h-4 w-4" />
                    个人中心
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </Link>
                )}
              </nav>

              {!isLoggedIn && (
                <div className="mt-8 space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">登录</Link>
                  </Button>
                  <Button variant="brand" className="w-full" asChild>
                    <Link href="/register">免费注册</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
