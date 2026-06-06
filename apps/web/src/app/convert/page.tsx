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
    title: '图片工具',
    icon: '✂️',
    tools: [
      { type: 'image-crop', label: '图片裁剪' },
      { type: 'image-rotate', label: '图片旋转' },
      { type: 'image-watermark', label: '图片水印' },
      { type: 'image-resize', label: '图片缩放' },
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
  {
    title: 'PDF 工具',
    icon: '📑',
    tools: [
      { type: 'pdf-merge', label: 'PDF 合并' },
      { type: 'pdf-split', label: 'PDF 拆分' },
      { type: 'pdf-watermark', label: 'PDF 水印' },
      { type: 'pdf-compress', label: 'PDF 压缩' },
    ],
  },
  {
    title: '视频转换',
    icon: '🎬',
    tools: [
      { type: 'video-to-mp4', label: '视频 → MP4' },
      { type: 'video-to-avi', label: '视频 → AVI' },
      { type: 'video-to-mkv', label: '视频 → MKV' },
      { type: 'video-to-mov', label: '视频 → MOV' },
      { type: 'video-to-webm', label: '视频 → WebM' },
    ],
  },
  {
    title: '音频转换',
    icon: '🎵',
    tools: [
      { type: 'audio-to-mp3', label: '音频 → MP3' },
      { type: 'audio-to-wav', label: '音频 → WAV' },
      { type: 'audio-to-flac', label: '音频 → FLAC' },
      { type: 'audio-to-aac', label: '音频 → AAC' },
      { type: 'audio-to-ogg', label: '音频 → OGG' },
    ],
  },
  {
    title: '音视频工具',
    icon: '🎞️',
    tools: [
      { type: 'video-extract-audio', label: '提取音频' },
      { type: 'video-trim', label: '视频裁剪' },
      { type: 'audio-trim', label: '音频裁剪' },
      { type: 'video-screenshot', label: '视频截图' },
      { type: 'video-to-gif', label: '视频转 GIF' },
      { type: 'video-compress', label: '视频压缩' },
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
      </main>
    </div>
  );
}
