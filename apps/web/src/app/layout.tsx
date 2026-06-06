import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FileShift - 在线文件格式转换工具',
  description: '支持文档、图片、音视频格式转换，文件压缩，PDF工具等一站式文件处理平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
