'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const tabs = ['全部', '图片', '文档', 'PDF', '视频', '音频', '工具'] as const;

const tools = [
  // 图片转换
  {
    name: 'PNG 转 JPG',
    type: 'png-to-jpg',
    cat: '图片',
    icon: '🖼️',
    color: 'bg-emerald-500',
    credits: 1,
  },
  {
    name: 'JPG 转 PNG',
    type: 'jpg-to-png',
    cat: '图片',
    icon: '🖼️',
    color: 'bg-emerald-500',
    credits: 1,
  },
  {
    name: 'PNG/JPG 转 WebP',
    type: 'image-to-webp',
    cat: '图片',
    icon: '🌐',
    color: 'bg-emerald-500',
    credits: 1,
  },
  {
    name: 'WebP 转 PNG/JPG',
    type: 'webp-to-image',
    cat: '图片',
    icon: '🖼️',
    color: 'bg-emerald-500',
    credits: 1,
  },
  {
    name: 'HEIC 转 JPG',
    type: 'heic-to-jpg',
    cat: '图片',
    icon: '📱',
    color: 'bg-emerald-500',
    credits: 1,
  },
  {
    name: 'PNG 转 ICO',
    type: 'png-to-ico',
    cat: '图片',
    icon: '🔲',
    color: 'bg-emerald-500',
    credits: 1,
  },
  {
    name: 'GIF 转 PNG/JPG',
    type: 'gif-to-image',
    cat: '图片',
    icon: '🎞️',
    color: 'bg-emerald-500',
    credits: 1,
  },
  // 文档转换
  {
    name: 'PDF 转 Word',
    type: 'pdf-to-word',
    cat: '文档',
    icon: '📝',
    color: 'bg-rose-500',
    credits: 3,
  },
  {
    name: 'Word 转 PDF',
    type: 'word-to-pdf',
    cat: '文档',
    icon: '📄',
    color: 'bg-rose-500',
    credits: 2,
  },
  {
    name: 'PDF 转 Excel',
    type: 'pdf-to-excel',
    cat: '文档',
    icon: '📊',
    color: 'bg-rose-500',
    credits: 5,
  },
  {
    name: 'Excel 转 PDF',
    type: 'excel-to-pdf',
    cat: '文档',
    icon: '📈',
    color: 'bg-rose-500',
    credits: 2,
  },
  {
    name: 'PDF 转 PPT',
    type: 'pdf-to-ppt',
    cat: '文档',
    icon: '📊',
    color: 'bg-rose-500',
    credits: 5,
  },
  {
    name: 'PPT 转 PDF',
    type: 'ppt-to-pdf',
    cat: '文档',
    icon: '📑',
    color: 'bg-rose-500',
    credits: 2,
  },
  {
    name: 'PDF 转图片',
    type: 'pdf-to-image',
    cat: '文档',
    icon: '🖼️',
    color: 'bg-rose-500',
    credits: 2,
  },
  // PDF 工具
  {
    name: '图片转 PDF',
    type: 'image-to-pdf',
    cat: 'PDF',
    icon: '📕',
    color: 'bg-amber-500',
    credits: 2,
  },
  {
    name: 'PDF 合并',
    type: 'pdf-merge',
    cat: 'PDF',
    icon: '📎',
    color: 'bg-amber-500',
    credits: 2,
  },
  {
    name: 'PDF 拆分',
    type: 'pdf-split',
    cat: 'PDF',
    icon: '✂️',
    color: 'bg-amber-500',
    credits: 2,
  },
  {
    name: 'PDF 压缩',
    type: 'pdf-compress',
    cat: 'PDF',
    icon: '📦',
    color: 'bg-amber-500',
    credits: 2,
  },
  {
    name: 'PDF 加水印',
    type: 'pdf-watermark',
    cat: 'PDF',
    icon: '💧',
    color: 'bg-amber-500',
    credits: 3,
  },
  // 视频转换
  {
    name: 'MP4 转 AVI',
    type: 'mp4-to-avi',
    cat: '视频',
    icon: '🎬',
    color: 'bg-violet-500',
    credits: 5,
  },
  {
    name: 'AVI 转 MP4',
    type: 'avi-to-mp4',
    cat: '视频',
    icon: '🎥',
    color: 'bg-violet-500',
    credits: 5,
  },
  {
    name: 'MP4 转 MKV',
    type: 'mp4-to-mkv',
    cat: '视频',
    icon: '📽️',
    color: 'bg-violet-500',
    credits: 5,
  },
  {
    name: 'FLV 转 MP4',
    type: 'flv-to-mp4',
    cat: '视频',
    icon: '🎞️',
    color: 'bg-violet-500',
    credits: 5,
  },
  {
    name: '视频提取音频',
    type: 'video-to-audio',
    cat: '视频',
    icon: '🎵',
    color: 'bg-violet-500',
    credits: 3,
  },
  // 音频转换
  {
    name: 'MP3 转 WAV',
    type: 'mp3-to-wav',
    cat: '音频',
    icon: '🎵',
    color: 'bg-indigo-500',
    credits: 3,
  },
  {
    name: 'WAV 转 MP3',
    type: 'wav-to-mp3',
    cat: '音频',
    icon: '🎶',
    color: 'bg-indigo-500',
    credits: 3,
  },
  {
    name: 'MP3 转 AAC',
    type: 'mp3-to-aac',
    cat: '音频',
    icon: '🎧',
    color: 'bg-indigo-500',
    credits: 3,
  },
  {
    name: 'OGG 转 MP3',
    type: 'ogg-to-mp3',
    cat: '音频',
    icon: '🔊',
    color: 'bg-indigo-500',
    credits: 3,
  },
  // 工具
  {
    name: '图片压缩',
    type: 'image-compress',
    cat: '工具',
    icon: '🗜️',
    color: 'bg-cyan-500',
    credits: 1,
  },
  {
    name: '图片裁剪',
    type: 'image-crop',
    cat: '工具',
    icon: '✂️',
    color: 'bg-cyan-500',
    credits: 1,
  },
  {
    name: '图片旋转',
    type: 'image-rotate',
    cat: '工具',
    icon: '🔄',
    color: 'bg-cyan-500',
    credits: 1,
  },
  {
    name: '图片加水印',
    type: 'image-watermark',
    cat: '工具',
    icon: '💧',
    color: 'bg-cyan-500',
    credits: 2,
  },
  {
    name: '视频压缩',
    type: 'video-compress',
    cat: '工具',
    icon: '📦',
    color: 'bg-cyan-500',
    credits: 5,
  },
  {
    name: '视频裁剪',
    type: 'video-trim',
    cat: '工具',
    icon: '✂️',
    color: 'bg-cyan-500',
    credits: 3,
  },
  {
    name: '视频截图',
    type: 'video-screenshot',
    cat: '工具',
    icon: '📸',
    color: 'bg-cyan-500',
    credits: 2,
  },
  {
    name: 'GIF 制作',
    type: 'video-to-gif',
    cat: '工具',
    icon: '🎞️',
    color: 'bg-cyan-500',
    credits: 3,
  },
  {
    name: '音频裁剪',
    type: 'audio-trim',
    cat: '工具',
    icon: '🎵',
    color: 'bg-cyan-500',
    credits: 3,
  },
];

