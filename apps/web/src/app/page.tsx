'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CREDIT_COSTS } from '@fileshift/constants';

export default function Home() {
  const totalFeatures = Object.keys(CREDIT_COSTS).length;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {/* 顶部导航 */}
      <nav className="mb-12 flex w-full max-w-4xl items-center justify-between">
        <h1 className="text-xl font-bold text-primary">FileShift</h1>
        <div className="flex gap-4">
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
      </nav>

      {/* Hero */}
      <div className="max-w-2xl text-center">
        <h2 className="mb-4 text-4xl font-bold">在线文件格式转换工具</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          支持文档、图片、音视频格式转换与压缩，一站式文件处理平台
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-6 transition-shadow hover:shadow-md">
            <h3 className="mb-2 font-semibold">文档转换</h3>
            <p className="text-sm text-muted-foreground">PDF、Word、Excel 等格式互转</p>
          </div>
          <div className="rounded-lg border p-6 transition-shadow hover:shadow-md">
            <h3 className="mb-2 font-semibold">图片处理</h3>
            <p className="text-sm text-muted-foreground">格式转换、压缩、裁剪、去背景</p>
          </div>
          <div className="rounded-lg border p-6 transition-shadow hover:shadow-md">
            <h3 className="mb-2 font-semibold">音视频</h3>
            <p className="text-sm text-muted-foreground">格式转换、压缩、裁剪、GIF制作</p>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          共支持 {totalFeatures} 种转换功能 · 新用户赠送 50 积分
        </p>

        {!isLoggedIn && (
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block rounded-md bg-primary px-8 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              免费注册体验
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
