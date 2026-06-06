import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://122.51.235.145';

const CONVERT_TYPES = [
  // 图片转换
  'png-to-jpg',
  'jpg-to-png',
  'png-to-webp',
  'jpg-to-webp',
  'webp-to-png',
  'webp-to-jpg',
  'image-compress',
  'image-crop',
  'image-rotate',
  'image-watermark',
  'image-resize',
  // 文档转换
  'pdf-to-word',
  'word-to-pdf',
  'pdf-to-excel',
  'excel-to-pdf',
  'pdf-to-ppt',
  'ppt-to-pdf',
  'markdown-to-pdf',
  // PDF工具
  'pdf-merge',
  'pdf-split',
  'pdf-watermark',
  'pdf-compress',
  // 视频转换
  'video-to-mp4',
  'video-to-avi',
  'video-to-mkv',
  'video-trim',
  'video-screenshot',
  'video-to-gif',
  'video-compress',
  'video-extract-audio',
  // 音频转换
  'audio-to-mp3',
  'audio-to-wav',
  'audio-trim',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/convert`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const typePages: MetadataRoute.Sitemap = CONVERT_TYPES.map((type) => ({
    url: `${BASE_URL}/convert/${type}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...typePages];
}
