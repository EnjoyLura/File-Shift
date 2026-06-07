'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ConversionTask, PaginatedData } from '@fileshift/shared-types';
import {
  History,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Clock,
  AlertCircle,
  Loader2,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { PageTransition } from '@/components/shared/page-transition';
import { useAuth } from '@/components/hooks/use-auth';
import { getTaskList, authenticatedDownload, deleteTask } from '@/lib/api';

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

const STATUS_BADGE: Record<
  string,
  { label: string; variant: 'success' | 'default' | 'warning' | 'destructive' | 'secondary' }
> = {
  pending: { label: '等待中', variant: 'secondary' },
  queued: { label: '排队中', variant: 'warning' },
  processing: { label: '处理中', variant: 'default' },
  completed: { label: '已完成', variant: 'success' },
  failed: { label: '失败', variant: 'destructive' },
  cancelled: { label: '已取消', variant: 'secondary' },
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

export default function DesignTasksPage() {
  const { isLoggedIn, loading: authLoading } = useAuth(true);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedData<ConversionTask> | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [downloadingTaskNo, setDownloadingTaskNo] = useState<string | null>(null);
  const [deletingTaskNo, setDeletingTaskNo] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

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
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    if (isLoggedIn) loadTasks();
  }, [isLoggedIn, loadTasks]);

  const handleDownload = async (taskNo: string, fileName?: string) => {
    try {
      setDownloadingTaskNo(taskNo);
      await authenticatedDownload(taskNo, fileName);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '下载失败');
    } finally {
      setDownloadingTaskNo(null);
    }
  };

  const confirmDelete = (taskNo: string) => {
    setTaskToDelete(taskNo);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      setDeletingTaskNo(taskToDelete);
      await deleteTask(taskToDelete);
      await loadTasks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingTaskNo(null);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  if (authLoading || !isLoggedIn) return null;

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-7 w-7 text-primary" /> 转换历史
          </h1>
          {data && <p className="mt-2 text-sm text-muted-foreground">共 {data.total} 条记录</p>}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-32"
          />
          <Select
            options={TYPE_OPTIONS}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-32"
          />
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </div>
        ) : !data || data.list.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="暂无转换记录"
            description="前往转换中心开始使用"
            action={{ label: '去转换中心', onClick: () => (window.location.href = '/convert') }}
          />
        ) : (
          <>
            <div className="space-y-3">
              {data.list.map((task) => {
                const status = STATUS_BADGE[task.status] || STATUS_BADGE.pending;
                const typeLabel = TYPE_LABELS[task.type] || task.type;
                return (
                  <Card key={task.taskNo} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{typeLabel}</span>
                          <Badge variant={status.variant} className="text-[10px] px-1.5 py-0">
                            {status.label}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {task.inputFileName}
                          {task.outputFileName && ` → ${task.outputFileName}`}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(task.createdAt).toLocaleString('zh-CN')} · {task.creditsCost}{' '}
                          积分
                          {task.status === 'failed' && task.errorMessage && (
                            <span className="ml-2 text-destructive">({task.errorMessage})</span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {task.status === 'completed' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleDownload(task.taskNo, task.outputFileName || undefined)
                            }
                            disabled={downloadingTaskNo === task.taskNo}
                          >
                            {downloadingTaskNo === task.taskNo ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline ml-1">下载</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(task.taskNo)}
                          disabled={deletingTaskNo === task.taskNo}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" /> 上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  下一页 <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent onClose={() => setDeleteDialogOpen(false)}>
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
              <DialogDescription>确定要删除这条转换记录吗？此操作不可撤销。</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deletingTaskNo === taskToDelete}
              >
                {deletingTaskNo === taskToDelete ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
