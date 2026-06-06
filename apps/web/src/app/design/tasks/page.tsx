'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const statusTabs = ['全部', '已完成', '处理中', '排队中', '失败'] as const;
const typeTabs = ['全部', '图片', '文档', 'PDF', '音视频'] as const;

const tasks = [
  {
    id: 1,
    name: 'screenshot-2024.png',
    type: 'PNG 转 JPG',
    cat: '图片',
    status: '已完成',
    credits: 1,
    time: '2024-12-05 14:32',
  },
  {
    id: 2,
    name: 'report-final.pdf',
    type: 'PDF 转 Word',
    cat: '文档',
    status: '已完成',
    credits: 3,
    time: '2024-12-05 13:18',
  },
  {
    id: 3,
    name: 'presentation.pptx',
    type: 'PPT 转 PDF',
    cat: '文档',
    status: '处理中',
    credits: 2,
    time: '2024-12-05 13:15',
  },
  {
    id: 4,
    name: 'photo-001.heic',
    type: 'HEIC 转 JPG',
    cat: '图片',
    status: '已完成',
    credits: 1,
    time: '2024-12-04 18:42',
  },
  {
    id: 5,
    name: 'video-demo.mp4',
    type: 'MP4 转 AVI',
    cat: '音视频',
    status: '失败',
    credits: 0,
    time: '2024-12-04 17:30',
  },
  {
    id: 6,
    name: 'document.pdf',
    type: 'PDF 合并',
    cat: 'PDF',
    status: '已完成',
    credits: 2,
    time: '2024-12-04 16:22',
  },
  {
    id: 7,
    name: 'banner.png',
    type: '图片压缩',
    cat: '图片',
    status: '已完成',
    credits: 1,
    time: '2024-12-03 15:10',
  },
  {
    id: 8,
    name: 'interview.mp3',
    type: 'MP3 转 WAV',
    cat: '音视频',
    status: '排队中',
    credits: 3,
    time: '2024-12-03 14:55',
  },
  {
    id: 9,
    name: 'scan-001.pdf',
    type: 'PDF 拆分',
    cat: 'PDF',
    status: '已完成',
    credits: 2,
    time: '2024-12-03 11:30',
  },
  {
    id: 10,
    name: 'logo.png',
    type: 'PNG 转 ICO',
    cat: '图片',
    status: '已完成',
    credits: 1,
    time: '2024-12-02 10:15',
  },
];

const statusColor: Record<string, string> = {
  已完成: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  处理中: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  排队中: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  失败: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

const catIcon: Record<string, string> = {
  图片: '🖼️',
  文档: '📄',
  PDF: '📕',
  音视频: '🎬',
};

const stagger = { visible: { transition: { staggerChildren: 0.05 } } };
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DesignTasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [typeFilter, setTypeFilter] = useState<string>('全部');

  const filtered = tasks.filter((t) => {
    const matchStatus = statusFilter === '全部' || t.status === statusFilter;
    const matchType = typeFilter === '全部' || t.cat === typeFilter;
    return matchStatus && matchType;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold tracking-tight mb-8"
      >
        转换历史
      </motion.h1>

      {/* 状态筛选 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              statusFilter === tab
                ? 'gradient-brand text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 类型筛选 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {typeTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setTypeFilter(tab)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all border ${
              typeFilter === tab
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 任务列表 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={statusFilter + typeFilter}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          variants={stagger}
          className="space-y-2"
        >
          {filtered.map((task) => (
            <motion.div
              key={task.id}
              variants={fadeIn}
              layout
              className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5 hover:border-primary/20"
            >
              {/* 左侧渐变条 */}
              <div className="w-1 h-10 rounded-full bg-gradient-to-b from-primary/40 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* 类型图标 */}
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">
                {catIcon[task.cat] || '📄'}
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{task.type}</span>
                  <span>·</span>
                  <span>{task.time}</span>
                </div>
              </div>

              {/* 状态 */}
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${statusColor[task.status]}`}
              >
                {task.status}
              </span>

              {/* 积分 */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0 w-16 text-right">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8"
                  />
                </svg>
                {task.credits}
              </div>

              {/* 操作 */}
              <div className="flex items-center gap-1 shrink-0">
                {task.status === '已完成' && (
                  <button
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary hover:bg-primary/5"
                    title="下载"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                )}
                <button
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/5"
                  title="删除"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📋</p>
          <p>暂无转换记录</p>
        </div>
      )}

      {/* 分页 */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-50"
          disabled
        >
          上一页
        </button>
        <span className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium">
          1
        </span>
        <button className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent">
          2
        </button>
        <button className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent">
          下一页
        </button>
      </div>
    </div>
  );
}
