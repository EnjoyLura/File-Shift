'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CREDIT_COSTS } from '@fileshift/constants';
import type { ConversionTaskDetail } from '@fileshift/shared-types';
import { Header } from '@/components/layout/header';
import { FileDropZone } from '@/components/upload/file-drop-zone';
import {
  uploadFile,
  createConversion,
  createMergeTask,
  getTaskStatus,
  authenticatedDownload,
} from '@/lib/api';

/** 转换类型显示名称映射 */
const TYPE_LABELS: Record<string, string> = {
  // 图片格式
  'png-to-jpg': 'PNG → JPG',
  'jpg-to-png': 'JPG → PNG',
  'png-to-webp': 'PNG → WebP',
  'jpg-to-webp': 'JPG → WebP',
  'webp-to-png': 'WebP → PNG',
  'webp-to-jpg': 'WebP → JPG',
  'image-compress': '图片压缩',
  // 图片工具
  'image-crop': '图片裁剪',
  'image-rotate': '图片旋转',
  'image-watermark': '图片水印',
  'image-resize': '图片缩放',
  // 文档
  'pdf-to-word': 'PDF → Word',
  'word-to-pdf': 'Word → PDF',
  'pdf-to-excel': 'PDF → Excel',
  'excel-to-pdf': 'Excel → PDF',
  'pdf-to-ppt': 'PDF → PPT',
  'ppt-to-pdf': 'PPT → PDF',
  'markdown-to-pdf': 'Markdown → PDF',
  // PDF 工具
  'pdf-merge': 'PDF 合并',
  'pdf-split': 'PDF 拆分',
  'pdf-watermark': 'PDF 水印',
  'pdf-compress': 'PDF 压缩',
  // 视频转换
  'video-to-mp4': '视频 → MP4',
  'video-to-avi': '视频 → AVI',
  'video-to-mkv': '视频 → MKV',
  'video-to-mov': '视频 → MOV',
  'video-to-webm': '视频 → WebM',
  // 音频转换
  'audio-to-mp3': '音频 → MP3',
  'audio-to-wav': '音频 → WAV',
  'audio-to-flac': '音频 → FLAC',
  'audio-to-aac': '音频 → AAC',
  'audio-to-ogg': '音频 → OGG',
  // 音视频工具
  'video-extract-audio': '提取音频',
  'video-trim': '视频裁剪',
  'audio-trim': '音频裁剪',
  'video-screenshot': '视频截图',
  'video-to-gif': '视频转 GIF',
  'video-compress': '视频压缩',
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
  'image-crop': 'image/*',
  'image-rotate': 'image/*',
  'image-watermark': 'image/*',
  'image-resize': 'image/*',
  'pdf-to-word': '.pdf',
  'word-to-pdf': '.doc,.docx',
  'pdf-to-excel': '.pdf',
  'excel-to-pdf': '.xls,.xlsx',
  'pdf-to-ppt': '.pdf',
  'ppt-to-pdf': '.ppt,.pptx',
  'markdown-to-pdf': '.md,.markdown,.txt',
  'pdf-merge': '.pdf',
  'pdf-split': '.pdf',
  'pdf-watermark': '.pdf',
  'pdf-compress': '.pdf',
  'video-to-mp4': 'video/*',
  'video-to-avi': 'video/*',
  'video-to-mkv': 'video/*',
  'video-to-mov': 'video/*',
  'video-to-webm': 'video/*,.webm',
  'audio-to-mp3': 'audio/*',
  'audio-to-wav': 'audio/*',
  'audio-to-flac': 'audio/*,.flac',
  'audio-to-aac': 'audio/*',
  'audio-to-ogg': 'audio/*,.ogg',
  'video-extract-audio': 'video/*',
  'video-trim': 'video/*',
  'audio-trim': 'audio/*',
  'video-screenshot': 'video/*',
  'video-to-gif': 'video/*',
  'video-compress': 'video/*',
};

/** 需要多文件的类型 */
const MULTI_FILE_TYPES = ['pdf-merge'];

type AppState = 'idle' | 'uploading' | 'converting' | 'completed' | 'error';

