'use client';

import { ThemeProvider } from 'next-themes';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/design', label: 'Style Guide' },
  { href: '/design/home', label: '首页' },
  { href: '/design/auth/login', label: '登录' },
  { href: '/design/auth/register', label: '注册' },
  { href: '/design/convert', label: '转换中心' },
  { href: '/design/convert/png-to-jpg', label: '转换详情' },
  { href: '/design/profile', label: '个人中心' },
  { href: '/design/tasks', label: '转换历史' },
  { href: '/design/admin', label: '管理后台' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
    >
      {theme === 'dark' ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
      {theme === 'dark' ? '浅色' : '深色'}
    </button>
  );
}

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        {/* 设计导航栏 */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/design" className="text-sm font-bold gradient-text">
                  FileShift Design
                </Link>
                <div className="hidden md:flex items-center gap-1 overflow-x-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${
                        pathname === item.href
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* 页面内容 */}
        <main>{children}</main>
      </div>
    </ThemeProvider>
  );
}
