'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Upload,
  FileUp,
  Loader2,
  Settings,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { CREDIT_COSTS } from '@fileshift/constants';
import type { ConversionTaskDetail } from '@fileshift/shared-types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/hooks/use-auth';
import { PageTransition } from '@/components/shared/page-transition';
import {
  uploadFile,
  createConversion,
  createMergeTask,
  getTaskStatus,
  authenticatedDownload,
} from '@/lib/api';

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
  'video-to-mov': '视频 → MOV',
  'video-to-webm': '视频 → WebM',
  'audio-to-mp3': '音频 → MP3',
  'audio-to-wav': '音频 → WAV',
  'audio-to-flac': '音频 → FLAC',
  'audio-to-aac': '音频 → AAC',
  'audio-to-ogg': '音频 → OGG',
  'video-extract-audio': '提取音频',
  'video-trim': '视频裁剪',
  'audio-trim': '音频裁剪',
  'video-screenshot': '视频截图',
  'video-to-gif': '视频转 GIF',
  'video-compress': '视频压缩',
};

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

type AppState = 'idle' | 'uploading' | 'converting' | 'completed' | 'error';

const STEPS = [
  { label: '上传文件', state: 'idle' },
  { label: '设置参数', state: 'idle' },
  { label: '转换中', state: 'converting' },
  { label: '完成', state: 'completed' },
];

function getStepStatus(state: AppState, idx: number): 'done' | 'active' | 'pending' {
  if (state === 'completed') return idx < 4 ? 'done' : 'active';
  if (state === 'converting') return idx < 2 ? 'done' : idx === 2 ? 'active' : 'pending';
  if (state === 'uploading') return idx < 1 ? 'done' : idx === 1 ? 'active' : 'pending';
  return idx === 0 ? 'active' : 'pending';
}