export default function ConvertTypePage() {
  const params = useParams();
  const router = useRouter();
  const conversionType = params.type as string;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [state, setState] = useState<AppState>('idle');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [, setTaskNo] = useState('');
  const [taskDetail, setTaskDetail] = useState<ConversionTaskDetail | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  // 转换参数
  const [options, setOptions] = useState<Record<string, unknown>>({});

  const isMultiFile = MULTI_FILE_TYPES.includes(conversionType);
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

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleFileSelect = (file: File) => {
    if (isMultiFile) {
      setSelectedFiles((prev) => [...prev, file]);
    } else {
      setSelectedFiles([file]);
    }
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
    if (selectedFiles.length === 0) return;
    setError('');

    try {
      setState('uploading');
      setProgress(10);

      if (isMultiFile) {
        // 多文件上传 + 合并
        const fileIds: string[] = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          setProgress(10 + Math.round(((i + 1) / selectedFiles.length) * 30));
          const result = await uploadFile(selectedFiles[i]);
          fileIds.push(result.fileId);
        }

        setProgress(50);
        const convResult = await createMergeTask({
          fileIds,
          type: conversionType,
          options: Object.keys(options).length > 0 ? options : undefined,
        });
        setTaskNo(convResult.taskNo);
        setState('converting');
        setProgress(60);
        startPolling(convResult.taskNo);
      } else {
        // 单文件上传
        const uploadResult = await uploadFile(selectedFiles[0]);
        setProgress(40);

        setProgress(50);
        const convResult = await createConversion({
          fileId: uploadResult.fileId,
          type: conversionType,
          options: Object.keys(options).length > 0 ? options : undefined,
        });
        setTaskNo(convResult.taskNo);
        setState('converting');
        setProgress(60);
        startPolling(convResult.taskNo);
      }
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleReset = () => {
    stopPolling();
    setState('idle');
    setSelectedFiles([]);
    setTaskNo('');
    setTaskDetail(null);
    setError('');
    setProgress(0);
    setOptions({});
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
            <FileDropZone accept={accept} onFileSelect={handleFileSelect} multiple={isMultiFile} />

            {/* 已选文件列表 */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📎</span>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
                        setError('');
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      移除
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 转换参数面板 */}
            <OptionsPanel type={conversionType} options={options} onChange={setOptions} />

            {isMultiFile && selectedFiles.length < 2 && (
              <p className="text-xs text-muted-foreground">PDF 合并需要至少选择 2 个 PDF 文件</p>
            )}

            <button
              onClick={handleStart}
              disabled={selectedFiles.length === 0 || (isMultiFile && selectedFiles.length < 2)}
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
              <p className="text-xs text-muted-foreground">
                {conversionType.startsWith('video') || conversionType.startsWith('audio')
                  ? '音视频处理可能需要较长时间，请耐心等待...'
                  : '预计需要几秒到几十秒，请耐心等待...'}
              </p>
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
              <button
                onClick={async () => {
                  try {
                    await authenticatedDownload(
                      taskDetail.taskNo,
                      taskDetail.outputFileName || undefined,
                    );
                  } catch (err: unknown) {
                    alert(err instanceof Error ? err.message : '下载失败');
                  }
                }}
                className="flex-1 rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                下载文件
              </button>
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

/** 转换参数面板组件 */
function OptionsPanel({
  type,
  options,
  onChange,
}: {
  type: string;
  options: Record<string, unknown>;
  onChange: (opts: Record<string, unknown>) => void;
}) {
  const update = (key: string, value: unknown) => {
    onChange({ ...options, [key]: value });
  };

  // 图片裁剪
  if (type === 'image-crop') {
    return (
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <p className="font-medium">裁剪参数</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">X 起点</span>
            <input
              type="number"
              min={0}
              value={(options.left as number) || 0}
              onChange={(e) => update('left', Number(e.target.value))}
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Y 起点</span>
            <input
              type="number"
              min={0}
              value={(options.top as number) || 0}
              onChange={(e) => update('top', Number(e.target.value))}
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">宽度</span>
            <input
              type="number"
              min={1}
              value={(options.width as number) || ''}
              onChange={(e) => update('width', Number(e.target.value))}
              placeholder="像素"
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">高度</span>
            <input
              type="number"
              min={1}
              value={(options.height as number) || ''}
              onChange={(e) => update('height', Number(e.target.value))}
              placeholder="像素"
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
        </div>
      </div>
    );
  }

  // 图片旋转
  if (type === 'image-rotate') {
    return (
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <p className="font-medium">旋转角度</p>
        <div className="flex gap-2">
          {[90, 180, 270].map((deg) => (
            <button
              key={deg}
              onClick={() => update('angle', deg)}
              className={`rounded border px-3 py-1.5 text-sm ${
                options.angle === deg ? 'border-primary bg-primary/10 text-primary' : ''
              }`}
            >
              {deg}°
            </button>
          ))}
          <input
            type="number"
            value={(options.angle as number) || ''}
            onChange={(e) => update('angle', Number(e.target.value))}
            placeholder="自定义"
            className="w-24 rounded border px-2 py-1.5 text-sm"
          />
        </div>
      </div>
    );
  }

  // 水印 (图片/PDF)
  if (type === 'image-watermark' || type === 'pdf-watermark') {
    return (
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <p className="font-medium">水印设置</p>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">水印文字</span>
          <input
            type="text"
            value={(options.text as string) || ''}
            onChange={(e) => update('text', e.target.value)}
            placeholder="FileShift"
            className="w-full rounded border px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">
            透明度 ({((options.opacity as number) || 0.3).toFixed(1)})
          </span>
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={(options.opacity as number) || 0.3}
            onChange={(e) => update('opacity', Number(e.target.value))}
            className="w-full"
          />
        </label>
        {type === 'image-watermark' && (
          <div className="flex gap-2">
            {['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'].map((pos) => (
              <button
                key={pos}
                onClick={() => update('position', pos)}
                className={`rounded border px-2 py-1 text-xs ${
                  (options.position as string) === pos
                    ? 'border-primary bg-primary/10 text-primary'
                    : ''
                }`}
              >
                {pos === 'top-left'
                  ? '左上'
                  : pos === 'top-right'
                    ? '右上'
                    : pos === 'center'
                      ? '居中'
                      : pos === 'bottom-left'
                        ? '左下'
                        : '右下'}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 图片缩放
  if (type === 'image-resize') {
    return (
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <p className="font-medium">缩放参数</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">目标宽度</span>
            <input
              type="number"
              min={1}
              value={(options.width as number) || ''}
              onChange={(e) => update('width', Number(e.target.value) || undefined)}
              placeholder="留空自动"
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">目标高度</span>
            <input
              type="number"
              min={1}
              value={(options.height as number) || ''}
              onChange={(e) => update('height', Number(e.target.value) || undefined)}
              placeholder="留空自动"
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">留空则按比例缩放</p>
      </div>
    );
  }

  // PDF 拆分
  if (type === 'pdf-split') {
    return (
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <p className="font-medium">页码范围</p>
        <input
          type="text"
          value={(options.pageRange as string) || ''}
          onChange={(e) => update('pageRange', e.target.value)}
          placeholder="例: 1-3, 5, 7-9"
          className="w-full rounded border px-2 py-1.5 text-sm"
        />
        <p className="text-xs text-muted-foreground">输入要提取的页码范围，如 1-3,5,7-9</p>
      </div>
    );
  }

  // 视频/音频裁剪
  if (type === 'video-trim' || type === 'audio-trim') {
    return (
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <p className="font-medium">裁剪时间</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">开始时间</span>
            <input
              type="text"
              value={(options.start as string) || ''}
              onChange={(e) => update('start', e.target.value)}
              placeholder="00:00:00"
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">结束时间</span>
            <input
              type="text"
              value={(options.end as string) || ''}
              onChange={(e) => update('end', e.target.value)}
              placeholder="00:00:10"
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">格式: HH:MM:SS 或秒数</p>
      </div>
    );
  }

  // 视频截图
  if (type === 'video-screenshot') {
    return (
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <p className="font-medium">截图时间点</p>
        <input
          type="text"
          value={(options.timestamp as string) || ''}
          onChange={(e) => update('timestamp', e.target.value)}
          placeholder="00:00:05"
          className="w-full rounded border px-2 py-1.5 text-sm"
        />
        <p className="text-xs text-muted-foreground">格式: HH:MM:SS，默认 00:00:05</p>
      </div>
    );
  }

  // 视频转 GIF
  if (type === 'video-to-gif') {
    return (
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <p className="font-medium">GIF 参数</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">开始时间</span>
            <input
              type="text"
              value={(options.start as string) || ''}
              onChange={(e) => update('start', e.target.value)}
              placeholder="00:00:00"
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">时长 (秒)</span>
            <input
              type="number"
              min={1}
              max={30}
              value={(options.duration as number) || ''}
              onChange={(e) => update('duration', Number(e.target.value))}
              placeholder="5"
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">帧率</span>
            <input
              type="number"
              min={1}
              max={30}
              value={(options.fps as number) || ''}
              onChange={(e) => update('fps', Number(e.target.value))}
              placeholder="10"
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">宽度</span>
            <input
              type="number"
              min={100}
              max={1080}
              value={(options.width as number) || ''}
              onChange={(e) => update('width', Number(e.target.value))}
              placeholder="480"
              className="w-full rounded border px-2 py-1.5 text-sm"
            />
          </label>
        </div>
      </div>
    );
  }

  // 视频压缩
  if (type === 'video-compress') {
    return (
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <p className="font-medium">压缩质量</p>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">
            CRF 值: {(options.crf as number) || 28} (越高压缩率越大)
          </span>
          <input
            type="range"
            min={18}
            max={40}
            value={(options.crf as number) || 28}
            onChange={(e) => update('crf', Number(e.target.value))}
            className="w-full"
          />
        </label>
        <p className="text-xs text-muted-foreground">18 = 近乎无损, 28 = 中等, 35+ = 低质量</p>
      </div>
    );
  }

  // 图片压缩
  if (type === 'image-compress') {
    return (
      <div className="space-y-3 rounded-md border p-4 text-sm">
        <p className="font-medium">压缩质量</p>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">
            质量: {(options.quality as number) || 80}%
          </span>
          <input
            type="range"
            min={10}
            max={100}
            value={(options.quality as number) || 80}
            onChange={(e) => update('quality', Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
    );
  }

  // 无需参数的类型不显示面板
  return null;
}
