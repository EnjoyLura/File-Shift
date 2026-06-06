'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-primary">
            FileShift
          </Link>
          {isLoggedIn && (
            <div className="flex items-center gap-4 text-sm">
              <Link href="/convert" className="text-muted-foreground hover:text-primary">
                转换中心
              </Link>
              <Link href="/tasks" className="text-muted-foreground hover:text-primary">
                转换历史
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary">
                个人中心
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
