'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Image,
  FileText,
  Video,
  BookOpen,
  Scissors,
  Music,
  Zap,
  Shield,
  Smartphone,
  Coins,
  Upload,
  ArrowRight,
  Download,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaveDivider } from '@/components/shared/wave-divider';
import { GradientOrb } from '@/components/shared/gradient-orb';
import { stagger, fadeUp } from '@/components/shared/animations';

const toolCategories = [
  {
    title: '图片转换',
    desc: 'PNG、JPG、WebP、HEIC 等格式互转',
    icon: Image,
    count: 7,
    color: 'from-emerald-500 to-green-500',
    span: 'md:col-span-2 md:row-span-2',
    tools: ['PNG ↔ JPG', 'PNG/JPG → WebP', 'HEIC → JPG', 'PNG → ICO'],
  },
  {
    title: '文档转换',
    desc: 'PDF、Word、Excel、PPT 格式互转',
    icon: FileText,
    count: 7,
    color: 'from-rose-500 to-pink-500',
    span: 'md:col-span-2',
    tools: ['PDF → Word', 'Word → PDF', 'PDF → Excel'],
  },
  {
    title: '音视频转换',
    desc: 'MP4、AVI、MP3、WAV 等格式互转',
    icon: Video,
    count: 5,
    color: 'from-violet-500 to-purple-500',
    span: 'md:col-span-2',
    tools: ['MP4 ↔ AVI', 'MP3 ↔ WAV', '视频提取音频'],
  },
  {
    title: 'PDF 工具',
    desc: '合并、拆分、水印',
    icon: BookOpen,
    count: 4,
    color: 'from-amber-500 to-orange-500',
    span: 'md:col-span-1',
    tools: ['PDF合并', 'PDF拆分'],
  },
  {
    title: '图片工具',
    desc: '裁剪、旋转、水印、压缩',
    icon: Scissors,
    count: 4,
    color: 'from-cyan-500 to-teal-500',
    span: 'md:col-span-1',
    tools: ['图片裁剪', '图片压缩'],
  },
  {
    title: '音视频工具',
    desc: '裁剪、截图、GIF制作、压缩',
    icon: Music,
    count: 6,
    color: 'from-indigo-500 to-blue-500',
    span: 'md:col-span-2',
    tools: ['GIF制作', '视频压缩', '视频裁剪'],
  },
];

const advantages = [
  { icon: Zap, title: '极速处理', desc: '秒级转换，不排队等待' },
  { icon: Shield, title: '隐私安全', desc: '文件24h自动清理，不存储内容' },
  { icon: Smartphone, title: '多端适配', desc: '电脑、平板、手机无缝使用' },
  { icon: Coins, title: '积分灵活', desc: '按需付费，注册即送50积分' },
];

const steps = [
  { icon: Upload, title: '上传文件', desc: '拖拽或点击上传，支持批量处理' },
  { icon: Settings, title: '选择参数', desc: '选择目标格式和自定义参数' },
  { icon: Download, title: '下载结果', desc: '转换完成后一键下载文件' },
];

export default function DesignHomePage() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative gradient-hero text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <GradientOrb className="-top-40 -right-40" size="lg" color="bg-purple-500/20" />
          <GradientOrb className="top-20 -left-20" size="md" color="bg-blue-400/20" delay={2} />
          <GradientOrb
            className="bottom-0 right-1/4"
            size="sm"
            color="bg-indigo-400/15"
            delay={1}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-24 md:py-32 lg:py-40 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm mb-8"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              34+ 文件处理工具，一站搞定
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
            >
              文件格式转换
              <br />
              <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                从未如此简单
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-6 text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto"
            >
              文档、图片、音视频格式转换，压缩，裁剪，水印……一个平台解决所有文件处理需求
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 shadow-lg shadow-white/20 rounded-xl"
                asChild
              >
                <Link href="/register">免费开始 — 送50积分</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto text-white border border-white/30 hover:bg-white/10 rounded-xl"
                asChild
              >
                <Link href="/convert">
                  浏览所有工具 <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeUp}
              className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto"
            >
              {[
                { num: '34+', label: '处理工具' },
                { num: '50', label: '注册赠送积分' },
                { num: '<3s', label: '平均转换时间' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold">{stat.num}</p>
                  <p className="text-sm text-blue-200/70 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <WaveDivider />
      </section>

      {/* ── How it Works ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            三步完成 <span className="gradient-text">文件转换</span>
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            简单直观的操作流程，让文件处理变得轻松
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.title} variants={fadeUp} className="relative text-center group">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t border-dashed border-border" />
                )}
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl gradient-brand-subtle flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">STEP {i + 1}</div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Bento Grid Tools ─────────────────────────────────────────── */}
      <section className="bg-muted/30 dark:bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              一个平台，<span className="gradient-text">所有工具</span>
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              覆盖文档、图片、音视频三大类，34+ 种专业工具
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px]"
          >
            {toolCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.title}
                  variants={fadeUp}
                  className={`${cat.span} group relative rounded-2xl border border-border bg-background p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 cursor-pointer overflow-hidden`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`}
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                        {cat.count} 种工具
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold text-base">{cat.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{cat.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {cat.tools.slice(0, 3).map((tool) => (
                        <span
                          key={tool}
                          className="text-xs bg-muted/50 rounded-md px-2 py-0.5 text-muted-foreground"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Advantages ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {advantages.map((adv) => {
            const Icon = adv.icon;
            return (
              <motion.div key={adv.title} variants={fadeUp} className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl gradient-brand-subtle mx-auto flex items-center justify-center text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{adv.title}</h3>
                <p className="text-sm text-muted-foreground">{adv.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl gradient-hero overflow-hidden p-10 md:p-16 text-center text-white"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">注册即送 50 积分</h2>
            <p className="mt-3 text-blue-100/80 text-lg">
              足够完成 25+ 次文件转换，深度体验所有功能
            </p>
            <Button
              size="lg"
              className="mt-8 bg-white text-blue-900 hover:bg-blue-50 shadow-lg shadow-white/20 rounded-xl"
              asChild
            >
              <Link href="/register">立即免费注册</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
