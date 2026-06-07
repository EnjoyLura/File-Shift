'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Image,
  FileText,
  Video,
  BookOpen,
  Scissors,
  Music,
  Film,
  Sparkles,
} from 'lucide-react';
import { CREDIT_COSTS } from '@fileshift/constants';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/components/hooks/use-auth';
import { useDebounce } from '@/components/hooks/use-debounce';
import { stagger, fadeUp } from '@/components/shared/animations';
import { PageTransition } from '@/components/shared/page-transition';

const TOOL_GROUPS = [
  {
    title: '图片转换',
    icon: Image,
    category: 'image',
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
    icon: Scissors,
    category: 'image',
    tools: [
      { type: 'image-crop', label: '图片裁剪' },
      { type: 'image-rotate', label: '图片旋转' },
      { type: 'image-watermark', label: '图片水印' },
      { type: 'image-resize', label: '图片缩放' },
    ],
  },
  {
    title: '文档转换',
    icon: FileText,
    category: 'document',
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
    icon: BookOpen,
    category: 'document',
    tools: [
      { type: 'pdf-merge', label: 'PDF 合并' },
      { type: 'pdf-split', label: 'PDF 拆分' },
      { type: 'pdf-watermark', label: 'PDF 水印' },
      { type: 'pdf-compress', label: 'PDF 压缩' },
    ],
  },
  {
    title: '视频转换',
    icon: Video,
    category: 'media',
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
    icon: Music,
    category: 'media',
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
    icon: Film,
    category: 'media',
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

const CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'image', label: '图片' },
  { value: 'document', label: '文档' },
  { value: 'media', label: '音视频' },
];

const groupColors = [
  'from-emerald-500 to-green-500',
  'from-cyan-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
  'from-indigo-500 to-blue-500',
  'from-pink-500 to-rose-500',
];

export default function DesignConvertPage() {
  const { isLoggedIn, loading } = useAuth(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const debouncedSearch = useDebounce(search);

  if (loading || !isLoggedIn) return null;

  const filteredGroups = TOOL_GROUPS.filter(
    (g) => activeCategory === 'all' || g.category === activeCategory,
  )
    .map((g) => ({
      ...g,
      tools: g.tools.filter(
        (t) => !debouncedSearch || t.label.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ),
    }))
    .filter((g) => g.tools.length > 0);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            转换中心
          </h1>
          <p className="mt-2 text-muted-foreground">选择需要的转换类型，上传文件即可开始转换</p>
        </div>

        {/* Search + Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索工具..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList variant="pills">
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} variant="pills">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Tool Groups */}
        {filteredGroups.length === 0 ? (
          <EmptyState
            icon={Search}
            title="没有找到匹配的工具"
            description="尝试使用不同的关键词或清除筛选"
          />
        ) : (
          <div className="space-y-10">
            {filteredGroups.map((group, gi) => {
              const Icon = group.icon;
              const color = groupColors[gi % groupColors.length];
              return (
                <section key={group.title}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold">{group.title}</h2>
                    <Badge variant="secondary">{group.tools.length}</Badge>
                  </div>
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-30px' }}
                    variants={stagger}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                  >
                    {group.tools.map((tool) => (
                      <motion.div key={tool.type} variants={fadeUp}>
                        <Link
                          href={`/convert/${tool.type}`}
                          className="group block rounded-xl border border-border bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
                        >
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {tool.label}
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-primary fill-primary" />
                            <span className="text-xs font-medium text-muted-foreground">
                              {CREDIT_COSTS[tool.type] ?? 1}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
