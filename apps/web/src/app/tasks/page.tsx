'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ConversionTask, PaginatedData } from '@fileshift/shared-types';
import { Header } from '@/components/layout/header';
import { getTaskList, getDownloadUrl, deleteTask } from '@/lib/api';

const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'completed', label: '已完成' },
  { value: 'queued', label: '排队中' },
  { value: 'processing', label: '处理中' },
  { value: 'failed', label: '失败' },
];

const TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'image', label: '图片' },
  { value: 'document', label: '文档' },
  { value: 'pdf', label: 'PDF' },
  { value: 'media', label: '音视频' },
];

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: '等待中', className: 'text-muted-foreground' },
  queued: { label: '排队中', className: 'text-yellow-600' },
  processing: { label: '处理中', className: 'text-blue-600' },
  completed: { label: '已完成', className: 'text-green-600' },
  failed: { label: '失败', className: 'text-destructive' },
  cancelled: { label: '已取消', className: 'text-muted-foreground' },
};

const TYPE_LABELS: Record<string, string> = {
  'png-to-jpg': 'PNG → JPG',
  'jpg-to-png': 'JPG → PNG',
  'png-to-webp': 'PNG → WebP',
  'jpg-to-webp': 'JPG → WebP',
  'webp-to-png': 'WebP → PNG',
  'webp-to-jpg': 'WebP → JPG',
  'image-compress': '图片压缩',
  'image-crop': '图片裁剪',
  'image-rotate': '图片旋转',
  'image-watermark': '图片水印',
  'image-resize': '图片缩放',
  'pdf-to-word': 'PDF → Word',
  'word-to-pdf': 'Word → PDF',
  'pdf-to-excel': 'PDF → Excel',
  'excel-to-pdf': 'Excel → PDF',
  'pdf-to-ppt': 'PDF → PPT',
  'ppt-to-pdf': 'PPT → PDF',
  'markdown-to-pdf': 'Markdown → PDF',
  'pdf-merge': 'PDF 合并',
  'pdf-split': 'PDF 拆分',
  'pdf-watermark': 'PDF 水印',
  'pdf-compress': 'PDF 压缩',
  'video-to-mp4': '视频 → MP4',
  'video-to-avi': '视频 → AVI',
  'video-to-mkv': '视频 → MKV',
  'audio-to-mp3': '音频 → MP3',
  'audio-to-wav': '音频 → WAV',
  'video-trim': '视频裁剪',
  'audio-trim': '音频裁剪',
  'video-screenshot': '视频截图',
  'video-to-gif': '视频转GIF',
  'video-compress': '视频压缩',
  'video-extract-audio': '提取音频',
};

export default function TasksPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedData<ConversionTask> | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deletingTaskNo, setDeletingTaskNo] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoggedIn(true);
  }, [router]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getTaskList(
        page,
        20,
        statusFilter || undefined,
        undefined,
        categoryFilter || undefined,
      );
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    if (isLoggedIn) loadTasks();
  }, [isLoggedIn, loadTasks]);

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'status') setStatusFilter(value);
    if (filter === 'category') setCategoryFilter(value);
    setPage(1);
  };

  const handleDelete = async (taskNo: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      setDeletingTaskNo(taskNo);
      await deleteTask(taskNo);
      await loadTasks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingTaskNo(null);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">转换历史</h1>

        {/* 筛选栏 */}
        <div className="mb-4 flex flex-wrap gap-3">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange('status', opt.value)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                statusFilter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="mx-1 w-px bg-border" />
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange('category', opt.value)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                categoryFilter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-12 text-center text-muted-foreground">加载中...</p>
        ) : !data || data.list.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="mb-2">暂无转换记录</p>
            <p className="text-sm">
              前往{' '}
              <a href="/convert" className="text-primary hover:underline">
                转换中心
              </a>{' '}
              开始使用
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data.list.map((task) => {
                const statusInfo = STATUS_LABELS[task.status] || STATUS_LABELS.pending;
                const typeLabel = TYPE_LABELS[task.type] || task.type;

                return (
                  <div
                    key={task.taskNo}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{typeLabel}</span>
                        <span className={`text-xs ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {task.inputFileName}
                        {task.outputFileName && ` → ${task.outputFileName}`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(task.createdAt).toLocaleString('zh-CN')} · {task.creditsCost} 积分
                        {task.status === 'failed' && task.errorMessage && (
                          <span className="ml-2 text-destructive">({task.errorMessage})</span>
                        )}
                      </p>
                    </div>

                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      {task.status === 'completed' && (
                        <a
                          href={getDownloadUrl(task.taskNo)}
                          download
                          className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                          下载
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(task.taskNo)}
                        disabled={deletingTaskNo === task.taskNo}
                        className="rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 分页 */}
            {data.total > data.pageSize && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="text-sm text-muted-foreground">
                  {page} / {Math.ceil(data.total / data.pageSize)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(data.total / data.pageSize)}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
