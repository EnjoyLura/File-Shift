'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CREDIT_COSTS } from '@fileshift/constants';
import { Header } from '@/components/layout/header';

/** 转换工具分类配置 */
const TOOL_GROUPS = [
  {
    title: '图片转换',
    icon: '🖼️',
    tools: [
      { type: 'png-to-jpg', label: 'PNG → JPG' },
      { type: 'jpg-to-png', label: 'JPG → PNG' },
      { type: 'png-to-webp', label: 'PNG → WebP' },
      { type: 'jpg-to-webp', label: 'JPG → WebP' },
      { type: 'webp-to-png', label: 'WebP → PNG' },
      { type: 'webp-to-jpg', label: 'WebP → JPG' },
      { type: 'image-compress', label: '图片压缩' },
    ],
  },
  {
    title: '文档转换',
    icon: '📄',
    tools: [
      { type: 'pdf-to-word', label: 'PDF → Word' },
      { type: 'word-to-pdf', label: 'Word → PDF' },
      { type: 'pdf-to-excel', label: 'PDF → Excel' },
      { type: 'excel-to-pdf', label: 'Excel → PDF' },
      { type: 'pdf-to-ppt', label: 'PDF → PPT' },
      { type: 'ppt-to-pdf', label: 'PPT → PDF' },
      { type: 'markdown-to-pdf', label: 'Markdown → PDF' },
    ],
  },
];

export default function ConvertPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoggedIn(true);
  }, [router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">转换中心</h1>
        <p className="mb-8 text-muted-foreground">选择需要的转换类型，上传文件即可开始转换</p>

        {TOOL_GROUPS.map((group) => (
          <section key={group.title} className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <span>{group.icon}</span>
              {group.title}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {group.tools.map((tool) => (
                <Link
                  key={tool.type}
                  href={`/convert/${tool.type}`}
                  className="group rounded-lg border p-4 transition-all hover:border-primary hover:shadow-sm"
                >
                  <p className="mb-1 text-sm font-medium group-hover:text-primary">{tool.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {CREDIT_COSTS[tool.type] ?? 1} 积分
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          更多格式转换功能（音视频、压缩解压等）即将上线，敬请期待！
        </div>
      </main>
    </div>
  );
}
