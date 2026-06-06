import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '转换中心',
  description: '在线转换图片、文档、PDF、音视频文件，支持格式转换、压缩、裁剪、水印等操作',
};

export default function ConvertLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
