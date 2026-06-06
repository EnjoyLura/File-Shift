'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

type Stage = 'idle' | 'uploading' | 'converting' | 'completed' | 'error';

export default function DesignConvertDetailPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const simulateConvert = useCallback(() => {
    setStage('uploading');
    setProgress(0);
    const uploadInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(uploadInterval);
          setStage('converting');
          setProgress(0);
          const convertInterval = setInterval(() => {
            setProgress((p2) => {
              if (p2 >= 100) {
                clearInterval(convertInterval);
                setStage('completed');
                return 100;
              }
              return Math.min(p2 + Math.random() * 8, 100);
            });
          }, 300);
          return 100;
        }
        return Math.min(p + Math.random() * 15, 100);
      });
    }, 200);
  }, []);

  const reset = () => {
    setStage('idle');
    setProgress(0);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* 面包屑 */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
      >
        <Link href="/design/convert" className="hover:text-foreground transition-colors">
          转换中心
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-medium">PNG 转 JPG</span>
      </motion.nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 主内容 */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">PNG 转 JPG</h1>
            <p className="mt-1 text-muted-foreground">将 PNG 图片转换为 JPG 格式 · 消耗 1 积分</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* 上传阶段 */}
            {stage === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    simulateConvert();
                  }}
                  onClick={simulateConvert}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 md:p-16 text-center transition-all duration-300 ${dragOver ? 'border-primary bg-primary/5 shadow-glow' : 'border-border hover:border-primary/40 hover:bg-accent/30'}`}
                >
                  <div
                    className={`absolute inset-0 rounded-2xl gradient-brand-subtle opacity-0 transition-opacity duration-300 ${dragOver ? 'opacity-50' : ''}`}
                  />
                  <div className="relative space-y-4">
                    <div
                      className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-all duration-300 ${dragOver ? 'gradient-brand text-white scale-110' : 'bg-muted text-muted-foreground'}`}
                    >
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium">拖拽文件到此处</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        或 <span className="text-primary font-medium">点击选择文件</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">支持 PNG 格式 · 最大 20MB</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 上传/转换中 */}
            {(stage === 'uploading' || stage === 'converting') && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl border border-border p-8 space-y-6"
              >
                {/* 步骤指示器 */}
                <div className="flex items-center justify-center gap-2">
                  {[
                    { label: '上传', done: stage === 'converting' },
                    { label: '转换', done: false },
                    { label: '完成', done: false },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-2">
                      {i > 0 && (
                        <div className={`w-8 h-0.5 ${step.done ? 'bg-primary' : 'bg-border'}`} />
                      )}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                            step.done
                              ? 'bg-primary text-primary-foreground'
                              : i === (stage === 'uploading' ? 0 : 1)
                                ? 'gradient-brand text-white animate-pulse'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {step.done ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            i + 1
                          )}
                        </div>
                        <span className="text-sm font-medium">{step.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 文件信息 */}
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                    🖼️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">screenshot-2024.png</p>
                    <p className="text-xs text-muted-foreground">2.3 MB</p>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {stage === 'uploading' ? '上传中...' : '转换中...'}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.min(Math.round(progress), 100)}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-brand"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  {stage === 'uploading' ? '正在上传文件到服务器...' : '正在处理文件，请稍候...'}
                </p>
              </motion.div>
            )}

            {/* 完成 */}
            {stage === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-border p-8 text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/10 mx-auto flex items-center justify-center"
                >
                  <svg
                    className="w-10 h-10 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>

                <div>
                  <h2 className="text-xl font-bold">转换完成！</h2>
                  <p className="text-sm text-muted-foreground mt-1">消耗 1 积分 · 剩余 49 积分</p>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                    🖼️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">screenshot-2024.jpg</p>
                    <p className="text-xs text-muted-foreground">1.8 MB · JPG 格式</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button className="gradient-brand text-white rounded-xl px-8 py-3 text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]">
                    下载文件
                  </button>
                  <button
                    onClick={reset}
                    className="rounded-xl border border-border px-6 py-3 text-sm font-medium transition-all hover:bg-accent"
                  >
                    继续转换
                  </button>
                </div>
              </motion.div>
            )}

            {/* 错误 */}
            {stage === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-rose-200 dark:border-rose-500/20 p-8 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/10 mx-auto flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-rose-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">转换失败</h2>
                <p className="text-sm text-muted-foreground">文件格式不支持或文件已损坏</p>
                <button
                  onClick={reset}
                  className="gradient-brand text-white rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
                >
                  重新选择文件
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 侧边提示区 */}
        <div className="lg:w-64 space-y-4">
          <div className="rounded-2xl border border-border p-5 space-y-3">
            <h3 className="text-sm font-semibold">积分余额</h3>
            <p className="text-3xl font-bold gradient-text">50</p>
            <p className="text-xs text-muted-foreground">本次消耗 1 积分</p>
          </div>
          <div className="rounded-2xl border border-border p-5 space-y-3">
            <h3 className="text-sm font-semibold">相关工具</h3>
            <div className="space-y-2">
              {['JPG 转 PNG', '图片压缩', 'PNG 转 WebP'].map((t) => (
                <Link
                  key={t}
                  href="/design/convert/png-to-jpg"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