export default function DesignConvertTypePage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth(true);
  const conversionType = params.type as string;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<AppState>('idle');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [, setTaskNo] = useState('');
  const [taskDetail, setTaskDetail] = useState<ConversionTaskDetail | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState<Record<string, unknown>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMultiFile = ['pdf-merge'].includes(conversionType);
  const isImageTool =
    conversionType.startsWith('image') ||
    [
      'png-to-jpg',
      'jpg-to-png',
      'png-to-webp',
      'jpg-to-webp',
      'webp-to-png',
      'webp-to-jpg',
    ].includes(conversionType);
  const label = TYPE_LABELS[conversionType] || conversionType;
  const cost = CREDIT_COSTS[conversionType] ?? 1;
  const accept = TYPE_ACCEPT[conversionType] || '*';

  // 图片预览相关状态
  const [previews, setPreviews] = useState<
    { url: string; name: string; width: number; height: number; size: number }[]
  >([]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

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
            setError(detail.errorMessage || '转换失败');
          }
        } catch {
          stopPolling();
          setState('error');
          setError('查询状态失败');
        }
      }, 2000);
    },
    [stopPolling],
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setSelectedFiles(isMultiFile ? (prev) => [...prev, ...arr] : isImageTool ? arr : [arr[0]]);
    setState('idle');
    setError('');
    setTaskDetail(null);
    setProgress(0);

    // 图片工具生成预览
    if (isImageTool) {
      arr.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new window.Image();
          img.onload = () => {
            setPreviews((prev) => [
              ...prev,
              {
                url: e.target?.result as string,
                name: file.name,
                width: img.naturalWidth,
                height: img.naturalHeight,
                size: file.size,
              },
            ]);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleStart = async () => {
    if (selectedFiles.length === 0) return;
    setError('');
    try {
      setState('uploading');
      setProgress(10);
      if (isMultiFile) {
        const fileIds: string[] = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          setProgress(10 + Math.round(((i + 1) / selectedFiles.length) * 30));
          const r = await uploadFile(selectedFiles[i]);
          fileIds.push(r.fileId);
        }
        setProgress(50);
        const c = await createMergeTask({
          fileIds,
          type: conversionType,
          options: Object.keys(options).length > 0 ? options : undefined,
        });
        setTaskNo(c.taskNo);
        setState('converting');
        setProgress(60);
        startPolling(c.taskNo);
      } else {
        const u = await uploadFile(selectedFiles[0]);
        setProgress(40);
        setProgress(50);
        const c = await createConversion({
          fileId: u.fileId,
          type: conversionType,
          options: Object.keys(options).length > 0 ? options : undefined,
        });
        setTaskNo(c.taskNo);
        setState('converting');
        setProgress(60);
        startPolling(c.taskNo);
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
    setPreviews([]);
    setTaskNo('');
    setTaskDetail(null);
    setError('');
    setProgress(0);
    setOptions({});
  };

  if (loading || !isLoggedIn) return null;

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/convert" className="hover:text-primary transition-colors">
            转换中心
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{label}</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{label}</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary fill-primary" />
            <span className="font-medium">{cost}</span>
            积分
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((step, i) => {
            const status = getStepStatus(state, i);
            return (
              <div key={step.label} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    status === 'done'
                      ? 'bg-primary text-primary-foreground'
                      : status === 'active'
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-xs hidden sm:inline ${status === 'active' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                >
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px ${status === 'done' ? 'bg-primary' : 'bg-border'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex items-start gap-2"
          >
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* IDLE: Upload + Options */}
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
                  dragOver
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={isMultiFile || isImageTool}
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <Upload
                  className={`mx-auto h-10 w-10 mb-3 transition-colors ${dragOver ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <p className="font-medium">
                  拖拽文件到这里，或<span className="text-primary">点击选择</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">支持格式: {accept}</p>
              </div>

              {/* Selected Files - 图片工具显示预览卡片 */}
              {selectedFiles.length > 0 && (
                <div
                  className={isImageTool ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'space-y-2'}
                >
                  {isImageTool
                    ? previews.map((preview, idx) => (
                        <Card key={idx} className="p-3 space-y-2 relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted/30">
                            <img
                              src={preview.url}
                              alt={preview.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs font-medium truncate">{preview.name}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {preview.width}×{preview.height}
                            </span>
                            <span>{(preview.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                            onClick={() => {
                              setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
                              setPreviews((prev) => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Card>
                      ))
                    : selectedFiles.map((file, idx) => (
                        <Card key={idx} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileUp className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                </div>
              )}

              {/* Options Panel */}
              <OptionsPanel type={conversionType} options={options} onChange={setOptions} />

              <Button
                onClick={handleStart}
                disabled={selectedFiles.length === 0 || (isMultiFile && selectedFiles.length < 2)}
                className="w-full"
                size="lg"
              >
                <Settings className="h-4 w-4" /> 开始转换
              </Button>
            </motion.div>
          )}

          {/* UPLOADING / CONVERTING */}
          {(state === 'uploading' || state === 'converting') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-border p-8 text-center space-y-4"
            >
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
              <p className="font-medium">
                {state === 'uploading' ? '正在上传文件...' : '正在转换中...'}
              </p>
              <Progress value={progress} variant="brand" className="max-w-xs mx-auto" />
              <p className="text-sm text-muted-foreground">{progress}%</p>
              {state === 'converting' && (
                <p className="text-xs text-muted-foreground">
                  {conversionType.startsWith('video') || conversionType.startsWith('audio')
                    ? '音视频处理可能需要较长时间，请耐心等待...'
                    : '预计几秒到几十秒...'}
                </p>
              )}
            </motion.div>
          )}

          {/* COMPLETED */}
          {state === 'completed' && taskDetail && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-border p-8 text-center space-y-5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
              </motion.div>
              <h2 className="text-xl font-bold">转换完成！</h2>
              <Card className="p-4 text-left max-w-sm mx-auto">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">输出文件</span>
                    <span className="font-medium">{taskDetail.outputFileName || '未知'}</span>
                  </div>
                  {taskDetail.outputFileSize && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">文件大小</span>
                      <span>{(taskDetail.outputFileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">消耗积分</span>
                    <span>{taskDetail.creditsCost}</span>
                  </div>
                </div>
              </Card>
              <div className="flex gap-3 justify-center">
                <Button
                  size="lg"
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
                >
                  <Download className="h-4 w-4" /> 下载文件
                </Button>
                <Button variant="outline" size="lg" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" /> 继续转换
                </Button>
              </div>
            </motion.div>
          )}

          {/* ERROR */}
          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <Button variant="outline" size="lg" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" /> 重新选择文件
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

/* ─── Options Panel ────────────────────────────────────────────────────── */
function OptionsPanel({
  type,
  options,
  onChange,
}: {
  type: string;
  options: Record<string, unknown>;
  onChange: (o: Record<string, unknown>) => void;
}) {
  const update = (key: string, value: unknown) => onChange({ ...options, [key]: value });

  const renderInputs = () => {
    if (type === 'image-crop') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {[
            ['left', 'X 起点', 0],
            ['top', 'Y 起点', 0],
            ['width', '宽度', 1],
            ['height', '高度', 1],
          ].map(([key, label, min]) => (
            <div key={key as string}>
              <Label className="text-xs">{label as string}</Label>
              <Input
                type="number"
                min={min as number}
                value={(options[key as string] as number) || ''}
                onChange={(e) => update(key as string, Number(e.target.value))}
                placeholder="像素"
              />
            </div>
          ))}
        </div>
      );
    }
    if (type === 'image-rotate') {
      return (
        <div className="flex gap-2 flex-wrap">
          {[90, 180, 270].map((deg) => (
            <Button
              key={deg}
              variant={options.angle === deg ? 'default' : 'outline'}
              size="sm"
              onClick={() => update('angle', deg)}
            >
              {deg}°
            </Button>
          ))}
          <Input
            type="number"
            value={(options.angle as number) || ''}
            onChange={(e) => update('angle', Number(e.target.value))}
            placeholder="自定义"
            className="w-24"
          />
        </div>
      );
    }
    if (type === 'image-watermark' || type === 'pdf-watermark') {
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">水印文字</Label>
            <Input
              value={(options.text as string) || ''}
              onChange={(e) => update('text', e.target.value)}
              placeholder="FileShift"
            />
          </div>
          <div>
            <Label className="text-xs">
              透明度 ({((options.opacity as number) || 0.3).toFixed(1)})
            </Label>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={(options.opacity as number) || 0.3}
              onChange={(e) => update('opacity', Number(e.target.value))}
              className="w-full"
            />
          </div>
          {type === 'image-watermark' && (
            <div className="flex gap-1.5 flex-wrap">
              {['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'].map((pos) => (
                <Button
                  key={pos}
                  variant={options.position === pos ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => update('position', pos)}
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
                </Button>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (type === 'image-resize') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">目标宽度</Label>
            <Input
              type="number"
              min={1}
              value={(options.width as number) || ''}
              onChange={(e) => update('width', Number(e.target.value) || undefined)}
              placeholder="留空自动"
            />
          </div>
          <div>
            <Label className="text-xs">目标高度</Label>
            <Input
              type="number"
              min={1}
              value={(options.height as number) || ''}
              onChange={(e) => update('height', Number(e.target.value) || undefined)}
              placeholder="留空自动"
            />
          </div>
        </div>
      );
    }
    if (type === 'pdf-split') {
      return (
        <div>
          <Label className="text-xs">页码范围</Label>
          <Input
            value={(options.pageRange as string) || ''}
            onChange={(e) => update('pageRange', e.target.value)}
            placeholder="例: 1-3, 5, 7-9"
          />
        </div>
      );
    }
    if (type === 'video-trim' || type === 'audio-trim') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">开始时间</Label>
            <Input
              value={(options.start as string) || ''}
              onChange={(e) => update('start', e.target.value)}
              placeholder="00:00:00"
            />
          </div>
          <div>
            <Label className="text-xs">结束时间</Label>
            <Input
              value={(options.end as string) || ''}
              onChange={(e) => update('end', e.target.value)}
              placeholder="00:00:10"
            />
          </div>
        </div>
      );
    }
    if (type === 'video-screenshot') {
      return (
        <div>
          <Label className="text-xs">截图时间点</Label>
          <Input
            value={(options.timestamp as string) || ''}
            onChange={(e) => update('timestamp', e.target.value)}
            placeholder="00:00:05"
          />
        </div>
      );
    }
    if (type === 'video-to-gif') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">开始时间</Label>
            <Input
              value={(options.start as string) || ''}
              onChange={(e) => update('start', e.target.value)}
              placeholder="00:00:00"
            />
          </div>
          <div>
            <Label className="text-xs">时长(秒)</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={(options.duration as number) || ''}
              onChange={(e) => update('duration', Number(e.target.value))}
              placeholder="5"
            />
          </div>
          <div>
            <Label className="text-xs">帧率</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={(options.fps as number) || ''}
              onChange={(e) => update('fps', Number(e.target.value))}
              placeholder="10"
            />
          </div>
          <div>
            <Label className="text-xs">宽度</Label>
            <Input
              type="number"
              min={100}
              max={1080}
              value={(options.width as number) || ''}
              onChange={(e) => update('width', Number(e.target.value))}
              placeholder="480"
            />
          </div>
        </div>
      );
    }
    if (type === 'video-compress') {
      return (
        <div>
          <Label className="text-xs">CRF 值: {(options.crf as number) || 28}</Label>
          <input
            type="range"
            min={18}
            max={40}
            value={(options.crf as number) || 28}
            onChange={(e) => update('crf', Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            18 = 近乎无损, 28 = 中等, 35+ = 低质量
          </p>
        </div>
      );
    }
    if (type === 'image-compress') {
      return (
        <div>
          <Label className="text-xs">质量: {(options.quality as number) || 80}%</Label>
          <input
            type="range"
            min={10}
            max={100}
            value={(options.quality as number) || 80}
            onChange={(e) => update('quality', Number(e.target.value))}
            className="w-full"
          />
        </div>
      );
    }
    return null;
  };

  const content = renderInputs();
  if (!content) return null;

  return (
    <Card className="p-4">
      <p className="font-medium text-sm mb-3">转换参数</p>
      {content}
    </Card>
  );
}
