'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CREDIT_COSTS } from '@fileshift/constants';
import type { ConversionTaskDetail } from '@fileshift/shared-types';
import { Header } from '@/components/layout/header';
import { FileDropZone } from '@/components/upload/file-drop-zone';
import { uploadFile, createConversion, getTaskStatus, getDownloadUrl } from '@/lib/api';

/** 转换类型显示名称映射 */
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

/** 转换类型到 accept 属性映射 */
const TYPE_ACCEPT: Record<string, string> = {
  'png-to-jpg': '.png',
  'jpg-to-png': '.jpg,.jpeg',
  'png-to-webp': '.png',
  'jpg-to-webp': '.jpg,.jpeg',
  'webp-to-png': '.webp',
  'webp-to-jpg': '.webp',
  'image-compress': 'image/*',
  'pdf-to-word': '.pdf',
  'word-to-pdf': '.doc,.docx',
  'pdf-to-excel': '.pdf',
  'excel-to-pdf': '.xls,.xlsx',
  'pdf-to-ppt': '.pdf',
  'ppt-to-pdf': '.ppt,.pptx',
  'markdown-to-pdf': '.md,.markdown,.txt',
};

type AppState = 'idle' | 'uploading' | 'converting' | 'completed' | 'error';

export default function ConvertTypePage() {
  const params = useParams();
  const router = useRouter();
  const conversionType = params.type as string;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [state, setState] = useState<AppState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setFileId] = useState('');
  const [, setTaskNo] = useState('');
  const [taskDetail, setTaskDetail] = useState<ConversionTaskDetail | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const label = TYPE_LABELS[conversionType] || conversionType;
  const cost = CREDIT_COSTS[conversionType] ?? 1;
  const accept = TYPE_ACCEPT[conversionType] || '*';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoggedIn(true);
  }, [router]);

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setState('idle');
    setError('');
    setTaskDetail(null);
    setProgress(0);
  };

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (tn: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const detail = await getTaskStatus(tn);
          setTaskDetail(detail);
          setProgress(detail.progress || 0);

          if (detail.status === 'completed') {
            stopPolling();
            setState('completed');
          } else if (detail.status === 'failed') {
            stopPolling();
            setState('error');
            setError(detail.errorMessage || '转换失败，积分已退还');
          }
        } catch (err) {
          stopPolling();
          setState('error');
          setError(err instanceof Error ? err.message : '查询状态失败');
        }
      }, 2000);
    },
    [stopPolling],
  );

  const handleStart = async () => {
    if (!selectedFile) return;
    setError('');

    try {
      // Step 1: 上传文件
      setState('uploading');
      setProgress(10);
      const uploadResult = await uploadFile(selectedFile);
      setFileId(uploadResult.fileId);
      setProgress(40);

      // Step 2: 创建转换任务
      setProgress(50);
      const convResult = await createConversion({
        fileId: uploadResult.fileId,
        type: conversionType,
      });
      setTaskNo(convResult.taskNo);
      setState('converting');
      setProgress(60);

      // Step 3: 开始轮询
      startPolling(convResult.taskNo);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleReset = () => {
    stopPolling();
    setState('idle');
    setSelectedFile(null);
    setFileId('');
    setTaskNo('');
    setTaskDetail(null);
    setError('');
    setProgress(0);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* 面包屑 */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/convert" className="hover:text-primary">
            转换中心
          </Link>
          <span>/</span>
          <span className="text-foreground">{label}</span>
        </div>

        <h1 className="mb-1 text-2xl font-bold">{label}</h1>
        <p className="mb-6 text-sm text-muted-foreground">消耗 {cost} 积分/次</p>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* 上传区域 */}
        {state === 'idle' && (
          <div className="space-y-4">
            <FileDropZone accept={accept} onFileSelect={handleFileSelect} />

            {selectedFile && (
              <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📎</span>
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setError('');
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  移除
                </button>
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={!selectedFile}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              开始转换
            </button>
          </div>
        )}

        {/* 上传中 / 转换中 */}
        {(state === 'uploading' || state === 'converting') && (
          <div className="space-y-4 rounded-lg border p-6">
            <div className="flex items-center justify-between text-sm">
              <span>{state === 'uploading' ? '正在上传文件...' : '正在转换中...'}</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {state === 'converting' && (
              <p className="text-xs text-muted-foreground">预计需要几秒到几十秒，请耐心等待...</p>
            )}
          </div>
        )}

        {/* 完成 */}
        {state === 'completed' && taskDetail && (
          <div className="space-y-4 rounded-lg border p-6">
            <div className="flex items-center gap-2 text-primary">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">转换完成！</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">输出文件:</span>
                <span>{taskDetail.outputFileName || '未知'}</span>
              </div>
              {taskDetail.outputFileSize && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">文件大小:</span>
                  <span>{(taskDetail.outputFileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">消耗积分:</span>
                <span>{taskDetail.creditsCost}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={getDownloadUrl(taskDetail.taskNo)}
                download
                className="flex-1 rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                下载文件
              </a>
              <button
                onClick={handleReset}
                className="rounded-md border px-4 py-2.5 text-sm hover:bg-accent"
              >
                继续转换
              </button>
            </div>
          </div>
        )}

        {/* 错误 */}
        {state === 'error' && (
          <div className="space-y-4">
            <button
              onClick={handleReset}
              className="w-full rounded-md border px-4 py-2.5 text-sm hover:bg-accent"
            >
              重新选择文件
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
