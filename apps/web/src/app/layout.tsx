import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'FileShift - 在线文件格式转换工具',
    template: '%s | FileShift',
  },
  description:
    'FileShift 是一款在线文件格式转换工具，支持图片、文档、PDF、音视频格式转换，以及图片裁剪、旋转、水印、PDF合并、拆分等一站式文件处理。',
  keywords: [
    '文件转换',
    '格式转换',
    'PDF转换',
    '图片转换',
    '视频转换',
    '音频转换',
    '在线工具',
    'FileShift',
  ],
  openGraph: {
    title: 'FileShift - 在线文件格式转换工具',
    description: '支持图片、文档、PDF、音视频格式转换的一站式文件处理平台',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