const stagger = {
  visible: { transition: { staggerChildren: 0.04 } },
};
const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DesignConvertPage() {
  const [activeTab, setActiveTab] = useState<string>('全部');
  const [search, setSearch] = useState('');

  const filtered = tools.filter((t) => {
    const matchTab = activeTab === '全部' || t.cat === activeTab;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* 标题 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">转换中心</h1>
        <p className="mt-2 text-muted-foreground">34+ 种专业工具，覆盖文档、图片、音视频全场景</p>
      </motion.div>

      {/* 搜索 + 积分 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索工具..."
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl gradient-brand-subtle dark:bg-primary/5 px-4 py-2 text-sm">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold text-primary">50</span>
          <span className="text-muted-foreground">积分可用</span>
        </div>
      </div>

      {/* 分类 Tab */}
      <div className="relative mb-8 overflow-x-auto">
        <div className="flex items-center gap-1 border-b border-border pb-px min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                color: activeTab === tab ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 gradient-brand rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 工具网格 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + search}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
        >
          {filtered.map((tool) => (
            <motion.div key={tool.type} variants={fadeIn}>
              <Link
                href={`/design/convert/${tool.type}`}
                className="group block rounded-2xl border border-border bg-background p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center text-lg shadow-sm transition-transform group-hover:scale-110`}
                >
                  {tool.icon}
                </div>
                <h3 className="mt-3 font-medium text-sm leading-tight">{tool.name}</h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1"
                    />
                  </svg>
                  {tool.credits} 积分
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p>没有找到匹配的工具</p>
        </div>
      )}
    </div>
  );
}
