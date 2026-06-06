'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ConversionTask, PaginatedData } from '@fileshift/shared-types';
import { Header } from '@/components/layout/header';
import { getTaskList, getDownloadUrl } from '@/lib/api';

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
  'pdf-to-word': 'PDF → Word',
  'word-to-pdf': 'Word → PDF',
  'pdf-to-excel': 'PDF → Excel',
  'excel-to-pdf': 'Excel → PDF',
  'pdf-to-ppt': 'PDF → PPT',
  'ppt-to-pdf': 'PPT → PDF',
  'markdown-to-pdf': 'Markdown → PDF',
};

export default function TasksPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedData<ConversionTask> | null>(null);
  const [page, setPage] = useState(1);

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
      const result = await getTaskList(page, 20);
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (isLoggedIn) loadTasks();
  }, [isLoggedIn, loadTasks]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">转换历史</h1>

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
                      </p>
                    </div>

                    {task.status === 'completed' && (
                      <a
                        href={getDownloadUrl(task.taskNo)}
                        download
                        className="ml-4 shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
                      >
                        下载
                      </a>
                    )}
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
